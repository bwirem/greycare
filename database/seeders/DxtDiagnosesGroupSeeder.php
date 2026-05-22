<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diagnosis\DxtDiagnosesGroup;

class DxtDiagnosesGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            ['code' => 'I', 'name' => 'Infections and Parasite diseases'],
            ['code' => 'II', 'name' => 'Neoplasms'],
            ['code' => 'III', 'name' => 'Diseases of blood and blood forming'],
            ['code' => 'IV', 'name' => 'Endocrine, Nutrition and metabolic'],
            ['code' => 'V', 'name' => 'Mental and behavioural disorder'],
            ['code' => 'VI', 'name' => 'Diseases of the Nervous system'],
            ['code' => 'VII', 'name' => 'Diseases of the eye'],
            ['code' => 'VIII', 'name' => 'Diseases of ear and mastoid process'],
            ['code' => 'IX', 'name' => 'Diseases of the circulatory system'],
            ['code' => 'X', 'name' => 'Diseases of the Respiratory system'],
            ['code' => 'XI', 'name' => 'Diseases of digestive system'],
            ['code' => 'XII', 'name' => 'Diseases of skin and subcutaneous tissue'],
            ['code' => 'XIII', 'name' => 'Diseases of the Musculoskeletal system and connective tissue'],
            ['code' => 'XIV', 'name' => 'Diseases of the genital urinary system and pelvic inflammatory diseases'],
            ['code' => 'XV', 'name' => 'Pregnancy, childbirth and puerperium'],
            ['code' => 'XVI', 'name' => 'Certain condition originating in the Perinatal period'],
            ['code' => 'XVII', 'name' => 'Congenital malformations, deformations and chromosomal abnormalities'],
            ['code' => 'XIX', 'name' => 'Injury, poisoning and certain others'], // XVIII was skipped in your image
            ['code' => 'XX', 'name' => 'External causes of morbidity and mortality'],
        ];

        // Loop through and create them
        foreach ($groups as $group) {
            DxtDiagnosesGroup::firstOrCreate(
                ['code' => $group['code']], // Check if this code already exists
                ['name' => $group['name']]  // If not, create it with this name
            );
        }
    }
}
