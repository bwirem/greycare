<?php

namespace App\Services;

use App\Models\Laboratory\LabPrescription;
use App\Models\Radiology\RadRequest;
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Theatre\TheatreBooking;
use App\Models\Opd\OpdBooking;

use Illuminate\Support\Facades\Log;

class HospitalBillingService
{
    /**
     * Fetch all unpaid clinical orders for a given Patient Code.
     */
    public function getPendingCharges(string $patientCode)
    {
        $charges = collect();

        // --- CONSULTATIONS ---
        // Fetch OPD Bookings where payment is pending AND a bill item was assigned
        $consultations = OpdBooking::with(['billItem']) // Relationship to BLSItem via bill_item_id
            ->where('patientcode', $patientCode)
            ->where('payment_status', 'unpaid')
            ->whereNotNull('bill_item_id') // Only if a charge applies
            ->get();

        foreach ($consultations as $visit) {
            if ($visit->billItem) {
                
                // Use the specific item saved during registration
                $charges->push([
                    'source_type' => 'consultation',
                    'source_id'   => $visit->id,
                    'item_id'     => $visit->billItem->id,
                    'item_name'   => $visit->billItem->name . ' (' . $visit->visit_classification . ')',
                    'quantity'    => 1,
                    'price'       => $visit->billItem->price1, // Or logic for insurance price
                    'stock_qty'   => 0,
                ]);
            }
        }

        // 1. LABORATORY
        // Look for 'Requested' items that are 'unpaid'
        $labs = LabPrescription::with(['panel.blsItem'])
            ->where('patientcode', $patientCode)
            ->where('status', 'Requested') 
            ->where('payment_status', 'unpaid')
            ->get();

        foreach ($labs as $lab) {
            // Ensure the Lab Panel is linked to a Billing Item (BLSItem)
            if ($lab->panel && $lab->panel->blsItem) {
                $charges->push([
                    'source_type' => 'laboratory',
                    'source_id'   => $lab->id,
                    'item_id'     => $lab->panel->blsItem->id,
                    'item_name'   => $lab->panel->blsItem->name,
                    'quantity'    => 1,
                    'price'       => $lab->panel->blsItem->price1, // Default to Price1
                    'stock_qty'   => 0, // Services have no stock
                ]);
            }
        }

        // 2. RADIOLOGY
        // Look for 'Ordered' items that are 'unpaid'
        $rads = RadRequest::with(['procedure.blsItem'])
            ->where('patientcode', $patientCode)
            ->where('status', 'Ordered')
            ->where('payment_status', 'unpaid')
            ->get();

        foreach ($rads as $rad) {
            if ($rad->procedure && $rad->procedure->blsItem) {
                $charges->push([
                    'source_type' => 'radiology',
                    'source_id'   => $rad->id,
                    'item_id'     => $rad->procedure->blsItem->id,
                    'item_name'   => $rad->procedure->blsItem->name,
                    'quantity'    => 1,
                    'price'       => $rad->procedure->blsItem->price1,
                    'stock_qty'   => 0,
                ]);
            }
        }

        // 3. PHARMACY
        // Look for 'Prescribed' items that are 'unpaid'
        $meds = PharmacyPrescription::with(['product.blsItem'])
            ->where('patientcode', $patientCode)
            ->where('status', 'Prescribed')
            ->where('payment_status', 'unpaid')
            ->get();

        foreach ($meds as $med) {
            if ($med->product && $med->product->blsItem) {
                $charges->push([
                    'source_type' => 'pharmacy',
                    'source_id'   => $med->id,
                    'item_id'     => $med->product->blsItem->id,
                    'item_name'   => $med->product->blsItem->name,
                    'quantity'    => $med->quantity_prescribed,
                    'price'       => $med->product->blsItem->price1,
                    // Note: Pharmacy dispensing checks stock later, pass 0 for now or fetch actual stock if needed
                    'stock_qty'   => 0, 
                ]);
            }
        }

        // 4. THEATRE
        // Look for 'Scheduled' items that are 'unpaid'
        $surgeries = TheatreBooking::with(['procedure.blsItem'])
            ->where('patientcode', $patientCode)
            ->where('status', 'Scheduled')
            ->where('payment_status', 'unpaid')
            ->get();

        foreach ($surgeries as $surg) {
            if ($surg->procedure && $surg->procedure->blsItem) {
                $charges->push([
                    'source_type' => 'theatre',
                    'source_id'   => $surg->id,
                    'item_id'     => $surg->procedure->blsItem->id,
                    'item_name'   => $surg->procedure->blsItem->name,
                    'quantity'    => 1,
                    'price'       => $surg->procedure->blsItem->price1,
                    'stock_qty'   => 0,
                ]);
            }
        }

        return $charges;
    }

    /**
     * Mark clinical requests as PAID.
     * This moves the workflow forward (e.g., Lab can now collect sample).
     */
    public function markAsPaid(array $orderItem)
    {
        if (empty($orderItem['source_type']) || empty($orderItem['source_id'])) {
            return;
        }

        $id = $orderItem['source_id'];

        switch ($orderItem['source_type']) {
            case 'laboratory':
                // Move from 'unpaid' to 'paid'. Status remains 'Requested' until sample collection.
                LabPrescription::where('id', $id)->update(['payment_status' => 'paid']);
                break;

            case 'radiology':
                RadRequest::where('id', $id)->update(['payment_status' => 'paid']);
                break;

            case 'pharmacy':
                PharmacyPrescription::where('id', $id)->update(['payment_status' => 'paid']);
                break;
                
            case 'theatre':
                TheatreBooking::where('id', $id)->update(['payment_status' => 'paid']);
                break;
        }
    }
}