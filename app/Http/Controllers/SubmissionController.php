<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Submission;
use App\Models\submission_workflow_steps;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Notifications\SubmissionStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use setasign\Fpdi\Fpdi;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SubmissionController extends Controller
{
    use AuthorizesRequests;

    /** ------------------------
     *  TAMPILKAN DAFTAR PENGAJUAN
     *  ------------------------ */
public function index()
{
    $user = Auth::user();

    $submissions = Submission::with([
        'user',
        'workflow.steps.division' // gunakan relasi baru, bukan division_from/to
    ])
    ->when($user->role === 'employee', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })
    ->latest()
    ->paginate(10);

    return Inertia::render('Submissions/Index', [
        'submissions' => $submissions,
        'canApprove' => $user->role === 'manager',
        'userDivision' => $user->division,
    ]);
}



    /** ------------------------
     *  FORM BUAT PENGAJUAN
     *  ------------------------ */
public function create()
{
    $divisions = Division::all(['id', 'name']);

    return Inertia::render('Submissions/Create', [
        'divisions' => $divisions,
        'userDivision' => Auth::user()->division,
    ]);
}







    /** ------------------------
     *  SIMPAN PENGAJUAN BARU
     *  ------------------------ */
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        'steps' => 'required|array|min:1',
        'steps.*.division_id' => 'required|exists:divisions,id',
    ]);

    $user = Auth::user();
    $path = $request->file('file')->store('submissions', 'private');

    $submission = Submission::create([
        'user_id' => $user->id,
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'file_path' => $path,
        'status' => 'pending',
        'current_step' => 1,
    ]);

    foreach ($validated['steps'] as $index => $step) {
        submission_workflow_steps::create([
            'submission_id' => $submission->id,
            'division_id' => $step['division_id'],
            'step_order' => $index + 1,
        ]);
    }

    return redirect()->route('submissions.show', $submission)
        ->with('success', 'Pengajuan berhasil dibuat dengan alur persetujuan.');
}



    /** ------------------------
     *  DETAIL PENGAJUAN
     *  ------------------------ */
/** ------------------------
 *  DETAIL PENGAJUAN
 *  ------------------------ */
