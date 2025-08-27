import { useState } from "react";
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  Settings,
} from "lucide-react";

// Mock data - esto se reemplazará con datos reales de la API
const mockStats = {
  usuarios: { total: 0, activos: 0, nuevos: 0 },
  eventos: { total: 0, proximos: 0, activos: 0 },
  expedientes: { total: 0, pendientes: 0, aprobados: 0 },
  talleres: { total: 0, activos: 0, inscritos: 0 },
  voluntariado: { programas: 0, voluntarios: 0, horas: 0 }
};

const mockRecentActivities = [
  { id: 1, title: "Expedientes nuevos", user: "null", time: "0", type: "expediente" },
  { id: 3, title: "Taller completado", workshop: "null", time: "0", type: "taller" },
  { id: 4, title: "Nuevo voluntario registrado", user: "null", time: "0", type: "voluntario" },
  { id: 5, title: "Evento programado", event: "null", time: "0", type: "evento" },
];

const mockQuickActions = [
  { title: "Revisar Expedientes", icon: FileText, color: "bg-blue-500", count: 1 },
  { title: "Consulta sobre Donaciones", icon: DollarSign, color: "bg-green-500", count: 1 },
  { title: "Programar Evento", icon: Calendar, color: "bg-purple-500", count: 0 },
  { title: "Administrar Talleres", icon: GraduationCap, color: "bg-orange-500", count: 1 },
  { title: "Gestión de Usuarios", icon: Users, color: "bg-indigo-500", count: 1 },
  { title: "Configuración", icon: Settings, color: "bg-gray-500", count: 0 },
];

export default function AdminDashboardHome() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600">Bienvenido al centro de control de ASONIPED</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Último acceso</p>
            <p className="text-sm font-medium text-gray-900">null</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Usuarios Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.usuarios.total}</p>
              <p className="text-xs text-gray-500">+{mockStats.usuarios.nuevos} nuevos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Eventos Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.eventos.total}</p>
              <p className="text-xs text-gray-500">{mockStats.eventos.proximos} próximos</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Expedientes Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expedientes</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.expedientes.total}</p>
              <p className="text-xs text-gray-500">{mockStats.expedientes.pendientes} pendientes</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Talleres Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Talleres</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.talleres.total}</p>
              <p className="text-xs text-gray-500">{mockStats.talleres.inscritos} inscritos</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Voluntariado Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voluntariado</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.voluntariado.voluntarios}</p>
              <p className="text-xs text-gray-500">{mockStats.voluntariado.horas}h servicio</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockQuickActions.map((action, index) => (
            <button
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">{action.title}</span>
              </div>
              {action.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h2>
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'expediente' ? 'bg-blue-100' :
                  activity.type === 'donacion' ? 'bg-green-100' :
                  activity.type === 'taller' ? 'bg-orange-100' :
                  activity.type === 'voluntario' ? 'bg-purple-100' :
                  'bg-indigo-100'
                }`}>
                  {activity.type === 'expediente' ? (
                    <FileText className="w-4 h-4 text-blue-600" />
                  ) : activity.type === 'donacion' ? (
                    <DollarSign className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'taller' ? (
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                  ) : activity.type === 'voluntario' ? (
                    <Users className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">
                    {activity.user && `${activity.user} • `}
                    {activity.amount && `${activity.amount} • `}
                    {activity.workshop && `${activity.workshop} • `}
                    {activity.event && `${activity.event} • `}
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Servidor Web</span>
              </div>
              <span className="text-sm text-red-600">Desconectado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Base de Datos</span>
              </div>
              <span className="text-sm text-green-600">Conectado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Almacenamiento</span>
              </div>
              <span className="text-sm text-yellow-600">0% usado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Backup</span>
              </div>
              <span className="text-sm text-green-600">Actualizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">Crecimiento</p>
            <p className="text-2xl font-bold text-blue-600">0%</p>
            <p className="text-sm text-gray-500">Este mes</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Tiempo de Respuesta</p>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Promedio</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900">Meta</p>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Usuarios</p>
          </div>
        </div>
      </div>
    </div>
  );
}

