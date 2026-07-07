<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    public const METHOD_CASH = 'CASH';
    public const METHOD_BANK_TRANSFER = 'BANK_TRANSFER';
    public const METHOD_CREDIT_CARD = 'CREDIT_CARD';
    public const METHOD_CHEQUE = 'CHEQUE';
    public const METHOD_OTHER = 'OTHER';

    protected $fillable = [
        'invoice_id',
        'payment_no',
        'payment_date',
        'amount',
        'payment_method',
        'reference_no',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}