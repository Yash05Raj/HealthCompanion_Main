/**
 * Chatbot Service
 * Orchestrates the medicine chatbot by combining FDA API data with Gemini AI responses
 */

import { searchMedicine } from './medicineService';
import { generateMedicineResponse, isApiKeyConfigured } from './geminiService';

/**
 * Process a user's medicine query and generate an AI response
 * @param {string} userMessage - The user's question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Response object with text and metadata
 */
export async function processMedicineQuery(userMessage, conversationHistory = []) {
    try {
        // Step 1: Extract potential medicine name from the query
        const medicineName = extractMedicineName(userMessage);

        // Step 2: Search for medicine data (Firestore cache -> FDA API)
        let medicineData = null;
        if (medicineName) {
            try {
                medicineData = await searchMedicine(medicineName);
            } catch (error) {
                console.error('Error searching for medicine:', error);
                // Continue without medicine data - Gemini can still provide general info
            }
        }

        // Step 3: Generate AI response with Gemini
        const aiResponse = await generateMedicineResponse(
            userMessage,
            medicineData,
            conversationHistory
        );

        return {
            text: aiResponse,
            medicineData: medicineData,
            source: medicineData ? 'gemini+fda' : 'gemini',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error processing medicine query:', error);

        // Return a helpful fallback response
        return {
            text: getFallbackMessage(userMessage, error),
            medicineData: null,
            source: 'fallback',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Extract potential medicine name from user query
 * @param {string} query - User's question
 * @returns {string|null} - Extracted medicine name or null
 */
function extractMedicineName(query) {
    const normalized = query.trim().toLowerCase();

    // Common question patterns
    const patterns = [
        /(?:what is|tell me about|info on|information about)\s+([a-z]+)/i,
        /([a-z]+)\s+(?:dosage|side effects|uses|warnings|precautions)/i,
        /(?:can i take|should i take|is)\s+([a-z]+)/i,
        /^([a-z]+)$/i, // Single word queries
    ];

    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
            const extracted = match[1].trim();
            // Filter out common words that aren't medicine names
            const commonWords = ['the', 'what', 'how', 'when', 'where', 'why', 'can', 'should', 'is', 'are', 'my', 'me', 'i'];
            if (!commonWords.includes(extracted.toLowerCase()) && extracted.length > 2) {
                return extracted;
            }
        }
    }

    // If no pattern matches, try to find capitalized words (often medicine names)
    const words = query.split(/\s+/);
    for (const word of words) {
        // Check if word looks like a medicine name (3+ chars, not common words)
        if (word.length >= 3 && /^[a-z]+$/i.test(word)) {
            const lower = word.toLowerCase();
            const commonWords = ['what', 'tell', 'about', 'info', 'information', 'dosage', 'side', 'effects', 'uses', 'warnings', 'take', 'should', 'can'];
            if (!commonWords.includes(lower)) {
                return word;
            }
        }
    }

    return null;
}

/**
 * Get a fallback message when the main flow fails
 * @param {string} userMessage - Original user message
 * @param {Error} error - The error that occurred
 * @returns {string} - Fallback message
 */
function getFallbackMessage(userMessage, error) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for emergency keywords
    if (lowerMessage.includes('emergency') ||
        lowerMessage.includes('urgent') ||
        lowerMessage.includes('severe pain') ||
        lowerMessage.includes('chest pain') ||
        lowerMessage.includes('difficulty breathing')) {
        return "⚠️ This appears to be an urgent medical situation. Please call emergency services immediately (911 in the US) or visit your nearest emergency room. Don't wait for online advice in emergency situations.";
    }

    // Check if it's an API configuration issue
    if (!isApiKeyConfigured()) {
        return "I apologize, but the AI chatbot is currently not configured. The Gemini API key needs to be set up. In the meantime, please consult with a healthcare professional for medical questions.";
    }

    // Check if it's a rate limit error
    if (error.message && error.message.includes('rate limit')) {
        return "I'm receiving a lot of requests right now. Please wait a moment and try again. For urgent medical questions, please consult a healthcare professional directly.";
    }

    // Generic fallback
    return "I apologize, but I'm having trouble processing your request at the moment. This could be due to a temporary issue with the AI service. Please try again in a moment, or consult with a healthcare professional for medical advice.\n\n💡 Tip: Try rephrasing your question or asking about a specific medicine name.";
}

/**
 * Check if the chatbot service is ready
 * @returns {Object} - Status object
 */
export function getChatbotStatus() {
    return {
        geminiConfigured: isApiKeyConfigured(),
        ready: isApiKeyConfigured(),
        capabilities: {
            medicineSearch: true,
            fdaData: true,
            conversationalAI: isApiKeyConfigured(),
            conversationHistory: true
        }
    };
}

/**
 * Get suggested questions based on context
 * @param {Object|null} medicineData - Current medicine data if available
 * @returns {Array<string>} - Array of suggested questions
 */
export function getSuggestedQuestions(medicineData = null) {
    if (medicineData) {
        return [
            `What are the side effects of ${medicineData.name}?`,
            `How should I take ${medicineData.name}?`,
            `What are the warnings for ${medicineData.name}?`,
            `Can I take ${medicineData.name} with other medications?`,
            `Is ${medicineData.name} safe for children?`
        ];
    }

    // Default suggestions
    return [
        'What is Ibuprofen used for?',
        'Tell me about Aspirin side effects',
        'How much Acetaminophen can I take?',
        'What are the warnings for Amoxicillin?',
        'Is Metformin safe during pregnancy?'
    ];
}
