<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Submission;
use App\Models\SubmissionWorkflowStep;
use App\Models\Workflow;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SubmissionController extends Controller
{
    use AuthorizesRequests;

    /** ------------------------
     *  LIST PENGAJUAN OLEH USER
     *  ------------------------ */
    public function index()
    {
        $user = Auth::user();

        $submissions = Submission::with(['workflow.document', 'workflow.steps.division', 'workflowSteps.division'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Submissions/Index', [
            'submissions' => $submissions,
            'userDivision' => $user->division,
        ]);
    }

    /** ------------------------
     *  LIST PENGAJUAN UNTUK DIVISI INI
     *  ------------------------ */
    public function forDivision(Request $request)
    {
        $user = Auth::user();
        $divisionId = $user->division_id;
        $statusFilter = $request->get('status', 'all');

        $submissions = Submission::with(['user.division', 'workflow.document', 'workflow.steps.division', 'workflowSteps'])
            ->whereHas('workflowSteps', function ($query) use ($divisionId) {
                $query->where('division_id', $divisionId);
            })
            ->when($statusFilter === 'pending', function ($query) {
                $query->where('status', 'pending');
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Submissions/ForDivision', [
            'submissions' => $submissions,
            'userDivision' => $user->division,
            'statusFilter' => $statusFilter,
        ]);
    }

    /** ------------------------
     *  FORM BUAT PENGAJUAN
     *  ------------------------ */
    public function create()
    {
        $user = Auth::user();
        $division = $user->division;

        // Ambil semua dokumen yang memiliki workflow aktif
        $documents = Document::whereHas('workflows', function ($q) {
            $q->where('is_active', true);
        })->get();

        return Inertia::render('Submissions/Create', [
            'userDivision' => $division,
            'documents' => $documents,
        ]);
    }

    /** ------------------------
     *  SIMPAN PENGAJUAN BARU
     *  ------------------------ */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240',
        ]);

        $user = Auth::user();

        // Cari workflow berdasarkan dokumen yang dipilih
        $workflow = Workflow::where('document_id', $validated['document_id'])
            ->where('is_active', true)
            ->with('steps')
            ->first();

        if (!$workflow) {
            return back()->withErrors([
                'workflow' => 'Belum ada workflow yang diatur untuk jenis dokumen ini.',
            ]);
        }

        $steps = $workflow->steps->sortBy('step_order')->values();

        // Upload file
        $filePath = $request->file('file')->store('submissions', 'private');

        // Buat submission baru
        $submission = Submission::create([
            'user_id' => $user->id,
            'division_id' => $user->division_id,
            'workflow_id' => $workflow->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'status' => 'pending',
            'current_step' => 1,
        ]);

        // Buat step workflow-nya
        foreach ($steps as $step) {
            SubmissionWorkflowStep::create([
                'submission_id' => $submission->id,
                'division_id' => $step->division_id,
                'step_order' => $step->step_order,
                'status' => $step->step_order === 1 ? 'approved' : 'pending',
            ]);
        }

        return redirect()->route('submissions.index')->with('success', 'Pengajuan berhasil dibuat.');
    }

    /** ------------------------
     *  DETAIL PENGAJUAN
     *  ------------------------ */
  public function show(Submission $submission)
{
    $this->authorize('view', $submission);

    // Load relasi user, division, workflow dan semua langkah dengan division
    $submission->load(['user.division', 'workflow.document', 'workflowSteps.division']);

    // Ambil semua step
    $steps = $submission->workflowSteps()->orderBy('step_order')->get();

    // Step saat ini
    $currentStep = $steps->firstWhere('step_order', $submission->current_step);

    $user = Auth::user();
    $canApprove = $currentStep &&
        $currentStep->division_id === $user->division_id &&
        $submission->status === 'pending';

    return Inertia::render('Submissions/Show', [
        'submission' => $submission,
        'workflowSteps' => $steps,          // Kirim steps ke frontend
        'currentStep' => $currentStep,      // Kirim step saat ini
        'canApprove' => $canApprove,
        'fileUrl' => route('submissions.file', $submission->id),
        'signedFileExists' => $submission->status === 'approved' &&
            Storage::disk('private')->exists($submission->file_path),
    ]);
}


    /** ------------------------
     *  VIEW FILE
     *  ------------------------ */
    public function file(Submission $submission)
    {
        $this->authorize('view', $submission);

        if (!Storage::disk('private')->exists($submission->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $path = Storage::disk('private')->path($submission->file_path);
        $type = mime_content_type($path);

        return response()->file($path, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="' . basename($submission->file_path) . '"',
        ]);
    }

    /** ------------------------
     *  APPROVE PENGAJUAN
     *  ------------------------ */
    public function approve(Request $request, Submission $submission)
    {
        $this->authorize('view', $submission);
        $user = Auth::user();

        $currentStep = $submission->workflowSteps()
            ->where('step_order', $submission->current_step)
            ->first();

        if (!$currentStep || $currentStep->division_id !== $user->division_id) {
            abort(403, 'Anda tidak berhak melakukan approve pada dokumen ini.');
        }

        $currentStep->status = 'approved';
        $currentStep->save();

        $maxStepOrder = $submission->workflowSteps()->max('step_order');
        if ($submission->current_step >= $maxStepOrder) {
            $submission->status = 'approved';
        } else {
            $submission->current_step += 1;
        }
        $submission->save();

        return redirect()->back()->with('success', 'Dokumen berhasil disetujui.');
    }

    /** ------------------------
     *  REJECT PENGAJUAN
     *  ------------------------ */
    public function reject(Request $request, Submission $submission)
    {
        $this->authorize('view', $submission);
        $user = Auth::user();

        $currentStep = $submission->workflowSteps()
            ->where('step_order', $submission->current_step)
            ->first();

        if (!$currentStep || $currentStep->division_id !== $user->division_id) {
            abort(403, 'Anda tidak berhak melakukan reject pada dokumen ini.');
        }

        $currentStep->status = 'rejected';
        $currentStep->save();

        $submission->status = 'rejected';
        $submission->save();

        return redirect()->back()->with('success', 'Dokumen telah ditolak.');
    }
}
