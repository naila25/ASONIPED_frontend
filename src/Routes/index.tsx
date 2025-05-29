// src/router.ts
import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
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

// Lazy-loaded admin Pages with Suspense boundaries
const AdminDashboard = lazy(() => import('../Pages/Admin/AdminDashboard'));
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
  path: 'admin-login',
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

// Admin routes with lazy loading and authentication check
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  component: () => (
    <Suspense fallback={<div style={{color:'red',fontSize:'2rem',textAlign:'center'}}>Loading AdminDashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  ),
});

// Admin sub-routes
const volunteersAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'volunteers',
  component: VolunteersSubDashboard,
});

const donationsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'donations',
  component: () => (
    <Suspense fallback={<div style={{color:'red',fontSize:'2rem',textAlign:'center'}}>Loading DonationForms...</div>}>
      <DonationForms />
    </Suspense>
  ),
});

const attendanceAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'attendance',
  component: () => (
    <Suspense fallback={<div style={{color:'red',fontSize:'2rem',textAlign:'center'}}>Loading AttendancePage...</div>}>
      <AttendancePage />
    </Suspense>
  ),
});

const volunteerOptionsRoute = createRoute({
  getParentRoute: () => volunteersAdminRoute,
  path: 'options',
  component: () => (
    <Suspense fallback={<div style={{color:'red',fontSize:'2rem',textAlign:'center'}}>Loading VolunteerOptionsPage...</div>}>
      <VolunteerOptionsPage />
    </Suspense>
  ),
});

const volunteerFormsRoute = createRoute({
  getParentRoute: () => volunteersAdminRoute,
  path: 'forms',
  component: () => (
    <Suspense fallback={<div style={{color:'red',fontSize:'2rem',textAlign:'center'}}>Loading VolunteerFormsPage...</div>}>
      <VolunteerFormsPage />
    </Suspense>
  ),
});

const eventsNewsAdminRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'events-news',
  component: EventsNewsAdmin,
});

const eventsNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'events-news',
  component: EventsNewsList,
});

// Route tree construction
const routeTree = rootRoute.addChildren([
  indexRoute,
  volunteersRoute,
  adminLoginRoute,
  donacionesRoute,
  conocenosRoute,
  formularioDonacionRoute,
  adminRoute.addChildren([
    volunteersAdminRoute.addChildren([
      volunteerOptionsRoute,
      volunteerFormsRoute
    ]),
    donationsAdminRoute,
    attendanceAdminRoute,
    eventsNewsAdminRoute,
  ]),
  eventsNewsRoute,
]);

// Singleton router instance
let router: any;

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