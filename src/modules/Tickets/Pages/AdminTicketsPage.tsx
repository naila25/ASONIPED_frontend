import AdminTicketsDashboard from "../Components/AdminTicketsDashboard";

export default function AdminTicketsPage() {
  return (
    <div className="p-6">
     
      <div className="max-w-8xl mx-auto bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Gestión de Tickets
            </h1>
          </div>
        </div>

        <AdminTicketsDashboard />
      </div>
    </div>
  );
}