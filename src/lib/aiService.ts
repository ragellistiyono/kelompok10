interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface AnthropicResponse {
  content: {
    text: string;
  }[];
}

interface DeepSeekResponse {
  output: {
    content: string;
  };
}

// Gemini (Google) API
export const getGeminiResponse = async (prompt: string, apiKey: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as GeminiResponse;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

// OpenAI (ChatGPT) API
export const getOpenAIResponse = async (prompt: string, model: string, apiKey: string): Promise<string> => {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as OpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

// Anthropic (Claude) API
export const getClaudeResponse = async (prompt: string, model: string, apiKey: string): Promise<string> => {
  const url = 'https://api.anthropic.com/v1/messages';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as AnthropicResponse;
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
};

// DeepSeek API
export const getDeepSeekResponse = async (prompt: string, model: string, apiKey: string): Promise<string> => {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as DeepSeekResponse;
    return data.output.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
};

// Unified API call function with object parameters
interface AIRequestParams {
  provider: string;
  message: string;
  model?: string;
  apiKey: string;
  baseUrl?: string;
}

export const getAIResponse = async (params: AIRequestParams): Promise<string> => {
  const { provider, message, model = '', apiKey } = params;

  try {
    switch (provider) {
      case 'gemini':
        return await getGeminiResponse(message, apiKey);
      
      case 'openai':
        return await getOpenAIResponse(message, model, apiKey);
      
      case 'claude':
        return await getClaudeResponse(message, model, apiKey);
      
      case 'deepseek':
        return await getDeepSeekResponse(message, model, apiKey);
      
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error in getAIResponse for ${provider}:`, error);
    throw error;
  }
}; 