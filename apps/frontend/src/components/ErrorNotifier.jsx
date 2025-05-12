import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';

const ErrorNotifier = () => {
  const error = useSelector((state) => state.error);

  if (!error) return null;

  const errMessage = `${error.status} - ${error.message}`;

  const details = null;
  if (error.reason) {
    console.log('error.reason:', error.reason);
  }

  return (
    <Alert sx={{ mt: 2 }} severity="error">
      {errMessage}
      {details}
    </Alert>
  );
};

export default ErrorNotifier;
