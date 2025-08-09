<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParameterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert parameters
        $parameters = [
            ['name' => 'total_number_of_vendor', 'description' => 'Number of vendors in the system'],
            ['name' => 'cuisine_type', 'description' => 'Types of cuisines available'],
            ['name' => 'main_material', 'description' => 'Main ingredients used'],
        ];

        foreach ($parameters as $param) {
            DB::table('parameters')->insert($param);
        }

        // Prepare parameter values by splitting the comma-separated values
        $parameterValues = [
            // for total_number_of_vendor
            ['parameter_id' => 1, 'values' => ['50', '80', '120']],
            // for cuisine_type
            ['parameter_id' => 2, 'values' => ['Malay', 'Chinese', 'Indian']],
            // for main_material
            ['parameter_id' => 3, 'values' => ['Chicken', 'Fish', 'Vegetable']],
        ];

        // Insert values
        foreach ($parameterValues as $param) {
            foreach ($param['values'] as $value) {
                DB::table('parameter_values')->insert([
                    'parameter_id' => $param['parameter_id'],
                    'value' => $value
                ]);
            }
        }
    }
}
