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
            // Updated to match your database columns
            $query->where('description', 'like', "%{$request->search}%")
                  ->orWhere('mtuha_code', 'like', "%{$request->search}%")
                  ->orWhere('exact_codes', 'like', "%{$request->search}%"); 
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Index', [
            // Replaced latest() with orderBy('id')
            'diagnoses' => $query->orderBy('id')->paginate(20)->withQueryString(),
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

        // Updated validation to match frontend form fields
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'mtuha_code' => "nullable|string|max:50|unique:$table,mtuha_code",
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
            'exact_codes' => 'nullable|string',
            'ranges' => 'nullable|string',
            'priority' => 'nullable|integer',
        ]);

        // Format the strings into arrays for the database JSON cast
        $dataToSave = $this->formatMappingData($validated);

        $model->create($dataToSave);

        return redirect()->route('systemconfiguration5.mtuha.index', $type)
            ->with('success', 'Diagnosis created successfully.');
    }

    public function edit($type, $id)
    {
        $model = $this->getModel($type);
        $diagnosis = $model->findOrFail($id);
        
        // Since exact_codes and ranges are arrays in the database, we need to convert them 
        // back to strings for the React input fields (e.g. ['A09', 'E86'] -> "A09, E86")
        if (is_array($diagnosis->exact_codes)) {
            $diagnosis->exact_codes = implode(', ', $diagnosis->exact_codes);
        }
        
        if (is_array($diagnosis->ranges)) {
            $formattedRanges = [];
            foreach($diagnosis->ranges as $range) {
                $formattedRanges[] = implode('-', $range);
            }
            $diagnosis->ranges = implode(', ', $formattedRanges);
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Mtuha/Edit', [
            'diagnosis' => $diagnosis,
            'type' => $type,
            'pageTitle' => $this->getTitle($type),
            'groups' => DxtDiagnosesGroup::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, $type, $id)
    {
        $model = $this->getModel($type)->findOrFail($id);
        $table = $model->getTable();

        // Updated validation to match frontend form fields
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'mtuha_code' => "nullable|string|max:50|unique:$table,mtuha_code,$id",
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
            'exact_codes' => 'nullable|string',
            'ranges' => 'nullable|string',
            'priority' => 'nullable|integer',
        ]);

        // Format the strings into arrays for the database JSON cast
        $dataToSave = $this->formatMappingData($validated);

        $model->update($dataToSave);

        return redirect()->route('systemconfiguration5.mtuha.index', $type)
            ->with('success', 'Diagnosis updated.');
    }

    public function destroy($type, $id)
    {
        $this->getModel($type)->findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Deleted successfully.');
    }

    /**
     * Helper method to convert text inputs from React into Arrays for the Model $casts
     */
    private function formatMappingData(array $validated)
    {
        // 1. Convert comma-separated string to Array for exact_codes (e.g. "B50, B54" -> ['B50', 'B54'])
        if (!empty($validated['exact_codes'])) {
            $validated['exact_codes'] = array_map('trim', explode(',', $validated['exact_codes']));
        } else {
            $validated['exact_codes'] = null;
        }

        // 2. Convert string to Array of Arrays for ranges (e.g. "A15-A19" -> [['A15', 'A19']])
        if (!empty($validated['ranges'])) {
            $rangeStrings = array_map('trim', explode(',', $validated['ranges']));
            $formattedRanges = [];
            
            foreach($rangeStrings as $rs) {
                $parts = array_map('trim', explode('-', $rs));
                if(count($parts) === 2) {
                    $formattedRanges[] = [$parts[0], $parts[1]];
                }
            }
            $validated['ranges'] = count($formattedRanges) > 0 ? $formattedRanges : null;
        } else {
            $validated['ranges'] = null;
        }

        // 3. Set default priority if empty
        $validated['priority'] = $validated['priority'] ?? 1;

        return $validated;
    }

    // ... (Keep your showImportForm, import, and downloadTemplate methods down here exactly as they were) ...
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