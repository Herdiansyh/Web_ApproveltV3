<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->float('watermark_x')->nullable();
            $table->float('watermark_y')->nullable();
            $table->float('watermark_width')->nullable();
            $table->float('watermark_height')->nullable();
        });
    }

    public function down()
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['watermark_x', 'watermark_y', 'watermark_width', 'watermark_height']);
        });
    }
};