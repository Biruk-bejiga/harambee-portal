"use client";
import { useState } from "react";

type Course = { code: string; title: string; credits: number };

export default function CoursesPage() {
  const catalog: Course[] = [
    { code: "CS101", title: "Intro to CS", credits: 3 },
    { code: "MATH201", title: "Calculus II", credits: 4 },
    { code: "ENG150", title: "Academic Writing", credits: 2 },
  ];

  const [enrolled, setEnrolled] = useState<Course[]>([catalog[0], catalog[1]]);

  const add = (c: Course) => {
    if (!enrolled.find((e) => e.code === c.code)) setEnrolled((s) => [...s, c]);
  };
  const drop = (code: string) => setEnrolled((s) => s.filter((c) => c.code !== code));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Courses</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-medium">Catalog</h2>
          <ul className="space-y-2 text-sm">
            {catalog.map((c) => (
              <li key={c.code} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.code} · {c.title}</div>
                  <div className="text-xs text-zinc-500">{c.credits} credits</div>
                </div>
                <button onClick={() => add(c)} className="rounded-md border px-3 py-1 text-sm dark:border-zinc-700">Add</button>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-medium">My Enrollments</h2>
          {enrolled.length === 0 ? (
            <p className="text-sm text-zinc-500">No courses yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {enrolled.map((c) => (
                <li key={c.code} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.code} · {c.title}</div>
                    <div className="text-xs text-zinc-500">{c.credits} credits</div>
                  </div>
                  <button onClick={() => drop(c.code)} className="rounded-md bg-red-600 px-3 py-1 text-sm text-white">Drop</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
