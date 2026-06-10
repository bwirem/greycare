<?php

namespace App\Http\Controllers\Orphanage;

use App\Http\Controllers\Controller;
use App\Models\Orphanage\OrpAdoptationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdoptationTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = OrpAdoptationType::query();

        if ($request->search) {
            $query->where('CODE', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        return Inertia::render(
            'SystemConfiguration/OrphanageSetup/AdoptationTypes/Index',
            [
                'adoptationTypes' => $query
                    ->orderBy('description')
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
            'SystemConfiguration/OrphanageSetup/AdoptationTypes/Create'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|max:50',
            'description' => 'required|max:255',
            'orphanagetoorphanages' => 'boolean',
            'orphanagetoadoptiveparent' => 'boolean',
        ]);

        OrpAdoptationType::create([
            'CODE' => $validated['code'],
            'description' => $validated['description'],
            'orphanagetoorphanages' => $request->orphanagetoorphanages ? 1 : 0,
            'orphanagetoadoptiveparent' => $request->orphanagetoadoptiveparent ? 1 : 0,
        ]);

        return redirect()
            ->route('systemconfiguration17.adoptationtypes.index')
            ->with('success', 'Adoption type created successfully.');
    }

    public function edit($id)
    {
        $adoptationType = OrpAdoptationType::findOrFail($id);

        return Inertia::render(
            'SystemConfiguration/OrphanageSetup/AdoptationTypes/Edit',
            compact('adoptationType')
        );
    }

    public function update(Request $request, $id)
    {
        $adoptationType = OrpAdoptationType::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|max:50',
            'description' => 'required|max:255',
            'orphanagetoorphanages' => 'boolean',
            'orphanagetoadoptiveparent' => 'boolean',
        ]);

        $adoptationType->update([
            'CODE' => $validated['code'],
            'description' => $validated['description'],
            'orphanagetoorphanages' => $request->orphanagetoorphanages ? 1 : 0,
            'orphanagetoadoptiveparent' => $request->orphanagetoadoptiveparent ? 1 : 0,
        ]);

        return redirect()
            ->route('systemconfiguration17.adoptationtypes.index')
            ->with('success', 'Adoption type updated successfully.');
    }

    public function destroy($id)
    {
        OrpAdoptationType::findOrFail($id)->delete();

        return back()->with(
            'success',
            'Adoption type deleted successfully.'
        );
    }
}