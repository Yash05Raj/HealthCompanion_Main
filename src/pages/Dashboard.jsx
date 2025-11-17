import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Description as PrescriptionIcon,
  Today as TodayIcon,
  Notifications as ReminderIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  MedicationOutlined as MedicationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import MedicineChatbot from '../components/MedicineChatbot';

const SummaryCard = ({ icon, count, subtitle, color = 'primary' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E9F0',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 1,
          backgroundColor: color === 'primary' ? '#E8F0FE' : 
                         color === 'info' ? '#E0F2F1' :
                         color === 'warning' ? '#FFF3E0' : '#FFEBEE',
          color: color === 'primary' ? '#0A4B94' :
                 color === 'info' ? '#00897B' :
                 color === 'warning' ? '#F57C00' : '#D32F2F',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>
          {count}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const PrescriptionCard = ({ prescription }) => (
  <Card
    elevation={0}
    sx={{
      mb: 2,
      border: '1px solid #E5E9F0',
      borderRadius: 2,
      backgroundColor: '#FFFFFF',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              {prescription.medicationName}
            </Typography>
            <Chip
              label="Active"
              size="small"
              sx={{
                backgroundColor: '#E8F0FE',
                color: '#0A4B94',
                fontWeight: 500,
                height: 24,
              }}
            />
            <IconButton size="small" sx={{ ml: 'auto' }}>
              <MoreVertIcon sx={{ color: '#6B7280' }} />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
            {prescription.dosage} - {prescription.frequency}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
              Added: {prescription.dateAdded}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
              Prescribed by: {prescription.prescribedBy}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              sx={{
                color: '#0A4B94',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F0F7FF' },
              }}
            >
              View Details
            </Button>
            <Button
              variant="text"
              sx={{
                color: '#0A4B94',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F0F7FF' },
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ReminderItem = ({ reminder }) => (
  <Box
    sx={{
      p: 3,
      mb: 2,
      border: '1px solid #E5E9F0',
      borderRadius: 2,
      backgroundColor: '#FFFFFF',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          backgroundColor: '#E8F0FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MedicationIcon sx={{ color: '#0A4B94' }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#111827' }}>
            {reminder.medicationName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {reminder.dosage}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
          Scheduled: {reminder.scheduledTime}
        </Typography>
      </Box>
      <Chip
        label={reminder.status}
        size="small"
        sx={{
          backgroundColor: reminder.status === 'Pending' ? '#E8F0FE' :
                          reminder.status === 'Overdue' ? '#FFEBEE' :
                          reminder.status === 'Taken' ? '#E8F5E9' :
                          reminder.status === 'Missed' ? '#FFEBEE' : '#E8F0FE',
          color: reminder.status === 'Pending' ? '#0A4B94' :
                 reminder.status === 'Overdue' ? '#D32F2F' :
                 reminder.status === 'Taken' ? '#2E7D32' :
                 reminder.status === 'Missed' ? '#D32F2F' : '#0A4B94',
          fontWeight: 500,
          height: 24,
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#0A4B94',
          color: '#FFFFFF',
          textTransform: 'none',
          '&:hover': { backgroundColor: '#083A75' },
        }}
      >
        Mark Taken
      </Button>
      <Button
        variant="outlined"
        sx={{
          borderColor: '#D1D5DB',
          color: '#374151',
          textTransform: 'none',
          '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
        }}
      >
        Snooze
      </Button>
      <Button
        variant="outlined"
        sx={{
          borderColor: '#D1D5DB',
          color: '#374151',
          textTransform: 'none',
          '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
        }}
      >
        Skip
      </Button>
    </Box>
  </Box>
);

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [summaryData, setSummaryData] = useState({
    activePrescriptions: 0,
    todaysMedications: 0,
    upcomingReminders: 0,
    expiringSoon: 0,
  });
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);

  useEffect(() => {
    // Fetch data from Firestore
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        // Fetch recent prescriptions
        const prescriptionsRef = collection(db, 'prescriptions');
        const q = query(
          prescriptionsRef,
          where('userId', '==', currentUser.uid),
          orderBy('dateAdded', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const prescriptions = [];
        querySnapshot.forEach((doc) => {
          prescriptions.push({ id: doc.id, ...doc.data() });
        });
        setRecentPrescriptions(prescriptions);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
            Healthcare Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#6B7280' }}>
            Manage your medical records and medications securely
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PrescriptionIcon />}
            sx={{
              backgroundColor: '#0A4B94',
              color: '#FFFFFF',
              textTransform: 'none',
              px: 2,
              py: 1,
              '&:hover': { backgroundColor: '#083A75' },
            }}
            onClick={() => navigate('/prescriptions')}
          >
            Add Prescription
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReminderIcon />}
            sx={{
              borderColor: '#D1D5DB',
              color: '#374151',
              textTransform: 'none',
              px: 2,
              py: 1,
              '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
            }}
            onClick={() => navigate('/reminders')}
          >
            Add Reminder
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={3}>
          <SummaryCard
            icon={<PrescriptionIcon />}
            count={summaryData.activePrescriptions}
            subtitle="Currently active"
            color="primary"
          />
        </Grid>
        <Grid item xs={3}>
          <SummaryCard
            icon={<TodayIcon />}
            count={summaryData.todaysMedications}
            subtitle="2 remaining"
            color="info"
          />
        </Grid>
        <Grid item xs={3}>
          <SummaryCard
            icon={<ReminderIcon />}
            count={summaryData.upcomingReminders}
            subtitle="Due today"
            color="warning"
          />
        </Grid>
        <Grid item xs={3}>
          <SummaryCard
            icon={<WarningIcon />}
            count={summaryData.expiringSoon}
            subtitle="Within 7 days"
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={7}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Prescriptions
              </Typography>
              <Button color="primary">View All</Button>
            </Box>
            {recentPrescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} />
            ))}
          </Box>
        </Grid>
        <Grid item xs={5}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Today's Reminders
              </Typography>
              <Button color="primary">View All</Button>
            </Box>
            {todayReminders.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MedicineChatbot />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;