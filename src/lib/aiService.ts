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
  // Updated API endpoint for Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 50) + '...');
    
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
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as GeminiResponse;
    console.log('Gemini API response received successfully');
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected Gemini API response format:', JSON.stringify(data).slice(0, 200) + '...');
      throw new Error('Unexpected Gemini API response format');
    }
    
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
    console.log('Calling DeepSeek API with model:', model || 'deepseek-chat');
    
    // Create headers with proper content type and authorization
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Create request payload
    const payload = {
      model: model || 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    console.log('DeepSeek API request payload:', JSON.stringify(payload).substring(0, 100) + '...');
    
    try {
      // Attempt direct API call first
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        mode: 'cors'  // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key for DeepSeek. Please check your API key and try again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Your DeepSeek API key may not have permission to use this model.');
        } else if (response.status === 429) {
          throw new Error('DeepSeek API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      console.log('DeepSeek API response:', JSON.stringify(data).slice(0, 100) + '...');
      
      // Handle different response formats
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else if (data.choices && data.choices[0]?.text) {
        return data.choices[0].text;
      } else if (data.output && data.output.content) {
        return data.output.content;
      } else if (data.response) {
        return data.response;
      } else {
        console.error('Unexpected DeepSeek API response format:', data);
        throw new Error('Unexpected DeepSeek API response format');
      }
    } catch (directError: any) {
      console.error('DeepSeek API call failed:', directError.message);
      
      // Check for specific error types
      if (directError.message.includes('Failed to fetch') || 
          directError.message.includes('NetworkError') ||
          directError.message.includes('CORS') ||
          directError.message.includes('Network request failed')) {
        throw new Error('Network error connecting to DeepSeek API. This may be due to CORS restrictions or network connectivity issues.');
      }
      
      throw directError;
    }
  } catch (error) {
    console.error('Error in DeepSeek API call:', error);
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
  const { provider, message, model = '', apiKey, baseUrl } = params;

  if (!apiKey) {
    console.error(`No API key provided for ${provider}`);
    throw new Error(`No API key provided for ${provider}`);
  }

  console.log(`Calling ${provider} API with model: ${model || 'default'}, API key: ${apiKey.substring(0, 4)}...`);
  
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
  } catch (error: any) {
    // Enrich the error with more context
    const enhancedError = new Error(`Error in ${provider} API: ${error.message}`);
    console.error(`Error in getAIResponse for ${provider}:`, error);
    throw enhancedError;
  }
}; 