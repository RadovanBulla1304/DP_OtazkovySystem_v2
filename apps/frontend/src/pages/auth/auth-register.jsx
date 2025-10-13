import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Container,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerTeacher, registerUser } from './authService';

const AuthRegister = () => {
  const navigate = useNavigate();
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
        await registerTeacher(data);
        setIsLoading(false);
        navigate('/auth/login');
      } catch (err) {
        setIsLoading(false);
        setError(err?.response?.data?.message || 'Registrácia zlyhala.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Typography align="center" sx={{ mt: '10%' }} variant="h4">
        Registrácia
      </Typography>
      <Card sx={{ mt: '5%', mb: '20%', p: 2 }}>
        {/* Toggle between Student and Teacher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={handleUserTypeChange}
            aria-label="user type"
            color="primary"
          >
            <ToggleButton value="student" aria-label="student">
              Študent
            </ToggleButton>
            <ToggleButton value="teacher" aria-label="teacher">
              Učiteľ
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

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
            helperText={
              userType === 'student'
                ? 'Email musí končiť @stud.uniza.sk'
                : 'Email musí končiť @uniza.sk'
            }
            sx={{ mb: 2 }}
          />

          {/* Student-specific fields */}
          {userType === 'student' && (
            <>
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
            </>
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
          {successMessage && (
            <Typography color="success.main" sx={{ mb: 2, textAlign: 'center' }}>
              {successMessage}
            </Typography>
          )}
          <LoadingButton
            loading={isLoading}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!!successMessage}
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
