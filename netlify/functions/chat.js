// Netlify Serverless Function 示例
// 如果你需要隐藏 API key 或添加后端逻辑，可以使用此 function

exports.handler = async (event, context) => {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { messages, model = 'deepseek-chat' } = JSON.parse(event.body);

    // 从环境变量读取 API key（推荐做法）
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // 设置超时（5秒）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DeepSeek API请求超时')), 5000);
    });

    // 调用 DeepSeek API
    const fetchPromise = fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 800, // 减少返回长度以加快速度
        temperature: 0.7
      })
    });

    // 使用Promise.race，如果5秒内没有响应，就抛出超时错误
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};