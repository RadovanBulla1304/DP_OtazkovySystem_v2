import { Navigate } from 'react-router-dom';
import { AuthPage } from './auth-login';

const routes = [
    {
        path: '',
        index: true,
        element: <Navigate to="login" />
    },
    {
        path: 'login',
        element: <AuthPage />
    }
];

export default routes;
