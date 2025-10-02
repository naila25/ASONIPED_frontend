import { createRouter, createRootRoute, createRoute, Router } from '@tanstack/react-router';
import { lazy } from 'react';
import App from '../../App';
import Home from '../../modules/Landing/Pages/HomePage';
import AdminLogin from '../../modules/Login/Pages/AdminLogin';
import VolunteersSubDashboard from '../../modules/Volunteers/Pages/VolunteersSubDashboard';
import VolunteerProposalsAdmin from '../../modules/Volunteers/Pages/VolunteerProposalsAdmin';
import DonacionesPage from '../../modules/Donation/Pages/Donaciones.page';
import FormularioDonacion from '../../modules/Donation/Components/FormularioDonacion';
import ConocenosSection from '../../modules/Landing/Components/Conocenos';
import EventsNewsList from '../../modules/EventsNews/Pages/EventsNewsList';
import EventsNewsAdmin from '../../modules/EventsNews/Pages/EventsNewsAdmin';
import ProtectedRoute from "./ProtectedRoute"; 
import PublicWorkshopsPage from '../../modules/Workshops/Components/PublicWorkshopsPage';
import AdminDashboard from '../../modules/Dashboards/Pages/AdminDashboard';
import AdminDashboardHome from '../../modules/Dashboards/Pages/AdminDashboardHome';
import ExpedientesAdminPage from '../../modules/Records/Pages/ExpedientesAdminPage';
import AdminDirectRecordCreation from '../../modules/Records/Pages/AdminDirectRecordCreation';
import AdminRecordEdit from '../../modules/Records/Pages/AdminRecordEdit';
import UserManagement from '../../modules/Dashboards/Pages/UserManagement';
import AdminTicketsPage from '../../modules/Tickets/Pages/AdminTicketsPage';
import UserDashboard from '../../modules/Dashboards/Pages/UserDashboard';
import DashboardHome from '../../modules/Dashboards/Pages/DashboardHome';
import ExpedientesPage from '../../modules/Records/Pages/ExpedientesPage';
import VoluntariadoPage from '../../modules/Volunteers/Pages/VoluntariadoPage';
import MensajesPage from '../../modules/Tickets/Pages/MensajesPage';
import CalendarioPage from '../../modules/Dashboards/Pages/CalendarioPage';
import PerfilPage from '../../modules/Dashboards/Pages/PerfilPage';
import SoportePage from '../../modules/Tickets/Pages/SoportePage';
import GestionLanding from '../../modules/Dashboards/Pages/GestionLanding';
import WorkshopPanel from '../../modules/Workshops/Components/WorkshopPanel';
import AttendancePanel from '../../modules/Attendance/Components/AttendancePanel';


// Lazy-loaded admin Pages with Suspense boundaries
const VolunteerOptionsPage = lazy(() => import('../../modules/Volunteers/Pages/VolunteerOptionsPage'));
const VolunteerFormsPage = lazy(() => import('../../modules/Volunteers/Pages/VolunteerFormsPage'));
const DonationForms = lazy(() => import('../../modules/Donation/Pages/DonationForms'));
//const AttendancePage = lazy(() => import('../../modules/Attendance/Pages/AttendancePage'));
const WorkshopFormsTaller = lazy(() => import('../../modules/Workshops/Pages/WorkshopFormsTaller'));
const WorkshopOptionsPage = lazy(() => import('../../modules/Workshops/Pages/WorkshopOptionsPage'));

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


const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin/login',
  component: AdminLogin,
});

const emailVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'verify-email',
  component: lazy(() => import('../../modules/Login/Pages/EmailVerification')),
});

const VolunteerCard = createRoute({
  getParentRoute: () => rootRoute,
  path: 'VolunteerCard',
  component: lazy(() => import('../../modules/Volunteers/Pages/VolunteerCard')),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'forgot-password',
  component: lazy(() => import('../../modules/Login/Pages/ForgotPassword')),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'reset-password',
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
  }),
  component: lazy(() => import('../../modules/Login/Pages/ResetPassword')),
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

const soporteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'soporte',
  component: SoportePage,
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

const adminDirectRecordCreationRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'expedientes/crear-directo',
  component: AdminDirectRecordCreation,
});

const adminRecordEditRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'expedientes/editar/$recordId',
  component: AdminRecordEdit,
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


const voluntariadoRoute = createRoute({
  getParentRoute: () => userDashboardRoute,
  path: 'voluntariado',
  component: VoluntariadoPage,
});

const WorkshopAdminRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'workshops',
  component: WorkshopPanel,
});

const WorkshopFormsRoute = createRoute({
  getParentRoute: () => WorkshopAdminRoute,
  path: 'forms',
  component: WorkshopFormsTaller,
});

const WorkshopOptionsRoute = createRoute({
  getParentRoute: () => WorkshopAdminRoute,
  path: 'options',
  component: WorkshopOptionsPage,
});
// Removed user dashboard Donaciones route in favor of /user/mensajes

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
      <AttendancePanel />
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

const volunteerProposalsAdminRoute = createRoute({
  getParentRoute: () => volunteersAdminRoute,
  path: 'proposals',
  component: VolunteerProposalsAdmin,
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


const GestionLandingRoute = createRoute({
  getParentRoute: () => adminDashboardRoute,
  path: 'landing',
  component: GestionLanding,
})

// Route tree construction
const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  emailVerificationRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  donacionesRoute,
  conocenosRoute,
  soporteRoute,
  formularioDonacionRoute,
  publicWorkshopsRoute,
  VolunteerCard,
 
  protectedRoute.addChildren([
    adminDashboardRoute.addChildren([
      adminHomeRoute,
      expedientesAdminRoute,
      adminDirectRecordCreationRoute,
      adminRecordEditRoute,
      volunteersAdminRoute.addChildren([
        volunteerOptionsRoute,
        volunteerFormsRoute,
        volunteerProposalsAdminRoute
      ]),
      donationsAdminRoute,
      attendanceAdminRoute,
      eventsNewsAdminRoute,
      WorkshopAdminRoute.addChildren([
       WorkshopOptionsRoute,
       WorkshopFormsRoute
      ]),
      
      userManagementRoute,
      adminTicketsRoute,
      GestionLandingRoute
    ]),
    userDashboardRoute.addChildren([
      userHomeRoute,
      expedientesRoute,
     
      voluntariadoRoute,
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