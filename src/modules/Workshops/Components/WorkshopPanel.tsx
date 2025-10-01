
import { Link, Outlet } from "@tanstack/react-router";
import { FaChalkboardTeacher, FaClipboardList, FaArrowRight } from "react-icons/fa";

export default function WorkshopPanel() {
  return (
    <main >
      <div className="space-y-6">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaChalkboardTeacher className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Módulo de Talleres</h1>
              <p className="text-gray-600">
                Gestiona opciones y formularios de talleres
              </p>
            </div>
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Opciones de Talleres */}
          <Link
            to="/admin/workshops/options"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FaClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Opciones de Talleres
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Configura y administra las opciones disponibles
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Formularios de Talleres */}
          <Link
            to="/admin/workshops/forms"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FaChalkboardTeacher className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Formularios de Talleres
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Revisa y gestiona las inscripciones recibidas
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Área de contenido dinámico */}
        <div className="bg-white rounded-lg shadow-sm">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
