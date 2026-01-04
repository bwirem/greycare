<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            // ADD THIS SECTION
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],  
            // --- ADD YOUR MODULE DEFINITIONS HERE ---
            'moduleGroups' => [
                'hospital' => [
                    'outpatient', 'inpatient', 'nursing', 'doctor', 'theatre',
                    'laboratory', 'blood-bank', 'radiology','pharmacy','reporting',
                    'systemConfig',
                ],
                'finance' => [
                    'billing', 'accounting', 'expenses', 'reporting', 'systemconfiguration0'
                ],
                'resources' => [
                    'procurements', 'inventory', 'fixedassets', 'systemconfiguration2'
                ],                
                // Add others as needed
            ],
        ]);
    }
}
