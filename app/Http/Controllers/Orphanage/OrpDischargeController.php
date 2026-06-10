<?php

namespace App\Http\Controllers\Orphanage;

use App\Http\Controllers\Controller;
use App\Models\Orphanage\OrpDischarge;
use App\Models\Orphanage\OrpRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrpDischargeController extends Controller
{
    public function index(Request $request)
    {
        $query = OrpDischarge::query()
            ->orderByDesc('transdate');

        if ($request->search) {

            $query->where(function ($q) use ($request) {

                $q->where(
                    'childcode',
                    'like',
                    "%{$request->search}%"
                )
                ->orWhere(
                    'parentname',
                    'like',
                    "%{$request->search}%"
                )
                ->orWhere(
                    'guardianname',
                    'like',
                    "%{$request->search}%"
                )
                ->orWhere(
                    'contact',
                    'like',
                    "%{$request->search}%"
                );
            });
        }

        return Inertia::render(
            'Orphanage/Discharges/Index',
            [
                'discharges' => $query
                    ->paginate(10)
                    ->withQueryString(),

                'filters' => [
                    'search' => $request->search
                ]
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'Orphanage/Discharges/Create',
            [
                'registrations' => OrpRegistration::orderBy('childcode')
                    ->get()
            ]
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'childcode' => ['required'],
            'transdate' => ['required'],
            'parentname' => ['required'],
        ]);

        OrpDischarge::create([
            'sysdate' => now(),
            'transdate' => $request->transdate,
            'childcode' => $request->childcode,
            'parentname' => $request->parentname,
            'guardianname' => $request->guardianname,
            'relationship' => $request->relationship,
            'physicaladdress' => $request->physicaladdress,
            'contact' => $request->contact,
            'user_id' => Auth::id(),
        ]);

        return redirect()
            ->route('orphanage2.index')
            ->with(
                'success',
                'Discharge recorded successfully.'
            );
    }

    public function edit(OrpDischarge $discharge)
    {
        return Inertia::render(
            'SystemConfiguration/Discharges/Edit',
            [
                'discharge' => $discharge,

                'registrations' => OrpRegistration::orderBy('childcode')
                    ->get()
            ]
        );
    }

    public function update(
        Request $request,
        OrpDischarge $discharge
    ) {
        $request->validate([
            'childcode' => ['required'],
            'transdate' => ['required'],
            'parentname' => ['required'],
        ]);

        $discharge->update([
            'transdate' => $request->transdate,
            'childcode' => $request->childcode,
            'parentname' => $request->parentname,
            'guardianname' => $request->guardianname,
            'relationship' => $request->relationship,
            'physicaladdress' => $request->physicaladdress,
            'contact' => $request->contact,
        ]);

        return redirect()
            ->route('orphanage2.index')
            ->with(
                'success',
                'Discharge updated successfully.'
            );
    }

    public function destroy(
        OrpDischarge $discharge
    ) {
        $discharge->delete();

        return redirect()
            ->route('orphanage2.index')
            ->with(
                'success',
                'Discharge deleted successfully.'
            );
    }
}