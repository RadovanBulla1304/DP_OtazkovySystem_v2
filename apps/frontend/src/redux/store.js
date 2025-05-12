import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import errorReducer from './api/errorSlice.js';
import { rtkQueryErrorLogger } from './api/rtkQueryErrorLogger';
//import { useDispatch, useSelector } from 'react-redux';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  error: errorReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(rtkQueryErrorLogger)
});

export default store;
