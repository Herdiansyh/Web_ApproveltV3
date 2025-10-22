<?php

namespace App\Notifications;

use App\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionStatusUpdated extends Notification
{
    use Queueable;

    public $submission;

    public function __construct(Submission $submission)
    {
        $this->submission = $submission;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $message = (new MailMessage)
            ->subject('Pengajuan "' . $this->submission->title . '" - ' . 
                     ($this->submission->status === 'approved' ? 'Disetujui' : 'Ditolak'))
            ->greeting('Halo ' . $notifiable->name);

        if ($this->submission->status === 'approved') {
            $message->line('Pengajuan Anda telah disetujui.')
                   ->line('Anda dapat mengunduh dokumen yang telah ditandatangani melalui sistem.')
                   ->action('Lihat Pengajuan', route('submissions.show', $this->submission->id));
        } else {
            $message->line('Pengajuan Anda tidak disetujui.')
                   ->line('Alasan: ' . $this->submission->approval_note)
                   ->action('Lihat Detail', route('submissions.show', $this->submission->id));
        }

        return $message;
    }

    public function toArray($notifiable)
    {
        return [
            'submission_id' => $this->submission->id,
            'title' => $this->submission->title,
            'status' => $this->submission->status,
            'approval_note' => $this->submission->approval_note,
        ];
    }
}