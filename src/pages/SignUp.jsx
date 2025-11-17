import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
  const navigate = useNavigate();
  const { signup, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setResetError('Enter the email associated with your account to reset your password.');
      setResetSuccess('');
      return;
    }

    try {
      setResetLoading(true);
      setResetError('');
      await resetPassword(email);
      setResetSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setResetSuccess('');
      setResetError(err?.message || 'Unable to send reset email. Please ensure the email is registered.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          border: '1px solid #E5E9F0',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign up for your Health Companion account
          </Typography>
        </Box>

        {(error || resetError || resetSuccess) && (
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
            {resetError && (
              <Alert severity="warning">
                {resetError}
              </Alert>
            )}
            {resetSuccess && (
              <Alert severity="success">
                {resetSuccess}
              </Alert>
            )}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handlePasswordReset}
              disabled={resetLoading}
              sx={{ textTransform: 'none', alignSelf: { xs: 'flex-start', sm: 'center' } }}
            >
              {resetLoading ? 'Sending...' : 'Forgot password?'}
            </Button>
          </Stack>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign Up
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default SignUp;