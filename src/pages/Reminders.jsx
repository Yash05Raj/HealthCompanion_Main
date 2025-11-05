import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  MedicationOutlined as MedicationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StatCard = ({ title, value, subtitle, icon }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      backgroundColor: '#F9FAFB',
      border: '1px solid #E5E9F0',
      borderRadius: 2,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

const ReminderItem = ({ reminder, onMarkTaken, onSnooze, onSkip }) => (
  <Box
    sx={{
      p: 2,
      mb: 2,
      border: '1px solid #E5E9F0',
      borderRadius: 2,
      backgroundColor: '#FFFFFF',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <MedicationIcon color="primary" />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {reminder.medicationName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {reminder.dosage}
        </Typography>
      </Box>
      <Chip
        label={reminder.status}
        size="small"
        color={reminder.status === 'Pending' ? 'primary' : 'error'}
        sx={{ ml: 'auto' }}
      />
    </Box>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Scheduled: {reminder.scheduledTime}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      {reminder.status === 'Overdue' ? (
        <Button
          variant="contained"
          fullWidth
          color="error"
          onClick={() => onMarkTaken(reminder.id)}
          sx={{ textTransform: 'none' }}
        >
          Mark Taken (Late)
        </Button>
      ) : (
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={() => onMarkTaken(reminder.id)}
          sx={{ textTransform: 'none' }}
        >
          Mark Taken
        </Button>
      )}
      <Button
        variant="outlined"
        size="small"
        onClick={() => onSnooze(reminder.id)}
      >
        Snooze
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => onSkip(reminder.id)}
      >
        Skip
      </Button>
    </Box>
  </Box>
);

function Reminders() {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    todaysDoses: 2,
    complianceRate: 85,
    overdue: 1,
  });

  useEffect(() => {
    const fetchReminders = async () => {
      if (!currentUser) return;

      try {
        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const remindersList = [];
        querySnapshot.forEach((doc) => {
          remindersList.push({ id: doc.id, ...doc.data() });
        });
        setReminders(remindersList);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };

    fetchReminders();
  }, [currentUser]);

  const handleMarkTaken = async (id) => {
    // Implement mark taken functionality
  };

  const handleSnooze = (id) => {
    // Implement snooze functionality
  };

  const handleSkip = (id) => {
    // Implement skip functionality
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Medication Reminders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your medication schedule and notifications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none' }}
        >
          Add Reminder
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Today's Doses"
          value={stats.todaysDoses}
          subtitle="2 remaining today"
          icon={<MedicationIcon color="primary" />}
        />
        <StatCard
          title="Compliance Rate"
          value={`${stats.complianceRate}%`}
          subtitle="This week"
          icon={<MedicationIcon color="success" />}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          subtitle="Needs attention"
          icon={<MedicationIcon color="error" />}
        />
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Reminders
        </Typography>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Today" />
          <Tab label="Upcoming" />
          <Tab label="History" />
        </Tabs>

        {reminders.map((reminder) => (
          <ReminderItem
            key={reminder.id}
            reminder={reminder}
            onMarkTaken={handleMarkTaken}
            onSnooze={handleSnooze}
            onSkip={handleSkip}
          />
        ))}
      </Box>
    </Box>
  );
}

export default Reminders;