public function show(Submission $submission)
{
    $this->authorize('view', $submission);

    $submission->load(['user.division']);

    // Ambil semua langkah workflow untuk submission ini
    $steps = submission_workflow_steps::with('division')
        ->where('submission_id', $submission->id)
        ->orderBy('step_order')
        ->get();

    $user = Auth::user();
    $currentStep = $steps->firstWhere('step_order', $submission->current_step);

    // Cek apakah user divisinya sesuai dengan langkah aktif
    $canApprove = $currentStep &&
                  $currentStep->division_id === $user->division_id &&
                  $submission->status === 'pending';

    return Inertia::render('Submissions/Show', [
        'submission' => $submission,
        'workflowSteps' => $steps,
        'currentStep' => $currentStep,
        'canApprove' => $canApprove,
        'fileUrl' => route('submissions.file', $submission->id),
        'signedFileExists' => $submission->status === 'approved' &&
            Storage::disk('private')->exists($submission->file_path),
    ]);
}



    /** ------------------------
     *  DOWNLOAD ATAU LIHAT FILE
     *  ------------------------ */
    public function file(Submission $submission)
    {
        $this->authorize('view', $submission);

        if (!Storage::disk('private')->exists($submission->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $path = Storage::disk('private')->path($submission->file_path);
        $type = mime_content_type($path);

        $filename = $submission->status === 'approved'
            ? 'signed_' . $submission->title . '.pdf'
            : $submission->title . '.' . pathinfo($submission->file_path, PATHINFO_EXTENSION);

        return response()->file($path, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    /** ------------------------
     *  APPROVE DOKUMEN
     *  ------------------------ */
public function approve(Request $request, Submission $submission)
{
    $this->authorize('approve', $submission); // pakai policy

    $user = Auth::user();

    $request->validate([
        'approval_note' => 'nullable|string',
        'signature' => 'required|string',
        'signatureMethod' => 'required|string',
        'watermark_x' => 'nullable|numeric',
        'watermark_y' => 'nullable|numeric',
        'watermark_width' => 'nullable|numeric',
        'watermark_height' => 'nullable|numeric',
    ]);

    // Ambil step aktif
    $currentStep = submission_workflow_steps::where('submission_id', $submission->id)
        ->where('step_order', $submission->current_step)
        ->first();

    if (!$currentStep) {
        abort(404, 'Langkah workflow tidak ditemukan.');
    }

    // Simpan tanda tangan
    $signatureContents = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->signature));
    $signaturePath = 'signatures/' . uniqid() . '.png';
    Storage::disk('private')->put($signaturePath, $signatureContents);

    // Tandai step aktif sebagai approved
    $currentStep->update([
        'status' => 'approved',
        'note' => $request->input('approval_note'),
        'approved_at' => now(),
        'approver_id' => $user->id,
    ]);

    // Cek apakah ada langkah berikutnya
    $nextStep = submission_workflow_steps::where('submission_id', $submission->id)
        ->where('step_order', '>', $currentStep->step_order)
        ->orderBy('step_order')
        ->first();

    if ($nextStep) {
        // pindah ke step berikutnya (tetapkan current_step ke next)
        $submission->update([
            'current_step' => $nextStep->step_order,
            'status' => 'pending',
            'signature_path' => $signaturePath,
            'approved_at' => now(), // optional: dapat direset atau disimpan per-step
            'approved_by' => $user->id,
        ]);

        // set next step status menjadi pending (jika sebelumnya null)
        $nextStep->update(['status' => 'pending']);
    } else {
        // Tidak ada step berikutnya => submission selesai dan approved
        $submission->update([
            'status' => 'approved',
            'signature_path' => $signaturePath,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);
    }

    // Notifikasi ke pembuat
    $submission->user->notify(new SubmissionStatusUpdated($submission));

    return redirect()->back()->with('success', 'Pengajuan telah disetujui.');
}




    /** ------------------------
     *  TOLAK DOKUMEN
     *  ------------------------ */
   public function reject(Request $request, Submission $submission)
{
    $this->authorize('reject', $submission); // pakai policy

    $request->validate([
        'approval_note' => 'required|string',
    ]);

    $user = Auth::user();

    // Ambil step aktif
    $currentStep = submission_workflow_steps::where('submission_id', $submission->id)
        ->where('step_order', $submission->current_step)
        ->first();

    if (!$currentStep) {
        abort(404, 'Langkah workflow tidak ditemukan.');
    }

    // Tandai step sebagai rejected
    $currentStep->update([
        'status' => 'rejected',
        'note' => $request->input('approval_note'),
        'approved_at' => now(),
        'approver_id' => $user->id,
    ]);

    // Update submission langsung jadi rejected
    $submission->update([
        'status' => 'rejected',
        'approval_note' => $request->input('approval_note'),
        'approved_at' => now(),
        'approved_by' => $user->id,
    ]);

    // Notifikasi
    $submission->user->notify(new SubmissionStatusUpdated($submission));

    return redirect()->back()->with('message', 'Pengajuan telah ditolak.');
}

 
/** ------------------------
 *  PENGAJUAN UNTUK DIVISI USER LOGIN
 *  ------------------------ */
public function forDivision()
{
    $user = Auth::user();

    $submissions = Submission::with(['user', 'user.division'])
        ->where('status', 'pending')
        ->whereHas('workflowSteps', function ($query) use ($user) {
            $query->whereColumn('submission_workflow_steps.step_order', 'submissions.current_step')
                  ->where('submission_workflow_steps.division_id', $user->division_id);
        })
        ->latest()
        ->paginate(10);

    return Inertia::render('Submissions/ForDivision', [
        'submissions' => $submissions,
    ]);
}



}
