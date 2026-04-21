import { Navigate } from 'react-router-dom';
import { AuthPage } from './auth-login';
import AuthRegister from './auth-register';
import ConfirmEmail from './confirm-email';
import RequestPasswordReset from './request-password-reset';
import ResetPassword from './reset-password';

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
  },
  {
    path: 'request-password-reset',
    element: <RequestPasswordReset />
  },
  {
    path: 'reset-password/:token',
    element: <ResetPassword />
  }
];

export default routes;
