<?php

use App\Models\KaspaFormula;
use Illuminate\Database\Seeder;

class KaspaFormulaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        KaspaFormula::insert([
            ['description' => 'Side setback Single Stroey must be at least {{Xm}} from boundary'],
            ['description' => 'Side setback Double Storey must be at leastf {{Xm}} from boundary'],
            ['description' => 'Must be {{Xmm}} from easement'],
            ['description' => 'Minimum house size is {{Xm2}} for lots larger than {{Xm2}}'],
            ['description' => 'Boundary wall length can be a maximum {{X%}}'],
            ['description' => 'Boundary wall length can be a maximum {{Xm}}'],
            ['description' => 'Side setback for corner lots must be a minimum of {{Xm}} from boundary'],
            ['description' => 'Garage door must be less than {{X%}} of the lot width'],
            ['description' => 'Double garage is required for lots at least {{Xm}} wide'],
            ['description' => 'Garage setback must be at least {{Xm}}'],
            ['description' => 'Single garage is required for lots less than {{Xm}} wide'],
            ['description' => 'Floorplan width must be at least {{X%}} of lot width'],
            ['description' => 'Double garage is required for lots at least {{Xm}} wide'],
            ['description' => 'Site coverage is a maximum of {{X%}}'],
            ['description' => 'Front setback must be at least {{Xm}} from boundary to front wall'],
            ['description' => 'Minimum house size is {{Xm2}} exclusive of garage'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots between {{Xm2}} and {{Xm2}} (Including Garage)'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots between {{Xm2}} and {{Xm2}} (Excluding Garage)(Bracket Display)'],
            ['description' => 'Minimum house area size is {{Xm2}} for lots between {{Xm2}} and {{Xm2}}  (Bracket Display)'],
            ['description' => 'Minimum house size is {{Xm2}} for lots less than {{Xm2}}'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots less than {{Xm2}}'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots larger than {{Xm2}}'],
            ['description' => 'Minimum living area size is {{Xm2}}'],
            ['description' => 'Porch can encroach a minimum of {{Xmm}}'],
            ['description' => 'Porch can encroach a maximum of {{Xmm}} for a single storey'],
            ['description' => 'Porch can encroach a maximum of {{Xmm}} for a double storey'],
            ['description' => 'Rear setback must be at least {{Xmm}} for single storey'],
            ['description' => 'Rear setback must be at least {{Xmm}} for double storey'],
            ['description' => 'Double garage is required for lots larger than {{Xm2}}'],
            ['description' => 'Garage must be less than {{X%}} of the lot width'],
            ['description' => 'Single Garage must be less than {{X%}} of the lot width'],
            ['description' => 'Front setback must be at least {{Xm}} from boundary to front wall on lots of {{Xm}} wide or less'],
            ['description' => 'Balcony can encroach front setback  a maximum of {{Xm}} for a single storey'],
            ['description' => 'Floorplan cannot have 0 setback on both side boundaries'],
            ['description' => 'Front setback cannot be more than {{Xm}}'],
            ['description' => 'Wall on boundary cannot exceed {{Xm}}'],
            ['description' => 'Wall on boundary cannot exceed {{Xm}} plus {{X%}}'],
            ['description' => 'Garage setback cannot be between {{Xm}} and {{Xm}}'],
            ['description' => 'Garages within {{Xm}} of the boundary cannot exceed {{Xm}} in length'],
            ['description' => 'Front setback must be at least {{Xm}} to front wall on lots less than {{Xm2}}'],
            ['description' => 'Front setback must be at least {{Xm}} to front wall on lots larger than {{Xm2}}'],
            ['description' => 'Porch, Verandah, balconies and pergolas not encroach setback by {{Xm}} on lots less than {{Xm2}}'],
            ['description' => 'Porch, Verandah, balconies and pergolas not encroach setback by {{Xm}} on lots greater than {{Xm2}}'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots less than {{Xm2}} (Excluding garage, porch, portico, verandahs)'],
            ['description' => 'Minimum living area size is {{Xm2}} for lots larger than {{Xm2}} (Excluding garage, porch, portico, verandahs)'],
            ['description' => 'Side setbacks must be a minimum of {{Xm}} from at least one side boundary'],
            ['description' => 'Front setback must be between {{Xm}} and {{Xm}} from boundary to front wall on lots between {{Xm2}} and {{Xm2}}'],
            ['description' => 'Front setback must be at least {{Xm}} and {{Xm}} from boundary to front wall on lots larger than {{Xm2}}'],
        ]);
    }
}
