import React from 'react';
import { DollarSign } from "lucide-react";
import { useAuth } from "../../Utils/useAuth";
import UserTicketsList from "../../Components/Donation/UserTicketsList";

export default function DonacionesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Debe iniciar sesión para ver sus tickets de donación.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Donaciones</h1>
        <p className="text-gray-600">
          Gestiona tus solicitudes de donación y consulta tu historial de contribuciones
        </p>
      </div>
      
      <UserTicketsList userId={user.id} />
    </div>
  );
}

