import { createBrowserRouter } from 'react-router-dom';
import MinimalLayout from './components/layout/MinimalLayout';
import Protected from './components/layout/Protected';
import { RouteNotFound } from './components/RouteNotFound.component';
import Dashboard from './pages/admin/dashboard/Dashboard';
import authRoutes from './pages/auth';

import adminRoutes from '@app/pages/admin';
import Moduls from './pages/moduls/ModulsList';
import MyQuestions from './pages/my-questions/MyQuestions';
import SubjectDetail from './pages/subjects/SubjectDetail';
import Subjects from './pages/subjects/Subjects';
import Tests from './pages/tests/Tests';
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
        path: '/subjects/:subjectId',
        element: <SubjectDetail />
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
