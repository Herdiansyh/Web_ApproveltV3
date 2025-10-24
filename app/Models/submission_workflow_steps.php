<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class submission_workflow_steps extends Model
{
     use HasFactory;

     protected $fillable = ['submission_id', 'division_id', 'step_order'];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }
}
