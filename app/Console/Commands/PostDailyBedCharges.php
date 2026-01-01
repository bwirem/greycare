<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdBedCharge;

// Service
use App\Services\BillingService;

class PostDailyBedCharges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ipd:post-charges';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Post daily bed/room charges for all active admissions.';

    /**
     * Execute the console command.
     */
    public function handle(BillingService $billingService)
    {
        $today = Carbon::today()->format('Y-m-d');
        $this->info("Starting Bed Charge Process for: {$today}");

        // 1. Get all currently ADMITTED patients
        // Eager load the Ward and its linked Billing Item
        $admissions = IpdAdmission::with(['ward.blsItem', 'patient'])
            ->where('status', 'Admitted')
            ->whereNotNull('bed_id') // Ensure they are physically assigned a bed
            ->get();

        if ($admissions->isEmpty()) {
            $this->info("No active admissions found.");
            return;
        }

        $successCount = 0;
        $skippedCount = 0;
        $errorCount = 0;

        foreach ($admissions as $admission) {
            
            // A. Validation: Does the Ward have a Price?
            // Note: We use 'blsItem' because of the relationship defined in IpdWard
            if (!$admission->ward || !$admission->ward->blsItem) {
                $this->error("Skipping Admission ID {$admission->id}: Ward '{$admission->ward->name}' has no linked Billing Item (Price).");
                $errorCount++;
                continue;
            }

            // B. Duplicate Check: Have we already charged this patient today?
            $alreadyCharged = IpdBedCharge::where('ipd_admission_id', $admission->id)
                ->whereDate('charge_date', $today)
                ->exists();

            if ($alreadyCharged) {
                // $this->line("Skipping Admission ID {$admission->id}: Already charged today.");
                $skippedCount++;
                continue;
            }

            // C. Process Charge
            try {
                DB::transaction(function () use ($admission, $billingService, $today) {
                    
                    // Determine Price
                    // TODO: If you implement Insurance Categories later, logic goes here.
                    // For now, use Price1 (Cash/Standard)
                    $price = $admission->ward->blsItem->price1;

                    // 1. Create Internal Log
                    $chargeRecord = IpdBedCharge::create([
                        'ipd_admission_id' => $admission->id,
                        'charge_date' => $today,
                        'amount' => $price
                    ]);

                    // 2. Push to Billing Module (Financials)
                    $billingService->addToBill(
                        $admission->patientcode,
                        $admission->ward->blsItem->id, // The Bill Item ID
                        1,                             // Quantity (1 Day)
                        'ipd_bed_charge',              // Source Type
                        $chargeRecord->id,              // Source ID
                        $admission->pricecategory // Price Category
                    );
                });

                $this->info("Charged: {$admission->patient->first_name} {$admission->patient->last_name} ({$admission->patientcode})");
                $successCount++;

            } catch (\Exception $e) {
                $this->error("Failed to charge Admission ID {$admission->id}: " . $e->getMessage());
                $errorCount++;
            }
        }

        $this->info("--------------------------------------------------");
        $this->info("Process Complete.");
        $this->info("Charged: {$successCount}");
        $this->info("Skipped (Already Done): {$skippedCount}");
        $this->info("Errors (No Price/Config): {$errorCount}");
    }
}