import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as PrescriptionsIcon,
  Medication as MedicationsIcon,
  Notifications as RemindersIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyIcon,
  Logout as LogoutIcon,
  LocalHospital as MedicalIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Prescriptions', icon: <PrescriptionsIcon />, path: '/prescriptions' },
    { text: 'Reminders', icon: <RemindersIcon />, path: '/reminders' },
  ];

  const accountMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Privacy', icon: <PrivacyIcon />, path: '/privacy' },
    { text: 'Logout', icon: <LogoutIcon />, action: 'logout' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E9F0',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 3,
            backgroundColor: '#0A4B94',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(10, 75, 148, 0.2)',
          }}
        >
          <MedicalIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0A4B94', lineHeight: 1.2 }}>
            Health Companion
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
            Healthcare Manager
          </Typography>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <Typography
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: '#6B7280', fontWeight: 600, fontSize: '0.7rem' }}
        >
          Healthcare
        </Typography>
        <List>
          {mainMenuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  setSelectedIndex(index);
                  navigate(item.path);
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: '#E8F0FE',
                    '&:hover': {
                      backgroundColor: '#E8F0FE',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#0A4B94' : '#6B7280' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: location.pathname === item.path ? '#0A4B94' : '#374151',
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: '#6B7280', mt: 2, fontWeight: 600, fontSize: '0.7rem' }}
        >
          Account
        </Typography>
        <List>
          {accountMenuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={item.path ? location.pathname === item.path : false}
                onClick={async () => {
                  if (item.action === 'logout') {
                    await logout();
                    navigate('/login');
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#6B7280' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ '& .MuiListItemText-primary': { color: '#374151', fontWeight: 500, fontSize: '0.95rem' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        <ListItem disablePadding>
          <ListItemButton
            sx={{
              mx: 1,
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#059669' }}>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="Secure & HIPAA Compliant"
              sx={{ '& .MuiListItemText-primary': { color: '#059669', fontWeight: 600, fontSize: '0.85rem' } }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
}

export default Sidebar;