export default function Home() {
  const grades = [
    { course: "CS101", title: "Intro to CS", score: 92.5, letter: "A" },
    { course: "MATH201", title: "Calculus II", score: 84.0, letter: "B" },
  ];
  const billing = { term: "Fall 2025", amountDue: 2600, amountPaid: 500 };
  const enrolled = [
    { code: "CS101", title: "Intro to CS", credits: 3 },
    { code: "MATH201", title: "Calculus II", credits: 4 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-medium">Recent Grades</h2>
          <ul className="space-y-2 text-sm">
            {grades.map((g) => (
              <li key={g.course} className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {g.course} · {g.title}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {g.letter} ({g.score})
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-medium">Billing Summary</h2>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            <div>Term: {billing.term}</div>
            <div>Amount Due: ${billing.amountDue}</div>
            <div>Amount Paid: ${billing.amountPaid}</div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Balance: ${billing.amountDue - billing.amountPaid}</div>
          </div>
        </section>
      </div>
      <section className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-medium">Current Courses</h2>
        <ul className="space-y-2 text-sm">
          {enrolled.map((c) => (
            <li key={c.code} className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-300">
                {c.code} · {c.title}
              </span>
              <span className="text-zinc-500">{c.credits} credits</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
