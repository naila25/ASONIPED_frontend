import { Link, Outlet } from '@tanstack/react-router';
import { Users, Settings, FileText, ArrowRight, MessageSquare } from 'lucide-react';

const VolunteersSubDashboard = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Users className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Voluntariado</h1>
          <p className="text-gray-600">Gestiona opciones y formularios de voluntariado</p>
        </div>
      </div>
    </div>

    {/* Navigation Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link 
        to="/admin/volunteers/options" 
        className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Opciones de Voluntariado
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configura y administra las opciones disponibles
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

      <Link 
        to="/admin/volunteers/forms" 
        className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                Formularios de Voluntarios
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Revisa y gestiona las solicitudes recibidas
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

      <Link 
        to="/admin/volunteers/proposals" 
        className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Propuestas de Voluntariado
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Revisa y aprueba nuevas propuestas
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </div>

    {/* Content Area */}
    <div className="bg-white rounded-lg shadow-sm">
      <Outlet />
    </div>
  </div>
);

export default VolunteersSubDashboard; 