<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control Number - ORD-{{ $order->id }}</title>
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
            font-size: 14px;
            font-weight: 800;
            border: 2px solid #000;
            display: inline-block;
            padding: 2px 8px;
            margin: 5px 0;
            background-color: #000;
            color: #fff;
        }

        /* CONTROL NUMBER HIGHLIGHT */
        .control-number-box {
            border: 2px dashed #000;
            padding: 8px 5px;
            margin: 10px 0;
            text-align: center;
        }

        .cnum-label {
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .cnum-value {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 1px;
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

        /* TOTALS SECTION */
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        
        .grand-total {
            font-size: 15px;
            font-weight: 800;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 5px 0;
            margin-top: 5px;
        }

        /* INSTRUCTIONS */
        .instructions {
            font-size: 10px;
            text-align: center;
            margin: 10px 0;
            line-height: 1.4;
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
        .qr-text {
            font-size: 9px;
            margin-top: 2px;
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
            {!! $facility->address ? nl2br(e($facility->address)) : '' !!}<br>
            @if($facility->phone) <strong>Tel:</strong> {{ $facility->phone }}<br>@endif
        </div>

        <div class="receipt-title">
            BILL / CONTROL NUMBER
        </div>
    </div>

    <!-- 2. CONTROL NUMBER HIGHLIGHT -->
    <div class="control-number-box">
        <div class="cnum-label">Pay using Control Number:</div>
        <div class="cnum-value">
            {{ $controlResponse['control_no'] ?? 'PENDING' }}
        </div>
    </div>

    <!-- 3. META INFO -->
    <div class="meta-info">
        <div style="display:flex; justify-content:space-between;">
            <span><strong>Order ID:</strong> ORD-{{ $order->id }}</span>
            <span><strong>Date:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</span>
        </div>
        
        <div class="divider"></div>
        
        <div>
            <strong>Patient/Customer:</strong>
            @if($order->customer)
                {{ $order->customer->customer_type === 'company' 
                    ? $order->customer->company_name 
                    : trim($order->customer->first_name . ' ' . $order->customer->surname) }}
            @else 
                Walk-in Client 
            @endif
        </div>
    </div>

    <!-- 4. ITEMS TABLE -->
    <table>
        <thead>
            <tr>
                <th class="col-item">Service/Item</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Price</th>
                <th class="col-total">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->orderitems as $item)
            <tr>
                <td class="col-item">
                    <span class="item-name">{{ $item->item->name ?? 'Item' }}</span>
                </td>
                <td class="col-qty">{{ (float)$item->quantity + 0 }}</td>
                <td class="col-price">{{ number_format($item->price, 0) }}</td>
                <td class="col-total">{{ number_format($item->price * $item->quantity, 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider-solid"></div>

    <!-- 5. TOTALS CALCULATION -->
    <div class="totals">
        <div class="totals-row grand-total">
            <span>AMOUNT TO PAY</span>
            <span>{{ number_format($order->total, 2) }}</span>
        </div>
    </div>

    <!-- 6. PAYMENT INSTRUCTIONS (UPDATED FOR CRDB ONLY) -->
    <div class="instructions">
        <strong>Payment Instructions / Jinsi ya Kulipa:</strong><br><br>
        Please make your payment STRICTLY via <strong>CRDB Bank</strong> (Branch, CRDB Wakala, or SimBanking) using the Control Number provided above.<br><br>
        <em>Tafadhali fanya malipo KUPITIA <strong>BENKI YA CRDB TU</strong> (Tawini, CRDB Wakala, au SimBanking) kwa kutumia Namba ya Malipo hapo juu.</em>
    </div>

    <div class="divider"></div>

    <!-- 7. QR CODE -->
    @if(!empty($controlResponse['control_no']))
    <div class="qr-section">
        <img src="data:image/svg+xml;base64, {!! base64_encode(QrCode::format('svg')->size(200)->margin(0)->generate($controlResponse['control_no'])) !!} ">        
        <div class="qr-text">Scan via CRDB SimBanking</div>
    </div>
    @endif

    <!-- 8. FOOTER -->
    <div class="footer">
        Generated by: {{ Auth::user()->name ?? 'System' }}<br>
        <em>Please keep this receipt for your records.</em>
    </div>

    <!-- 9. FEED PADDING -->
    <div class="feed-padding">.</div>

</div>

</body>
</html>