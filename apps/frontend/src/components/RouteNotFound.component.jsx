import { Button, Paper, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export const RouteNotFound = () => {
  const navigate = useNavigate();
  return (
    <Paper elevation={3} sx={{ p: 2, my: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Požadovaná stránka neexistuje!
      </Typography>
      <Stack spacing={2} direction={'row'}>
        <Button component={Link} to={'/'} variant="outlined">
          Návrat domov
        </Button>
        <Button
          onClick={() => {
            navigate(-1);
          }}
          variant="outlined"
        >
          Spať
        </Button>
      </Stack>
    </Paper>
  );
};
