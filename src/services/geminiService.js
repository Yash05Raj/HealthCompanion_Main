/**
 * Gemini AI Service
 * Handles interactions with Google's Gemini API for the medicine chatbot
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_PROMPT = `You are a helpful medical information assistant for a health companion app. Your role is to:

1. Provide accurate, evidence-based information about medications, dosages, side effects, and general health topics
2. Always include appropriate medical disclaimers
3. Encourage users to consult healthcare professionals for personalized medical advice
4. Be concise but informative
5. Use clear, easy-to-understand language
6. If asked about serious symptoms or emergencies, advise seeking immediate medical attention

IMPORTANT SAFETY GUIDELINES:
- Never diagnose conditions
- Never prescribe medications
- Always recommend consulting a healthcare provider for personalized advice
- For emergencies, advise calling emergency services immediately
- Provide general educational information only

Keep responses concise (2-4 paragraphs) unless more detail is specifically requested.`;

/**
 * Generate a response from Gemini API
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export async function generateResponse(userMessage, conversationHistory = []) {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
        // Build conversation context
        const context = conversationHistory
            .slice(-6) // Keep last 6 messages for context (3 exchanges)
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
            .join('\n\n');

        // Combine system prompt, context, and new message
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${context ? `Previous conversation:\n${context}\n\n` : ''}User: ${userMessage}\n\nAssistant:`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API error:', errorData);

            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 403) {
                throw new Error('API key is invalid or not authorized. Please check your configuration.');
            } else {
                throw new Error(`API request failed: ${response.statusText}`);
            }
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated. Please try rephrasing your question.');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return aiResponse.trim();

    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Provide helpful error messages
        if (error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        }

        throw error;
    }
}

/**
 * Check if API key is configured
 * @returns {boolean}
 */
export function isApiKeyConfigured() {
    return !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here';
}

/**
 * Get a fallback response when API is not available
 * @param {string} userMessage
 * @returns {string}
 */
export function getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return "I'm here to help, but I'm currently unable to access my AI capabilities. For pain or discomfort, please consult a healthcare professional who can properly assess your symptoms and provide appropriate treatment. If you're experiencing severe pain, please seek immediate medical attention.";
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        return "This appears to be urgent. Please call emergency services immediately or visit your nearest emergency room. Don't wait for online advice in emergency situations.";
    }

    return "I apologize, but I'm currently unable to process your request due to a configuration issue. Please ensure the Gemini API key is properly set up. For medical questions, please consult with a healthcare professional.";
}
