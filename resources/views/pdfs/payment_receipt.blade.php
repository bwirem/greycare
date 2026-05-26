<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {{ $payment->receiptno }}</title>
    <style>
        /* 
           1. PAGE SETUP 
           Sets the paper size to 80mm width. 
           Auto height allows the paper to unroll as long as needed.
        */
        @page {
            margin: 0;
            size: 80mm auto;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #000000;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        /* 
           2. CONTAINER 
           72mm is the "Safe Area" for 80mm printers.
           This prevents text from being cut off at the edges.
        */
        .receipt {
            width: 72mm;
            max-width: 72mm;
            margin: 0 auto;
            padding: 2mm 0; 
        }

        /* UTILITIES */
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: 700; }
        
        .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
            width: 100%;
        }

        .divider-solid {
            border-top: 1px solid #000;
            margin: 6px 0;
            width: 100%;
        }

        /* HEADER */
        .logo-img {
            max-width: 40mm;
            height: auto;
            filter: grayscale(100%); 
        }

        .shop-name {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 5px;
        }

        .shop-info {
            font-size: 10px;
            margin-bottom: 5px;
        }

        .receipt-title {
            font-size: 15px;
            font-weight: 800;
            border: 2px solid #000;
            display: inline-block;
            padding: 2px 8px;
            margin: 5px 0;
        }

        /* META INFO */
        .meta-info {
            font-size: 11px;
        }

        /* TABLE STYLES */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 5px;
        }

        th {
            text-align: left;
            border-bottom: 2px solid #000;
            padding-bottom: 3px;
            font-size: 10px;
            text-transform: uppercase;
        }

        td {
            padding: 3px 0;
            vertical-align: top;
        }

        /* COLUMN WIDTHS (Optimized for 72mm) */
        .col-item { width: 45%; padding-right: 2px; }
        .col-qty  { width: 15%; text-align: center; }
        .col-price{ width: 20%; text-align: right; }
        .col-total{ width: 20%; text-align: right; }

        .item-name {
            display: block;
            font-weight: 600;
        }

        /* INVOICE SECTION STYLES */
        .invoice-header {
            font-weight: bold;
            font-size: 11px;
            background-color: #f7f7f7;
            padding: 4px;
            margin-top: 5px;
            text-align: left;
        }
        .invoice-summary {
            text-align: right;
            font-size: 10px;
            padding-top: 3px;
            padding-bottom: 5px;
        }

        /* TOTALS SECTION */
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .grand-total {
            font-size: 14px;
            font-weight: 800;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            margin-top: 5px;
        }

        /* QR CODE */
        .qr-section {
            text-align: center;
            margin: 10px 0;
        }
        .qr-section img {
            width: 100px;
            height: auto;
        }

        /* FOOTER */
        .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
        }

        /* FEED PADDING */
        .feed-padding {
            height: 15mm; 
        }
    </style>
</head>

<body>

<div class="receipt">

    <!-- 1. LOGO & HEADER -->
    <div class="center">
        @if(!empty($facility->logo_path) && file_exists(storage_path('app/public/' . $facility->logo_path)))
            <img class="logo-img" src="data:image/png;base64,{{ base64_encode(file_get_contents(storage_path('app/public/' . $facility->logo_path))) }}" alt="Logo">
        @endif

        <div class="shop-name">{{ $facility->name ?? 'FACILITY NAME' }}</div>

        <div class="shop-info">
            {!! !empty($facility->address) ? nl2br(e($facility->address)) : '' !!}<br>
            @if(!empty($facility->phone)) <strong>Tel:</strong> {{ $facility->phone }}<br>@endif
            @if(!empty($facility->tin)) TIN: {{ $facility->tin }} | @endif
            @if(!empty($facility->vrn)) VRN: {{ $facility->vrn }} @endif
        </div>

        <div class="receipt-title">PAYMENT RECEIPT</div>
    </div>

    <!-- 2. META INFO -->
    <div class="meta-info">
        <div style="display:flex; justify-content:space-between;">
            <span><strong>Ref:</strong> {{ $payment->receiptno }}</span>
            <span><strong>Date:</strong> {{ \Carbon\Carbon::parse($payment->transdate)->format('d/m/Y') }}</span>
        </div>
        
        <div class="divider"></div>
        
        <div>
            <strong>Received From:</strong><br>
            {{ $payment->customer->first_name ?? '' }} {{ $payment->customer->surname ?? $payment->customer->company_name ?? 'Guest' }}
        </div>
    </div>

    <!-- 3. ITEMS TABLE (Flattened for 80mm width) -->
    <table>
        <thead>
            <tr>
                <th class="col-item">Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Price</th>
                <th class="col-total">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payment->items as $paymentDetail)
                
                <!-- Invoice Sub-header -->
                <tr>
                    <td colspan="4" style="padding: 0;">
                        <div class="invoice-header">Payment for Invoice #{{ $paymentDetail->invoiceno }}</div>
                    </td>
                </tr>

                <!-- Nested Invoice Line Items -->
                @if($paymentDetail->invoice && $paymentDetail->invoice->items->count() > 0)
                    @foreach($paymentDetail->invoice->items as $lineItem)
                    <tr>
                        <td class="col-item">
                            <span class="item-name">{{ $lineItem->item->name ?? 'Unknown Item' }}</span>
                        </td>
                        <td class="col-qty">{{ (float)$lineItem->quantity + 0 }}</td>
                        <td class="col-price">{{ number_format($lineItem->price, 2) }}</td>
                        <td class="col-total">{{ number_format($lineItem->quantity * $lineItem->price, 2) }}</td>
                    </tr>
                    @endforeach
                @endif

                <!-- Invoice Payment Summary -->
                <tr>
                    <td colspan="4" style="padding: 0; border-bottom: 1px dashed #ccc;">
                        <div class="invoice-summary">
                            Due: {{ number_format($paymentDetail->totaldue, 2) }} | 
                            <strong>Paid Now: {{ number_format($paymentDetail->totalpaid, 2) }}</strong> | 
                            Bal: {{ number_format($paymentDetail->invoice->balance ?? 0, 2) }}
                        </div>
                    </td>
                </tr>

            @endforeach
        </tbody>
    </table>

    <div class="divider-solid" style="margin-top: 10px;"></div>

    <!-- 4. TOTALS CALCULATION -->
    <div class="totals">
        <div class="totals-row grand-total">
            <span>TOTAL AMOUNT RECEIVED</span>
            <span>{{ number_format($payment->totalpaid, 2) }}</span>
        </div>
    </div>

    <div class="divider"></div>

    <!-- 5. QR CODE -->
    <div class="qr-section">
        <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(200)->margin(0)->generate($payment->receiptno)) !!} " alt="QR Code">        
    </div>

    <!-- 6. FOOTER -->
    <div class="footer">
        Thank you for your business!<br>
        Served by: {{ Auth::user()->name ?? 'System' }}
    </div>

    <!-- 7. FEED PADDING -->
    <div class="feed-padding">.</div>

</div>

</body>
</html>