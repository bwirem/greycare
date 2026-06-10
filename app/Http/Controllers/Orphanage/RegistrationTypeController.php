<?php

namespace App\Http\Controllers\Orphanage;

use App\Http\Controllers\Controller;
use App\Models\Orphanage\OrpRegistrationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrationTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = OrpRegistrationType::query();

        if ($request->search) {
            $query->where('CODE', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%");
        }

        return Inertia::render(
            'SystemConfiguration/OrphanageSetup/RegistrationTypes/Index',
            [
                'registrationTypes' => $query
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
            'SystemConfiguration/OrphanageSetup/RegistrationTypes/Create'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|max:50',
            'description' => 'required|max:255',
        ]);

        OrpRegistrationType::create([
            'CODE' => $validated['code'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('systemconfiguration17.registrationtypes.index')
            ->with('success', 'Registration type created successfully.');
    }

    public function edit($id)
    {
        $registrationType = OrpRegistrationType::findOrFail($id);

        return Inertia::render(
            'SystemConfiguration/OrphanageSetup/RegistrationTypes/Edit',
            compact('registrationType')
        );
    }

    public function update(Request $request, $id)
    {
        $registrationType = OrpRegistrationType::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|max:50',
            'description' => 'required|max:255',
        ]);

        $registrationType->update([
            'CODE' => $validated['code'],
            'description' => $validated['description'],
        ]);

        return redirect()
            ->route('systemconfiguration17.registrationtypes.index')
            ->with('success', 'Registration type updated successfully.');
    }

    public function destroy($id)
    {
        OrpRegistrationType::findOrFail($id)->delete();

        return back()->with(
            'success',
            'Registration type deleted successfully.'
        );
    }
}