<?php

namespace App\Imports;

use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesGroup;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\Rule;

class IcdDiagnosesImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // 1. Find or Create the Group (e.g., "Infectious Diseases")
        $group = null;
        if (!empty($row['group'])) {
            $group = DxtDiagnosesGroup::firstOrCreate(
                ['name' => trim($row['group'])]
            );
        }

        // 2. Create the ICD Diagnosis
        return new DxtDiagnosesIcd([
            'code'                   => $row['code'],
            'name'                   => $row['name'],
            'dxt_diagnoses_group_id' => $group ? $group->id : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'code'  => 'required|string|max:20|unique:dxt_diagnoses_icd,code',
            'name'  => 'required|string|max:255',
            'group' => 'nullable|string|max:255',
        ];
    }
}