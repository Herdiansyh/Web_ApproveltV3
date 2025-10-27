<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama workflow, misal: "Workflow Pengajuan Barang"
            $table->text('description')->nullable(); // Keterangan opsional

            // 🔹 Relasi ke dokumen, sekarang nullable
            $table->foreignId('document_id')->nullable()->constrained('documents')->onDelete('cascade');

            // 🔹 Divisi awal dan tujuan (nullable)
            $table->foreignId('division_from_id')->nullable()->constrained('divisions')->onDelete('cascade');
            $table->foreignId('division_to_id')->nullable()->constrained('divisions')->onDelete('cascade');

            $table->boolean('is_active')->default(true);
            $table->integer('total_steps')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};
