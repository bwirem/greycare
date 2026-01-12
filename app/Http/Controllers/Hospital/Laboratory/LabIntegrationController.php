<?php

namespace App\Http\Controllers\Hospital\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

// Models
use App\Models\Laboratory\LabSample;
use App\Models\Laboratory\LabResult;
use App\Models\Laboratory\LabTestParameter;

class LabIntegrationController extends Controller
{
    /**
     * Handle incoming Lab Results (JSON format)
     * Endpoint: POST /api/lis/results
     * 
     * Expected JSON Payload:
     * {
     *   "sample_id": "2501120055",
     *   "results": [
     *     { "code": "WBC", "value": "12.5", "flag": "H" },
     *     { "code": "RBC", "value": "4.50", "flag": "N" }
     *   ]
     * }
     */
    public function receiveResults(Request $request)
    {
        // 1. Log incoming data (Critical for debugging connection issues)
        Log::channel('daily')->info('LIS Integration Data Received:', $request->all());

        // 2. Validate the incoming JSON structure
        $validator = Validator::make($request->all(), [
            'sample_id' => 'required|string', // This matches lab_samples.sample_code
            'results'   => 'required|array',
            'results.*.code'  => 'required|string',
            'results.*.value' => 'required',
        ]);

        if ($validator->fails()) {
            Log::warning('LIS Validation Failed', $validator->errors()->toArray());
            return response()->json([
                'status' => 'error', 
                'message' => 'Validation Error', 
                'errors' => $validator->errors()
            ], 422);
        }

        // 3. Find the Sample in the Database
        // The Technician must have typed this specific ID into the Machine.
        $sample = LabSample::where('sample_code', $request->sample_id)->first();

        if (!$sample) {
            Log::error("LIS Error: Sample Code not found in DB: " . $request->sample_id);
            return response()->json([
                'status' => 'error', 
                'message' => 'Sample Code not found. Please check if barcode matches.'
            ], 404);
        }

        // 4. Process Results inside a Database Transaction
        DB::beginTransaction();
        try {
            $updatedCount = 0;

            foreach ($request->results as $row) {
                // A. Map Machine Code (e.g., "WBC") to Internal Parameter ID
                $parameter = LabTestParameter::where('machine_code', $row['code'])->first();

                if ($parameter) {
                    // B. Determine Flags
                    $machineFlag = $row['flag'] ?? null; // e.g., 'H', 'L', 'N'
                    
                    // Simple logic: if machine sends H/L/HH/LL, mark as abnormal
                    $isAbnormal = in_array($machineFlag, ['H', 'L', 'HH', 'LL', 'POS', '+']);
                    $isCritical = in_array($machineFlag, ['HH', 'LL', '++']);

                    // C. Create or Update the Result Record
                    LabResult::updateOrCreate(
                        [
                            'lab_sample_id'         => $sample->id,
                            'lab_test_parameter_id' => $parameter->id,
                        ],
                        [
                            'result_value'      => $row['value'],       // The clean value
                            'machine_raw_value' => $row['value'],       // Keep raw just in case
                            'machine_flag'      => $machineFlag,        // Store the flag (H/L)
                            'is_abnormal'       => $isAbnormal,
                            'is_critical'       => $isCritical,
                            'remarks'           => 'Received from Analyzer ' . now()->format('H:i'),
                            'technician_user_id'=> 1, // Optional: Assign to System User
                        ]
                    );

                    $updatedCount++;
                } else {
                    // Log warning if the machine sends a code we don't recognize
                    Log::warning("LIS Warning: Unknown parameter code received: " . $row['code']);
                }
            }

            // 5. Update Sample Status
            // Only update if it's not already completed to prevent overwriting final reports
            if ($sample->status !== 'completed' && $updatedCount > 0) {
                $sample->update([
                    'status' => 'analyzed', // Tells the Tech "Results are ready to view"
                    'notes'  => $sample->notes . "\n[System]: Results received from Analyzer at " . now(),
                ]);
            }

            DB::commit();

            Log::info("LIS Success: Updated $updatedCount results for Sample " . $request->sample_id);

            return response()->json([
                'status' => 'success', 
                'message' => 'Results processed successfully',
                'count' => $updatedCount
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("LIS Critical Error: " . $e->getMessage());
            return response()->json([
                'status' => 'error', 
                'message' => 'Internal Server Error'
            ], 500);
        }
    }
}