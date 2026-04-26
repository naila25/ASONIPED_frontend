import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { 
  Home, 
  FileText, 
  GraduationCap, 
  Heart,
  MessageSquare, 
  Calendar,
  Settings,
} from "lucide-react";

const navLinks = [
  { to: "/user", label: "Dashboard", icon: Home },
  { to: "/user/expedientes", label: "Expedientes", icon: FileText },
  { to: "/user/talleres", label: "Talleres", icon: GraduationCap },
  { to: "/user/voluntariado", label: "Voluntariado", icon: Heart },
  { to: "/user/mensajes", label: "Tickets", icon: MessageSquare },
  { to: "/user/calendario", label: "Calendario", icon: Calendar },
  { to: "/user/perfil", label: "Mi Perfil", icon: Settings },
];

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-60 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-64`}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-2">
            <p className="text-sm text-gray-600">ASONIPED Digital</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors duration-200"
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
          className="fixed inset-0 bg-blue-950/15 backdrop-blur-[2px] z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 md:ml-0 transition-all">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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

