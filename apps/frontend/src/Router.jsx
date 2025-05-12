import { createBrowserRouter } from 'react-router-dom';
import MinimalLayout from './components/layout/MinimalLayout';
import Protected from './components/layout/Protected';
import { RouteNotFound } from './components/RouteNotFound.component';
import authRoutes from './pages/auth';
import Dashboard from './pages/dashboard/Dashboard';

import adminRoutes from '@app/pages/admin';
import Tests from './pages/tests/Tests';
import Moduls from './pages/moduls/Moduls';
import MyQuestions from './pages/my-questions/MyQuestions';
import Subjects from './pages/subjects/Subjects';

export const router = createBrowserRouter([
  {
    element: <MinimalLayout />,
    children: [
      {
        path: 'auth',
        children: authRoutes
      }
    ]
  },
  {
    element: <Protected />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/moduls',
        element: <Moduls />
      },
      {
        path: '/tests',
        element: <Tests />
      },
      {
        path: '/my-questions',
        element: <MyQuestions />
      },
      {
        path: '/subjects',
        element: <Subjects />
      },
      {
        path: 'admin',
        children: adminRoutes
      },
      {
        path: '*',
        element: <RouteNotFound />
      }
    ]
  },
  {
    path: '*',
    element: <RouteNotFound />
  }
]);
