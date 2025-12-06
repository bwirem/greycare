<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy\PharmacyRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PharmacyRouteController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Routes/Index', [
            'routes' => PharmacyRoute::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Routes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pharmacy_routes,name',
            'abbreviation' => 'nullable|string|max:20',
        ]);

        PharmacyRoute::create($validated);

        return redirect()->route('systemconfiguration9.routes.index')
            ->with('success', 'Route created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Routes/Edit', [
            'routeItem' => PharmacyRoute::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $routeItem = PharmacyRoute::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:pharmacy_routes,name,'.$id,
            'abbreviation' => 'nullable|string|max:20',
        ]);

        $routeItem->update($validated);

        return redirect()->route('systemconfiguration9.routes.index')
            ->with('success', 'Route updated successfully.');
    }

    public function destroy($id)
    {
        PharmacyRoute::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Route deleted successfully.');
    }
}