<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    /** ------------------------
     *  TAMPILKAN SEMUA WORKFLOW
     *  ------------------------ */
    public function index()
    {
        $workflows = Workflow::with(['steps.division'])->get()
            ->map(function ($wf) {
                // Pastikan steps terurut
                $wf->steps = $wf->steps->sortBy('step_order')->values();
                return $wf;
            });

        $divisions = Division::all();

        return Inertia::render('Workflows/Index', [
            'workflows' => $workflows,
            'divisions' => $divisions,
        ]);
    }

    /** ------------------------
     *  SIMPAN WORKFLOW BARU
     *  ------------------------ */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.division_id' => 'required|exists:divisions,id',
        ]);

       $workflow = Workflow::create([
    'name' => $validated['name'],
    'description' => $validated['description'] ?? null,
    'division_from_id' => $validated['steps'][0]['division_id'],
    'division_to_id' => $validated['steps'][count($validated['steps']) - 1]['division_id'],
]);


        foreach ($validated['steps'] as $index => $step) {
    WorkflowStep::create([
        'workflow_id' => $workflow->id,
        'division_id' => $step['division_id'],
        'step_order' => $index + 1,
    ]);
}

        // Update division_from_id dan division_to_id
        $workflow->update([
            'division_from_id' => $validated['steps'][0]['division_id'],
            'division_to_id' => $validated['steps'][count($validated['steps']) - 1]['division_id'],
        ]);

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow baru berhasil dibuat.');
    }

    /** ------------------------
     *  FORM EDIT WORKFLOW
     *  ------------------------ */
    public function edit(Workflow $workflow)
    {
        $workflow->load(['steps.division']);
        $workflow->steps = $workflow->steps->sortBy('step_order')->values();
        $divisions = Division::all();

        return Inertia::render('Workflows/Edit', [
            'workflow' => $workflow,
            'divisions' => $divisions,
        ]);
    }

    /** ------------------------
     *  UPDATE WORKFLOW
     *  ------------------------ */
    public function update(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.id' => 'nullable|exists:workflow_steps,id',
            'steps.*.division_id' => 'required|exists:divisions,id',
        ]);

        $workflow->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'division_from_id' => $validated['steps'][0]['division_id'],
            'division_to_id' => $validated['steps'][count($validated['steps']) - 1]['division_id'],
        ]);

        foreach ($validated['steps'] as $index => $step) {
            if (isset($step['id'])) {
                $existingStep = WorkflowStep::find($step['id']);
                if ($existingStep) {
                    $existingStep->update([
                        'division_id' => $step['division_id'],
                        'step_order' => $index + 1,
                    ]);
                }
            } else {
                WorkflowStep::create([
                    'workflow_id' => $workflow->id,
                    'division_id' => $step['division_id'],
                    'step_order' => $index + 1,
                ]);
            }
        }

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow berhasil diperbarui.');
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
