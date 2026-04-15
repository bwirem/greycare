<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesHistoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $sales;

    public function __construct($sales)
    {
        $this->sales = $sales;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->sales;
    }

    /**
     * Define the Excel Column Headers
     */
    public function headings(): array
    {
        return [
            'Date',
            'Receipt/Invoice No.',
            'Customer Name',
            'Total Due',
            'Total Paid',
            'Balance',
        ];
    }

    /**
     * Map each row of data to the Excel columns
     */
    public function map($sale): array
    {
        // Format Customer Name
        $customerName = 'N/A';
        if ($sale->customer) {
            $customerName = $sale->customer->customer_type === 'individual' 
                ? trim($sale->customer->first_name . ' ' . $sale->customer->other_names . ' ' . $sale->customer->surname) 
                : $sale->customer->company_name;
        }

        return [
            Carbon::parse($sale->created_at)->format('Y-m-d H:i'),
            $sale->receiptno ?? $sale->invoiceno,
            $customerName,
            number_format((float)$sale->totaldue, 2, '.', ''),
            number_format((float)$sale->totalpaid, 2, '.', ''),
            number_format((float)($sale->totaldue - $sale->totalpaid), 2, '.', ''),
        ];
    }

    /**
     * Optional: Make the header row bold
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}