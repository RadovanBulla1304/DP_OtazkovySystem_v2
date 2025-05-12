import * as authService from '@app/pages/auth/authService';
import { Navigate, Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';

const Protected = () => {
  const isAuth = authService.getUserFromStorage();
  if (!isAuth) {
    return <Navigate to="/auth/login" replace />;
  }
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default Protected;
