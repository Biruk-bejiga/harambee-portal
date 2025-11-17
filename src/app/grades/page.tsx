export default function GradesPage() {
  const grades = [
    { course: "CS101", title: "Intro to CS", score: 92.5, letter: "A" },
    { course: "MATH201", title: "Calculus II", score: 84.0, letter: "B" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Grades</h1>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Course</th>
              <th className="px-4 py-2 text-left font-medium">Title</th>
              <th className="px-4 py-2 text-right font-medium">Score</th>
              <th className="px-4 py-2 text-right font-medium">Letter</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.course} className="border-t dark:border-zinc-800">
                <td className="px-4 py-2">{g.course}</td>
                <td className="px-4 py-2">{g.title}</td>
                <td className="px-4 py-2 text-right">{g.score}</td>
                <td className="px-4 py-2 text-right font-medium">{g.letter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
