import { useResetPasswordMutation } from '@app/redux/api';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Container, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await resetPassword({
        token,
        password,
        password_confirmation: passwordConfirmation
      }).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(err?.data?.message || 'Chyba pri zmene hesla.');
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        pt: { xs: 3, sm: 4 },
        pb: { xs: 4, sm: 6 },
        bgcolor: 'none'
      }}
    >
      <Typography align="center" sx={{ mt: { xs: 1, sm: 2 } }} variant="h6" color="text.secondary">
        Zadajte nové heslo
      </Typography>
      <Card
        sx={{
          mt: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: 600,
          p: { xs: 1.5, sm: 2 }
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 1,
            width: '100%',
            paddingBlock: { xs: 1, sm: 2 },
            paddingInline: { xs: 0.5, sm: 1 }
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            Zmena hesla
          </Typography>
          <TextField
            variant="outlined"
            label="Nové heslo"
            name="password"
            id="password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label="Zopakujte nové heslo"
            name="password_confirmation"
            id="password_confirmation"
            type="password"
            fullWidth
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            sx={{ mb: 2 }}
          />
          {success && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              Heslo bolo úspešne zmenené.
            </Typography>
          )}
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
            Zmeniť heslo
          </LoadingButton>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Link component={RouterLink} to="/auth/login" variant="body2">
              Naspäť na prihlásenie
            </Link>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default ResetPassword;
