<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;

class InvoiceOverdueController extends Controller
{
    public function markOverdue(): JsonResponse
    {
        $updatedCount = Invoice::query()
            ->whereIn('status', [
                Invoice::STATUS_UNPAID,
                Invoice::STATUS_PARTIALLY_PAID,
            ])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now()->toDateString())
            ->update([
                'status' => Invoice::STATUS_OVERDUE,
                'updated_at' => now()
            ]);

        app(AuditLogService::class)->log(
            request: request(),
            action: 'marked_overdue',
            module: 'invoices',
            description: "Marked {$updatedCount} invoice(s) as overdue.",
            newValues: [
                'updated_count' => $updatedCount,
            ]
        );

        return response()->json([
            'message' => 'Overdue invoices updated successfully.',
            'updated_count' => $updatedCount,
        ]);
    }
}