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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src="/logo.svg"
          alt="Health Companion"
          sx={{ width: 32, height: 32 }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0A4B94' }}>
            Health Companion
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            Healthcare Manager
          </Typography>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <Typography
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: '#6B7280' }}
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
                  '&.Mui-selected': {
                    backgroundColor: '#E8F0FE',
                    '&:hover': {
                      backgroundColor: '#E8F0FE',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#0A4B94' : '#6B7280' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: location.pathname === item.path ? '#0A4B94' : '#374151',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: '#6B7280', mt: 2 }}
        >
          Account
        </Typography>
        <List>
          {accountMenuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ color: '#6B7280' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ '& .MuiListItemText-primary': { color: '#374151' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: '#6B7280' }}>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary="Secure & HIPAA Compliant"
              sx={{ '& .MuiListItemText-primary': { color: '#374151' } }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
}

export default Sidebar;