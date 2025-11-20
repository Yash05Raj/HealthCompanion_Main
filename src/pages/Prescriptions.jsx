import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as CloudUploadIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  getPrescriptions,
  addPrescription,
  deletePrescription,
  getSyncStatus
} from '../services/storageService';
import MedicineChatbot from '../components/MedicineChatbot';

const PrescriptionCard = ({ prescription, onDelete, onDownload }) => (
  <Card
    elevation={0}
    sx={{
      mb: 2,
      border: '1px solid #E5E9F0',
      borderRadius: 2,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {prescription.medicationName}
            </Typography>
            {prescription.syncStatus === 'pending' && (
              <Chip
                label="Syncing..."
                size="small"
                color="warning"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
            {prescription.syncStatus === 'synced' && (
              <CloudDoneIcon sx={{ fontSize: 18, color: 'success.main' }} />
            )}
            {prescription.localOnly && (
              <Chip
                label="Local"
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#E8F0FE' }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {prescription.dosage}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Added: {prescription.dateAdded}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prescribed by: {prescription.prescribedBy}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDownload(prescription)}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => onDelete(prescription.id)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label="Active"
            size="small"
            sx={{
              backgroundColor: '#E8F0FE',
              color: '#0A4B94',
              fontWeight: 500,
            }}
          />
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function Prescriptions() {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [error, setError] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Fetch prescriptions on mount and set up sync status polling
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        const data = await getPrescriptions(currentUser.uid);
        setPrescriptions(data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    fetchData();

    // Poll sync status every 5 seconds
    const interval = setInterval(() => {
      const status = getSyncStatus();
      setSyncStatus(status);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await deletePrescription(currentUser.uid, id);
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setError('Failed to delete prescription');
    }
  };

  const handleDownload = (prescription) => {
    if (prescription.fileURL) {
      // For local storage, fileURL is base64 data
      if (prescription.fileURL.startsWith('data:')) {
        // Create a download link for base64 data
        const link = document.createElement('a');
        link.href = prescription.fileURL;
        link.download = prescription.fileName || 'prescription';
        link.click();
      } else {
        // For Firebase URLs, open in new tab
        window.open(prescription.fileURL, '_blank');
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!currentUser) {
      setError('You must be logged in to upload prescriptions');
      return;
    }

    if (!selectedFile || !medicationName || !dosage || !prescribedBy) {
      setError('Please fill in all fields and select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or image file (JPEG, PNG)');
        setLoading(false);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        setLoading(false);
        return;
      }

      const prescriptionData = {
        medicationName,
        dosage,
        prescribedBy,
        instructions,
        status: 'active'
      };

      const newPrescription = await addPrescription(
        currentUser.uid,
        prescriptionData,
        selectedFile
      );

      setPrescriptions([...prescriptions, newPrescription]);

      setOpenDialog(false);
      setSelectedFile(null);
      setMedicationName('');
      setDosage('');
      setPrescribedBy('');
      setInstructions('');
      setError('');
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setError(error.message || 'Failed to upload prescription. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                Prescriptions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Manage your digital prescription records
                </Typography>
                {syncStatus && (
                  <Chip
                    icon={syncStatus.online ? <CloudDoneIcon /> : <CloudOffIcon />}
                    label={syncStatus.online ? 'Online' : 'Offline'}
                    size="small"
                    color={syncStatus.online ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                )}
                {syncStatus && syncStatus.totalPending > 0 && (
                  <Chip
                    label={`${syncStatus.totalPending} pending sync`}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ textTransform: 'none' }}
              onClick={() => {
                setError('');
                setSelectedFile(null);
                setMedicationName('');
                setDosage('');
                setPrescribedBy('');
                setInstructions('');
                setOpenDialog(true);
              }}
            >
              Add New
            </Button>

            <Dialog open={openDialog} onClose={() => {
              setOpenDialog(false);
              setError('');
            }} maxWidth="sm" fullWidth>
              <DialogTitle>Add New Prescription</DialogTitle>
              <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Prescribed By"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  margin="normal"
                  multiline
                  minRows={2}
                />
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Upload Prescription
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setOpenDialog(false);
                  setError('');
                }} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} variant="contained" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              All Prescriptions ({prescriptions.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                placeholder="Search prescriptions..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ textTransform: 'none', minWidth: 100 }}
              >
                Filter
              </Button>
            </Box>

            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onDelete={handleDelete}
                onDownload={handleDownload}
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

export default Prescriptions;