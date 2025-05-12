import CheckIcon from '@mui/icons-material/Check';
import { Box } from '@mui/material';

const CenteredCheckIcon = () => {
  return (
    <Box display={'flex'} justifyContent={'center'} height={'100%'}>
      <CheckIcon sx={{ alignSelf: 'center' }} />
    </Box>
  );
};

export default CenteredCheckIcon;
