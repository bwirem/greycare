<?php
namespace App\Observers;

use App\Models\Radiology\RadRequest;
use App\Services\OrthancService;
use Illuminate\Support\Str;

class RadRequestObserver
{
    public function creating(RadRequest $request)
    {
        // Ensure every request has a unique Accession Number
        if (empty($request->accession_number)) {
            $request->accession_number = 'ACC-' . date('Ymd') . '-' . strtoupper(Str::random(5));
        }
    }

    public function created(RadRequest $request)
    {
        // Push to Orthanc immediately after saving to DB
        try {
            $request->load(['patient', 'procedure.modality']);
            (new OrthancService())->createWorklist($request);
        } catch (\Exception $e) {
            \Log::error("Orthanc MWL Push Failed: " . $e->getMessage());
        }
    }
}