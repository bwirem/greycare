<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use App\Models\Laboratory\LabCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Categories/Index', [
            'categories' => LabCategory::withCount('panels')->latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:50']);
        LabCategory::create($validated);
        return redirect()->route('systemconfiguration6.categories.index')->with('success', 'Category created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/LabSetup/Categories/Edit', [
            'category' => LabCategory::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = LabCategory::findOrFail($id);
        $category->update($request->validate(['name' => 'required|string|max:255', 'code' => 'nullable']));
        return redirect()->route('systemconfiguration6.categories.index')->with('success', 'Category updated.');
    }

    public function destroy($id)
    {
        LabCategory::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Category deleted.');
    }
}