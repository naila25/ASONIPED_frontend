import React from 'react';
import { useAuth } from "../../Login/Hooks/useAuth";
import UserTicketsList from "../../Tickets/Components/UserTicketsList";

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
      <UserTicketsList userId={user.id} />
    </div>
  );
}

