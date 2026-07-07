<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuotationController;
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

    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('products', ProductController::class);

    Route::post('/quotations/{quotation}/send', [QuotationController::class, 'send']);
    Route::post('/quotations/{quotation}/accept', [QuotationController::class, 'accept']);
    Route::post('/quotations/{quotation}/reject', [QuotationController::class, 'reject']);
    Route::post('/quotations/{quotation}/convert-to-invoice', [QuotationController::class, 'convertToInvoice']);

    Route::apiResource('quotations', QuotationController::class);

    Route::get('/invoices/{invoice}/payments', [PaymentController::class, 'index']);
    Route::post('/invoices/{invoice}/payments', [PaymentController::class, 'store']);
    Route::delete('/invoices/{invoice}/payments/{payment}', [PaymentController::class, 'destroy']);

    Route::apiResource('invoices', InvoiceController::class)->only([
        'index',
        'show',
        'destroy',
    ]);
});