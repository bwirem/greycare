<?php

namespace App\Services;

use App\Models\MedicalRecord\MrMtuhaMappingOpd;
use App\Models\MedicalRecord\MrMtuhaMappingIpd;
use App\Models\MedicalRecord\MrMtuhaMappingDental;
use App\Models\MedicalRecord\MrMtuhaMappingEye;

class IcdMappingService
{
    public function findMtuha(string $icdCode, string $Source)
    {
        $icdCode = strtoupper(trim($icdCode));
        // Base code (e.g., "S02.1" becomes "S02")
        $baseCode = substr(explode('.', $icdCode)[0], 0, 3);

        // Get all mappings
        $mappings = MrMtuhaMappingOpd::all();
        if ($Source === 'IPD') {
            $mappings = MrMtuhaMappingIpd::all();
        } elseif ($Source === 'Dental') {
            $mappings = MrMtuhaMappingDental::all();
        } elseif ($Source === 'Eye') {
            $mappings = MrMtuhaMappingEye::all();
        }

        // -------------------------------------------------------------
        // PASS 1: Look for EXACT MATCHES first across all rows
        // -------------------------------------------------------------
        foreach ($mappings as $mapping) {
            if (!empty($mapping->exact_codes)) {
                // Match exact full string (e.g., T14.3)
                if (in_array($icdCode, $mapping->exact_codes)) {
                    return $mapping;
                }
                // Match base code (e.g., S02.1 matches S02)
                if (in_array($baseCode, $mapping->exact_codes)) {
                    return $mapping;
                }
            }
        }

        // -------------------------------------------------------------
        // PASS 2: Look for STANDARD RANGES (Priority 1 & 2)
        // -------------------------------------------------------------
        foreach ($mappings->whereIn('priority', [1, 2]) as $mapping) {
            if ($this->checkRangeMatch($mapping->ranges, $baseCode)) {
                return $mapping;
            }
        }

        // -------------------------------------------------------------
        // PASS 3: Look for "REMAINDER" RANGES (Priority 3)
        // -------------------------------------------------------------
        foreach ($mappings->where('priority', 3) as $mapping) {
            if ($this->checkRangeMatch($mapping->ranges, $baseCode)) {
                return $mapping;
            }
        }

        return null;
    }

    /**
     * Helper function to check if a basecode falls inside a range array
     */
    private function checkRangeMatch($ranges, $baseCode)
    {
        if (empty($ranges)) return false;

        foreach ($ranges as $range) {
            $start = $range[0];
            $end = $range[1];

            // Alphabetical string comparison (e.g. 'S02' >= 'S00' && 'S02' <= 'T14')
            if ($baseCode >= $start && $baseCode <= $end) {
                return true;
            }
        }

        return false;
    }
}