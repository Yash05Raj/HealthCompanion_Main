import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Prescriptions from './pages/Prescriptions';
import Reminders from './pages/Reminders';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0A4B94',
    },
    secondary: {
      main: '#FF4B4B',
    },
    background: {
      default: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500
        },
        containedPrimary: {
          backgroundColor: '#0A4B94',
          '&:hover': { backgroundColor: '#083A75' }
        },
        outlined: {
          borderColor: '#D1D5DB',
          color: '#374151',
          '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          height: 24,
          fontWeight: 500
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E9F0'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#E8F0FE',
            '&:hover': { backgroundColor: '#E8F0FE' }
          }
        }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/*"
                element={
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    <Sidebar />
                    <Box component="main" sx={{ flexGrow: 1, p: 4, maxWidth: 1200, mx: 'auto' }}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/prescriptions" element={<Prescriptions />} />
                        <Route path="/reminders" element={<Reminders />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Box>
                  </Box>
                }
              />
            </Routes>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;