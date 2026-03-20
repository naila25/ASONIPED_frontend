import AdminTicketsDashboard from "../Components/AdminTicketsDashboard";
import { FaTicketAlt } from "react-icons/fa";

export default function AdminTicketsPage() {
  return (
    <div className=" bg-white rounded-lg shadow-sm p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        {/* Título de la página con ícono 
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <FaTicketAlt className="text-orange-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Tickets</h1>
        </div>
        */}
        <AdminTicketsDashboard />
      </div>
    </div>
  );
}