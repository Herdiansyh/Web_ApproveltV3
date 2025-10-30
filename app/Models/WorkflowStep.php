<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id', 
        'workflow_id',     // 🔹 Tambahan agar step bisa terhubung ke template workflow
        'division_id', 
        'step_order',
        'status', 
        'note', 'actions',
        'approved_at', 
        'approver_id'
    ];

    /**
     * Relasi ke Division
     */
    public function division()
    {
        return $this->belongsTo(\App\Models\Division::class);
    }

    /**
     * Relasi ke Submission (workflow aktif saat pengajuan berjalan)
     */
    public function submission()
    {
        return $this->belongsTo(\App\Models\Submission::class);
    }

    /**
     * Relasi ke Workflow (template workflow yang diatur oleh admin)
     */
    public function workflow()
    {
        return $this->belongsTo(\App\Models\Workflow::class);
    }
}
