<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Division;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create divisions
        $divisions = [
            ['name' => 'General', 'description' => 'General Division'],
            ['name' => 'HR', 'description' => 'Human Resources'],
            ['name' => 'IT', 'description' => 'Information Technology'],
            ['name' => 'Finance', 'description' => 'Finance Department'],
            ['name' => 'Operations', 'description' => 'Operations Department'],
        ];

        foreach ($divisions as $division) {
            Division::create($division);
        }

        // Create manager account
        User::create([
            'name' => 'Direktur',
            'email' => 'direktur@direktur.com',
            'password' => Hash::make('123123123'),
            'role' => 'manager',
            'division_id' => Division::where('name', 'General')->first()->id,
            'email_verified_at' => now(),
        ]);
        // Create admin account
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('123123123'),
            'role' => 'admin',
            'division_id' => Division::where('name', 'General')->first()->id,
            'email_verified_at' => now(),
        ]);

        // Create some example employees
        $employees = [
            [
                'name' => 'HR Staff',
                'email' => 'hr@example.com',
                'division' => 'HR'
            ],
            [
                'name' => 'IT Staff',
                'email' => 'it@example.com',
                'division' => 'IT'
            ],
            [
                'name' => 'Finance Staff',
                'email' => 'finance@example.com',
                'division' => 'Finance'
            ]
        ];

        foreach ($employees as $employee) {
            User::create([
                'name' => $employee['name'],
                'email' => $employee['email'],
                'password' => Hash::make('123123123'),
                'role' => 'employee',
                'division_id' => Division::where('name', $employee['division'])->first()->id,
                'email_verified_at' => now(),
            ]);
        }
    }
}