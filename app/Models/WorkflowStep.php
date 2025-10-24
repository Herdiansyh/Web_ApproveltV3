<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'division_id',
        'step_order',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }
}
