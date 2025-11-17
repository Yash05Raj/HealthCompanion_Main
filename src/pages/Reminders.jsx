import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MedicationOutlined as MedicationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import MedicineChatbot from '../components/MedicineChatbot';

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
      Scheduled: {reminder.scheduledTime ? new Date(reminder.scheduledTime).toLocaleString() : 'Not set'}
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
    todaysDoses: 0,
    complianceRate: 0,
    overdue: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [error, setError] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!currentUser) return;

      try {
        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, where('userId', '==', currentUser.uid), orderBy('scheduledTime'));
        const querySnapshot = await getDocs(q);
        const remindersList = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          const scheduledStr = data.scheduledTime && typeof data.scheduledTime?.toDate === 'function' ? data.scheduledTime.toDate().toISOString() : data.scheduledTime;
          remindersList.push({ id: d.id, ...data, scheduledTime: scheduledStr });
        });
        setReminders(remindersList);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };

    fetchReminders();
  }, [currentUser]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!currentUser) return;
      try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const q = query(prescriptionsRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
        setPrescriptionsList(list);
      } catch (e) {
        console.error('Error fetching prescriptions:', e);
      }
    };
    fetchPrescriptions();
  }, [currentUser]);

  const handleMarkTaken = async (id) => {
    try {
      const takenAt = new Date().toISOString();
      await updateDoc(doc(db, 'reminders', id), { status: 'Taken', takenAt });
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Taken', takenAt } : r)));
    } catch (e) {
      console.error('Error updating reminder:', e);
    }
  };

  const handleSnooze = async (id) => {
    try {
      const r = reminders.find((x) => x.id === id);
      const base = r?.scheduledTime ? new Date(r.scheduledTime) : new Date();
      base.setMinutes(base.getMinutes() + 10);
      const newTimeIso = base.toISOString();
      await updateDoc(doc(db, 'reminders', id), { scheduledTime: Timestamp.fromDate(base), status: 'Pending' });
      setReminders((prev) => prev.map((x) => (x.id === id ? { ...x, scheduledTime: newTimeIso, status: 'Pending' } : x)));
    } catch (e) {
      console.error('Error snoozing reminder:', e);
    }
  };

  const handleSkip = async (id) => {
    try {
      await updateDoc(doc(db, 'reminders', id), { status: 'Missed' });
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Missed' } : r)));
    } catch (e) {
      console.error('Error skipping reminder:', e);
    }
  };

  const handleAddReminder = async () => {
    if (!currentUser) {
      setError('You must be logged in to add reminders');
      return;
    }

    if (!medicationName || !scheduledTime) {
      setError('Please provide medication name and scheduled time');
      return;
    }

    // Validate scheduled time is in the future (optional check)
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      setError('Please provide a valid date and time');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      // Debug logging
      console.log('Current User:', currentUser);
      console.log('User ID:', currentUser?.uid);
      console.log('Is Authenticated:', !!currentUser);
      
      const data = {
        userId: currentUser.uid,
        prescriptionId: selectedPrescriptionId || null,
        medicationName: medicationName.trim(),
        dosage: dosage.trim() || '',
        scheduledTime: Timestamp.fromDate(scheduledDate),
        status: 'Pending',
        createdAt: serverTimestamp()
      };
      
      console.log('Data being sent:', { ...data, scheduledTime: scheduledDate.toISOString(), createdAt: 'serverTimestamp' });
      
      const docRef = await addDoc(collection(db, 'reminders'), data);
      setReminders((prev) => [...prev, { 
        id: docRef.id, 
        ...data, 
        scheduledTime: scheduledDate.toISOString() 
      }]);
      
      setOpenDialog(false);
      setMedicationName('');
      setDosage('');
      setScheduledTime('');
      setSelectedPrescriptionId('');
      setError('');
    } catch (e) {
      console.error('Error adding reminder:', e);
      setError(e.message || 'Failed to add reminder. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
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
              onClick={() => {
                setError('');
                setMedicationName('');
                setDosage('');
                setScheduledTime('');
                setSelectedPrescriptionId('');
                setOpenDialog(true);
              }}
            >
              Add Reminder
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <StatCard
              title="Today's Doses"
              value={stats.todaysDoses}
              subtitle="Remaining today"
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

            <Dialog open={openDialog} onClose={() => {
              setOpenDialog(false);
              setError('');
            }} maxWidth="sm" fullWidth>
              <DialogTitle>Add Reminder</DialogTitle>
              <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  select
                  fullWidth
                  label="Linked Prescription (optional)"
                  value={selectedPrescriptionId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPrescriptionId(val);
                    if (val) {
                      const p = prescriptionsList.find((x) => x.id === val);
                      if (p) {
                        setMedicationName(p.medicationName || '');
                        setDosage(p.dosage || '');
                      }
                    } else {
                      setMedicationName('');
                      setDosage('');
                    }
                  }}
                  margin="normal"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {prescriptionsList.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{`${p.medicationName || 'Untitled'}${p.dosage ? ` - ${p.dosage}` : ''}`}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Dosage (optional)"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Scheduled Time"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setOpenDialog(false);
                  setError('');
                }} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleAddReminder} disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add'}
                </Button>
              </DialogActions>
            </Dialog>

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
        </Grid>
        <Grid item xs={12} lg={5}>
          <MedicineChatbot />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reminders;