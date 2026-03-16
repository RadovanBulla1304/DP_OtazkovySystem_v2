//TODO poriadne erro hlasky

import { api } from '@app/redux/api';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Container,
  Grid,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerTeacher, registerUser } from './authService';

const AuthRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userType, setUserType] = useState('student'); // 'student' or 'teacher'

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      setError(null); // Clear errors when switching
      setSuccessMessage(null); // Clear success message when switching
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (userType === 'student') {
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
        const response = await registerUser(data);
        // Invalidate users cache so lists refresh automatically
        dispatch(api.util.invalidateTags(['Users']));
        setIsLoading(false);

        // Check if email confirmation is required
        if (response?.requiresEmailConfirmation) {
          setSuccessMessage(
            response.message ||
              'Registrácia prebehla úspešne. Skontrolujte svoj email a potvrďte registráciu.'
          );
        } else {
          navigate('/auth/login');
        }
      } catch (err) {
        setIsLoading(false);
        setError(err?.response?.data?.message || 'Registrácia zlyhala.');
      }
    } else {
      // Teacher registration
      const data = {
        name: event.target.name.value.trim(),
        surname: event.target.surname.value.trim(),
        email: event.target.email.value.trim(),
        password: event.target.password.value,
        password_confirmation: event.target.password_confirmation.value
      };
      try {
        const response = await registerTeacher(data);
        // Invalidate teachers cache so the list refreshes automatically
        dispatch(api.util.invalidateTags(['Teachers']));
        setIsLoading(false);

        // Check if email confirmation is required
        if (response?.requiresEmailConfirmation) {
          setSuccessMessage(
            response.message ||
              'Registrácia prebehla úspešne. Skontrolujte svoj email a potvrďte registráciu.'
          );
        } else {
          navigate('/auth/login');
        }
      } catch (err) {
        setIsLoading(false);
        setError(err?.response?.data?.message || 'Registrácia zlyhala.');
      }
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
        justifyContent: 'flex-start',
        bgcolor: 'none',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        overflowX: 'hidden'
      }}
    >
      <Typography align="center" sx={{ mt: { xs: 1, sm: 2 } }} variant="h6" color="text.secondary">
        {userType === 'student' ? 'Registrácia študenta' : 'Registrácia učiteľa'}
      </Typography>
      <Card
        sx={{
          mt: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 4 },
          p: { xs: 1.5, sm: 2 },
          minHeight: 'inherit',
          width: '100%',
          maxWidth: '750px',
          overflowX: 'hidden'
        }}
      >
        {/* Toggle between Student and Teacher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 3 } }}>
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={handleUserTypeChange}
            aria-label="user type"
            color="primary"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="student" aria-label="student">
              Študent
            </ToggleButton>
            <ToggleButton value="teacher" aria-label="teacher">
              Učiteľ
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, paddingBlock: { xs: 1, sm: 2 }, paddingInline: { xs: 0.5, sm: 1 } }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Registrácia
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Meno"
                name="name"
                id="name"
                autoComplete="given-name"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Priezvisko"
                name="surname"
                id="surname"
                autoComplete="family-name"
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <TextField
            variant="outlined"
            label="Email"
            name="email"
            id="email"
            autoComplete="email"
            fullWidth
            required
            helperText={
              userType === 'student'
                ? 'Email musí končiť @stud.uniza.sk'
                : 'Email musí končiť @uniza.sk'
            }
            sx={{ mt: 2 }}
          />

          {/* Student-specific fields */}
          {userType === 'student' && (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  label="Skupina"
                  name="groupNumber"
                  id="groupNumber"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  label="Študentské číslo"
                  name="studentNumber"
                  id="studentNumber"
                  type="number"
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          )}

          <TextField
            required
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            variant="outlined"
            label="Heslo"
            fullWidth
            helperText="Heslo musí mať aspoň 6 znakov, jedno veľké písmeno a jedno číslo"
            sx={{ mt: 2 }}
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
            sx={{ mt: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {successMessage && (
            <Typography color="success.main" sx={{ mt: 2, textAlign: 'center' }}>
              {successMessage}
            </Typography>
          )}
          <LoadingButton
            loading={isLoading}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4 }}
            disabled={!!successMessage}
          >
            Registrovať sa
          </LoadingButton>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
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
