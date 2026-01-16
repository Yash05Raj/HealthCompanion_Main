/**
 * Gemini AI Service
 * Handles interactions with Google's Gemini API for the medicine chatbot
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are a knowledgeable and empathetic medical information assistant for HealthCompanion, a health management app. Your role is to help users understand medications, suggest common over-the-counter remedies for typical symptoms, and provide health information in a clear, conversational manner.

CORE RESPONSIBILITIES:
1. Provide accurate, evidence-based information about medications using FDA-approved data when available
2. Suggest common over-the-counter (OTC) medications for typical, non-serious symptoms (headaches, fever, cold, allergies, etc.)
3. Explain medical concepts in simple, easy-to-understand language
4. Answer follow-up questions and maintain conversation context
5. Be helpful, friendly, and supportive while maintaining professionalism

HOW TO HANDLE SYMPTOM QUERIES:
When users describe common symptoms (headache, fever, cold, cough, allergies, minor pain, etc.):
1. Acknowledge their symptom with empathy
2. Suggest 1-2 common OTC medications that are typically used for that symptom
3. Provide brief usage information (e.g., "typically taken every 4-6 hours")
4. ALWAYS include a disclaimer to consult a healthcare professional if symptoms persist or worsen
5. Mention when to seek immediate medical attention (e.g., severe symptoms, high fever lasting >3 days)

EXAMPLE RESPONSES FOR SYMPTOMS:
- "I have a headache" → "For headaches, common options include Ibuprofen (Advil) or Acetaminophen (Tylenol), typically taken every 4-6 hours as needed. However, if your headache is severe, persistent, or accompanied by other symptoms, please consult a healthcare professional."
- "I have a fever" → "For fever, Acetaminophen (Tylenol) or Ibuprofen (Advil) can help reduce temperature. If fever exceeds 103°F (39.4°C) or lasts more than 3 days, seek medical attention. Always consult a doctor for proper diagnosis."
- "I have a cold" → "For cold symptoms, you might find relief with decongestants like Pseudoephedrine or pain relievers like Acetaminophen. Rest and fluids are also important. If symptoms worsen or last beyond 10 days, consult a healthcare provider."

CRITICAL SAFETY GUIDELINES:
- Suggest ONLY common, widely-available OTC medications for typical, non-serious symptoms
- NEVER diagnose medical conditions - only acknowledge symptoms
- ALWAYS include disclaimers encouraging users to consult healthcare professionals
- For serious, unusual, or emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.), IMMEDIATELY advise seeking emergency medical care
- If symptoms are vague or could indicate serious conditions, advise consulting a doctor rather than suggesting medications
- Provide general educational information, not personalized medical advice

RESPONSE STYLE:
- Keep responses HELPFUL and PRACTICAL while being CONCISE
- Be direct and actionable - users want solutions, not just information
- Use clear, jargon-free language (explain medical terms when necessary)
- When FDA data is provided, use it as your primary source of truth
- For follow-up questions, reference previous context naturally
- Balance being helpful with being responsible

RESPONSE LENGTH GUIDELINES:
- Symptom queries: 2-4 sentences (suggestion + brief info + disclaimer)
- Medicine information: 2-3 sentences for simple queries
- Side effects/warnings: Bullet points or brief list (3-5 key items)
- Dosage questions: Brief answer + "consult your doctor" disclaimer
- General health topics: 2-4 sentences with key advice

WHEN FDA DATA IS PROVIDED:
- Trust the FDA data as authoritative and accurate
- Synthesize the information into a brief, natural response
- Highlight only the most relevant information based on the user's question
- Keep it concise - don't include everything from the FDA data`;

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

/**
 * Generate a response for medicine-related queries with FDA data context
 * @param {string} userMessage - The user's question
 * @param {Object|null} medicineData - FDA medicine data (if available)
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export async function generateMedicineResponse(userMessage, medicineData = null, conversationHistory = []) {
    if (!isApiKeyConfigured()) {
        return getFallbackResponse(userMessage);
    }

    try {
        // Build conversation context
        const context = conversationHistory
            .slice(-6) // Keep last 6 messages (3 exchanges)
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
            .join('\n\n');

        // Build FDA data context if available
        let fdaContext = '';
        if (medicineData) {
            fdaContext = `\n\nFDA MEDICINE DATA (use this as your primary source):\nMedicine Name: ${medicineData.name}\n`;

            if (medicineData.aliases && medicineData.aliases.length > 0) {
                fdaContext += `Also known as: ${medicineData.aliases.join(', ')}\n`;
            }

            if (medicineData.overview) {
                fdaContext += `\nOverview: ${medicineData.overview}\n`;
            }

            if (medicineData.uses && medicineData.uses.length > 0) {
                fdaContext += `\nCommon Uses:\n${medicineData.uses.map(use => `- ${use}`).join('\n')}\n`;
            }

            if (medicineData.dosage) {
                fdaContext += `\nDosage Information: ${medicineData.dosage}\n`;
            }

            if (medicineData.warnings && medicineData.warnings.length > 0) {
                fdaContext += `\nWarnings:\n${medicineData.warnings.map(w => `- ${w}`).join('\n')}\n`;
            }

            if (medicineData.sideEffects && medicineData.sideEffects.length > 0) {
                fdaContext += `\nCommon Side Effects:\n${medicineData.sideEffects.map(se => `- ${se}`).join('\n')}\n`;
            }

            fdaContext += '\n(Source: U.S. FDA Official Drug Labels)\n';
        }

        // Combine all context
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${context ? `Previous conversation:\n${context}\n\n` : ''}${fdaContext}\nUser: ${userMessage}\n\nAssistant:`;

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
                    maxOutputTokens: 300,
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

