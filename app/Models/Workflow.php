<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'division_from_id',
        'division_to_id',
        'is_active',
        'total_steps',
    ];

    /**
     * Relasi ke WorkflowStep
     * Satu workflow bisa punya banyak step
     */
    public function steps()
    {
        return $this->hasMany(WorkflowStep::class);
    }

    /**
     * Relasi ke divisi asal
     */
    public function divisionFrom()
    {
        return $this->belongsTo(Division::class, 'division_from_id');
    }

    /**
     * Relasi ke divisi tujuan
     */
    public function divisionTo()
    {
        return $this->belongsTo(Division::class, 'division_to_id');
    }
}
