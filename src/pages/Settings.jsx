import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Divider, Switch, FormControlLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { logout, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdSuccess, setChangePwdSuccess] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePwd, setDeletePwd] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account preferences and application settings
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <Card elevation={0} sx={{ border: '1px solid #E5E9F0', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Appearance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Customize how Health Companion looks and feels
            </Typography>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
              label="Enable dark mode (local only)"
            />
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #E5E9F0', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Control how you receive reminders and alerts
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />}
                label="Email notifications"
              />
              <FormControlLabel
                control={<Switch checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />}
                label="Push notifications"
              />
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #E5E9F0', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Basic account actions
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => setChangePwdOpen(true)}>Change Password</Button>
              <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
              <Button variant="outlined" onClick={async () => { await logout(); navigate('/login'); }}>Logout</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
        {/* Change Password Dialog */}
        <Dialog open={changePwdOpen} onClose={() => setChangePwdOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            {changePwdError && <Alert severity="error" sx={{ mb: 2 }}>{changePwdError}</Alert>}
            {changePwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{changePwdSuccess}</Alert>}
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePwdOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={changePwdLoading}
              onClick={async () => {
                try {
                  setChangePwdLoading(true);
                  setChangePwdError('');
                  setChangePwdSuccess('');
                  await changePassword(currentPwd, newPwd);
                  setChangePwdSuccess('Password updated successfully');
                  setCurrentPwd('');
                  setNewPwd('');
                  setTimeout(() => setChangePwdOpen(false), 800);
                } catch (e) {
                  setChangePwdError(e?.message || 'Failed to change password');
                } finally {
                  setChangePwdLoading(false);
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will permanently delete your account and associated data.
            </Alert>
            <TextField
              fullWidth
              type="password"
              label="Confirm Current Password"
              value={deletePwd}
              onChange={(e) => setDeletePwd(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              disabled={deleteLoading}
              onClick={async () => {
                try {
                  setDeleteLoading(true);
                  setDeleteError('');
                  await deleteAccount(deletePwd);
                  setDeleteOpen(false);
                  navigate('/login');
                } catch (e) {
                  setDeleteError(e?.message || 'Failed to delete account');
                } finally {
                  setDeleteLoading(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}

export default Settings;