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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';

const knowledgeBase = [
  {
    name: 'Ibuprofen',
    aliases: ['advil', 'motrin'],
    overview: 'A non-steroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.',
    uses: ['Headaches & migraines', 'Muscle aches', 'Arthritis pain', 'Menstrual cramps'],
    dosage: '200-400mg every 4-6 hours as needed. Do not exceed 1200mg in 24 hours without medical supervision.',
    warnings: [
      'Avoid if you have stomach ulcers, bleeding disorders, or severe kidney disease.',
      'Take with food to reduce stomach irritation.',
      'May interact with blood thinners or other NSAIDs.',
    ],
    sideEffects: ['Upset stomach', 'Dizziness', 'Fluid retention'],
  },
  {
    name: 'Paracetamol',
    aliases: ['acetaminophen', 'tylenol'],
    overview: 'An analgesic and antipyretic used to treat mild to moderate pain and reduce fever.',
    uses: ['Fever reduction', 'Headaches', 'Post-vaccination discomfort'],
    dosage: '500-1000mg every 6 hours as needed. Maximum 4000mg in 24 hours (or 3000mg for chronic use).',
    warnings: [
      'Exceeding 4g per day can lead to severe liver damage.',
      'Avoid combining with alcohol or other paracetamol-containing medications.',
    ],
    sideEffects: ['Rare, but may include rash or liver enzyme elevation with prolonged high doses.'],
  },
  {
    name: 'Amoxicillin',
    aliases: ['amoxil'],
    overview: 'A penicillin-type antibiotic that fights bacterial infections.',
    uses: ['Ear infections', 'Pneumonia', 'Urinary tract infections', 'Skin infections'],
    dosage: '250-500mg every 8 hours or 500-875mg every 12 hours, depending on the infection.',
    warnings: [
      'Complete the full prescribed course even if you feel better.',
      'May reduce effectiveness of oral contraceptives—use backup protection.',
      'Not effective for viral infections like cold or flu.',
    ],
    sideEffects: ['Nausea', 'Diarrhea', 'Skin rash', 'Yeast infections'],
  },
  {
    name: 'Metformin',
    aliases: [],
    overview: 'An oral medication for type 2 diabetes that improves insulin sensitivity and lowers glucose production.',
    uses: ['Type 2 diabetes', 'Prediabetes management', 'Polycystic ovary syndrome (off-label)'],
    dosage: '500mg once or twice daily with meals. Titrate up to 2000mg per day as tolerated.',
    warnings: [
      'Take with food to reduce gastrointestinal upset.',
      'Rare risk of lactic acidosis—avoid with severe kidney or liver disease.',
    ],
    sideEffects: ['Diarrhea', 'Bloating', 'Metallic taste'],
  },
  {
    name: 'Cetirizine',
    aliases: ['zyrtec'],
    overview: 'A second-generation antihistamine used for allergy relief.',
    uses: ['Seasonal allergies', 'Chronic urticaria', 'Allergic rhinitis'],
    dosage: '10mg once daily for adults. Children dosing varies by age/weight.',
    warnings: ['Use caution with kidney impairment.', 'May cause mild drowsiness in some individuals.'],
    sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
  },
];

const quickSuggestions = [
  'Ibuprofen dosage',
  'Paracetamol side effects',
  'Amoxicillin precautions',
  'Metformin instructions',
  'Cetirizine uses',
];

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
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! I can help you explore common medicines.',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const matcher = useMemo(
    () => (query) => {
      const normalized = query.trim().toLowerCase();
      if (!normalized) return null;
      return knowledgeBase.find((med) =>
        [med.name, ...med.aliases].some((alias) => normalized.includes(alias.toLowerCase()))
      );
    },
    []
  );

  const handleSend = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    const match = matcher(trimmed);
    const botMessage = match
      ? {
          role: 'bot',
          text: `Medicine: ${match.name}\n${formatResponse(match)}`,
        }
      : {
          role: 'bot',
          text:
            'I could not find detailed data for that medicine. Please double-check the spelling or ask about Ibuprofen, Paracetamol, Amoxicillin, Metformin, or Cetirizine. For urgent questions, consult a healthcare professional.',
        };

    setMessages((prev) => [...prev, botMessage]);
    setInput('');
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

