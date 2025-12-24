<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // LEAVE EMPTY
        // We are using routes/console.php for scheduling now.
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        // KEEP THIS - It loads your custom commands (like PostDailyBedCharges)
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}