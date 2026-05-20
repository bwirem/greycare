<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalRecord\MrMtuhaMappingOpd;

class MtuhaMappingSeeder extends Seeder
{
    public function run()
    {
        // Clear the table before seeding so you don't get duplicate rows if you run it twice
        MrMtuhaMappingOpd::truncate();

        $mappings = [
            ['mtuha_code' => '4', 'description' => 'Hepatitis B', 'exact_codes' => ['B16', 'B18.0', 'B18.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '5', 'description' => 'Hepatitis C', 'exact_codes' => ['B17.1', 'B18.2'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '6', 'description' => 'Septicaemia Unspecified', 'exact_codes' => ['A41.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '7', 'description' => 'Diarrhea with no dehydration', 'exact_codes' => ['A09', 'E86'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '8', 'description' => 'Diarrhea with some dehydration', 'exact_codes' => ['A09', 'E86.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '9', 'description' => 'Human Africa Trypanosomiasis', 'exact_codes' => ['B56'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '10', 'description' => 'Urogenital Schistosomiasis', 'exact_codes' => ['B65.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '11', 'description' => 'Intestinal Schistosomiasis', 'exact_codes' => ['B65.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '12', 'description' => 'Lymphatic filairiasis -Hydrocele', 'exact_codes' => ['B74', 'N50.8'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '13', 'description' => 'Lymphatic filairiasis -Lymphoedema', 'exact_codes' => ['B74', 'I89.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '014a', 'description' => 'Malaria Blood slide positive', 'exact_codes' => ['B50', 'B54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '014b', 'description' => 'Malaria mRDT Positive', 'exact_codes' => ['B50', 'B54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '014c', 'description' => 'Malaria clinical (no Test )', 'exact_codes' => ['B54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '014d', 'description' => 'Malaria cases (Refferal in )', 'exact_codes' => ['B54', 'Z52'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '15', 'description' => 'Suspected Onchocerciasis (river blindness)', 'exact_codes' => ['B73'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '16', 'description' => 'Amoebiasis', 'exact_codes' => ['A06'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '17', 'description' => 'STH (Trichuris, Hookworm, ascaries)', 'exact_codes' => null, 'ranges' => [['B68', 'B81']], 'priority' => 1],
            ['mtuha_code' => '18', 'description' => 'SexuallyTransmitted Infections, Other', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '19', 'description' => 'Tuberculosis', 'exact_codes' => null, 'ranges' => [['A15', 'A19']], 'priority' => 1],
            ['mtuha_code' => '20', 'description' => 'Other infections and parasite diseases', 'exact_codes' => null, 'ranges' => [['A00', 'B99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '21', 'description' => 'Neoplasms/Cancer unspecified', 'exact_codes' => ['C80', 'D48'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '22', 'description' => 'Anaemia, Mild/Moderate', 'exact_codes' => ['D64.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '23', 'description' => 'Anaemia, Severe', 'exact_codes' => ['D64.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '24', 'description' => 'Iron deficiency anaemia', 'exact_codes' => ['D50'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '25', 'description' => 'Sickle cell Disease', 'exact_codes' => ['D57'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '26', 'description' => 'Other Diseases of blood and blood forming organ', 'exact_codes' => null, 'ranges' => [['D51', 'D89']], 'priority' => 1],
            ['mtuha_code' => '27', 'description' => 'Diabetes', 'exact_codes' => null, 'ranges' => [['E10', 'E14']], 'priority' => 1],
            ['mtuha_code' => '28', 'description' => 'Severe Wasting with Nutritional Edema', 'exact_codes' => ['E40', 'E42'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '29', 'description' => 'Severe Wasting without Nutritional Edema', 'exact_codes' => ['E41'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '30', 'description' => 'Goiter', 'exact_codes' => ['E04'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '31', 'description' => 'Other Thyroid diseases', 'exact_codes' => null, 'ranges' => [['E00', 'E07']], 'priority' => 1],
            ['mtuha_code' => '32', 'description' => 'Moderate Wasting', 'exact_codes' => ['E44.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '33', 'description' => 'Obesity', 'exact_codes' => ['E66'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '34', 'description' => 'Vitamin A Deficiency', 'exact_codes' => ['E50'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '35', 'description' => 'Other Endocrine, Nutrition and Metabolic Diseases', 'exact_codes' => null, 'ranges' => [['E00', 'E89']], 'priority' => 3], // Remainder
            ['mtuha_code' => '36', 'description' => 'Schizophrenia', 'exact_codes' => ['F20'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '37', 'description' => 'Epilepsy', 'exact_codes' => ['G40'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '38', 'description' => 'Neurosis', 'exact_codes' => ['F48.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '39', 'description' => 'Substance Abuse', 'exact_codes' => null, 'ranges' => [['F10', 'F19']], 'priority' => 1],
            ['mtuha_code' => '40', 'description' => 'Other Mental and behavioural disoder', 'exact_codes' => null, 'ranges' => [['F00', 'F99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '41', 'description' => 'Cerebral Palsy', 'exact_codes' => ['G80'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '42', 'description' => 'Other nervours system diseases', 'exact_codes' => null, 'ranges' => [['G00', 'G99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '43', 'description' => 'Eye diseases, Infectious', 'exact_codes' => null, 'ranges' => [['H00', 'H59']], 'priority' => 1],
            ['mtuha_code' => '44', 'description' => 'Eye diseases,Non infectious', 'exact_codes' => null, 'ranges' => [['H00', 'H59']], 'priority' => 1],
            ['mtuha_code' => '45', 'description' => 'Eye diseases, Injuries', 'exact_codes' => ['S05'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '46', 'description' => 'Other eye diseases', 'exact_codes' => null, 'ranges' => [['H00', 'H59']], 'priority' => 3], // Remainder
            ['mtuha_code' => '47', 'description' => 'Ear Infection, Acute', 'exact_codes' => ['H65.0', 'H66.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '48', 'description' => 'Ear Infection, Chronic', 'exact_codes' => ['H65.2', 'H66.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '49', 'description' => 'Other Diseases of ear and mastoid process', 'exact_codes' => null, 'ranges' => [['H60', 'H95']], 'priority' => 3], // Remainder
            ['mtuha_code' => '50', 'description' => 'Hypertension', 'exact_codes' => ['I10'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '51', 'description' => 'Rheumatic heart diseases', 'exact_codes' => null, 'ranges' => [['I05', 'I09']], 'priority' => 1],
            ['mtuha_code' => '52', 'description' => 'Other diseases of the circulatory system', 'exact_codes' => null, 'ranges' => [['I00', 'I99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '53', 'description' => 'Upper Respiratory Infections (Pharyngitis) Tonsill', 'exact_codes' => ['J02', 'J03', 'J06.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '54', 'description' => 'Pneumonia', 'exact_codes' => null, 'ranges' => [['J12', 'J18']], 'priority' => 1],
            ['mtuha_code' => '55', 'description' => 'Bronchial Asthma', 'exact_codes' => ['J45'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '56', 'description' => 'Acute bronchiltis', 'exact_codes' => ['J20'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '57', 'description' => 'Other respiratory diseases', 'exact_codes' => null, 'ranges' => [['J00', 'J99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '58', 'description' => 'Appendicitis', 'exact_codes' => null, 'ranges' => [['K35', 'K37']], 'priority' => 1],
            ['mtuha_code' => '59', 'description' => 'Hernia unspeciefied', 'exact_codes' => ['K46'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '60', 'description' => 'Haemorrhoids', 'exact_codes' => ['I84', 'K64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '61', 'description' => 'Peptic Ulcers', 'exact_codes' => ['K27'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '62', 'description' => 'GIT Diseases, Other Non-infectious', 'exact_codes' => null, 'ranges' => [['K20', 'K93']], 'priority' => 2], // Sub-Remainder
            ['mtuha_code' => '63', 'description' => 'Dental carries', 'exact_codes' => ['K02'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '64', 'description' => 'Periodontal Diseases', 'exact_codes' => ['K05'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '65', 'description' => 'Dental Conditions, Other', 'exact_codes' => null, 'ranges' => [['K00', 'K08']], 'priority' => 2], // Sub-Remainder
            ['mtuha_code' => '66', 'description' => 'Dental Abcess', 'exact_codes' => ['K04.7'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '67', 'description' => 'Other digestive diseases', 'exact_codes' => null, 'ranges' => [['K00', 'K93']], 'priority' => 3], // Remainder
            ['mtuha_code' => '68', 'description' => 'Skin Infection, Non-Fungal', 'exact_codes' => null, 'ranges' => [['L00', 'L08']], 'priority' => 1],
            ['mtuha_code' => '69', 'description' => 'Skin Infection, Fungal', 'exact_codes' => ['B35', 'B36'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '70', 'description' => 'Skin Diseases, Non-infectious', 'exact_codes' => null, 'ranges' => [['L10', 'L99']], 'priority' => 1],
            ['mtuha_code' => '71', 'description' => 'Fungal Infection, Non-skin', 'exact_codes' => null, 'ranges' => [['B37', 'B49']], 'priority' => 1],
            ['mtuha_code' => '72', 'description' => 'Other skin and subcutaneus tissue', 'exact_codes' => null, 'ranges' => [['L00', 'L99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '73', 'description' => 'Gout', 'exact_codes' => ['M10'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '74', 'description' => 'Osteomyelitis', 'exact_codes' => ['M86'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '75', 'description' => 'Rheumatoid and Joint Diseases', 'exact_codes' => null, 'ranges' => [['M05', 'M14']], 'priority' => 1],
            ['mtuha_code' => '76', 'description' => 'Cellulitis', 'exact_codes' => ['L03'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '77', 'description' => 'Soft tissue Injury', 'exact_codes' => ['T14.3'], 'ranges' => [['S00', 'T14']], 'priority' => 1],
            ['mtuha_code' => '78', 'description' => 'Other Diseases of the Musculaskeletal', 'exact_codes' => null, 'ranges' => [['M00', 'M99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '79', 'description' => 'Urinary Tract Infections (UTI)', 'exact_codes' => ['N39.0'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '80', 'description' => 'Acute Kidney Diseases(AKI)', 'exact_codes' => ['N17'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '81', 'description' => 'Bartholin Abcess', 'exact_codes' => ['N75.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '82', 'description' => 'Benign prostatic Hyperplasia(BPH)', 'exact_codes' => ['N40'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '83', 'description' => 'Neprotic syndrome (UNSPECIFIED)', 'exact_codes' => ['N04.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '84', 'description' => 'Pelvic Inflammatory Diseases (PID)', 'exact_codes' => ['N73.9'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '85', 'description' => 'STI Genital Discharge Syndrom (GDS)', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '86', 'description' => 'STI GenitalUlcer Diseases (GUD)', 'exact_codes' => ['A64'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '87', 'description' => 'Other diseases of the genital urinary and pelvic', 'exact_codes' => null, 'ranges' => [['N00', 'N99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '88', 'description' => 'Gynaecological diseases, others', 'exact_codes' => null, 'ranges' => [['N70', 'N98']], 'priority' => 2], // Sub-Remainder
            ['mtuha_code' => '89', 'description' => 'Cystitis', 'exact_codes' => ['N30'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '90', 'description' => 'Ectopic pregnacy', 'exact_codes' => ['O00'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '91', 'description' => 'Abortion', 'exact_codes' => null, 'ranges' => [['O03', 'O06']], 'priority' => 1],
            ['mtuha_code' => '92', 'description' => 'Pregnancy complications', 'exact_codes' => null, 'ranges' => [['O10', 'O99']], 'priority' => 1],
            ['mtuha_code' => '93', 'description' => 'puerperal Sepsis', 'exact_codes' => ['O85'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '94', 'description' => 'Cracked nipple', 'exact_codes' => ['O92.1'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '95', 'description' => 'Other Pregnacy , childbirth and puperium', 'exact_codes' => null, 'ranges' => [['O00', 'O99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '96', 'description' => 'Neonatal Sepsis', 'exact_codes' => ['P36'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '97', 'description' => 'Low birth weight and Prematurity', 'exact_codes' => ['P07'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '98', 'description' => 'Birth asphyxia', 'exact_codes' => ['P21'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '99', 'description' => 'Other Certain condition originating in the perinat', 'exact_codes' => null, 'ranges' => [['P00', 'P96']], 'priority' => 3], // Remainder
            ['mtuha_code' => '100', 'description' => 'Congenital Hydrocephalus', 'exact_codes' => ['Q03'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '101', 'description' => 'Other Congenital Disorders', 'exact_codes' => null, 'ranges' => [['Q00', 'Q99']], 'priority' => 3], // Remainder
            ['mtuha_code' => '102', 'description' => 'Burn', 'exact_codes' => null, 'ranges' => [['T20', 'T32']], 'priority' => 1],
            ['mtuha_code' => '103', 'description' => 'Fractures', 'exact_codes' => ['S02', 'S12', 'S22', 'S32', 'S42', 'S52', 'S62', 'S72', 'S82', 'S92'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '104', 'description' => 'Poisoning', 'exact_codes' => null, 'ranges' => [['T36', 'T65']], 'priority' => 1],
            ['mtuha_code' => '105', 'description' => 'Dislocations (unspecified)', 'exact_codes' => ['T14.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '106', 'description' => 'Sprain/Strain', 'exact_codes' => ['T14.3'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '107', 'description' => 'Alcohol Intoxication', 'exact_codes' => ['F10.0', 'T51'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '108', 'description' => 'Snake Bite', 'exact_codes' => ['T63.0', 'X20'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '109', 'description' => 'Insect Bites', 'exact_codes' => ['T63.4', 'X23'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '110', 'description' => 'Animal bite (Non suspected Rabies)', 'exact_codes' => ['T14.1', 'W54'], 'ranges' => null, 'priority' => 1],
            ['mtuha_code' => '111', 'description' => 'Other Injury ,poisoning and certain others', 'exact_codes' => null, 'ranges' => [['S00', 'T98']], 'priority' => 3], // Remainder
            ['mtuha_code' => '112', 'description' => 'Road Traffic Accidents', 'exact_codes' => null, 'ranges' => [['V01', 'V89']], 'priority' => 1],
            ['mtuha_code' => '113', 'description' => 'Assault (Unspecified)', 'exact_codes' => null, 'ranges' => [['X85', 'Y09']], 'priority' => 1],
            ['mtuha_code' => '114', 'description' => 'Drouwning', 'exact_codes' => ['T75.1'], 'ranges' => [['W65', 'W74']], 'priority' => 1],
            ['mtuha_code' => '115', 'description' => 'Other Extenal causes of morbidity', 'exact_codes' => null, 'ranges' => [['V01', 'Y98']], 'priority' => 3], // Remainder
        ];

        // Insert in chunks to be safe with database limitations, though 115 rows is usually fine
       foreach ($mappings as $mapping) {
            MrMtuhaMappingOpd::create($mapping);
        }


    }
}