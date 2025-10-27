<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\Document; // baru
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    /** ------------------------
     *  TAMPILKAN SEMUA WORKFLOW
     *  ------------------------ */
    public function index()
    {
        $workflows = Workflow::with(['steps.division', 'document'])->get()
            ->map(function ($wf) {
                $wf->steps = $wf->steps->sortBy('step_order')->values();
                return $wf;
            });

        $divisions = Division::all();
        $documents = Document::all(); // baru

        return Inertia::render('Workflows/Index', [
            'workflows' => $workflows,
            'divisions' => $divisions,
            'documents' => $documents,
        ]);
    }

    /** ------------------------
     *  SIMPAN WORKFLOW BARU
     *  ------------------------ */
   /** ------------------------
 *  SIMPAN WORKFLOW BARU
 *  ------------------------ */
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'document_id' => 'required|exists:documents,id',
        'steps' => 'required|array|min:1',
        'steps.*.division_id' => 'required|exists:divisions,id',
    ]);

    $workflow = Workflow::create([
        'name' => $validated['name'],
        'description' => $validated['description'] ?? null,
        'document_id' => $validated['document_id'],
        'division_from_id' => $validated['steps'][0]['division_id'],
        'division_to_id' => $validated['steps'][count($validated['steps']) - 1]['division_id'],
        'total_steps' => count($validated['steps']),
    ]);

    foreach ($validated['steps'] as $index => $step) {
        WorkflowStep::create([
            'workflow_id' => $workflow->id,
            'division_id' => $step['division_id'],
            'step_order' => $index + 1,
            'is_final_step' => ($index + 1 === count($validated['steps'])), // tandai step terakhir
        ]);
    }

    return redirect()->route('workflows.index')
        ->with('success', 'Workflow baru berhasil dibuat.');
}

/** ------------------------
 *  UPDATE WORKFLOW
 *  ------------------------ */
public function update(Request $request, Workflow $workflow)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'document_id' => 'required|exists:documents,id',
        'steps' => 'required|array|min:1',
        'steps.*.id' => 'nullable|exists:workflow_steps,id',
        'steps.*.division_id' => 'required|exists:divisions,id',
    ]);

    $workflow->update([
        'name' => $validated['name'],
        'description' => $validated['description'] ?? null,
        'document_id' => $validated['document_id'],
        'division_from_id' => $validated['steps'][0]['division_id'],
        'division_to_id' => $validated['steps'][count($validated['steps']) - 1]['division_id'],
        'total_steps' => count($validated['steps']),
    ]);

    foreach ($validated['steps'] as $index => $step) {
        if (isset($step['id'])) {
            $existingStep = WorkflowStep::find($step['id']);
            if ($existingStep) {
                $existingStep->update([
                    'division_id' => $step['division_id'],
                    'step_order' => $index + 1,
                    'is_final_step' => ($index + 1 === count($validated['steps'])),
                ]);
            }
        } else {
            WorkflowStep::create([
                'workflow_id' => $workflow->id,
                'division_id' => $step['division_id'],
                'step_order' => $index + 1,
                'is_final_step' => ($index + 1 === count($validated['steps'])),
            ]);
        }
    }

    return redirect()->route('workflows.index')
        ->with('success', 'Workflow berhasil diperbarui.');
}

    /** ------------------------
     *  FORM EDIT WORKFLOW
     *  ------------------------ */
    public function edit(Workflow $workflow)
    {
        $workflow->load(['steps.division', 'document']);
        $workflow->steps = $workflow->steps->sortBy('step_order')->values();
        $divisions = Division::all();
        $documents = Document::all(); // baru

        return Inertia::render('Workflows/Edit', [
            'workflow' => $workflow,
            'divisions' => $divisions,
            'documents' => $documents,
        ]);
    }

 

    /** ------------------------
     *  HAPUS WORKFLOW
     *  ------------------------ */
    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow berhasil dihapus.');
    }
}
