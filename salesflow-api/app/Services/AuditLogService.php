<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(
        Request $request,
        string $action,
        string $module,
        ?Model $auditable = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog
    {
        return AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'module' => $module,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->id,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}