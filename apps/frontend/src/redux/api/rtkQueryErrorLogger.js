import { isRejectedWithValue } from '@reduxjs/toolkit';
import { clearError, setError } from './errorSlice.js';

const handleErrors = (error) => {
  const status = error.status;
  let errorMessage = 'An unknown error occurred. Please try again later.';

  switch (status) {
    case 400:
      errorMessage = 'Bad Request. Please check your input.';
      break;
    case 401:
      errorMessage = 'Unauthorized. Please log in again.';
      //authService.; // Odhlásenie používateľa pri chybe 401
      break;
    case 403:
      errorMessage = 'Forbidden. You do not have access to this resource.';
      break;
    case 404:
      errorMessage = 'Resource not found. Please check the URL.';
      break;
    case 412:
      errorMessage = 'Precondition failed. Please refresh and try again.';
      break;
    case 500:
      errorMessage = 'Internal server error. Please try again later.';
      break;
    case 503:
      errorMessage = 'Service unavailable. Please try again later.';
      break;
    default:
      if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (status >= 400) {
        errorMessage = 'Client error. Please check your request.';
      }
      break;
  }
  if (error?.data.message) {
    errorMessage = error?.data.message;
  }

  console.error(`Error ${status}: ${errorMessage}`);
  return { status, message: errorMessage, reason: error?.data?.reason };
};

export const rtkQueryErrorLogger = (store) => (next) => (action) => {
  if (action.type === setError.type || action.type === clearError.type) {
    return next(action);
  }
  if (isRejectedWithValue(action)) {
    const error = action.payload;

    console.error('RTK Query Error:', error);

    //store.dispatch(setError('asdas'));
    store.dispatch(setError(handleErrors(error)));
  } else {
    store.dispatch(clearError());
  }

  return next(action);
};
