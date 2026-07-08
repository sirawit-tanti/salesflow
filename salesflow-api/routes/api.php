<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\InvoiceOverdueController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'SalesFlow API',
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])
        ->middleware('role:ADMIN,SALES,ACCOUNTANT,MANAGER');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('role:ADMIN,MANAGER');
    
    Route::prefix('reports')
        ->middleware('role:ADMIN,ACCOUNTANT,MANAGER')
        ->group(function () {
            Route::get('/sales', [ReportController::class, 'sales']);
            Route::get('/sales/export', [ReportController::class, 'exportSales']);

            Route::get('/payments', [ReportController::class, 'payments']);
            Route::get('/payments/export', [ReportController::class, 'exportPayments']);

            Route::get('/outstanding-invoices', [ReportController::class, 'outstandingInvoices']);
            Route::get('/outstanding-invoices/export', [ReportController::class, 'exportOutstandingInvoices']);
        });

    Route::apiResource('customers', CustomerController::class)
        ->middleware('role:ADMIN,SALES');
        
    Route::apiResource('products', ProductController::class)
        ->middleware('role:ADMIN,SALES');

    Route::post('/quotations/{quotation}/send', [QuotationController::class, 'send'])
        ->middleware('role:ADMIN,SALES');

    Route::post('/quotations/{quotation}/accept', [QuotationController::class, 'accept'])
        ->middleware('role:ADMIN,SALES');
        
    Route::post('/quotations/{quotation}/reject', [QuotationController::class, 'reject'])
        ->middleware('role:ADMIN,SALES');
        
    Route::post('/quotations/{quotation}/convert-to-invoice', [QuotationController::class, 'convertToInvoice'])
        ->middleware('role:ADMIN,SALES');

    Route::get('/quotations', [QuotationController::class, 'index'])
        ->middleware('role:ADMIN,SALES,MANAGER');

    Route::get('/quotations/{quotation}', [QuotationController::class, 'show'])
        ->middleware('role:ADMIN,SALES,MANAGER');

    Route::post('/quotations', [QuotationController::class, 'store'])
        ->middleware('role:ADMIN,SALES');

    Route::put('/quotations/{quotation}', [QuotationController::class, 'update'])
        ->middleware('role:ADMIN,SALES');

    Route::patch('/quotations/{quotation}', [QuotationController::class, 'update'])
        ->middleware('role:ADMIN,SALES');

    Route::delete('/quotations/{quotation}', [QuotationController::class, 'destroy'])
        ->middleware('role:ADMIN,SALES');

    Route::get('/invoices/{invoice}/payments', [PaymentController::class, 'index'])
        ->middleware('role:ADMIN,ACCOUNTANT,MANAGER');

    Route::post('/invoices/{invoice}/payments', [PaymentController::class, 'store'])
        ->middleware('role:ADMIN,ACCOUNTANT');

    Route::delete('/invoices/{invoice}/payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('role:ADMIN,ACCOUNTANT');

    Route::post('/invoices/mark-overdue', [InvoiceOverdueController::class, 'markOverdue'])
        ->middleware('role:ADMIN,ACCOUNTANT');

    Route::get('/invoices', [InvoiceController::class, 'index'])
        ->middleware('role:ADMIN,ACCOUNTANT,MANAGER');

    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])
        ->middleware('role:ADMIN,ACCOUNTANT,MANAGER');

    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])
        ->middleware('role:ADMIN,ACCOUNTANT');
    
    Route::apiResource('receipts', ReceiptController::class)
        ->only(['index', 'show'])
        ->middleware('role:ADMIN,ACCOUNTANT,MANAGER');
});