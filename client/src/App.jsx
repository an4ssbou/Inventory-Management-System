import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import DashboardLayout from './Layouts/DashboardLayout';
import Login from './pages/Login';
import User from './components/Users';
import Material from './components/Material';
import Request from './components/Request';
import Loan from './components/Loan';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import MaterialListing from './components/MaterialListing';
import UserRequests from './components/UserRequests';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route element={<ProtectedRoute />}>
        <Route index element={<HomePage />} />
        <Route path="/material" element={<MaterialListing />} />
        <Route path="/requests" element={<UserRequests />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="/dashboard/users" element={<User />} />
          <Route path="/dashboard/material" element={<Material />} />
          <Route path="/dashboard/requests" element={<Request />} />
          <Route path="/dashboard/loans" element={<Loan />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

const App = () => (
  <div className="dark:bg-gray-900">
    <RouterProvider router={router} />
  </div>
);

export default App;
