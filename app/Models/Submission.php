<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $with = ['user', 'workflow', 'approver', 'currentStep'];
    
    protected $fillable = [
        'user_id',
        'workflow_id',
        'title',
        'description',
        'file_path',
        'status',
        'approval_note',
        'signature_path',
        'approved_at',
        'approved_by',
        'notes',
        'current_step', // urutan langkah sekarang
        'watermark_x',
        'watermark_y',
        'watermark_width',
        'watermark_height',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Ambil langkah workflow saat ini
    public function currentStep()
    {
        return $this->hasOneThrough(
            WorkflowStep::class,   // model langkah
            Workflow::class,       // model workflow
            'id',                  // foreign key di workflow -> submission.workflow_id
            'workflow_id',         // foreign key di workflow_step -> workflow.id
            'workflow_id',         // local key di submission -> workflow.id
            'id'                   // local key di workflow_step
        )->where('step_order', $this->current_step);
    }
}
