<?php

namespace App\Http\Controllers\Diagnosis;

use App\Http\Controllers\Controller;

// Models
use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesGroup;

// Imports for Excel handling
use App\Imports\IcdDiagnosesImport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DxtDiagnosesIcdController extends Controller
{
    public function index(Request $request)
    {
        $query = DxtDiagnosesIcd::with('group');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Icd/Index', [
            'diagnoses' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Icd/Create', [
            'groups' => DxtDiagnosesGroup::orderBy('name')->get(['id', 'name'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:dxt_diagnoses_icd,code',
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
        ]);

        DxtDiagnosesIcd::create($request->all());

        return redirect()->route('systemconfiguration5.diagnoses.index')
            ->with('success', 'ICD Diagnosis created successfully.');
    }

    public function edit($id)
    {
        $diagnosis = DxtDiagnosesIcd::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/Icd/Edit', [
            'diagnosis' => $diagnosis,
            'groups' => DxtDiagnosesGroup::orderBy('name')->get(['id', 'name'])
        ]);
    }

    public function update(Request $request, $id)
    {
        $diagnosis = DxtDiagnosesIcd::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:dxt_diagnoses_icd,code,' . $id,
            'dxt_diagnoses_group_id' => 'nullable|exists:dxt_diagnoses_groups,id',
        ]);

        $diagnosis->update($request->all());

        return redirect()->route('systemconfiguration5.diagnoses.index')
            ->with('success', 'ICD Diagnosis updated.');
    }

    public function destroy($id)
    {
        DxtDiagnosesIcd::findOrFail($id)->delete();
        return back()->with('success', 'Diagnosis deleted.');
    }

    /**
     * Show the form for importing ICDs.
     */
    public function showImportForm()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Icd/Import');
    }

    /**
     * Handle the Excel import.
     */
    public function import(Request $request)
    {
        $request->validate([
            // 'txt' added to support CSVs detected as text/plain
            'file' => 'required|file|mimes:xlsx,xls,csv,txt'
        ]);

        try {
            Excel::import(new IcdDiagnosesImport, $request->file('file'));
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
            return redirect()->route('systemconfiguration5.diagnoses.import.show')
                ->with('import_errors', $errors);
        }

        return redirect()->route('systemconfiguration5.diagnoses.index')
            ->with('success', 'ICD Diagnoses imported successfully!');
    }

    /**
     * Download a sample template.
     */
    public function downloadTemplate()
    {
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=icd_import_template.csv",
        ];

        // Columns required in the Excel/CSV
        $columns = ['code', 'name', 'group'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            // Sample Data
            fputcsv($file, ['A00.0', 'Cholera due to Vibrio cholerae 01, biovar cholerae', 'Infectious Diseases']);
            fputcsv($file, ['B50.9', 'Plasmodium falciparum malaria, unspecified', 'Infectious Diseases']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}