<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function view(User $user, Submission $submission): bool
    {
        return $user->role === 'manager' || $user->id === $submission->user_id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'employee';
    }

    public function approve(User $user, Submission $submission): bool
    {
        return $user->role === 'manager' && $submission->status === 'pending';
    }

    public function reject(User $user, Submission $submission): bool
    {
        return $user->role === 'manager' && $submission->status === 'pending';
    }
}