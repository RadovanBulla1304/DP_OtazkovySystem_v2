import { Navigate } from 'react-router-dom';
import { AuthPage } from './auth-login';

import AuthRegister from './auth-register';

const routes = [
  {
    path: '',
    index: true,
    element: <Navigate to="login" />
  },
  {
    path: 'login',
    element: <AuthPage />
  },
  {
    path: 'register',
    element: <AuthRegister />
  }
];

export default routes;
