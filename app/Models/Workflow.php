<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description', // opsional
    ];

    // Relasi ke langkah-langkah workflow
    public function steps()
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('step_order');
    }
}
