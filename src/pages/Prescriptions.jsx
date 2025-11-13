import { useState, useEffect } from 'react';
import {
  Box,
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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

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
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {prescription.medicationName}
          </Typography>
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
            <Button variant="outlined" size="small">
              View Details
            </Button>
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

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!currentUser) return;

      try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const q = query(prescriptionsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const prescriptionsList = [];
        querySnapshot.forEach((doc) => {
          prescriptionsList.push({ id: doc.id, ...doc.data() });
        });
        setPrescriptions(prescriptionsList);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    fetchPrescriptions();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      const prescription = prescriptions.find(p => p.id === id);
      if (prescription?.filePath) {
        const fileRef = ref(storage, prescription.filePath);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'prescriptions', id));
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setError('Failed to delete prescription');
    }
  };

  const handleDownload = (prescription) => {
    if (prescription.fileURL) {
      window.open(prescription.fileURL, '_blank');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !medicationName || !dosage || !prescribedBy) {
      setError('Please fill in all fields and select a file');
      return;
    }

    try {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or image file (JPEG, PNG)');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }

      const filePath = `prescriptions/${currentUser.uid}/${Date.now()}_${selectedFile.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, selectedFile);
      const fileURL = await getDownloadURL(fileRef);

      const prescriptionData = {
        userId: currentUser.uid,
        medicationName,
        dosage,
        prescribedBy,
        instructions,
        dateAdded: new Date().toLocaleDateString(),
        fileURL,
        filePath,
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), prescriptionData);
      setPrescriptions([...prescriptions, { id: docRef.id, ...prescriptionData }]);
      
      setOpenDialog(false);
      setSelectedFile(null);
      setMedicationName('');
      setDosage('');
      setPrescribedBy('');
      setInstructions('');
      setError('');
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setError('Failed to upload prescription');
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Prescriptions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your digital prescription records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ textTransform: 'none' }}
          onClick={() => setOpenDialog(true)}
        >
          Add New
        </Button>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained">
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          All Prescriptions ({prescriptions.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
    </Box>
  );
}

export default Prescriptions;