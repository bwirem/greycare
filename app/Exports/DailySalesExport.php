<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle; // 1. Import WithTitle

// 2. Add WithTitle to the implements list
class DailySalesExport implements FromView, ShouldAutoSize, WithTitle 
{
    protected $aggregatedItems, $salesByItemGroup, $summaries, $reportDate, $billingGroupName;

    public function __construct($aggregatedItems, $salesByItemGroup, $summaries, $reportDate, $billingGroupName)
    {
        $this->aggregatedItems = $aggregatedItems;
        $this->salesByItemGroup = $salesByItemGroup;
        $this->summaries = $summaries;
        $this->reportDate = $reportDate;
        $this->billingGroupName = $billingGroupName;
    }

    public function view(): View
    {
        return view('pdfs.daily_sales_report', [
            'aggregatedItems' => $this->aggregatedItems,
            'salesByItemGroup' => $this->salesByItemGroup,
            'summaries' => $this->summaries,
            'reportDate' => $this->reportDate,
            'billingGroupName' => $this->billingGroupName,
            'facility' => null 
        ]);
    }

    // 3. Add this method
    public function title(): string
    {
        // Must be 31 characters or less!
        return 'Daily Sales'; 
    }
}