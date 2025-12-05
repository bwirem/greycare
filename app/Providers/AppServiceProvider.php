<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
            database_path('migrations/patient'),
            database_path('migrations/opd_department'),
            database_path('migrations/ipd_department'),
            database_path('migrations/medical_records'), 
            database_path('migrations/laboratory'),        
        ]);
    }
}
