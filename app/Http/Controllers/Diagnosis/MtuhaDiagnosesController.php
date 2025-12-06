<?php

namespace App\Http\Controllers\Diagnosis;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
// Import Models
use App\Models\Diagnosis\DxtDiagnosesOpd;
use App\Models\Diagnosis\DxtDiagnosesIpd;
use App\Models\Diagnosis\DxtDiagnosesDental;
use App\Models\Diagnosis\DxtDiagnosesEyes;
use App\Models\Diagnosis\DxtDiagnosesGroup;

class MtuhaDiagnosesController extends Controller
{
    /**
     * Helper to resolve model based on type string.
     */
    private function getModel($type)
    {
        return match ($type) {
            'opd'    => new DxtDiagnosesOpd(),
            'ipd'    => new DxtDiagnosesIpd(),
            'dental' => new DxtDiagnosesDental(),
            'eyes'   => new DxtDiagnosesEyes(),
            default  => abort(404, 'Invalid Diagnosis Type'),
        };
    }

    private function getTitle($type)
    {
        return match ($type) {
            'opd'    => 'OPD Diagnoses',
            'ipd'    => 'IPD Diagnoses',
            'dental' => 'Dental Diagnoses',
            'eyes'   => 'Eye Clinic Diagnoses',
            default  => 'Mtuha Diagnoses',
        };
    }

    public function index(Request $request, $type)
    {
        $model = $this->getModel($type);
        
        $query = $model->query()->with('group');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Index', [
            'diagnoses' => $query->latest()->paginate(15),
            'type'      => $type, // Pass type to frontend for tabs
            'pageTitle' => $this->getTitle($type),
            'filters'   => $request->only(['search']),
        ]);
    }

    public function create($type)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Create', [
            'type' => $type,
            'pageTitle' => $this->getTitle($type),
            'groups' => DxtDiagnosesGroup::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, $type)
    {
        $model = $this->getModel($type);
        $table = $model->getTable(); // Get exact table name for unique validation

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "nullable|string|max:50|unique:$table,code",
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
            'subgroup' => 'nullable|string|max:50',
            'maptocode' => 'nullable|string|max:50', // Map to ICD
        ]);

        $model->create($validated);

        return redirect()->route('systemconfiguration5.mtuha.index', $type)
            ->with('success', 'Diagnosis created successfully.');
    }

    public function edit($type, $id)
    {
        $model = $this->getModel($type);
        
        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Edit', [
            'diagnosis' => $model->findOrFail($id),
            'type' => $type,
            'pageTitle' => $this->getTitle($type),
            'groups' => DxtDiagnosesGroup::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, $type, $id)
    {
        $model = $this->getModel($type)->findOrFail($id);
        $table = $model->getTable();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "nullable|string|max:50|unique:$table,code,$id",
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
            'subgroup' => 'nullable|string|max:50',
            'maptocode' => 'nullable|string|max:50',
        ]);

        $model->update($validated);

        return redirect()->route('systemconfiguration5.mtuha.index', $type)
            ->with('success', 'Diagnosis updated.');
    }

    public function destroy($type, $id)
    {
        $this->getModel($type)->findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Deleted successfully.');
    }
}