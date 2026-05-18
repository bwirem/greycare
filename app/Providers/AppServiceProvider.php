<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

use App\Models\Radiology\RadRequest;
use App\Observers\RadRequestObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        // This tells Laravel to ALSO look in these folders
        $this->loadMigrationsFrom([
            // Healthcare modules
            database_path('migrations/patient'),  
            database_path('migrations/opd_department'),
            database_path('migrations/ipd_department'),
            database_path('migrations/diagnosis'),
            database_path('migrations/medical_records'), 
            database_path('migrations/laboratory'),   
            database_path('migrations/radiology'),   
            database_path('migrations/theatre'),  
            database_path('migrations/pharmacy'),
            database_path('migrations/bloodbank'),
            database_path('migrations/mortuary'),
            // Administrative modules
            database_path('migrations/billing'),
            database_path('migrations/expenses'),
            database_path('migrations/inventory'),
            database_path('migrations/procurement'),          
            database_path('migrations/accounting'),   
            database_path('migrations/human_resources'),
            database_path('migrations/rch_department'),
            database_path('migrations/physiotherapy'),
            database_path('migrations/nursing'),            
        ]);

        RadRequest::observe(RadRequestObserver::class);
    }
}
