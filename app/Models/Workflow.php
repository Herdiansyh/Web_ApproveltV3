<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Workflow extends Model
{
    protected $fillable = [
        'name',
        'division_from_id',
        'division_to_id',
    ];

    public function division_from(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_from_id');
    }

    public function division_to(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_to_id');
    }
}
