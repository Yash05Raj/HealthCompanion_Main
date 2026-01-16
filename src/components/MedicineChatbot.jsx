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
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../contexts/AuthContext';
import { processMedicineQuery, getChatbotStatus, getSuggestedQuestions } from '../services/chatbotService';

const MedicineChatbot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '👋 Hi! I\'m your AI medicine companion powered by Google Gemini and FDA data. Ask me anything about medications, dosages, side effects, or general health topics!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [chatbotStatus, setChatbotStatus] = useState(null);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const messagesEndRef = useRef(null);

  // Check chatbot status on mount
  useEffect(() => {
    const status = getChatbotStatus();
    setChatbotStatus(status);

    if (!currentUser) {
      setError('Please log in to use the medicine chatbot.');
    } else if (!status.geminiConfigured) {
      setError('⚠️ Gemini AI is not configured. Please add VITE_GEMINI_API_KEY to your .env file for full chatbot functionality.');
    }
  }, [currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Generate dynamic suggestions based on current context
  const quickSuggestions = useMemo(() => {
    return getSuggestedQuestions(currentMedicine);
  }, [currentMedicine]);

  const handleSend = async (value) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Get conversation history (exclude the current message)
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'bot',
        text: msg.text
      }));

      // Process query with Gemini AI + FDA data
      const response = await processMedicineQuery(trimmed, history);

      // Update current medicine if found
      if (response.medicineData) {
        setCurrentMedicine(response.medicineData);
      }

      // Add AI response to messages
      const botMessage = {
        role: 'bot',
        text: response.text,
        source: response.source,
        medicineName: response.medicineData?.name
      };

      setIsTyping(false);

      // Small delay for better UX (shows typing indicator briefly)
      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
      }, 300);

    } catch (error) {
      console.error('Error in handleSend:', error);
      setIsTyping(false);

      const errorMessage = {
        role: 'bot',
        text: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question. For urgent medical matters, please consult a healthcare professional directly.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalInformationIcon sx={{ color: '#0A4B94' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Medicine Companion
          </Typography>
        </Box>
        {chatbotStatus?.geminiConfigured && (
          <Chip
            icon={<SmartToyIcon />}
            label="Powered by Gemini"
            size="small"
            sx={{ backgroundColor: '#E8F0FE', color: '#0A4B94', fontWeight: 500 }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ask me anything about medications! I use official FDA data and AI to provide helpful, conversational answers.
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity={chatbotStatus?.geminiConfigured ? "info" : "warning"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2, gap: 1 }}>
        {quickSuggestions.map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => handleSend(suggestion)}
            size="small"
            disabled={loading}
            sx={{
              backgroundColor: '#E8F0FE',
              color: '#0A4B94',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              '&:hover': { backgroundColor: loading ? '#E8F0FE' : '#D2E3FC' }
            }}
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

        {/* Typing Indicator */}
        {isTyping && (
          <Fade in={isTyping}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <CircularProgress size={16} sx={{ color: '#0A4B94' }} />
                <Typography variant="body2" sx={{ ml: 1, color: '#1F2933' }}>
                  AI is thinking...
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about medicines..."
          fullWidth
          size="small"
          disabled={loading || !currentUser}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={loading || !input.trim() || !currentUser}
          sx={{
            backgroundColor: '#0A4B94',
            color: '#FFFFFF',
            '&:hover': { backgroundColor: '#083A75' },
            '&:disabled': { backgroundColor: '#E5E9F0', color: '#9CA3AF' }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MedicineChatbot;

