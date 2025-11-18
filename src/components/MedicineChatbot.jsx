import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { useAuth } from '../contexts/AuthContext';
import { fetchMedicines, searchMedicine } from '../services/medicineService';

const formatResponse = (medicine) => {
  const sections = [
    `Overview: ${medicine.overview}`,
    `Common uses: ${medicine.uses.join(', ')}.`,
    `Typical dosage: ${medicine.dosage}`,
    `Warnings: ${medicine.warnings.join(' ')}`,
    `Common side effects: ${medicine.sideEffects.join(', ')}`,
    'Always consult your healthcare provider for personalized guidance.',
  ];

  return sections.join('\n');
};

const MedicineChatbot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! I can help you explore common medicines.',
    },
  ]);
  const [input, setInput] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch medicines from Firestore on component mount
  useEffect(() => {
    const loadMedicines = async () => {
      if (!currentUser) {
        setError('Please log in to use the medicine chatbot.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const medicines = await fetchMedicines();
        setKnowledgeBase(medicines);
        // Don't show error if collection is empty - FDA API will handle searches
        if (medicines.length === 0) {
          console.log('No cached medicines found. FDA API will be used for searches.');
        }
        setError('');
      } catch (err) {
        console.error('Error loading medicines:', err);
        // Don't block the UI - FDA API can still work
        setKnowledgeBase([]);
        setError('');
        console.log('Continuing without cache - FDA API will be used for searches.');
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, [currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Generate quick suggestions from available medicines
  const quickSuggestions = useMemo(() => {
    if (knowledgeBase.length === 0) {
      return [
        'Ibuprofen dosage',
        'Paracetamol side effects',
        'Amoxicillin precautions',
        'Metformin instructions',
        'Cetirizine uses',
      ];
    }
    const meds = knowledgeBase.slice(0, 5);
    return [
      `${meds[0]?.name || 'Ibuprofen'} dosage`,
      `${meds[1]?.name || 'Paracetamol'} side effects`,
      `${meds[2]?.name || 'Amoxicillin'} precautions`,
      `${meds[3]?.name || 'Metformin'} instructions`,
      `${meds[4]?.name || 'Cetirizine'} uses`,
    ];
  }, [knowledgeBase]);

  const matcher = useMemo(
    () => (query) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized || knowledgeBase.length === 0) return null;
      return knowledgeBase.find((med) => {
        const nameMatch = med.name.toLowerCase().includes(normalized);
        const aliasMatch = med.aliases?.some((alias) =>
          normalized.includes(alias.toLowerCase())
        );
        return nameMatch || aliasMatch;
      });
    },
    [knowledgeBase]
  );

  const handleSend = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    // Show loading message
    const loadingMessage = {
      role: 'bot',
      text: 'Searching for medicine information...',
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Try to find medicine in local knowledge base first (fast)
      let match = matcher(trimmed);
      
      // If not found locally, search using the service (checks Firestore cache, then FDA API)
      if (!match) {
        try {
          match = await searchMedicine(trimmed);
        } catch (err) {
          console.error('Error searching medicine:', err);
        }
      }

      // Remove loading message
      setMessages((prev) => prev.slice(0, -1));

      const botMessage = match
        ? {
            role: 'bot',
            text: `Medicine: ${match.name}${match.source === 'FDA' ? ' (via FDA)' : ''}\n${formatResponse(match)}`,
          }
        : {
            role: 'bot',
            text: `I could not find detailed data for "${trimmed}". Please try:\n• Checking the spelling\n• Using the generic or brand name\n• Asking about a different medicine\n\nFor urgent medical questions, please consult a healthcare professional.`,
          };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.slice(0, -1));
      
      const errorMessage = {
        role: 'bot',
        text: 'Sorry, I encountered an error while searching. Please try again or consult a healthcare professional for urgent questions.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #E5E9F0',
        borderRadius: 3,
        background: 'linear-gradient(135deg, #F8FBFF 0%, #FFFFFF 100%)',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <MedicalInformationIcon sx={{ color: '#0A4B94' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Medicine Companion
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search evidence-based details about common medications. This assistant is for informational purposes only.
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading medicine database...
          </Typography>
        </Box>
      )}

      {!loading && !error && (
        <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2, gap: 1 }}>
          {quickSuggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onClick={() => handleSend(suggestion)}
              size="small"
              sx={{ backgroundColor: '#E8F0FE', color: '#0A4B94', fontWeight: 500 }}
            />
          ))}
        </Stack>
      )}

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #E5E9F0',
          borderRadius: 2,
          p: 2,
          backgroundColor: '#FFFFFF',
          mb: 2,
          minHeight: 260,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={`message-${index}`}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                maxWidth: '85%',
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: message.role === 'user' ? '#0A4B94' : '#F1F5F9',
                color: message.role === 'user' ? '#FFFFFF' : '#1F2933',
                boxShadow: message.role === 'user' ? '0 4px 12px rgba(10,75,148,0.2)' : 'none',
              }}
            >
              {message.text.split('\n').map((line, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    fontWeight: line.startsWith('Medicine:') ? 600 : 400,
                    mb: line ? 0.5 : 0,
                    color: message.role === 'user' ? '#FFFFFF' : '#1F2933',
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a medicine or dosage..."
          fullWidth
          size="small"
        />
        <IconButton
          color="primary"
          type="submit"
          sx={{ backgroundColor: '#0A4B94', color: '#FFFFFF', '&:hover': { backgroundColor: '#083A75' } }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MedicineChatbot;

