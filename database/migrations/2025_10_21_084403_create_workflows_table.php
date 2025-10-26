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
            $table->string('name'); // Nama alur, misal: "Workflow Pengajuan Barang"
            $table->text('description')->nullable(); // Keterangan opsional
            $table->foreignId('division_from_id')->constrained('divisions')->onDelete('cascade'); // Divisi pengaju
            $table->foreignId('division_to_id')->constrained('divisions')->onDelete('cascade');   // Divisi penerima

            // 🔽 Tambahan opsional (bisa kamu sesuaikan)
            $table->boolean('is_active')->default(true); // Status aktif/tidak dari workflow
            $table->integer('total_steps')->nullable();  // Jumlah step, untuk referensi cepat

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};
