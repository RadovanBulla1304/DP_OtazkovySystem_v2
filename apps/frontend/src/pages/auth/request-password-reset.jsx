import { useRequestPasswordResetMutation } from '@app/redux/api';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Container, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await requestPasswordReset({ email: email.trim() }).unwrap();
      setSuccess(true);
    } catch (err) {
      setError(err?.data?.message || 'Chyba pri odosielaní požiadavky.');
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
        Zadajte svoj email pre obnovenie hesla
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
            Zabudnuté heslo
          </Typography>
          <TextField
            variant="outlined"
            label="Email"
            name="email"
            id="email"
            autoComplete="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          {success && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              Ak email existuje, bol odoslaný odkaz na obnovenie hesla.
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
            Odoslať
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

export default RequestPasswordReset;
