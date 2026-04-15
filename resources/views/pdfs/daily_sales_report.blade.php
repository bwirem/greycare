<!DOCTYPE html>
<html>
<head>
    <title>Daily Sales Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-right { text-align: right; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary-box { margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
    </style>
</head>
<body>

    @if(isset($facility))
    <div class="header">
        <h2>{{ $facility->name ?? 'Facility Name' }}</h2>
        <h3>Daily Sales Report</h3>
        <p>Date: {{ $reportDate->format('F d, Y') }}</p>
        <p>Billing Group: {{ $billingGroupName }}</p>
    </div>
    @endif

    <div class="summary-box">
        <strong>Total Sales Amount:</strong> {{ number_format($summaries->total_sales ?? 0, 2) }}<br>
        <strong>Number of Transactions:</strong> {{ $summaries->transaction_count ?? 0 }}<br>
        <strong>Total Discount Given:</strong> {{ number_format($summaries->total_discount ?? 0, 2) }}
    </div>

    <h4>Sales by Item Group</h4>
    <table>
        <thead>
            <tr>
                <th>Group Name</th>
                <th class="text-right">Total Quantity Sold</th>
                <th class="text-right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($salesByItemGroup as $group)
                <tr>
                    <td>{{ $group['name'] }}</td>
                    <td class="text-right">{{ $group['total_quantity'] }}</td>
                    <td class="text-right">{{ number_format($group['total_amount'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h4>Summary of Items Sold</h4>
    <table>
        <thead>
            <tr>
                <th>Item Name</th>
                <th>Item Group</th>
                <th class="text-right">Quantity Sold</th>
                <th class="text-right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($aggregatedItems as $item)
                <tr>
                    <td>{{ $item->item_name }}</td>
                    <td>{{ $item->item_group }}</td>
                    <td class="text-right">{{ $item->total_quantity }}</td>
                    <td class="text-right">{{ number_format($item->total_amount, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>