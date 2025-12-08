<?php

namespace App\Imports;

use App\Models\Diagnosis\DxtDiagnosesGroup;
use App\Models\Diagnosis\DxtDiagnosesOpd;
use App\Models\Diagnosis\DxtDiagnosesIpd;
use App\Models\Diagnosis\DxtDiagnosesDental;
use App\Models\Diagnosis\DxtDiagnosesEyes;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Validation\Rule;

class MtuhaDiagnosesImport implements ToModel, WithHeadingRow, WithValidation
{
    private $type;
    private $modelClass;
    private $tableName;

    public function __construct($type)
    {
        $this->type = $type;
        
        // Determine Model and Table dynamically
        $this->modelClass = match ($type) {
            'opd'    => DxtDiagnosesOpd::class,
            'ipd'    => DxtDiagnosesIpd::class,
            'dental' => DxtDiagnosesDental::class,
            'eyes'   => DxtDiagnosesEyes::class,
            default  => DxtDiagnosesOpd::class,
        };

        // Get table name for validation rules
        $instance = new $this->modelClass;
        $this->tableName = $instance->getTable();
    }

    public function model(array $row)
    {
        // 1. Find or Create the Group (e.g., "Infectious Diseases")
        $group = null;
        if (!empty($row['group'])) {
            $group = DxtDiagnosesGroup::firstOrCreate(
                ['name' => trim($row['group'])]
            );
        }

        // 2. Create the Diagnosis
        return new $this->modelClass([
            'name'                   => $row['name'],
            'code'                   => $row['code'] ?? null,
            'maptocode'              => $row['icd_map'] ?? null, // Excel Header: "icd_map"
            'dxt_diagnoses_group_id' => $group ? $group->id : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:255',
            'code'    => ['nullable', 'string', 'max:50', Rule::unique($this->tableName, 'code')],
            'group'   => 'nullable|string|max:255',
            'icd_map' => 'nullable|string|max:100',
        ];
    }
}