<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'division_from_id', 'division_to_id'];

    public function steps()
    {
        return $this->hasMany(WorkflowStep::class);
    }

    public function divisionFrom()
    {
        return $this->belongsTo(Division::class, 'division_from_id');
    }

    public function divisionTo()
    {
        return $this->belongsTo(Division::class, 'division_to_id');
    }
}


