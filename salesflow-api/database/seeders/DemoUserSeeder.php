<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Sales User',
                'email' => 'sales@salesflow.test',
                'password' => 'password',
                'role' => 'SALES',
            ],
            [
                'name' => 'Accountant User',
                'email' => 'accountant@salesflow.test',
                'password' => 'password',
                'role' => 'ACCOUNTANT',
            ],
            [
                'name' => 'Manager User',
                'email' => 'manager@salesflow.test',
                'password' => 'password',
                'role' => 'MANAGER',
            ],
        ];

        foreach ($users as $userData) {
            $role = Role::where('name', $userData['role'])->first();

            if (! $role) {
                continue;
            }

            User::updateOrCreate(
                [
                    'email' => $userData['email'],
                ],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'role_id' => $role->id,
                    'is_active' => true,
                ]
            );
        }
    }
}