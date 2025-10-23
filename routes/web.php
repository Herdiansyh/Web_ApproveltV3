<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// User Management Routes (Manager only)
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // User Management Routes (Manager only)
    Route::middleware('can:manage-users')->group(function () {

    });
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Employee-only routes
    Route::middleware(['role:employee'])->group(function () {
        Route::get('submissions/create', [SubmissionController::class, 'create'])->name('submissions.create');
        Route::post('submissions', [SubmissionController::class, 'store'])->name('submissions.store');
    });

    // Common submission routes for both employees and managers
    Route::middleware(['auth'])->group(function () {
        Route::resource('submissions', SubmissionController::class)->only(['index', 'show']);
        Route::get('submissions/{submission}/file', [SubmissionController::class, 'file'])->name('submissions.file');
    });

    // Manager-only routes
    Route::middleware(['role:manager'])->group(function () {
        Route::post('submissions/{submission}/approve', [SubmissionController::class, 'approve'])->name('submissions.approve');
        Route::post('submissions/{submission}/reject', [SubmissionController::class, 'reject'])->name('submissions.reject');
    });
});

require __DIR__.'/auth.php';
