import { createSlice } from '@reduxjs/toolkit';

const errorSlice = createSlice({
  name: 'error',
  initialState: null, // Inicializácia bez chyby
  reducers: {
    setError: (state, action) => action.payload, // Uloženie chyby
    clearError: () => null // Vymazanie chyby
  }
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;
