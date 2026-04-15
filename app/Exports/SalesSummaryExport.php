<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle; // 1. Import WithTitle

// 2. Add WithTitle to the implements list
class SalesSummaryExport implements FromView, ShouldAutoSize, WithTitle 
{
    protected $viewData;

    public function __construct(array $viewData)
    {
        $this->viewData = $viewData;
    }

    public function view(): View
    {
        return view('pdfs.sales_summary_report', $this->viewData);
    }

    // 3. Add this method to force a short sheet tab name
    public function title(): string
    {
        // Must be 31 characters or less!
        return 'Sales Summary'; 
    }
}