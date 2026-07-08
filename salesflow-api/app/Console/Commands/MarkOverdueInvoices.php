<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use Illuminate\Console\Command;

class MarkOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark unpaid and partially paid invoices as overdue when due date has passed';

    /**
     * Execute the console command.
     */
    public function handle(): int
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

        $this->info("Marked {$updatedCount} invoice(s) as overdue.");

        return self::SUCCESS;
    }
}