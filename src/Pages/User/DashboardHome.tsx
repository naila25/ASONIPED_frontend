import { useState } from "react";
import { 
  FileText, 
  GraduationCap, 
  Heart, 
  DollarSign, 
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Award
} from "lucide-react";

// Mock data - esto se reemplazará con datos reales de la API
const mockStats = {
  expediente: { total: 0, activos: 0, pendientes: 0 },
  talleres: { inscritos: 0, completados: 0, proximos: 0 },
  voluntariado: { programas: 0, horas: 0, activo: true }
};

const mockActivities = [
  { id: 1, title: "Talleres", date: "0-0-0", time: "00-00", type: "taller" },
  { id: 2, title: "Voluntariado", date: "0-0-0", time: "00:00", type: "voluntariado" },
  { id: 3, title: "Revisión de Expediente #123", date: "0-0-0", time: "00:00", type: "expediente" },
];

export default function DashboardHome() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Hola, Usuario!</h1>
            <p className="text-gray-600">Bienvenido a tu panel personal de ASONIPED</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Expedientes Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expediente</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.expediente.total}</p>
              <p className="text-xs text-gray-500">{mockStats.expediente.activos} activos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Talleres Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Talleres</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.talleres.inscritos}</p>
              <p className="text-xs text-gray-500">{mockStats.talleres.completados} completados</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Voluntariado Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Voluntariado</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.voluntariado.horas}h</p>
              <p className="text-xs text-gray-500">{mockStats.voluntariado.programas} programas</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Expediente</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
            <GraduationCap className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Inscribirse a Taller</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">Registrar Voluntariado</span>
          </button>
        </div>
      </div>

      {/* Recent Activities and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h2>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'taller' ? 'bg-green-100' :
                  activity.type === 'voluntariado' ? 'bg-purple-100' :
                  'bg-blue-100'
                }`}>
                  {activity.type === 'taller' ? (
                    <GraduationCap className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'voluntariado' ? (
                    <Heart className="w-4 h-4 text-purple-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date} a las {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Actividades</h2>
          <div className="text-center p-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Calendario de actividades próximamente</p>
            <p className="text-sm text-gray-400">Integración con talleres y voluntariado</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mi Progreso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">Participación</p>
            <p className="text-2xl font-bold text-blue-600">85%</p>
            <p className="text-sm text-gray-500">Excelente progreso</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Horas de Servicio</p>
            <p className="text-2xl font-bold text-green-600">45h</p>
            <p className="text-sm text-gray-500">Meta: 50h</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900">Logros</p>
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-sm text-gray-500">Certificados obtenidos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

