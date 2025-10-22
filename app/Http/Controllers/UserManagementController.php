<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class UserManagementController extends Controller
{
    public function index()
    {
        $this->authorize('manage-users');
        
        return Inertia::render('UserManagement/Index', [
            'users' => User::with('division')->latest()->get(),
            'divisions' => Division::all(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage-users');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:manager,employee',
            'division_id' => 'required|exists:divisions,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'division_id' => $request->division_id,
            'email_verified_at' => now(),
        ]);

        return redirect()->back()->with('message', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('manage-users');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:manager,employee',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'division_id' => $request->division_id,
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        return redirect()->back()->with('message', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('manage-users');
        
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();
        return redirect()->back()->with('message', 'User deleted successfully.');
    }
}