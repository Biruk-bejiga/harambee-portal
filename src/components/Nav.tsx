"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/grades", label: "Grades" },
  { href: "/billing", label: "Billing" },
  { href: "/courses", label: "Courses" },
  { href: "/profile", label: "Profile" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-60 shrink-0 border-r bg-white/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="px-5 py-6">
        <div className="mb-6 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Harambee Portal</div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
