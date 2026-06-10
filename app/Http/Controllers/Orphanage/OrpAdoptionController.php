<?php

namespace App\Http\Controllers\Orphanage;

use App\Http\Controllers\Controller;
use App\Models\Orphanage\OrpAdoptationType;
use App\Models\Orphanage\OrpAdoptativeParent;
use App\Models\Orphanage\OrpAdoptativeOrphanage;
use App\Models\Orphanage\OrpRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrpAdoptionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->search;

        $parents = OrpAdoptativeParent::query()
            ->when($search, function ($query) use ($search) {
                $query->where('childcode', 'like', "%{$search}%")
                    ->orWhere('adoptivefather', 'like', "%{$search}%")
                    ->orWhere('adoptivemother', 'like', "%{$search}%");
            })
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->autocode,
                    'source' => 'parent',
                    'childcode' => $item->childcode,
                    'adoption_type' => 'Orphanage → Adoptive Parent',
                    'destination' => trim($item->adoptivefather . ' & ' . $item->adoptivemother),
                    'contact' => $item->contact,
                    'transdate' => $item->transdate,
                ];
            });

        $orphanages = OrpAdoptativeOrphanage::query()
            ->when($search, function ($query) use ($search) {
                $query->where('childcode', 'like', "%{$search}%")
                    ->orWhere('orphanagename', 'like', "%{$search}%");
            })
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->autocode,
                    'source' => 'orphanage',
                    'childcode' => $item->childcode,
                    'adoption_type' => 'Orphanage → Orphanage',
                    'destination' => $item->orphanagename,
                    'contact' => $item->contact,
                    'transdate' => $item->transdate,
                ];
            });

        $adoptions = $parents
            ->concat($orphanages)
            ->sortByDesc('transdate')
            ->values();

        return Inertia::render(
            'Orphanage/Adoptions/Index',
            [
                'adoptions' => [
                    'data' => $adoptions,
                    'links' => [],
                ],
                'filters' => [
                    'search' => $search,
                ],
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'Orphanage/Adoptions/Create',
            [
                'adoptionTypes' => OrpAdoptationType::orderBy('description')->get(),
                'registrations' => OrpRegistration::orderBy('childcode')->get(),
            ]
        );
    }

    public function store(Request $request)
    {
        $type = OrpAdoptationType::findOrFail(
            $request->adoption_type_id
        );

        if ($type->orphanagetoorphanages == 1) {

            $request->validate([
                'childcode' => 'required',
                'orphanagename' => 'required',
            ]);

            OrpAdoptativeOrphanage::create([
                'sysdate' => now(),
                'transdate' => $request->transdate,
                'childcode' => $request->childcode,
                'orphanagename' => $request->orphanagename,
                'personincharge' => $request->personincharge,
                'position' => $request->position,
                'institution' => $request->institution,
                'contact' => $request->contact,
                'user_id' => Auth::id(),
            ]);
        }

        if ($type->orphanagetoadoptiveparent == 1) {

            $request->validate([
                'childcode' => 'required',
                'adoptivefather' => 'required',
            ]);

            OrpAdoptativeParent::create([
                'sysdate' => now(),
                'transdate' => $request->transdate,
                'childcode' => $request->childcode,
                'adoptivefather' => $request->adoptivefather,
                'adoptivemother' => $request->adoptivemother,
                'maritalstatus' => $request->maritalstatus,
                'numberofbloodchildren' => $request->numberofbloodchildren,
                'numberofadoptedchildren' => $request->numberofadoptedchildren,
                'profession' => $request->profession,
                'physicaladdress' => $request->physicaladdress,
                'contact' => $request->contact,
                'user_id' => Auth::id(),
            ]);
        }

        return redirect()
            ->route('orphanage1.index')
            ->with(
                'success',
                'Adoption recorded successfully.'
            );
    }

    public function edit(Request $request, $id)
    {
        $source = $request->source;

        if ($source === 'parent') {
            $adoption = OrpAdoptativeParent::findOrFail($id);
        } else {
            $adoption = OrpAdoptativeOrphanage::findOrFail($id);
        }

        return Inertia::render(
            'Orphanage/Adoptions/Edit',
            [
                'adoption' => $adoption,
                'source' => $source,
                'adoptionTypes' => OrpAdoptationType::orderBy('description')->get(),
                'registrations' => OrpRegistration::orderBy('childcode')->get(),
            ]
        );
    }

    public function update(Request $request, $id)
    {
        $source = $request->source;

        if ($source === 'parent') {

            $record = OrpAdoptativeParent::findOrFail($id);

            $record->update([
                'transdate' => $request->transdate,
                'childcode' => $request->childcode,
                'adoptivefather' => $request->adoptivefather,
                'adoptivemother' => $request->adoptivemother,
                'maritalstatus' => $request->maritalstatus,
                'numberofbloodchildren' => $request->numberofbloodchildren,
                'numberofadoptedchildren' => $request->numberofadoptedchildren,
                'profession' => $request->profession,
                'physicaladdress' => $request->physicaladdress,
                'contact' => $request->contact,
            ]);
        } else {

            $record = OrpAdoptativeOrphanage::findOrFail($id);

            $record->update([
                'transdate' => $request->transdate,
                'childcode' => $request->childcode,
                'orphanagename' => $request->orphanagename,
                'personincharge' => $request->personincharge,
                'position' => $request->position,
                'institution' => $request->institution,
                'contact' => $request->contact,
            ]);
        }

        return redirect()
            ->route('orphanage1.index')
            ->with('success', 'Adoption updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $source = $request->source;

        if ($source === 'parent') {
            OrpAdoptativeParent::findOrFail($id)->delete();
        } else {
            OrpAdoptativeOrphanage::findOrFail($id)->delete();
        }

        return redirect()
            ->route('orphanage1.index')
            ->with('success', 'Adoption deleted successfully.');
    }
}