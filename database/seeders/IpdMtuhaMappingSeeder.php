<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalRecord\MrMtuhaMappingIpd; // Update this if your IPD model has a different name!

class IpdMtuhaMappingSeeder extends Seeder
{
    public function run()
    {
        // NOTE: If you are using the same table for OPD and IPD, DO NOT use truncate().
        // If you have a separate table/model for IPD, uncomment the truncate line below.
        // MtuhaMapping::truncate();

        $mappings = [
            ['mtuha_code' => '2', 'description' => 'Septicaemia', 'exact_codes' => ['A41.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '3', 'description' => 'Suspected onchocerciasis (river blindnes)', 'exact_codes' => ['B73'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '4', 'description' => 'STH (Trichuris, Hookworm, ascaries)', 'exact_codes' => ['B79', 'B76', 'B77'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '5', 'description' => 'Typhoid', 'exact_codes' => ['A01.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '6', 'description' => 'Diarrhea,Acute (<14days)', 'exact_codes' => ['A09'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '7', 'description' => 'Diarrhea, Chronic(or >14days)', 'exact_codes' => ['A09', 'K52.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '0008a', 'description' => 'Malaria, Severe/Complicated-Postive(Bs/mRDT)', 'exact_codes' => ['B50.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '0008b', 'description' => 'Malaria, Severe/Complicated-Clinical(notest)', 'exact_codes' => ['B54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '9', 'description' => 'Hepatitic B', 'exact_codes' => ['B16', 'B18.0', 'B18.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '10', 'description' => 'Hepatitic C', 'exact_codes' => ['B17.1', 'B18.2'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '11', 'description' => 'Intestinal Schistosomiasis', 'exact_codes' => ['B65.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '12', 'description' => 'Urogenital Schistosomiasis', 'exact_codes' => ['B65.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '13', 'description' => 'Lymphatic filairiasis -Hydrocele', 'exact_codes' => ['B74', 'N50.8'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '14', 'description' => 'Lymphatic filairiasis-Lymphoedema', 'exact_codes' => ['B74', 'I89.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '15', 'description' => 'Sexually Transmitted Infection,Other', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '16', 'description' => 'Other diseases of infections parasite', 'exact_codes' => null, 'ranges' => [['A00', 'B99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '17', 'description' => 'Malignant neoplasm of breast', 'exact_codes' => ['C50'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '18', 'description' => 'Malignant neoplasm of female genital organs', 'exact_codes' => null, 'ranges' => [['C51', 'C58']], 'priority' => 1],
            ['mtuha_code' => '19', 'description' => 'Malignant neoplasm of digestive organs', 'exact_codes' => null, 'ranges' => [['C15', 'C26']], 'priority' => 1],
            ['mtuha_code' => '20', 'description' => 'Malignant neoplasm of male genital organs', 'exact_codes' => null, 'ranges' => [['C60', 'C63']], 'priority' => 1],
            ['mtuha_code' => '21', 'description' => 'Neoplasm/cancer,others', 'exact_codes' => null, 'ranges' => [['C00', 'D48']], 'priority' => 3], // Remainder
            ['mtuha_code' => '22', 'description' => 'Sicklecell Disease', 'exact_codes' => ['D57'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '23', 'description' => 'Anaemia Mid/Moderate', 'exact_codes' => ['D64.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '24', 'description' => 'Anaemia, Severe', 'exact_codes' => ['D64.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '25', 'description' => 'Other Diseases of blood and blood forming organ', 'exact_codes' => null, 'ranges' => [['D51', 'D89']], 'priority' => 1],
            ['mtuha_code' => '26', 'description' => 'Diabetes', 'exact_codes' => null, 'ranges' => [['E10', 'E14']], 'priority' => 1],
            ['mtuha_code' => '27', 'description' => 'Severe Wasting with Nutritional Edema', 'exact_codes' => ['E40', 'E42'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '28', 'description' => 'Severe Wasting without Nutritional Edema', 'exact_codes' => ['E41'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '29', 'description' => 'Goiter', 'exact_codes' => ['E04'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '30', 'description' => 'Other Thyroid diseases', 'exact_codes' => null, 'ranges' => [['E00', 'E07']], 'priority' => 1],
            ['mtuha_code' => '31', 'description' => 'Moderate Wasting', 'exact_codes' => ['E44.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '32', 'description' => 'Vitamin A Deficiency', 'exact_codes' => ['E50'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '33', 'description' => 'Other Nutritional Diseases', 'exact_codes' => null, 'ranges' => [['E40', 'E64']], 'priority' => 3], // Remainder
            ['mtuha_code' => '34', 'description' => 'Psychoses', 'exact_codes' => null, 'ranges' => [['F20', 'F29']], 'priority' => 1],
            ['mtuha_code' => '35', 'description' => 'Neuroses', 'exact_codes' => null, 'ranges' => [['F40', 'F48']], 'priority' => 1],
            ['mtuha_code' => '36', 'description' => 'Substance abuse', 'exact_codes' => null, 'ranges' => [['F10', 'F19']], 'priority' => 1],
            ['mtuha_code' => '37', 'description' => 'Epilepsy', 'exact_codes' => ['G40'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '38', 'description' => 'Other Mental and behavioural disoder', 'exact_codes' => null, 'ranges' => [['F00', 'F99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '39', 'description' => 'Cerebral Palsy', 'exact_codes' => ['G80'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '40', 'description' => 'Bacterial Meningitis', 'exact_codes' => ['G00'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '41', 'description' => 'Other nervours system diseases', 'exact_codes' => null, 'ranges' => [['G00', 'G99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '42', 'description' => 'Eye diseases, Infectious', 'exact_codes' => null, 'ranges' => [['H00', 'H59']], 'priority' => 1],
            ['mtuha_code' => '43', 'description' => 'Eye diseases, Injuries', 'exact_codes' => ['S05'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '44', 'description' => 'Other eye diseases', 'exact_codes' => null, 'ranges' => [['H00', 'H59']], 'priority' => 3], // Remainder
            ['mtuha_code' => '45', 'description' => 'Ear Infection, Acute', 'exact_codes' => ['H65.0', 'H66.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '46', 'description' => 'Ear Infection, Chronic', 'exact_codes' => ['H65.2', 'H66.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '47', 'description' => 'Acute otitis media', 'exact_codes' => ['H66.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '48', 'description' => 'Ear diseases-non infection', 'exact_codes' => null, 'ranges' => [['H60', 'H95']], 'priority' => 1],
            ['mtuha_code' => '49', 'description' => 'Other Diseases of ear and mastoid process', 'exact_codes' => null, 'ranges' => [['H60', 'H95']], 'priority' => 3], // Remainder
            ['mtuha_code' => '50', 'description' => 'Hypertension', 'exact_codes' => ['I10'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '51', 'description' => 'Cardiac Failure', 'exact_codes' => ['I50.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '52', 'description' => 'Rheumatic heart diseases', 'exact_codes' => null, 'ranges' => [['I05', 'I09']], 'priority' => 1],
            ['mtuha_code' => '53', 'description' => 'Cardiovascular Diseases, Other', 'exact_codes' => null, 'ranges' => [['I20', 'I52']], 'priority' => 1],
            ['mtuha_code' => '54', 'description' => 'Other diseases of the circulatory system', 'exact_codes' => null, 'ranges' => [['I00', 'I99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '55', 'description' => 'Upper Respiratory Infections (Pharyngitis, Tonsils)', 'exact_codes' => ['J02', 'J03', 'J06.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '56', 'description' => 'Pneumonia none Severe', 'exact_codes' => ['J18.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '57', 'description' => 'Pneumonia Severe', 'exact_codes' => ['J18.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '58', 'description' => 'Bronchial Asthma, severe', 'exact_codes' => ['J45'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '59', 'description' => 'Acute bronchitis', 'exact_codes' => ['J20'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '60', 'description' => 'Other respiratory diseases', 'exact_codes' => null, 'ranges' => [['J00', 'J99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '61', 'description' => 'Appendicitis', 'exact_codes' => null, 'ranges' => [['K35', 'K37']], 'priority' => 1],
            ['mtuha_code' => '62', 'description' => 'Scrotal Iguinal Hernia', 'exact_codes' => ['K40'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '63', 'description' => 'Hernia Others', 'exact_codes' => null, 'ranges' => [['K41', 'K46']], 'priority' => 1],
            ['mtuha_code' => '64', 'description' => 'Intestinal Obstruction', 'exact_codes' => ['K56.6'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '65', 'description' => 'Hemarrhoid', 'exact_codes' => ['I84', 'K64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '66', 'description' => 'Peptic Ulcers', 'exact_codes' => ['K27'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '67', 'description' => 'Gastro Oesophageal Reflux Diseases(GERD)', 'exact_codes' => ['K21'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '68', 'description' => 'GIT Diseases, Other Non-infectious', 'exact_codes' => null, 'ranges' => [['K20', 'K93']], 'priority' => 2], // Sub-Remainder
            ['mtuha_code' => '69', 'description' => 'Dental Abcess', 'exact_codes' => ['K04.7'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '70', 'description' => 'Fractures of mandible', 'exact_codes' => ['S02.6'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '71', 'description' => 'Fractures of maxilla', 'exact_codes' => ['S02.4'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '72', 'description' => 'Ludwigs Angina', 'exact_codes' => ['K12.2'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '73', 'description' => 'Necrotizing Faciitis secondary to dental abscess', 'exact_codes' => ['M72.6', 'K04.7'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '74', 'description' => 'other digestive diseases', 'exact_codes' => null, 'ranges' => [['K00', 'K93']], 'priority' => 3], // Remainder
            ['mtuha_code' => '75', 'description' => 'Skin Infection, Non-Fungal', 'exact_codes' => null, 'ranges' => [['L00', 'L08']], 'priority' => 1],
            ['mtuha_code' => '76', 'description' => 'Skin Infection, Fungal', 'exact_codes' => ['B35', 'B36'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '77', 'description' => 'Skin Diseases, Non-infectious', 'exact_codes' => null, 'ranges' => [['L10', 'L99']], 'priority' => 1],
            ['mtuha_code' => '78', 'description' => 'Other skin and subcutaneus tissue diseases', 'exact_codes' => null, 'ranges' => [['L00', 'L99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '79', 'description' => 'Gout', 'exact_codes' => ['M10'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '80', 'description' => 'Osteomyelitis', 'exact_codes' => ['M86'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '81', 'description' => 'Rheumatoid and Joint Diseases', 'exact_codes' => null, 'ranges' => [['M05', 'M14']], 'priority' => 1],
            ['mtuha_code' => '82', 'description' => 'Cellulitis', 'exact_codes' => ['L03'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '83', 'description' => 'Soft tissue Injury', 'exact_codes' => ['T14.3'], 'ranges' => [['S00', 'T14']], 'priority' => 2], // Sub-remainder protection
            ['mtuha_code' => '84', 'description' => 'Other Diseases of the Musculaskeletal system', 'exact_codes' => null, 'ranges' => [['M00', 'M99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '85', 'description' => 'Urinary Tract Infections (UTI)', 'exact_codes' => ['N39.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '86', 'description' => 'Acute Kidney Diseases(AKI)', 'exact_codes' => ['N17'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '87', 'description' => 'Bartholin Abcess', 'exact_codes' => ['N75.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '88', 'description' => 'Benign prostatic Hyperplasia(BPH)', 'exact_codes' => ['N40'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '89', 'description' => 'STI Genital Discharge Syndrome(GDS)', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '90', 'description' => 'STI GenitalUlcerDiseases(GUD)', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '91', 'description' => 'Nepritic syndrome (UNSPECIFIED)', 'exact_codes' => ['N04.9', 'N05'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '92', 'description' => 'Pelvic Inflammatory Diseases (PID)', 'exact_codes' => ['N73.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '93', 'description' => 'Other diseases of the genitor urinary', 'exact_codes' => null, 'ranges' => [['N00', 'N99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '94', 'description' => 'Ectopic pregnacy', 'exact_codes' => ['O00'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '95', 'description' => 'Abortion', 'exact_codes' => null, 'ranges' => [['O03', 'O06']], 'priority' => 1],
            ['mtuha_code' => '96', 'description' => 'Gynaecological diseases, others', 'exact_codes' => null, 'ranges' => [['N70', 'N98']], 'priority' => 3], // Remainder
            ['mtuha_code' => '97', 'description' => 'Pregnancy complications', 'exact_codes' => null, 'ranges' => [['O10', 'O99']], 'priority' => 1],
            ['mtuha_code' => '98', 'description' => 'Puerperal Sepsis', 'exact_codes' => ['O85'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '99', 'description' => 'Cracked nipple', 'exact_codes' => ['O92.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '100', 'description' => 'Cystitis', 'exact_codes' => ['N30'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '101', 'description' => 'Other Pregnacy, childbirth and puperium', 'exact_codes' => null, 'ranges' => [['O00', 'O99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '102', 'description' => 'Neonatal Sepsis', 'exact_codes' => ['P36'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '103', 'description' => 'Low birth weight and Pre-maturity complications', 'exact_codes' => ['P07'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '104', 'description' => 'Birth asphyxia', 'exact_codes' => ['P21'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '105', 'description' => 'Other certain condition originating', 'exact_codes' => null, 'ranges' => [['P00', 'P96']], 'priority' => 3], // Remainder
            ['mtuha_code' => '106', 'description' => 'Congenital Hydrocephalus', 'exact_codes' => ['Q03'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '107', 'description' => 'Other congenital malformations', 'exact_codes' => null, 'ranges' => [['Q00', 'Q99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '108', 'description' => 'Burn', 'exact_codes' => null, 'ranges' => [['T20', 'T32']], 'priority' => 1],
            ['mtuha_code' => '109', 'description' => 'Fractures', 'exact_codes' => ['S02', 'S12', 'S22', 'S32', 'S42', 'S52', 'S62', 'S72', 'S82', 'S92'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '110', 'description' => 'Poisoning', 'exact_codes' => null, 'ranges' => [['T36', 'T65']], 'priority' => 1],
            ['mtuha_code' => '111', 'description' => 'Dislocations (unspecified)', 'exact_codes' => ['T14.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '112', 'description' => 'Sprain/Strain', 'exact_codes' => ['T14.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '113', 'description' => 'Alcohol Intoxication', 'exact_codes' => ['F10.0', 'T51'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '114', 'description' => 'Snake Bite', 'exact_codes' => ['T63.0', 'X20'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '115', 'description' => 'Insect Bites', 'exact_codes' => ['T63.4', 'X23'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '116', 'description' => 'Animal bite (Non suspected Rabies)', 'exact_codes' => ['T14.1', 'W54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '117', 'description' => 'Other injury and poisoning', 'exact_codes' => null, 'ranges' => [['S00', 'T98']], 'priority' => 3], // Remainder
            ['mtuha_code' => '118', 'description' => 'Road Traffic Accidents', 'exact_codes' => null, 'ranges' => [['V01', 'V89']], 'priority' => 1],
            ['mtuha_code' => '119', 'description' => 'Assalt (Unspecified)', 'exact_codes' => null, 'ranges' => [['X85', 'Y09']], 'priority' => 1],
            ['mtuha_code' => '120', 'description' => 'Drouwing', 'exact_codes' => ['T75.1'], 'ranges' => [['W65', 'W74']], 'priority' => 1], // Contains both exact and range
            ['mtuha_code' => '121', 'description' => 'Other extenal causes of morbidity and mortality', 'exact_codes' => null, 'ranges' => [['V01', 'Y98']], 'priority' => 3], // Remainder
        ];

        // Use create() to ensure the model casts the arrays to JSON text properly
        foreach ($mappings as $mapping) {
            MrMtuhaMappingIpd::create($mapping);
        }
    }
}