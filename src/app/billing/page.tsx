export default function BillingPage() {
  const invoices = [
    { term: "Fall 2025", amountDue: 2600, amountPaid: 500, status: "PENDING", dueDate: new Date(Date.now() + 1000*60*60*24*30) },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Billing</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {invoices.map((inv) => (
          <div key={inv.term} className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-lg font-medium">{inv.term}</div>
            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
              <div>Amount Due: ${inv.amountDue}</div>
              <div>Amount Paid: ${inv.amountPaid}</div>
              <div>Balance: ${inv.amountDue - inv.amountPaid}</div>
              <div>Due: {inv.dueDate.toLocaleDateString()}</div>
              <div>Status: <span className="font-medium">{inv.status}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-black">Make Payment</button>
              <button className="rounded-md border px-3 py-2 text-sm dark:border-zinc-700">View Statement</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
