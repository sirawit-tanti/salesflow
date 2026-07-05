export function formatCurrency(value: string | number | null | undefined) {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}