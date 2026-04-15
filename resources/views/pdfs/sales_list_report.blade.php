<!DOCTYPE html>
<html>
<head>
    <title>Sales List Report</title>
    <style>
        body { font-family: sans-serif; font-size: 10px; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-right { text-align: right; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h3 { margin-bottom: 5px; color: #333; }
        .header h4 { margin-top: 0; color: #555; }
        .filter-info { font-size: 9px; color: #777; margin-bottom: 5px; text-align: center;}
        .footer { position: fixed; bottom: 0; width: 100%; text-align: right; font-size: 8px; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h3>{{ $facility->name ?? 'Facility Name' }}</h3>
        <h4>Sales List Report</h4>
        <p>From {{ $filters['start_date']->format('F d, Y') }} To {{ $filters['end_date']->format('F d, Y') }}</p>
        @if($filters['billinggroup_id'])
            <p>Billing Group: {{ $filters['billing_group_name'] }}</p>
        @endif
        @if($filters['search'])
            <p>Search Term: "{{ $filters['search'] }}"</p>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Receipt/Invoice No.</th>
                <th>Customer Name</th>
                <th class="text-right">Total Due</th>
                <th class="text-right">Total Paid</th>
                <th class="text-right">Balance</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($sales as $sale)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($sale->created_at)->format('Y-m-d H:i') }}</td>
                    <td>{{ $sale->receiptno ?? $sale->invoiceno }}</td>
                    <td>
                        @if ($sale->customer)
                            {{ $sale->customer->customer_type === 'individual' ? trim($sale->customer->first_name . ' ' . $sale->customer->other_names . ' ' . $sale->customer->surname) : $sale->customer->company_name }}
                        @else
                            N/A
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($sale->totaldue, 2) }}</td>
                    <td class="text-right">{{ number_format($sale->totalpaid, 2) }}</td>
                    <td class="text-right">{{ number_format($sale->totaldue - $sale->totalpaid, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">No sales found for the selected criteria.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr style="background-color: #e6e6e6;">
                <th colspan="3" class="text-right">GRAND TOTALS</th>
                <th class="text-right">{{ number_format($sales->sum('totaldue'), 2) }}</th>
                <th class="text-right">{{ number_format($sales->sum('totalpaid'), 2) }}</th>
                <th class="text-right">{{ number_format($sales->sum('totaldue') - $sales->sum('totalpaid'), 2) }}</th>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Generated on {{ now()->format('Y-m-d H:i:s') }}
    </div>
</body>
</html>