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
  MessageSquare,
  Edit,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const navLinks = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/expedientes", label: "Expedientes", icon: FileText },
  { 
    label: "Asistencia", 
    icon: TrendingUp, 
    hasSubmenu: true,
    submenu: [
      { to: "/admin/attendance", label: "Panel de Asistencia", icon: TrendingUp },
      { to: "/admin/attendance/beneficiaries", label: "Asistencia Beneficiarios", icon: Users },
      { to: "/admin/attendance/guests", label: "Asistencia Invitados", icon: User },
      { to: "/admin/attendance/list", label: "Lista de Asistencia", icon: FileText },
      { to: "/admin/attendance/activities", label: "Actividades", icon: Calendar }
    ]
  },
  { 
    label: "Voluntarios", 
    icon: Users, 
    hasSubmenu: true,
    submenu: [
      { to: "/admin/volunteers/options", label: "Opciones de Voluntariado", icon: Settings },
      { to: "/admin/volunteers/forms", label: "Formularios de Voluntarios", icon: FileText },
      { to: "/admin/volunteers/proposals", label: "Propuestas de Voluntariado", icon: MessageSquare }
    ]
  },
  { 
    label: "Talleres", 
    icon: GraduationCap, 
    hasSubmenu: true,
    submenu: [
      { to: "/admin/workshops/options", label: "Opciones de Talleres", icon: Settings },
      { to: "/admin/workshops/forms", label: "Formularios de Talleres", icon: FileText }
    ]
  },
  { to: "/admin/tickets", label: "Tickets", icon: MessageSquare },
  { to: "/admin/events-news", label: "Eventos", icon: Calendar },
  { to: "/admin/landing", label: "Gestión del Landing", icon: Edit},
  { to: "/admin/users", label: "Gestión de Usuarios", icon: Settings },
  
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

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
              <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
            </div>
            <p className="text-sm text-gray-600">ASONIPED Digital</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isExpanded = expandedMenus.has(link.label);
              
              if (link.hasSubmenu && link.submenu) {
                return (
                  <div key={link.label}>
                    {/* Parent menu item */}
                    <button
                      onClick={() => toggleSubmenu(link.label)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Submenu items */}
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {link.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.to}
                              to={subItem.to}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors duration-200 text-sm"
                              onClick={() => setSidebarOpen(false)}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
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
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-0 md:ml-0 transition-all min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-300 flex-shrink-0">
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
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
