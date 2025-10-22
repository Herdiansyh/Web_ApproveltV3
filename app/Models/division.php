<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    protected $fillable = [
        'name',
        'description'
    ];

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
