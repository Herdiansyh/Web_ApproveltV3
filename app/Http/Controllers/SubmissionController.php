<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Notifications\SubmissionStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use setasign\Fpdi\Fpdi;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SubmissionController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = Auth::user();
        $submissions = Submission::when($user->role === 'employee', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Submissions/Index', [
            'submissions' => $submissions,
            'canApprove' => $user->role === 'manager',
            'userDivision' => $user->division
        ]);
    }

    public function create()
    {
        return Inertia::render('Submissions/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // Max 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store('submissions', 'private');

        // Pastikan division_id ada
        $divisionId = Auth::user()->division_id;
        if (empty($divisionId)) {
            $divisionId = DB::table('divisions')->where('name', 'General')->value('id');
            if (empty($divisionId)) {
                $divisionId = DB::table('divisions')->insertGetId([
                    'name' => 'General',
                    'description' => 'General Division',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $submission = Auth::user()->submissions()->create([
            'title' => $request->title,
            'description' => $request->description,
            'file_path' => $path,
            'division_id' => $divisionId,
            'status' => 'pending'
        ]);

        return redirect()->route('submissions.show', $submission)
            ->with('success', 'Submission created successfully.');
    }

    public function show(Submission $submission)
    {
        $this->authorize('view', $submission);

        return Inertia::render('Submissions/Show', [
            'submission' => $submission->load(['user', 'division', 'approver']),
            'canApprove' => Auth::user()->role === 'manager' && $submission->status === 'pending',
            'fileUrl' => route('submissions.file', $submission->id),
            'signedFileExists' => $submission->status === 'approved' && Storage::disk('private')->exists($submission->file_path)
        ]);
    }

    /**
     * Gabungan method file() yang sudah diperbaiki.
     * Menampilkan file (PDF / gambar) dari penyimpanan private.
     */
    public function file(Submission $submission)
    {
        $this->authorize('view', $submission);

        if (!Storage::disk('private')->exists($submission->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $path = Storage::disk('private')->path($submission->file_path);
        $type = mime_content_type($path);

        // Tentukan nama file untuk ditampilkan
        $filename = $submission->status === 'approved'
            ? 'signed_' . $submission->title . '.pdf'
            : $submission->title . '.' . pathinfo($submission->file_path, PATHINFO_EXTENSION);

        return response()->file($path, [
            'Content-Type' => $type,
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ]);
    }

    public function approve(Request $request, Submission $submission)
    {
        if (Gate::denies('approve', $submission)) {
            abort(403);
        }

        $request->validate([
            'approval_note' => 'nullable|string',
            'signature' => 'required|string', // Base64 signature data
            'signatureMethod' => 'required|string',
            'watermark_x' => 'nullable|numeric',
            'watermark_y' => 'nullable|numeric',
            'watermark_width' => 'nullable|numeric',
            'watermark_height' => 'nullable|numeric',
        ]);

        // Simpan tanda tangan ke storage
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

        // Tambahkan tanda tangan ke PDF (jika file PDF)
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
                        $sigFile = tmpfile();
                        $sigMeta = stream_get_meta_data($sigFile);
                        $sigPathTmp = $sigMeta['uri'];
                        file_put_contents($sigPathTmp, $signatureContents);
                        try {
                            $pdf->Image($sigPathTmp, $x, $y, $width, $height);
                        } catch (\Exception $e) {}
                        fclose($sigFile);
                    }
                }
                $pdf->Output($tmpSigned, 'F');
                $signedStoragePath = 'submissions/signed-' . uniqid() . '.pdf';
                Storage::disk('private')->put($signedStoragePath, file_get_contents($tmpSigned));
                @unlink($tmpSigned);
                $newFilePath = $signedStoragePath;
            } catch (\Throwable $e) {
                $newFilePath = $submission->file_path;
            }
        }

        // Update status approval
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

        // Kirim notifikasi ke pengaju
        $submission->user->notify(new SubmissionStatusUpdated($submission));

        return redirect()->back()->with('message', 'Dokumen telah ditolak.');
    }
}
