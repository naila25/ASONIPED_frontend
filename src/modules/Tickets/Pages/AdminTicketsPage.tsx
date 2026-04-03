import AdminTicketsDashboard from "../Components/AdminTicketsDashboard";
import AttendancePageHeader from "../../Attendance/Components/AttendancePageHeader";
import { Ticket } from "lucide-react";

export default function AdminTicketsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="teal"
        icon={<Ticket className="h-6 w-6" />}
        title="Gestión de tickets"
        description="Consulta, filtra y administra los tickets de soporte y donaciones."
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <AdminTicketsDashboard />
      </div>
    </div>
  );
}
