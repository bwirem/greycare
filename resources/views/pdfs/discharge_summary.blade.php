<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Discharge Summary - {{ $patient->code }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .container { width: 100%; margin: 0 auto; }
        
        /* Layout Helpers */
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        
        /* Header Tables */
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .header-table td { border: none; vertical-align: top; }

        /* Patient Info Table */
        .info-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
        .info-table td { border: none; vertical-align: top; padding-bottom: 5px; }

        /* Content Sections */
        .section-title { 
            text-align: center; 
            border-top: 2px solid #eee; 
            border-bottom: 2px solid #eee; 
            padding: 8px 0; 
            margin: 20px 0; 
            font-size: 16px; 
            font-weight: bold; 
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .content-block { margin-bottom: 15px; }
        .label { font-weight: bold; text-transform: uppercase; color: #555; font-size: 10px; margin-bottom: 3px; }
        .value { font-size: 13px; line-height: 1.4; text-align: justify; }

        /* Medications List style (if needed) */
        .meds-list { margin: 0; padding-left: 20px; }

        .footer { margin-top: 50px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        
        {{-- HEADER SECTION (Matches Invoice Style) --}}
        <div class="header">
            <table class="header-table">
                <tr>
                    {{-- LEFT COLUMN: LOGO --}}
                    <td style="width: 30%;">
                        @if(!empty($facility->logo_path))
                            {{-- Use absolute path for DomPDF stability --}}
                            <img src="{{ storage_path('app/public/' . $facility->logo_path) }}" style="max-height: 80px; max-width: 150px;" alt="Logo">
                        @endif
                    </td>

                    {{-- RIGHT COLUMN: FACILITY DETAILS --}}
                    <td style="width: 70%;" class="text-right">
                        <h1 style="margin: 0; font-size: 20px; color: #333;">{{ $facility->name ?? 'Facility Name' }}</h1>
                        
                        <p style="margin: 5px 0; font-size: 11px; line-height: 1.4; color: #555;">
                            {{ $facility->address ?? '' }}<br>
                            @if($facility->phone) Tel: {{ $facility->phone }} @endif
                            @if($facility->email) | Email: {{ $facility->email }} @endif
                            @if($facility->website) <br>Web: {{ $facility->website }} @endif
                        </p>
                    </td>
                </tr>
            </table>

            <div class="section-title">
                Medical Discharge Summary
            </div>
        </div>

        {{-- PATIENT & ADMISSION DETAILS --}}
        <table class="info-table">
            <tr>
                <td style="width:50%;">
                    <div class="label">Patient Details</div>
                    <div style="font-size: 14px; font-weight: bold;">
                        {{ $patient->first_name }} {{ $patient->last_name }}
                    </div>
                    <div>File No: <strong>{{ $patient->code }}</strong></div>
                    <div>Age/Sex: {{ $patient->age }} Yrs / {{ $patient->gender }}</div>
                    <div>Address: {{ $patient->address ?? 'N/A' }}</div>
                </td>
                <td style="width:50%;" class="text-right">
                    <div class="label">Admission Details</div>
                    <div><strong>Ward:</strong> {{ $admission->ward->name ?? '-' }} / {{ $admission->bed->name ?? '-' }}</div>
                    <div><strong>Admitted:</strong> {{ $admission->created_at->format('d-M-Y H:i') }}</div>
                    <div><strong>Discharged:</strong> {{ $summary->created_at->format('d-M-Y H:i') }}</div>
                    <div><strong>Doctor:</strong> {{ $summary->doctor->name ?? 'Attending Physician' }}</div>
                </td>
            </tr>
        </table>

        <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">

        {{-- CLINICAL CONTENT --}}
        
        <div class="content-block">
            <div class="label">Final Diagnosis</div>
            <div class="value">{{ $summary->final_diagnosis }}</div>
        </div>

        <div class="content-block">
            <div class="label">Clinical Summary & Treatment Given</div>
            <div class="value">
                {!! nl2br(e($summary->clinical_summary)) !!}
            </div>
        </div>

        <div class="content-block">
            <div class="label">Discharge Medications</div>
            <div class="value">
                {!! nl2br(e($summary->discharge_medications)) !!}
            </div>
        </div>

        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="width: 50%;">
                    <div class="label">Discharge Outcome</div>
                    <div class="value">{{ $summary->outcome }}</div>
                </td>
                <td style="width: 50%;">
                    <div class="label">Follow Up Date</div>
                    <div class="value">
                        {{ $summary->follow_up_date ? date('d-M-Y', strtotime($summary->follow_up_date)) : 'N/A' }}
                    </div>
                </td>
            </tr>
        </table>

        <div class="content-block" style="margin-top: 15px;">
            <div class="label">Instructions / Recommendations</div>
            <div class="value">
                {{ $summary->follow_up_instructions ?? 'None' }}
            </div>
        </div>

        {{-- SIGNATURE SECTION --}}
        <div style="margin-top: 60px;">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 60%;"></td>
                    <td style="width: 40%; text-align: center; border-top: 1px solid #000; padding-top: 5px;">
                        <span style="font-weight: bold;">Dr. {{ $summary->doctor->name ?? 'Signature' }}</span><br>
                        <span style="font-size: 10px; color: #555;">Authorized Signature & Date</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>This is a computer-generated medical record.</p>
            <p>Printed on {{ now()->format('d-M-Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>