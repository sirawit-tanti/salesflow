<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $invoice->invoice_no }}</title>

    <style>
    body {
        font-family: DejaVu Sans, sans-serif;
        font-size: 12px;
        color: #111827;
    }

    .header {
        display: table;
        width: 100%;
        margin-bottom: 24px;
    }

    .header-left,
    .header-right {
        display: table-cell;
        vertical-align: top;
        width: 50%;
    }

    .header-right {
        text-align: right;
    }

    .company-name {
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .document-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .muted {
        color: #6b7280;
    }

    .section {
        margin-bottom: 20px;
    }

    .section-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #e5e7eb;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        background: #f3f4f6;
        text-align: left;
        font-size: 11px;
        padding: 8px;
        border: 1px solid #e5e7eb;
    }

    td {
        padding: 8px;
        border: 1px solid #e5e7eb;
        vertical-align: top;
    }

    .text-right {
        text-align: right;
    }

    .summary {
        width: 320px;
        margin-left: auto;
        margin-top: 16px;
    }

    .summary td {
        border: none;
        padding: 5px 0;
    }

    .summary .total {
        font-size: 15px;
        font-weight: bold;
        border-top: 1px solid #111827;
        padding-top: 8px;
    }

    .paid {
        color: #047857;
        font-weight: bold;
    }

    .balance {
        color: #b91c1c;
        font-weight: bold;
    }

    .footer {
        margin-top: 36px;
        font-size: 11px;
        color: #6b7280;
    }
    </style>
</head>

<body>
    <div class="header">
        <div class="header-left">
            <div class="company-name">SalesFlow</div>
            <div class="muted">Quotation, Invoice & Payment Management System</div>
        </div>

        <div class="header-right">
            <div class="document-title">INVOICE</div>
            <div><strong>No:</strong> {{ $invoice->invoice_no }}</div>
            <div><strong>Status:</strong> {{ $invoice->status }}</div>
            <div><strong>Issue Date:</strong> {{ $invoice->issue_date?->format('Y-m-d') }}</div>
            <div><strong>Due Date:</strong> {{ $invoice->due_date?->format('Y-m-d') ?? '-' }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Customer Information</div>
        <div><strong>Name:</strong> {{ $invoice->customer?->name ?? '-' }}</div>
        <div><strong>Company:</strong> {{ $invoice->customer?->company_name ?? '-' }}</div>
        <div><strong>Email:</strong> {{ $invoice->customer?->email ?? '-' }}</div>
        <div><strong>Phone:</strong> {{ $invoice->customer?->phone ?? '-' }}</div>
        <div><strong>Tax ID:</strong> {{ $invoice->customer?->tax_id ?? '-' }}</div>
        <div><strong>Address:</strong> {{ $invoice->customer?->address ?? '-' }}</div>
    </div>

    <div class="section">
        <div class="section-title">Items</div>

        <table>
            <thead>
                <tr>
                    <th style="width: 36px;">#</th>
                    <th>Item</th>
                    <th style="width: 70px;" class="text-right">Qty</th>
                    <th style="width: 70px;">Unit</th>
                    <th style="width: 90px;" class="text-right">Unit Price</th>
                    <th style="width: 90px;" class="text-right">Discount</th>
                    <th style="width: 100px;" class="text-right">Line Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $item->item_name }}</strong>
                        @if ($item->description)
                        <br>
                        <span class="muted">{{ $item->description }}</span>
                        @endif
                    </td>
                    <td class="text-right">{{ number_format((float) $item->quantity, 2) }}</td>
                    <td>{{ $item->unit }}</td>
                    <td class="text-right">{{ number_format((float) $item->unit_price, 2) }}</td>
                    <td class="text-right">{{ number_format((float) $item->discount_amount, 2) }}</td>
                    <td class="text-right">{{ number_format((float) $item->line_total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <table class="summary">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">{{ number_format((float) $invoice->sub_total, 2) }}</td>
            </tr>
            <tr>
                <td>Discount</td>
                <td class="text-right">{{ number_format((float) $invoice->discount_amount, 2) }}</td>
            </tr>
            <tr>
                <td>Tax {{ number_format((float) $invoice->tax_rate, 2) }}%</td>
                <td class="text-right">{{ number_format((float) $invoice->tax_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="total">Total</td>
                <td class="text-right total">{{ number_format((float) $invoice->total_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="paid">Paid</td>
                <td class="text-right paid">{{ number_format((float) $invoice->paid_amount, 2) }}</td>
            </tr>
            <tr>
                <td class="balance">Balance Due</td>
                <td class="text-right balance">{{ number_format((float) $invoice->balance_due, 2) }}</td>
            </tr>
        </table>
    </div>

    @if ($invoice->payments->count() > 0)
    <div class="section">
        <div class="section-title">Payment History</div>

        <table>
            <thead>
                <tr>
                    <th>Payment No</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->payments as $payment)
                <tr>
                    <td>{{ $payment->payment_no }}</td>
                    <td>{{ $payment->payment_date?->format('Y-m-d') }}</td>
                    <td>{{ $payment->payment_method }}</td>
                    <td>{{ $payment->reference_no ?? '-' }}</td>
                    <td class="text-right">{{ number_format((float) $payment->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if ($invoice->notes)
    <div class="section">
        <div class="section-title">Notes</div>
        <div>{{ $invoice->notes }}</div>
    </div>
    @endif

    <div class="footer">
        Generated by SalesFlow on {{ now()->timezone('Asia/Bangkok')->format('Y-m-d H:i:s') }}
    </div>
</body>

</html>