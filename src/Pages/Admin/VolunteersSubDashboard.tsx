import { Link, Outlet } from '@tanstack/react-router';

const VolunteersSubDashboard = () => (
  <div className="flex flex-col pb-10">
    <main className="flex-1 container mx-auto py-10 flex flex-col items-center justify-center">
      <h2 className="text-2xl  mb-8"> Voluntarios</h2>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl py-10">
        <Link to="/admin/volunteers/options" className="flex-1 bg-orange-500 text-white p-8 rounded shadow text-center text-base  hover:bg-orange-600 transition">Opciones de Voluntarios</Link>
        <Link to="/admin/volunteers/forms" className="flex-1 bg-orange-500 text-white p-8 rounded shadow text-center text-base hover:bg-orange-600 transition">Formularios de Voluntarios</Link>
      </div>
      <Outlet />
    </main>
  </div>
);

export default VolunteersSubDashboard; 