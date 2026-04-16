<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class PatientHistoryExport implements FromView, ShouldAutoSize, WithTitle
{
    protected $viewData;

    public function __construct(array $viewData)
    {
        $this->viewData = $viewData;
    }

    public function view(): View
    {
        return view('pdfs.patient_history_report', $this->viewData);
    }

    public function title(): string
    {
        return 'Patient History'; // Max 31 chars
    }
}