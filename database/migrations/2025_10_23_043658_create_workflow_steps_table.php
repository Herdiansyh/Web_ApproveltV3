<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('workflows')->onDelete('cascade');
            $table->foreignId('division_id')->constrained('divisions')->onDelete('cascade');
            $table->integer('step_order'); // Urutan proses (1, 2, 3, dst)

            // 🔽 Tambahan opsional (berguna kalau kamu ingin sistem approval dinamis)
            $table->string('role')->nullable(); // Role/divisi khusus untuk step ini
            $table->boolean('is_final_step')->default(false); // Menandai step terakhir
            $table->text('instructions')->nullable(); // Catatan atau petunjuk step

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_steps');
    }
};
