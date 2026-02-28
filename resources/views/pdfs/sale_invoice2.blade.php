<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt - {{ $sale->invoiceno ?? $sale->receiptno }}</title>
    <style>
        /* 1. Reset Page Margins */
        @page {
            margin: 0px; 
            padding: 0px;
        }

        /* 2. Body fills the custom paper size defined in PHP */
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #000;
            margin: 5px; /* Small margin to prevent cutting off text */
            width: 95%;  /* Fill available space */
        }

        .centered {
            text-align: center;
        }

        /* Container for the logo to ensure it centers nicely */
        .logo-container {
            text-align: center;
            margin-bottom: 5px;
        }

        .header-logo {
            max-width: 60px;
            max-height: 60px;
        }

        h1 {
            font-size: 13px;
            margin: 2px 0;
            text-transform: uppercase;
        }

        .divider {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        th {
            border-bottom: 1px dashed #000;
            font-size: 10px;
            text-align: left;
            padding-bottom: 2px;
        }

        td {
            font-size: 10px;
            padding: 2px 0;
            vertical-align: top;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .totals-row {
            display: table; /* Simulate flex since DOMPDF has poor Flexbox support */
            width: 100%;
            margin-bottom: 2px;
        }
        .totals-label {
            display: table-cell;
            text-align: left;
            width: 60%;
        }
        .totals-value {
            display: table-cell;
            text-align: right;
            width: 40%;
        }

        .grand-total {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            font-weight: bold;
            font-size: 12px;
            padding: 5px 0;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 9px;
        }
    </style>
</head>
<body>

    <div class="logo-container">
        @if(!empty($facility->logo_path))
            <img src="{{ storage_path('app/public/' . $facility->logo_path) }}" class="header-logo" alt="Logo">
        @endif
    </div>

    <div class="centered">
        <h1>{{ $facility->name ?? 'Facility Name' }}</h1>
        <div style="font-size: 10px;">
            {{ $facility->address ?? '' }}<br>
            @if($facility->phone) Tel: {{ $facility->phone }} <br> @endif
            @if($facility->tin) TIN: {{ $facility->tin }} | @endif
            @if($facility->vrn) VRN: {{ $facility->vrn }} @endif
        </div>
        <div class="divider"></div>
        <div style="font-weight: bold; font-size: 12px;">
            {{ $sale->invoiceno ? 'TAX INVOICE' : 'RECEIPT' }}
        </div>
    </div>

    <div style="font-size: 10px; margin-top: 5px;">
        <strong>Ref:</strong> {{ $sale->invoiceno ?? $sale->receiptno }}<br>
        <strong>Date:</strong> {{ $sale->created_at->format('d-M-Y H:i') }}<br>
        <strong>Customer:</strong> 
        @if($sale->customer)
             {{ $sale->customer->customer_type === 'individual' ? $sale->customer->first_name . ' ' . $sale->customer->surname : $sale->customer->company_name }}
        @else
            Walk-in
        @endif
    </div>

    <div class="divider"></div>

    <table>
        <thead>
            <tr>
                <th width="45%">Item</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="20%" class="text-right">Price</th>
                <th width="25%" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $item)
            <tr>
                <td>{{ $item->item->name ?? 'Item' }}</td>
                <td class="text-center">{{ (float)$item->quantity }}</td>
                <td class="text-right">{{ number_format($item->price, 0) }}</td>
                <td class="text-right">{{ number_format($item->price * $item->quantity, 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <!-- DOMPDF doesn't handle Flexbox well, using Table display for totals -->
    <div class="totals-row">
        <span class="totals-label">Total Due</span>
        <span class="totals-value">{{ number_format($sale->totaldue, 2) }}</span>
    </div>
    <div class="totals-row">
        <span class="totals-label">Paid</span>
        <span class="totals-value">{{ number_format($sale->totalpaid, 2) }}</span>
    </div>
    
    <div class="totals-row grand-total">
        <span class="totals-label">CHANGE</span>
        <span class="totals-value">{{ number_format(max(0, $sale->totalpaid - $sale->totaldue), 2) }}</span>
    </div>

    @if($sale->totalpaid < $sale->totaldue)
    <div class="totals-row" style="margin-top: 4px;">
        <span class="totals-label">Balance</span>
        <span class="totals-value">{{ number_format($sale->totaldue - $sale->totalpaid, 2) }}</span>
    </div>
    @endif

    <div class="footer">
        Thank you!<br>
        Served by: {{ Auth::user()->name ?? 'Sys' }}
    </div>

</body>
</html>