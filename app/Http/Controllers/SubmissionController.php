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

    // Ambil daftar divisi kecuali divisi asal user
    $divisions = Division::where('id', '<>', $user->division_id)
        ->select('id', 'name')
        ->get();

    return Inertia::render('Submissions/Create', [
        'divisions' => $divisions,
        'userDivision' => $user->division, // untuk tampil di form sebagai "dari divisi"
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
    'to_division_id' => 'required|exists:divisions,id',
]);

$user = Auth::user();

// Simpan workflow
$workflow = Workflow::firstOrCreate(
    [
        'division_from_id' => $user->division_id, // divisi asal otomatis
        'division_to_id' => $validated['to_division_id'],
    ],
    [
        'name' => 'Dari ' . $user->division->name .
                  ' ke ' . Division::find($validated['to_division_id'])->name,
    ]
);

// Simpan file
$path = $request->file('file')->store('submissions', 'private');

// Buat pengajuan
$submission = Submission::create([
    'user_id' => $user->id,
    'title' => $validated['title'],
    'description' => $validated['description'] ?? null,
    'file_path' => $path,
    'workflow_id' => $workflow->id,
    'status' => 'pending',
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

        return Inertia::render('Submissions/Show', [
'submission' => $submission->load([
    'user',
    'workflow.division_from',
    'workflow.division_to',
    'approver'
]),            'canApprove' => Auth::user()->role === 'manager' && $submission->status === 'pending',
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

        $originalPath = Storage::disk('private')->path($submission->file_path);
        $mime = mime_content_type($originalPath);

        $x = $request->input('watermark_x', 50);
        $y = $request->input('watermark_y', 50);
        $width = $request->input('watermark_width', 120);
        $height = $request->input('watermark_height', 60);

        $newFilePath = $submission->file_path;

        if ($mime === 'application/pdf') {
            $tmpSigned = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'signed_' . uniqid() . '.pdf';
            try {
                $pdf = new Fpdi();
                $pageCount = $pdf->setSourceFile($originalPath);
                for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                    $tplId = $pdf->importPage($pageNo);
                    $size = $pdf->getTemplateSize($tplId);
                    $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                    $pdf->useTemplate($tplId);
                    if ($pageNo === $pageCount) {
                        $sigTmp = tmpfile();
                        $sigMeta = stream_get_meta_data($sigTmp);
                        $sigPathTmp = $sigMeta['uri'];
                        file_put_contents($sigPathTmp, $signatureContents);
                        $pdf->Image($sigPathTmp, $x, $y, $width, $height);
                        fclose($sigTmp);
                    }
                }
                $pdf->Output($tmpSigned, 'F');
                $signedStoragePath = 'submissions/signed-' . uniqid() . '.pdf';
                Storage::disk('private')->put($signedStoragePath, file_get_contents($tmpSigned));
                @unlink($tmpSigned);
                $newFilePath = $signedStoragePath;
            } catch (\Throwable $e) {
                // jika gagal, pakai file asli saja
            }
        }

        $submission->update([
            'status' => 'approved',
            'approval_note' => $request->approval_note,
            'signature_path' => $signaturePath,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
            'file_path' => $newFilePath,
            'watermark_x' => $x,
            'watermark_y' => $y,
            'watermark_width' => $width,
            'watermark_height' => $height,
        ]);

        $submission->user->notify(new SubmissionStatusUpdated($submission));

        return redirect()->back()->with('success', 'Pengajuan berhasil disetujui.');
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
Submission::with(['user', 'workflow.division_from'])
        ->whereHas('workflow', function ($q) use ($user) {
            $q->where('division_to_id', $user->division_id);
        })
        ->latest()
        ->paginate(10);

    return Inertia::render('Submissions/SubmissionsToDivision', [
        'submissions' => $submissions,
    ]);
}

}
