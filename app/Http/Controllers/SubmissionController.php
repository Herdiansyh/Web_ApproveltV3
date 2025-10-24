<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Submission;
use App\Models\Workflow;
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

$submissions = Submission::with(['user', 'workflow.division_from', 'workflow.division_to'])
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
    $user = Auth::user();

    // Ambil workflow yang bisa dipilih karyawan
    // Bisa filter sesuai kebutuhan, misal workflow yang divisi pertama sama dengan divisi user
    $workflows = Workflow::with('steps.division')
        ->whereHas('steps', function ($q) use ($user) {
            $q->where('step_order', 1)
              ->where('division_id', $user->division_id);
        })
        ->get();

    return Inertia::render('Submissions/Create', [
        'workflows' => $workflows,
        'userDivision' => $user->division,
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
        'workflow_id' => 'required|exists:workflows,id',
    ]);

    $user = Auth::user();

    // Simpan file
    $path = $request->file('file')->store('submissions', 'private');

    // Buat pengajuan dengan current_step = 1
    $submission = Submission::create([
        'user_id' => $user->id,
        'workflow_id' => $validated['workflow_id'],
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'file_path' => $path,
        'status' => 'pending',
        'current_step' => 1,
    ]);

    return redirect()->route('submissions.show', $submission)
        ->with('success', 'Pengajuan berhasil dibuat.');
}


    /** ------------------------
     *  DETAIL PENGAJUAN
     *  ------------------------ */
   public function show(Submission $submission)
{
    $this->authorize('view', $submission);

    $submission->load([
        'user',
        'workflow.steps.division',
        'approver'
    ]);

    $user = Auth::user();

    // Langkah aktif saat ini
    $currentStep = $submission->workflow->steps
        ->firstWhere('step_order', $submission->current_step);

    $canApprove = $currentStep && $currentStep->division_id === $user->division_id && $submission->status === 'pending';

    return Inertia::render('Submissions/Show', [
        'submission' => $submission,
        'workflowSteps' => $submission->workflow->steps,
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
    if (Gate::denies('approve', $submission)) {
        abort(403);
    }

    $request->validate([
        'approval_note' => 'nullable|string',
        'signature' => 'required|string',
        'signatureMethod' => 'required|string',
        'watermark_x' => 'nullable|numeric',
        'watermark_y' => 'nullable|numeric',
        'watermark_width' => 'nullable|numeric',
        'watermark_height' => 'nullable|numeric',
    ]);

    $signatureContents = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $request->signature));
    $signaturePath = 'signatures/' . uniqid() . '.png';
    Storage::disk('private')->put($signaturePath, $signatureContents);

    // Ambil workflow step saat ini
    $currentStep = $submission->workflow->steps()->where('step_order', $submission->current_step)->first();

    // Cek apakah ini langkah terakhir
    $isLastStep = $submission->workflow->steps()->max('step_order') == $submission->current_step;

    // Update submission
    $submission->update([
        'current_step' => $isLastStep ? $submission->current_step : $submission->current_step + 1,
        'status' => $isLastStep ? 'approved' : 'pending',
        'approval_note' => $request->approval_note,
        'signature_path' => $signaturePath,
        'approved_at' => now(),
        'approved_by' => Auth::id(),
        'watermark_x' => $request->input('watermark_x', 50),
        'watermark_y' => $request->input('watermark_y', 50),
        'watermark_width' => $request->input('watermark_width', 120),
        'watermark_height' => $request->input('watermark_height', 60),
    ]);

    $submission->user->notify(new SubmissionStatusUpdated($submission));

    return redirect()->back()->with('success', $isLastStep ? 'Pengajuan disetujui dan selesai.' : 'Pengajuan disetujui, menunggu langkah berikutnya.');
}


    /** ------------------------
     *  TOLAK DOKUMEN
     *  ------------------------ */
    public function reject(Request $request, Submission $submission)
    {
        if (Gate::denies('reject', $submission)) {
            abort(403);
        }

        $request->validate([
            'approval_note' => 'required|string',
        ]);

        $submission->update([
            'status' => 'rejected',
            'approval_note' => $request->input('approval_note'),
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        $submission->user->notify(new SubmissionStatusUpdated($submission));

        return redirect()->back()->with('message', 'Dokumen telah ditolak.');
    }
   public function forDivision()
{
    $user = Auth::user();

    $submissions = Submission::with(['user', 'workflow.steps'])
        ->whereHas('workflow.steps', function ($q) use ($user) {
            $q->where('step_order', \DB::raw('submissions.current_step'))
              ->where('division_id', $user->division_id);
        })
        ->latest()
        ->paginate(10);

    return Inertia::render('Submissions/SubmissionsToDivision', [
        'submissions' => $submissions,
    ]);
}


}
