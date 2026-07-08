<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()
            ->with(['user:id,name,email'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function (Builder $query) use ($search) {
                $query->where('action', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function (Builder $userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('module')) {
            $query->where('module', $request->string('module')->toString());
        }

        if ($request->filled('action')) {
            $query->where('action', $request->string('action')->toString());
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->string('start_date')->toString());
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->string('end_date')->toString());
        }

        $perPage = min($request->integer('per_page', 10), 50);

        $auditLogs = $query->paginate($perPage);

        return AuditLogResource::collection($auditLogs);
    }
}