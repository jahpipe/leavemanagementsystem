import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from './dashboardAdmin/AdminDashboard.jsx';
import LoginForm from './pages/Login.jsx';
import EmpDashboard from './dashboardEmployee/EmpDashboard.jsx';
import NotfoundPages from './pages/NotfoundPages.jsx';
import { AuthProvider } from './dashboardAdmin/AuthProvider.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/LoginForm",
    element: <LoginForm/>
  },
  {
    path: "/AdminDashboard",
    element: <AdminDashboard/>
  },
  {
    path: "/EmpDashboard",
    element: <EmpDashboard/>
  },
  {
    path: "*",
    element: <NotfoundPages/>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)