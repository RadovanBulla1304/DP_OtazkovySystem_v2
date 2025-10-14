import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode: mode,
        primary: {
            main: '#1976d2'
        },
        error: {
            main: '#d32f2f'
        },
        ...(mode === 'dark' && {
            background: {
                default: '#121212',
                paper: '#1e1e1e'
            }
        })
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    overflowX: 'hidden'
                },
                html: {
                    overflowX: 'hidden'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                outlined: {
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(183, 28, 28, 0.18)' // Red box shadow
                    }
                },
                outlinedError: {
                    '&:hover': {
                        borderColor: '#b71c1c', // Dark red border on hover

                        backgroundColor: 'rgba(127, 0, 0, 0.04)',
                        boxShadow: '0 2px 8px rgba(127, 0, 0, 0.3)'
                    }
                },
                contained: {
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' // Enhanced shadow for contained buttons
                    }
                }
            }
        }
    }
});

export default getTheme;
