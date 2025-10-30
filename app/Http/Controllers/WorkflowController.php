<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Workflow;
use App\Models\WorkflowStep;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function index()
    {
        $workflows = Workflow::with(['steps.division', 'document'])->get()
            ->map(function ($wf) {
                $wf->steps = $wf->steps->sortBy('step_order')->values();
                return $wf;
            });

        $divisions = Division::all();
        $documents = Document::all();

        return Inertia::render('Workflows/Index', [
            'workflows' => $workflows,
            'divisions' => $divisions,
            'documents' => $documents,
        ]);
    }

    /** ------------------------
     *  SIMPAN WORKFLOW BARU (Dinamis Actions)
     *  ------------------------ */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document_id' => 'required|exists:documents,id',
            'steps' => 'required|array|min:1',
            'steps.*.division_id' => 'required|exists:divisions,id',
            'steps.*.actions' => 'nullable|array', // 🔽 Tambahan validasi
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
            $nextStep = $validated['steps'][$index + 1] ?? null;

            // 🔽 Buat daftar action
            $actions = $step['actions'] ?? [];

            // Jika admin belum isi actions, buat otomatis
            if (empty($actions)) {
                $actions = ['approve', 'reject'];
                if ($nextStep) {
                    $nextDivision = Division::find($nextStep['division_id']);
                    if ($nextDivision) {
                        $actions[] = "request to " . strtolower($nextDivision->name);
                    }
                }
            }

            WorkflowStep::create([
                'workflow_id' => $workflow->id,
                'division_id' => $step['division_id'],
                'step_order' => $index + 1,
                'is_final_step' => ($index + 1 === count($validated['steps'])),
                'actions' => json_encode($actions),
            ]);
        }

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow baru berhasil dibuat dengan action dinamis.');
    }

    /** ------------------------
     *  UPDATE WORKFLOW (Dinamis Actions)
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
            'steps.*.actions' => 'nullable|array', // 🔽 Tambahan validasi
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
            $nextStep = $validated['steps'][$index + 1] ?? null;
            $actions = $step['actions'] ?? [];

            // 🔽 Jika actions kosong, isi otomatis
            if (empty($actions)) {
                $actions = ['approve', 'reject'];
                if ($nextStep) {
                    $nextDivision = Division::find($nextStep['division_id']);
                    if ($nextDivision) {
                        $actions[] = "request to " . strtolower($nextDivision->name);
                    }
                }
            }

            if (isset($step['id'])) {
                WorkflowStep::where('id', $step['id'])->update([
                    'division_id' => $step['division_id'],
                    'step_order' => $index + 1,
                    'is_final_step' => ($index + 1 === count($validated['steps'])),
                    'actions' => json_encode($actions),
                ]);
            } else {
                WorkflowStep::create([
                    'workflow_id' => $workflow->id,
                    'division_id' => $step['division_id'],
                    'step_order' => $index + 1,
                    'is_final_step' => ($index + 1 === count($validated['steps'])),
                    'actions' => json_encode($actions),
                ]);
            }
        }

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow berhasil diperbarui dengan action dinamis.');
    }

    public function edit(Workflow $workflow)
    {
        $workflow->load(['steps.division', 'document']);
        $workflow->steps = $workflow->steps->sortBy('step_order')->values();
        $divisions = Division::all();
        $documents = Document::all();

        return Inertia::render('Workflows/Edit', [
            'workflow' => $workflow,
            'divisions' => $divisions,
            'documents' => $documents,
        ]);
    }

    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('workflows.index')
            ->with('success', 'Workflow berhasil dihapus.');
    }
}
