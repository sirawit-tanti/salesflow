<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'ADMIN')->first();

        User::updateOrCreate(
            ['email' => 'admin@salesflow.test'],
            [
                'role_id' => $adminRole?->id,
                'name' => 'SalesFlow Admin',
                'password' => 'password',
                'is_active' => true,
            ]
        );
    }
}