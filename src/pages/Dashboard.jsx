import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Description as PrescriptionIcon,
  Notifications as ReminderIcon,
  MoreVert as MoreVertIcon,
  MedicationOutlined as MedicationIcon,
  WavingHand as WavingHandIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import MedicineChatbot from '../components/MedicineChatbot';

const PrescriptionCard = ({ prescription }) => (
  <Card
    elevation={0}
    sx={{
      mb: 2,
      border: '1px solid #E5E9F0',
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)',
        borderColor: '#D1D5DB',
      },
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
                fontWeight: 600,
                height: 26,
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
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Added: {prescription.dateAdded}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Prescribed by: {prescription.prescribedBy}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              sx={{
                color: '#0A4B94',
                textTransform: 'none',
                fontWeight: 600,
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
                fontWeight: 600,
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
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
        borderColor: '#D1D5DB',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          backgroundColor: '#E8F0FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MedicationIcon sx={{ color: '#0A4B94', fontSize: 24 }} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
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
          fontWeight: 600,
          height: 26,
        }}
      />
    </Box>
    <Button
      variant="contained"
      fullWidth
      sx={{
        backgroundColor: '#0A4B94',
        color: '#FFFFFF',
        textTransform: 'none',
        fontWeight: 600,
        py: 1.2,
        borderRadius: 2,
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: '#083A75',
          boxShadow: '0 4px 12px rgba(10, 75, 148, 0.3)',
        },
      }}
    >
      Mark as Taken
    </Button>
  </Box>
);

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there';

  return (
    <Box sx={{ p: 4 }}>
      {/* Personalized Welcome Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <WavingHandIcon sx={{ fontSize: 36, color: '#F59E0B' }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827' }}>
            {getGreeting()}, {displayName}!
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, ml: 6 }}>
          Here's your health overview for today
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<PrescriptionIcon />}
          sx={{
            backgroundColor: '#0A4B94',
            color: '#FFFFFF',
            textTransform: 'none',
            px: 3,
            py: 1.3,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(10, 75, 148, 0.2)',
            '&:hover': {
              backgroundColor: '#083A75',
              boxShadow: '0 6px 16px rgba(10, 75, 148, 0.3)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
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
            px: 3,
            py: 1.3,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1rem',
            '&:hover': {
              borderColor: '#9CA3AF',
              backgroundColor: '#F9FAFB',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
          onClick={() => navigate('/reminders')}
        >
          Add Reminder
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Prescriptions
              </Typography>
              <Button
                color="primary"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={() => navigate('/prescriptions')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <>
                <Skeleton variant="rounded" height={160} sx={{ mb: 2, borderRadius: 3 }} />
                <Skeleton variant="rounded" height={160} sx={{ mb: 2, borderRadius: 3 }} />
              </>
            ) : recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))
            ) : (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '2px dashed #E5E9F0',
                  borderRadius: 3,
                  backgroundColor: '#F9FAFB',
                }}
              >
                <PrescriptionIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  No prescriptions yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first prescription to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PrescriptionIcon />}
                  onClick={() => navigate('/prescriptions')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Add Prescription
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Today's Reminders
              </Typography>
              <Button
                color="primary"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={() => navigate('/reminders')}
              >
                View All
              </Button>
            </Box>
            {todayReminders.length > 0 ? (
              todayReminders.map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))
            ) : (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '2px dashed #E5E9F0',
                  borderRadius: 3,
                  backgroundColor: '#F9FAFB',
                }}
              >
                <ReminderIcon sx={{ fontSize: 64, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  No reminders for today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            )}
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