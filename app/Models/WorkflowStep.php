<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
    use HasFactory;
  protected $fillable = [
        'submission_id', 'division_id', 'step_order',
        'status', 'note', 'approved_at', 'approver_id'
    ];

    public function division() { return $this->belongsTo(\App\Models\Division::class); }
    public function submission() { return $this->belongsTo(\App\Models\Submission::class); }

}


