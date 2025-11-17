"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Kim",
    major: "Computer Science",
    year: 2,
    phone: "555-0100",
  });

  const update = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a future step, send to API/prisma
    alert("Profile saved (demo)");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Profile</h1>
      <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-zinc-600 dark:text-zinc-300">First Name</div>
            <input value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-zinc-600 dark:text-zinc-300">Last Name</div>
            <input value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
        </div>
        <label className="block text-sm">
          <div className="mb-1 text-zinc-600 dark:text-zinc-300">Major</div>
          <input value={profile.major} onChange={(e) => update("major", e.target.value)} className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <div className="mb-1 text-zinc-600 dark:text-zinc-300">Year</div>
            <input type="number" value={profile.year} onChange={(e) => update("year", Number(e.target.value))} className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
          <label className="text-sm">
            <div className="mb-1 text-zinc-600 dark:text-zinc-300">Phone</div>
            <input value={profile.phone} onChange={(e) => update("phone", e.target.value)} className="w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-black">Save</button>
          <button type="button" onClick={() => setProfile({ firstName: "Alex", lastName: "Kim", major: "Computer Science", year: 2, phone: "555-0100" })} className="rounded-md border px-4 py-2 text-sm dark:border-zinc-700">Reset</button>
        </div>
      </form>
    </div>
  );
}
