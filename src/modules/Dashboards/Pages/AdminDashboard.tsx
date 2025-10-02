import { useState, useEffect } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  Home,
  Users,
  Calendar,
  FileText,
  GraduationCap,
  TrendingUp,
  Settings,
  Bell,
  User,
  Shield,
  MessageSquare
} from "lucide-react";

const navLinks = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/expedientes", label: "Expedientes", icon: FileText },
  { to: "/admin/volunteers", label: "Voluntarios", icon: Users },
  { to: "/admin/tickets", label: "Tickets", icon: MessageSquare },
  { to: "/admin/events-news", label: "Eventos", icon: Calendar },
  { to: "/admin/attendance", label: "Asistencia", icon: TrendingUp },
  { to: "/admin/workshops", label: "Talleres", icon: GraduationCap },
  { to: "/admin/users", label: "Gestión de Usuarios", icon: Settings },
  { to: "/admin/landing", label: "Gestión del Landing", icon: Settings},
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(0);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-64`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
            </div>
            <p className="text-sm text-gray-600">ASONIPED Digital</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 hover:text-orange-600 text-gray-700 transition-colors duration-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 md:ml-0 transition-all">
        <div>
          
    </div>
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-300">
          <div className="flex items-center justify-between p-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Page title */}
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-gray-800">
                Panel de Administración
              </h1>
            </div>

            {/* Right side - Notifications and User */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {username ? username : "Administrador"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
