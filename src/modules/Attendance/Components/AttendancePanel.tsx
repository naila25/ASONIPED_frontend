
import { Link } from "@tanstack/react-router";
import { FaUsers, FaUserFriends, FaListAlt, FaArrowRight } from "react-icons/fa";

export default function AttendancePanel() {
  return (
    <main>
      <div className="space-y-6">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Módulo de Asistencia</h1>
              <p className="text-gray-600">
                Gestiona y revisa la asistencia de beneficiarios e invitados, así como las listas generadas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Asistencia de Beneficiarios */}
          <Link
            to="/admin/attendance/beneficiaries"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300  hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FaUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Asistencia de Beneficiarios
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Controla y registra la asistencia de los beneficiarios.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Asistencia de Invitados */}
          <Link
            to="/admin/attendance/guests"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300  hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FaUserFriends className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Asistencia de Invitados
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestiona el registro y control de asistencia de invitados.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Lista de Asistencia */}
          <Link
            to="/admin/attendance/list"
            className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-orange-300  hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FaListAlt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    Lista de Asistencia
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Visualiza y administra las listas de asistencia generadas.
                  </p>
                </div>
              </div>
              <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>


      </div>
    </main>
  );
}