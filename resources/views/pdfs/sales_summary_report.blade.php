<!DOCTYPE html>
<html>
<head>
    <!-- Kept under 31 characters to prevent Laravel Excel crash! -->
    <title>Sales Summary</title>
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
        <!-- This is the visible title inside the document, which can be as long as you want -->
        <h3>{{ $report_title }}</h3>
        <p>Billing Group: {{ $billingGroupName }}</p>
    </div>
    @endif

    <div class="summary-box">
        <strong>Total Dues Amount:</strong> {{ number_format($summaries->total_dues ?? 0, 2) }}<br>
        <strong>Total Sales Amount:</strong> {{ number_format($summaries->total_sales ?? 0, 2) }}<br>
        <strong>Transactions:</strong> {{ $summaries->transaction_count ?? 0 }}<br>
        <strong>Total Discount:</strong> {{ number_format($summaries->total_discount ?? 0, 2) }}
    </div>

    <h4>{{ $grouped_data_title }}</h4>
    <table>
        <thead>
            <tr>
                <th>
                    @if($groupBy === 'item_group') Group Name 
                    @elseif($groupBy === 'product') Product Name 
                    @else Period @endif
                </th>
                
                @if($groupBy === 'item_group' || $groupBy === 'product')
                    <th class="text-right">Total Quantity</th>
                @endif
                
                @if(in_array($groupBy, ['day', 'week', 'month']))
                    <th class="text-right">Transactions</th>
                    <th class="text-right">Total Dues</th>
                @endif
                
                <th class="text-right">Total Sales</th>
            </tr>
        </thead>
        <tbody>
            @foreach($groupedSalesData as $row)
                <tr>
                    <td>{{ $row['period_label'] }}</td>
                    
                    @if($groupBy === 'item_group' || $groupBy === 'product')
                        <td class="text-right">{{ $row['total_quantity'] }}</td>
                    @endif
                    
                    @if(in_array($groupBy, ['day', 'week', 'month']))
                        <td class="text-right">{{ $row['transactions'] }}</td>
                        <td class="text-right">{{ number_format($row['total_dues'], 2) }}</td>
                    @endif
                    
                    <td class="text-right">{{ number_format($row['total_sales'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>