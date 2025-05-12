import ErrorNotifier from '@app/components/ErrorNotifier';
import * as authService from '@app/pages/auth/authService';
import { useLazyGetUserMeQuery, useLoginUserMutation } from '@app/redux/api';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Container, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [trigger] = useLazyGetUserMeQuery();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await loginUser({
      email: event.target.email.value.trim(),
      password: event.target.password.value.trim()
    });
    if (!response.error) {
      authService.saveTokenToStorage(response.data.token);
      const me = await trigger().unwrap();
      authService.saveUserToStorage(me);
      navigate('/');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        PMI template
      </Typography>
      <Typography align="center" sx={{ mt: 2 }} variant="h6" color="text.secondary">
        Prihláste sa pomocou svojho emailu
      </Typography>
      <Card sx={{ mt: '10%', mb: '20%', p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Prihlásenie
          </Typography>
          <TextField
            variant="outlined"
            label="Email"
            name="email"
            id="email"
            autoComplete="email"
            fullWidth
            required
          />
          <Typography variant="h4" sx={{ mb: 2 }}></Typography>
          <TextField
            required
            type="password"
            id="password"
            autoComplete="current-password"
            variant="outlined"
            label="Heslo"
            fullWidth
          />
          <ErrorNotifier />
          <LoadingButton
            loading={isLoading}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4 }}
          >
            Prihlásiť sa
          </LoadingButton>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%'
            }}
          >
            <Link component={RouterLink} to="/reset-password" variant="body2">
              Zabudnuté heslo
            </Link>
            <Link component={RouterLink} to="/signup" variant="body2">
              Registruj sa
            </Link>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
