import React from 'react';
import { FaTicketAlt } from "react-icons/fa";
import AdminTicketsDashboard from "../../Components/Admin/AdminTicketsDashboard";

export default function AdminTicketsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaTicketAlt className="text-orange-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Tickets</h1>
        </div>
        <p className="text-gray-600">
          Administra y responde a las tickets de los usuarios
        </p>
      </div>

      <AdminTicketsDashboard />
    </div>
  );
}
