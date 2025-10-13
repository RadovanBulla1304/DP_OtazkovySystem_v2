import { Box, Card, CircularProgress, Container, Link, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`/api/public/confirm-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email bol úspešne potvrdený. Môžete sa prihlásiť.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'Chyba pri potvrdení emailu. Token môže byť neplatný alebo expirovaný.'
        );
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setStatus('error');
      setMessage('Chýbajúci token');
    }
  }, [token]);

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        Potvrdenie emailu
      </Typography>
      <Card sx={{ mt: '5%', mb: '20%', p: 4 }}>
        {status === 'loading' && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography>Overujem email...</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography
              variant="h5"
              color="success.main"
              sx={{ textAlign: 'center', fontWeight: 600 }}
            >
              ✓ Úspech!
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>{message}</Typography>
            <Link component={RouterLink} to="/auth/login" variant="body1" sx={{ mt: 2 }}>
              Prejsť na prihlásenie
            </Link>
          </Box>
        )}

        {status === 'error' && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h5" color="error" sx={{ textAlign: 'center', fontWeight: 600 }}>
              ✗ Chyba
            </Typography>
            <Typography sx={{ textAlign: 'center' }} color="error">
              {message}
            </Typography>
            <Link component={RouterLink} to="/auth/register" variant="body1" sx={{ mt: 2 }}>
              Registrovať sa znova
            </Link>
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default ConfirmEmail;
