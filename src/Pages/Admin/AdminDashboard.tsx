import { Link, Outlet } from '@tanstack/react-router';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col py-10">
      <main className="flex-1 container mx-auto py-10">
        <h1 className="text-3xl font-bold text-center mb-8">Panel de Administración</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link to="/admin/volunteers" className="bg-orange-500 text-white p-6 rounded shadow hover:bg-orange-600 transition">Admin Volunteers</Link>
          <Link to="/admin/donations" className="bg-orange-500 text-white p-6 rounded shadow hover:bg-orange-600 transition">Admin Donaciones</Link>
          <div className="bg-gray-200 p-6 rounded shadow text-center">Admin Talleres</div>
          <Link to="/admin/events-news" className="bg-orange-500 text-white p-6 rounded shadow hover:bg-orange-600 transition">Admin Eventos</Link>
          <Link to="/admin/attendance" className="bg-orange-500 text-white p-6 rounded shadow hover:bg-orange-600 transition">Admin Asistencia</Link>
          <div className="bg-gray-200 p-6 rounded shadow text-center">Admin ETC</div>
        </div>
        <div className="mt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;