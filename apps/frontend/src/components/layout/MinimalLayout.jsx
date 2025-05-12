import * as authService from '@app/pages/auth/authService';
import { Box } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';

const MinimalLayout = () => {
  const isAuth = authService.getUserFromStorage();

  if (isAuth) {
    return <Navigate to="/" replace />;
  }
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#e9f0f3'
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MinimalLayout;
