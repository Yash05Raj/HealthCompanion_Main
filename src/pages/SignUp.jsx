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
  Divider,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google sign-up error:', error);
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up popup was closed. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create an account. Please try again.';
      
      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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

        {/* Google Sign Up - Primary Method */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          startIcon={<GoogleIcon />}
          sx={{
            mb: 3,
            backgroundColor: '#4285F4',
            '&:hover': {
              backgroundColor: '#357AE8',
            },
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          {googleLoading ? 'Signing up...' : 'Continue with Google'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Email/Password Sign Up - Secondary Method */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          Sign up with Email
        </Typography>
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
            variant="outlined"
            fullWidth
            disabled={loading || googleLoading}
            startIcon={<EmailIcon />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Creating account...' : 'Sign Up with Email'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default SignUp;