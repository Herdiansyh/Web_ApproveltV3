<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        return Inertia::render('Documents/Index', [
            'documents' => Document::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Document::create($request->only('name', 'description'));
    }

    public function update(Request $request, Document $document)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $document->update($request->only('name', 'description'));
    }

    public function destroy(Document $document)
    {
        $document->delete();
    }
}
