<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Quotation;
use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfController extends Controller
{
    public function quotation(Quotation $quotation): Response
    {
        $quotation->load([
            'customer',
            'items.product',
            'creator:id,name',
        ]);

        $pdf = Pdf::loadView('pdfs.quotation', [
            'quotation' => $quotation,
        ])->setPaper('a4');

        return $pdf->download("quotation-{$quotation->quotation_no}.pdf");
    }

    public function invoice(Invoice $invoice): Response
    {
        $invoice->load([
            'customer',
            'quotation',
            'items.product',
            'payments.receipt',
            'payments.creator:id,name',
            'creator:id,name',
        ]);

        $pdf = Pdf::loadView('pdfs.invoice', [
            'invoice' => $invoice,
        ])->setPaper('a4');

        return $pdf->download("invoice-{$invoice->invoice_no}.pdf");
    }

    public function receipt(Receipt $receipt): Response
    {
        $receipt->load([
            'invoice',
            'payment',
            'customer',
            'creator:id,name',
        ]);

        $pdf = Pdf::loadView('pdfs.receipt', [
            'receipt' => $receipt,
        ])->setPaper('a4');

        return $pdf->download("receipt-{$receipt->receipt_no}.pdf");
    }
}