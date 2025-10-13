import { Navigate } from 'react-router-dom';
import { AuthPage } from './auth-login';

import AuthRegister from './auth-register';
import ConfirmEmail from './confirm-email';

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
  },
  {
    path: 'confirm-email/:token',
    element: <ConfirmEmail />
  }
];

export default routes;
