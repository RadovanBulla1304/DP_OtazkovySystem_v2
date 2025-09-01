import { LoadingButton } from '@mui/lab';
import { Box, Card, Container, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerUser } from './authService';

const AuthRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const data = {
      name: event.target.name.value.trim(),
      surname: event.target.surname.value.trim(),
      email: event.target.email.value.trim(),
      groupNumber: event.target.groupNumber.value.trim(),
      studentNumber: event.target.studentNumber.value.trim(),
      password: event.target.password.value,
      password_confirmation: event.target.password_confirmation.value
    };
    try {
      await registerUser(data);
      setIsLoading(false);
      navigate('/auth/login');
    } catch (err) {
      setIsLoading(false);
      setError(err?.response?.data?.message || 'Registrácia zlyhala.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        Registrácia
      </Typography>
      <Card sx={{ mt: '10%', mb: '20%', p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            label="Meno"
            name="name"
            id="name"
            autoComplete="given-name"
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Priezvisko"
            name="surname"
            id="surname"
            autoComplete="family-name"
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Email"
            name="email"
            id="email"
            autoComplete="email"
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Skupina"
            name="groupNumber"
            id="groupNumber"
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Študentské číslo"
            name="studentNumber"
            id="studentNumber"
            type="number"
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            required
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            variant="outlined"
            label="Heslo"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            required
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            autoComplete="new-password"
            variant="outlined"
            label="Potvrďte heslo"
            fullWidth
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <LoadingButton
            loading={isLoading}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Registrovať sa
          </LoadingButton>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/auth/login" variant="body2">
              Máte už účet? Prihláste sa
            </Link>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default AuthRegister;
