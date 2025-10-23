<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $with = ['user', 'workflow', 'approver'];
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
}
