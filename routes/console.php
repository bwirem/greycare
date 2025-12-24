<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Change ->everyMinute() to ->dailyAt('23:55')
Schedule::command('ipd:post-charges')
    //->dailyAt('23:55')
    ->everyMinute() 
    ->appendOutputTo(storage_path('logs/ipd-charges.log'));
