import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

const ProfileSetup = ({ open, onClose }) => {
    const { updateUserProfile } = useAuth();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await updateUserProfile({ displayName: name.trim() });
            onClose();
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: '#E8F0FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}
                >
                    <PersonIcon sx={{ fontSize: 32, color: '#0A4B94' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Welcome to HealthCompanion!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Let's personalize your experience
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        What should we call you?
                    </Typography>
                    <TextField
                        fullWidth
                        label="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                        placeholder="e.g., John Doe"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        color: 'text.secondary',
                    }}
                    disabled={loading}
                >
                    Skip for now
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !name.trim()}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 4,
                        backgroundColor: '#0A4B94',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#083A75',
                            boxShadow: '0 4px 12px rgba(10, 75, 148, 0.2)',
                        },
                    }}
                >
                    {loading ? 'Saving...' : 'Continue'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileSetup;
