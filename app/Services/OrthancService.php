<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Radiology\RadRequest;

class OrthancService
{
    protected $baseUrl;
    protected $auth;
    // Define the Worklist Folder path explicitly for Windows
    protected $worklistFolder = 'C:\\Orthanc\\Worklists';

    public function __construct()
    {
        $this->baseUrl = env('ORTHANC_URL', 'http://127.0.0.1:8042');
        $this->auth = ['orthanc', 'orthanc']; // Ensure these match your config
    }

    public function createWorklist(RadRequest $request)
    {
        // 1. Format Data
        $patientName = strtoupper($request->patient->last_name . '^' . $request->patient->first_name);
        $accession = $request->accession_number;

        // 2. Prepare Payload
        // REMOVED "StudyInstanceUID" so Orthanc can generate it automatically
        $dicomTags = [
            "Tags" => [
                "PatientName" => $patientName,
                "PatientID" => (string) $request->patientcode,
                "PatientBirthDate" => $request->patient->dob ? $request->patient->dob->format('Ymd') : '',
                "PatientSex" => $request->patient->gender === 'Male' ? 'M' : 'F',
                "AccessionNumber" => $accession,
                "RequestedProcedureID" => (string) $request->id,
                "ScheduledProcedureStepSequence" => [
                    [
                        "ScheduledStationAETitle" => "GREYCARE", 
                        "ScheduledProcedureStepStartDate" => now()->format('Ymd'),
                        "ScheduledProcedureStepStartTime" => now()->format('His'),
                        "Modality" => $request->procedure->modality->code ?? "DX",
                        "ScheduledProcedureStepDescription" => $request->procedure->name,
                        "ScheduledProcedureStepID" => (string) $request->id,
                    ]
                ]
            ]
        ];

        try {
            // 3. Generate DICOM in Orthanc DB
            $response = Http::withBasicAuth(...$this->auth)
                ->post("{$this->baseUrl}/tools/create-dicom", $dicomTags);

            if (!$response->successful()) {
                Log::error("Orthanc Gen Failed: " . $response->body());
                return false;
            }

            $instanceId = $response->json()['ID'];

            // 4. Download the File
            $fileResponse = Http::withBasicAuth(...$this->auth)
                ->get("{$this->baseUrl}/instances/{$instanceId}/file");

            if ($fileResponse->successful()) {
                // 5. Save to C:\Orthanc\Worklists
                $fileName = "{$accession}.wl";
                $fullPath = $this->worklistFolder . '\\' . $fileName;

                file_put_contents($fullPath, $fileResponse->body());

                Log::info("Worklist File Created: {$fullPath}");
                
                // Cleanup: Delete the dummy instance from Orthanc DB 
                // (We only need the file in the folder, not in the DB yet)
                Http::withBasicAuth(...$this->auth)->delete("{$this->baseUrl}/instances/{$instanceId}");
                
                return true;
            }

        } catch (\Exception $e) {
            Log::error("Orthanc Connection Error: " . $e->getMessage());
            return false;
        }
    }

    public function findStudyByAccession($accessionNumber)
    {
        try {
            $response = Http::withBasicAuth(...$this->auth)
                ->post("{$this->baseUrl}/tools/find", [
                    'Level' => 'Study',
                    'Query' => ['AccessionNumber' => $accessionNumber]
                ]);

            if ($response->successful()) {
                $studies = $response->json();
                return count($studies) > 0 ? $studies[0] : null;
            }
        } catch (\Exception $e) {
            return null;
        }
        return null;
    }
}