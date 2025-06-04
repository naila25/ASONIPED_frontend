import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";

const navLinks = [
  { to: "/admin/volunteers", label: "Admin Volunteers" },
  { to: "/admin/donations", label: "Admin Donaciones" },
  { to: "/admin/events-news", label: "Admin Eventos" },
  { to: "/admin/attendance", label: "Admin Asistencia" },
  // Add more as needed
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-64`}>
        <div className="p-6">
          <h2 className="text-2xl  mb-9">Panel de Administración</h2>
          <nav className="flex flex-col gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="p-3 rounded hover:bg-zinc-100 text-orange-600  transition"
                onClick={() => setSidebarOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0  bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 md:ml-20 transition-all">
        {/* Top bar */}
        <div className="p-4 bg-white shadow flex items-center md:hidden">
          <button
            className="text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            &#9776; {/* Hamburger icon */}
          </button>
          <span className="ml-4 font-bold text-lg">Panel de Administración</span>
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}