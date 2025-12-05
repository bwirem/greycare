<!DOCTYPE html>
<html>
<head>
    <title>OPD Slip - {{ $booking->visit_number }}</title>
    <style>
        body { font-family: sans-serif; padding: 20px; text-align: center; }
        .ticket { border: 2px dashed #333; padding: 20px; width: 300px; margin: 0 auto; }
        h1 { font-size: 24px; margin-bottom: 5px; }
        .info { text-align: left; margin-top: 20px; }
    </style>
</head>
<body onload="window.print()">
    <div class="ticket">
        <h1>GREYCARE HOSP</h1>
        <p>OPD Visit Slip</p>
        <hr>
        <h2>{{ $booking->visit_number }}</h2>
        <div class="info">
            <p><strong>Name:</strong> {{ $booking->patient->firstname }} {{ $booking->patient->surname }}</p>
            <p><strong>File No:</strong> {{ $booking->patient->code }}</p>
            <p><strong>Clinic:</strong> {{ $booking->wheretaken }}</p>
            <p><strong>Date:</strong> {{ $booking->created_at->format('d-M-Y H:i') }}</p>
        </div>
        <hr>
        <p>Please proceed to Vitals Station.</p>
    </div>
</body>
</html>