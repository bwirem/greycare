<?php

namespace App\Imports;

use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesGroup;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class IcdDiagnosesImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    protected array $groups = [];

    public function collection(Collection $rows)
    {
        // Cache groups once
        if (empty($this->groups)) {
            $this->groups = DxtDiagnosesGroup::pluck('id', 'name')->toArray();
        }

        $insert = [];

        foreach ($rows as $row) {
            if (empty($row['code']) || empty($row['name'])) {
                continue;
            }

            $groupId = null;

            if (!empty($row['group'])) {
                $groupName = trim($row['group']);

                if (!isset($this->groups[$groupName])) {
                    $group = DxtDiagnosesGroup::create(['name' => $groupName]);
                    $this->groups[$groupName] = $group->id;
                }

                $groupId = $this->groups[$groupName];
            }

            $insert[] = [
                'code' => trim($row['code']),
                'name' => trim($row['name']),
                'dxt_diagnoses_group_id' => $groupId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Batch insert (ignore duplicates)
        if (!empty($insert)) {
            DxtDiagnosesIcd::insertOrIgnore($insert);
        }
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
