<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct()
    {
        // Authorization is handled by route middleware
    }
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('division')->latest()->paginate(10),
            'divisions' => Division::all(),
            'roles' => ['manager', 'employee', 'admin'],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', Rules\Password::defaults()],
            'role' => 'required|in:manager,employee,admin',
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

        return redirect()->back()->with('message', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:manager,employee,admin',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'division_id' => $request->division_id,
        ];

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'string', Rules\Password::defaults()],
            ]);
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->back()->with('message', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account');
        }

        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully');
    }
}