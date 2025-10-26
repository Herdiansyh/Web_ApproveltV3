<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;
use App\Models\SubmissionWorkflowStep;

class SubmissionPolicy
{
    public function view(User $user, Submission $submission): bool
    {
        // Pemilik, manager, admin, atau divisi yang sudah pernah menangani step boleh melihat
        return
            $user->id === $submission->user_id ||
            in_array($user->role, ['manager', 'admin']) ||
            SubmissionWorkflowStep::where('submission_id', $submission->id)
                ->where('division_id', $user->division_id)
                ->exists();
    }

    public function create(User $user): bool
    {
        // Semua employee dan admin boleh membuat pengajuan
        return in_array($user->role, ['employee', 'admin']);
    }

    public function approve(User $user, Submission $submission): bool
    {
        // Cek apakah user berasal dari divisi step aktif
        return SubmissionWorkflowStep::where('submission_id', $submission->id)
            ->where('step_order', $submission->current_step)
            ->where('division_id', $user->division_id)
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', 'pending');
            })
            ->exists();
    }

    public function reject(User $user, Submission $submission): bool
    {
        // Sama dengan approve
        return $this->approve($user, $submission);
    }
}
