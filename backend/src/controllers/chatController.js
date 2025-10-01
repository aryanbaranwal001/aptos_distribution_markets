const OpenAI = require('openai');

// Function to create OpenAI client with OpenRouter configuration
const createOpenAIClient = () => {
  // Use OPENAI_API_KEY (which contains the OpenRouter key) since that's what you have in .env
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://aptos-distribution-markets.com',
      'X-Title': 'Aptos Distribution Markets',
    },
  });
};

class ChatController {
  async chat(req, res, next) {
    try {
      const { message, marketId, aiContext, conversationHistory = [] } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Build conversation messages
      const messages = [];

      // Add system context if available
      if (aiContext && aiContext.trim()) {
        messages.push({
          role: 'system',
          content: `You are an AI assistant helping users understand distribution markets. Here's the context about the current market: ${aiContext}

Please provide helpful, accurate information about this market. Be concise but informative. Focus on helping users understand the market mechanics, factors that might influence outcomes, and general trading concepts. Do not provide financial advice.`
        });
      } else {
        messages.push({
          role: 'system',
          content: 'You are an AI assistant helping users understand distribution markets. Provide helpful information about market mechanics, factors that influence outcomes, and general trading concepts. Be concise but informative. Do not provide financial advice.'
        });
      }

      // Add conversation history (last 4 pairs = 8 messages)
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-8);
        recentHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      // Create OpenAI client and call OpenRouter API
      const openai = createOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

      res.json({
        success: true,
        response: response,
        message: 'Chat response generated successfully'
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide fallback response
      const fallbackResponse = aiContext && aiContext.trim() 
        ? `I'm here to help you understand this distribution market. This market involves predicting outcomes with probability distributions. Feel free to ask me about market mechanics, factors that might influence the outcome, or how distribution markets work in general.`
        : `I'm an AI assistant for distribution markets. I can help explain how these markets work, discuss factors that influence outcomes, and answer questions about trading concepts. What would you like to know?`;

      res.json({
        success: true,
        response: fallbackResponse,
        message: 'Fallback response provided'
      });
    }
  }
}

module.exports = new ChatController();
