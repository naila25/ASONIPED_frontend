import { createRouter, createRootRoute, createRoute, Router } from '@tanstack/react-router';
import { lazy } from 'react';
import App from '../App';
import Volunteers from '../Pages/Volunteer/Volunteers';
import Home from '../Home';
import AdminLogin from '../Pages/Admin/AdminLogin';
import VolunteersSubDashboard from '../Pages/Admin/VolunteersSubDashboard';
import DonacionesPage from '../Pages/Donaciones/Donaciones.page';
import FormularioDonacion from '../Components/Donation/FormularioDonacion';
import ConocenosSection from '../Components/Landing/Conocenos';
import EventsNewsList from '../Pages/Events/EventsNewsList';
import EventsNewsAdmin from '../Pages/Admin/EventsNewsAdmin';
import ProtectedRoute from "./ProtectedRoute"; 
import {FormularioMatricula} from '../Pages/Workshops/FormularioMatricula';
import PublicWorkshopsPage from '../Pages/Workshops/PublicWorkshopsPage';
import WorkshopForms from '../Components/Workshop/WorkshopForm';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import AdminDashboardHome from '../Pages/Admin/AdminDashboardHome';
import ExpedientesAdminPage from '../Pages/Admin/ExpedientesAdminPage';
import UserManagement from '../Pages/Admin/UserManagement';
import AdminTicketsPage from '../Pages/Admin/AdminTicketsPage';
import UserDashboard from '../Pages/User/UserDashboard';
import DashboardHome from '../Pages/User/DashboardHome';
import ExpedientesPage from '../Pages/User/ExpedientesPage';
import TalleresPage from '../Pages/User/TalleresPage';
import VoluntariadoPage from '../Pages/User/VoluntariadoPage';
import DonacionesUserPage from '../Pages/User/DonacionesPage';
import MensajesPage from '../Pages/User/MensajesPage';
import CalendarioPage from '../Pages/User/CalendarioPage';
import PerfilPage from '../Pages/User/PerfilPage';

// Lazy-loaded admin Pages with Suspense boundaries
const VolunteerOptionsPage = lazy(() => import('../Pages/Volunteer/VolunteerOptionsPage'));
const VolunteerFormsPage = lazy(() => import('../Pages/Volunteer/VolunteerFormsPage'));
const DonationForms = lazy(() => import('../Pages/Admin/DonationForms'));
const AttendancePage = lazy(() => import('../Pages/Admin/AttendancePage'));


// Root route - SINGLE SOURCE OF TRUTH
const rootRoute = createRootRoute({
  component: App,
});

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

// Public routes
const volunteersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'volunteers',
  component: Volunteers,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/login',
  component: AdminLogin,
});

// Donation routes
const donacionesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'donaciones',
  component: DonacionesPage,
});

const conocenosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'conocenos',
  component: ConocenosSection,
});

const formularioDonacionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'donaciones/formulario',
  component: FormularioDonacion,
});

const publicWorkshopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'talleres-publicos',
  component: PublicWorkshopsPage,
});

const formularioMatriculaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'formulario-matricula',
  component: FormularioMatricula,
});

// Admin routes with lazy loading and authentication check
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedRoute,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: 'admin',
  component: AdminDashboard,
});

const adminHomeRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: '/',
  component: AdminDashboardHome,
});

const expedientesAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'expedientes',
  component: ExpedientesAdminPage,
});

const userDashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: 'user',
  component: UserDashboard,
});

const userHomeRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: '/',
  component: DashboardHome,
});

const expedientesRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'expedientes',
  component: ExpedientesPage,
});

const talleresRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'talleres',
  component: TalleresPage,
});

const voluntariadoRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'voluntariado',
  component: VoluntariadoPage,
});

const donacionesUserRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'donaciones',
  component: DonacionesUserPage,
});

const mensajesRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'mensajes',
  component: MensajesPage,
});

const calendarioRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'calendario',
  component: CalendarioPage,
});

const perfilRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'perfil',
  component: PerfilPage,
});

// Admin sub-routes
const volunteersAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'volunteers',
  component: VolunteersSubDashboard,
});

const donationsAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'donations',
  component: () => (
      <DonationForms />
  ),
});

const attendanceAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'attendance',
  component: () => (
      <AttendancePage />
  ),
});

const userManagementRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'users',
  component: UserManagement,
});

const adminTicketsRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'tickets',
  component: AdminTicketsPage,
});

const volunteerOptionsRoute = createRoute({
  getParentRoute: () => volunteersAdminRoute,
  path: 'options',
  component: () => (
      <VolunteerOptionsPage />
  ),
});

const volunteerFormsRoute = createRoute({
  getParentRoute: () => volunteersAdminRoute,
  path: 'forms',
  component: () => (
      <VolunteerFormsPage />
  ),
});

const eventsNewsAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'events-news',
  component: EventsNewsAdmin,
});

const eventsNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'events-news',
  component: EventsNewsList,
});

const adminWorkshopFormsRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'workshop-forms',
  component: WorkshopForms,
});

// Route tree construction
const routeTree = rootRoute.addChildren([
  indexRoute,
  volunteersRoute,
  adminLoginRoute,
  donacionesRoute,
  conocenosRoute,
  formularioDonacionRoute,
  publicWorkshopsRoute,
  formularioMatriculaRoute,
  protectedRoute.addChildren([
    adminDashboardRoute.addChildren([
      adminHomeRoute,
      expedientesAdminRoute,
      volunteersAdminRoute.addChildren([
        volunteerOptionsRoute,
        volunteerFormsRoute
      ]),
      donationsAdminRoute,
      attendanceAdminRoute,
      eventsNewsAdminRoute,
      adminWorkshopFormsRoute,
      userManagementRoute,
      adminTicketsRoute
    ]),
    userDashboardRoute.addChildren([
      userHomeRoute,
      expedientesRoute,
      talleresRoute,
      voluntariadoRoute,
      donacionesUserRoute,
      mensajesRoute,
      calendarioRoute,
      perfilRoute
    ]),
  ]),
  eventsNewsRoute,
]);


let router: Router<typeof routeTree> | undefined;

if (!router) {
  router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error }) => (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-700">{error.message}</p>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold text-red-600">Page Not Found</h1>
        <p className="text-gray-700">The page you're looking for doesn't exist.</p>
      </div>
    )
  });
}

export { router };

// Type safety declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}