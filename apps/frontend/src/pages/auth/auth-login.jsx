import ErrorNotifier from '@app/components/ErrorNotifier';
import * as authService from '@app/pages/auth/authService';
import {
  useLazyGetTeacherMeQuery,
  useLazyGetUserMeQuery,
  useLoginTeacherMutation,
  useLoginUserMutation
} from '@app/redux/api';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Container, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const [loginUser, { isLoading: isUserLoading }] = useLoginUserMutation();
  const [loginTeacher, { isLoading: isTeacherLoading }] = useLoginTeacherMutation();
  const [triggerUserMe] = useLazyGetUserMeQuery();
  const [triggerTeacherMe] = useLazyGetTeacherMeQuery();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();
    let response;
    if (email.endsWith('@uniza.sk')) {
      response = await loginTeacher({ email, password });
    } else if (email.endsWith('@stud.uniza.sk')) {
      response = await loginUser({ email, password });
    } else {
      response = await loginUser({ email, password }); // fallback to user
    }
    if (!response.error) {
      authService.saveTokenToStorage(response.data.token);
      let me;
      if (email.endsWith('@uniza.sk')) {
        me = await triggerTeacherMe().unwrap();
        // Try to get fullName from response or fallback to name + surname
        let teacherFullName =
          me.fullName || (me.name && me.surname ? `${me.name} ${me.surname}` : undefined);
        if (!teacherFullName && response.data && response.data.name && response.data.surname) {
          teacherFullName = `${response.data.name} ${response.data.surname}`;
        }
        if (!teacherFullName && response.data && response.data.fullName) {
          teacherFullName = response.data.fullName;
        }
        if (!teacherFullName) {
          teacherFullName = email;
        }
        authService.saveUserToStorage({ ...me, isTeacher: true, fullName: teacherFullName });
      } else {
        me = await triggerUserMe().unwrap();
        authService.saveUserToStorage(me);
      }
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
            loading={isUserLoading || isTeacherLoading}
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
            <Link component={RouterLink} to="/auth/register" variant="body2">
              Registruj sa
            </Link>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};
