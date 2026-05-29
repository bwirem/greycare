<?php

namespace App\Enums;

enum StaffCategory: int
{
    case LabTechnicians = 0;
    case Nurses = 1;
    case Surgeons = 2;
    case Anesthetist = 3;
    case BirthAttendants = 4;
    case Clinicians = 5;
    case Pharmacists = 6;
    case Counsellors = 7;
    case WardIncharge = 8;
    case Radiographers = 9;
    case Radiologist = 10;
    case Physiotherapist = 11;
    case Others = 50;

    public static function getLabel(?int $value): string
    {
        return match ($value) {
            self::LabTechnicians->value => 'Lab Technicians',
            self::Nurses->value => 'Nurses',
            self::Surgeons->value => 'Surgeons',
            self::Anesthetist->value => 'Anesthetist',
            self::BirthAttendants->value => 'Birth Attendants',
            self::Clinicians->value => 'Clinicians',
            self::Pharmacists->value => 'Pharmacists',
            self::Counsellors->value => 'Counsellors',
            self::WardIncharge->value => 'Ward Incharge',
            self::Radiographers->value => 'Radiographers',
            self::Radiologist->value => 'Radiologist',
            self::Physiotherapist->value => 'Physiotherapist',
            self::Others->value => 'Others',
            default => 'Unknown',
        };
    }

    public static function getOptions(): array
    {
        return array_map(fn($case) => [
            'id' => $case->value,
            'name' => self::getLabel($case->value)
        ], self::cases());
    }
}