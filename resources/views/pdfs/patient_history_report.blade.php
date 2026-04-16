<!DOCTYPE html>
<html>
<head>
    <title>Patient History</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .patient-box { border: 1px solid #000; padding: 10px; margin-bottom: 20px; background-color: #f9f9f9;}
        h4 { margin-bottom: 5px; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 3px;}
    </style>
</head>
<body>

    <div class="header">
        <h2>{{ $facility->name ?? 'Medical Facility' }}</h2>
        <h3>Patient Medical Record</h3>
        @if($filters['start_date'] || $filters['end_date'])
            <p>Filtered Dates: {{ $filters['start_date'] ?? 'All Time' }} to {{ $filters['end_date'] ?? 'Present' }}</p>
        @endif
    </div>

    <div class="patient-box">
        <strong>Name:</strong> {{ $patient['name'] }} | 
        <strong>Code:</strong> {{ $patient['code'] }} | 
        <strong>Age:</strong> {{ $patient['age'] }} | 
        <strong>Gender:</strong> {{ $patient['gender'] }}<br>
        <strong>DOB:</strong> {{ $patient['dob'] }} | 
        <strong>Phone:</strong> {{ $patient['phone'] }} | 
        <strong>Address:</strong> {{ $patient['address'] }}
    </div>

    <h4>1. Clinical Timeline & Visits</h4>
    @if(count($timeline) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Location/Ward</th>
                    <th>Doctor</th>
                    <th>Vitals / Outcome</th>
                </tr>
            </thead>
            <tbody>
                @foreach($timeline as $event)
                    <tr>
                        <td>{{ $event['date_str'] }}</td>
                        <td>{{ $event['type'] }}</td>
                        <td>{{ $event['location'] }}</td>
                        <td>{{ $event['doctor'] }}</td>
                        <td>{{ $event['vitals'] ?? $event['outcome'] ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No visits found.</p>
    @endif

    <h4>2. Confirmed Diagnoses</h4>
    @if(count($diagnoses) > 0)
        <table>
            <thead><tr><th>Date</th><th>Diagnosis</th></tr></thead>
            <tbody>
                @foreach($diagnoses as $diag)
                    <tr><td>{{ $diag['date'] }}</td><td>{{ $diag['name'] }}</td></tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No diagnoses found.</p>
    @endif

    <h4>3. Medication History</h4>
    @if(count($medications) > 0)
        <table>
            <thead><tr><th>Date</th><th>Drug Name</th><th>Dosage</th><th>Qty</th></tr></thead>
            <tbody>
                @foreach($medications as $med)
                    <tr>
                        <td>{{ $med['date'] }}</td>
                        <td>{{ $med['drug'] }}</td>
                        <td>{{ $med['dose'] }}</td>
                        <td>{{ $med['qty'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No medications found.</p>
    @endif

    <h4>4. Laboratory & Radiology</h4>
    @if(count($investigations) > 0)
        <table>
            <thead><tr><th>Date</th><th>Type</th><th>Test/Procedure</th><th>Status</th></tr></thead>
            <tbody>
                @foreach($investigations as $inv)
                    <tr>
                        <td>{{ $inv['date'] }}</td>
                        <td>{{ $inv['type'] }}</td>
                        <td>{{ $inv['test'] }}</td>
                        <td>{{ $inv['status'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No investigations found.</p>
    @endif

</body>
</html>