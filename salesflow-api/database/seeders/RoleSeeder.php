<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'ADMIN', 'display_name' => 'Administrator'],
            ['name' => 'SALES', 'display_name' => 'Sales'],
            ['name' => 'ACCOUNTANT', 'display_name' => 'Accountant'],
            ['name' => 'MANAGER', 'display_name' => 'Manager'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                ['display_name' => $role['display_name']],
            );
        }
    }
}