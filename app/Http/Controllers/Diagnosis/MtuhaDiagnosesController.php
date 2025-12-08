<?php

namespace App\Http\Controllers\Diagnosis;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Import models
use App\Models\Diagnosis\DxtDiagnosesOpd;
use App\Models\Diagnosis\DxtDiagnosesIpd;
use App\Models\Diagnosis\DxtDiagnosesDental;
use App\Models\Diagnosis\DxtDiagnosesEyes;
use App\Models\Diagnosis\DxtDiagnosesGroup;

// Import logic
use App\Imports\MtuhaDiagnosesImport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class MtuhaDiagnosesController extends Controller
{
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
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('maptocode', 'like', "%{$request->search}%"); // Enable searching by ICD map
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Index', [
            'diagnoses' => $query->latest()->paginate(15)->withQueryString(),
            'type'      => $type,
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
        $table = $model->getTable();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => "nullable|string|max:50|unique:$table,code",
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
            // subgroup removed
            'maptocode' => 'nullable|string|max:100', // ICD-10 Codes (e.g., "A09, A08")
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
            // subgroup removed
            'maptocode' => 'nullable|string|max:100',
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

    /**
     * Show the form for importing diagnoses.
     */
    public function showImportForm($type)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Import', [
            'type' => $type,
            'pageTitle' => 'Import ' . $this->getTitle($type),
        ]);
    }

    /**
     * Handle the Excel import.
     */
    
    public function import(Request $request, $type)
    {
        $request->validate([
            // FIX: Add 'txt' to allowed mimes because CSVs are often detected as text/plain
            'file' => 'required|file|mimes:xlsx,xls,csv,txt'
        ]);

        try {
            Excel::import(new MtuhaDiagnosesImport($type), $request->file('file'));
        } catch (ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                ];
            }
            return redirect()->route('systemconfiguration5.mtuha.import.show', $type)
                ->with('import_errors', $errors);
        }

        return redirect()->route('systemconfiguration5.mtuha.index', $type)
            ->with('success', 'Diagnoses imported successfully!');
    }

    /**
     * Download a sample template.
     */
    public function downloadTemplate($type)
    {
        // You can create a real file in storage/app/templates, 
        // or generate one on the fly here using a library.
        // For simplicity, assuming you put a file named 'mtuha_import_template.xlsx'
        // in 'storage/app/templates/'
        
        $path = storage_path('app/templates/mtuha_import_template.xlsx');

        if (!file_exists($path)) {
            // Fallback: Create a simpler CSV on the fly if file doesn't exist
            $headers = [
                "Content-type"        => "text/csv",
                "Content-Disposition" => "attachment; filename=mtuha_import_template.csv",
            ];
            $columns = ['name', 'code', 'group', 'icd_map'];

            $callback = function() use ($columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);
                fputcsv($file, ['Malaria Severe', '01', 'Infectious Diseases', 'B50.0, B54']); // Example row
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->download($path);
    }
}