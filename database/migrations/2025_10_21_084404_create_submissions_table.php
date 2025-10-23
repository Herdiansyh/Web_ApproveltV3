<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // pembuat pengajuan
            $table->foreignId('division_id')->constrained()->onDelete('cascade'); // divisi pembuat pengajuan

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('signature_path')->nullable();

            // kolom untuk workflow dinamis
            $table->foreignId('workflow_id')->nullable()->constrained('workflows')->onDelete('set null');
            $table->integer('current_step')->default(1);

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
