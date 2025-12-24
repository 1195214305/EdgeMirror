/**
 * EdgeMirror - 全球实时协作白板
 * 主入口 Edge Function
 */

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-54ae495d0e8e4dfb92607467bfcdf357';

// 模拟边缘 KV 存储
const boardCache = new Map();

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 主请求处理
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // API 路由
  if (path === '/api/edge/info' || path === '/api/edge/info/') {
    return handleEdgeInfo(request);
  }

  if (path === '/api/ping' || path === '/api/ping/') {
    return handlePing(request);
  }

  if (path.startsWith('/api/board/')) {
    return handleBoard(request, path);
  }

  if (path === '/api/ai/mindmap' || path === '/api/ai/mindmap/') {
    return handleMindMap(request);
  }

  // 静态文件回退
  if (env && env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 边缘信息
function handleEdgeInfo(request) {
  const headers = request.headers;
  const startTime = Date.now();

  const geoInfo = {
    ip: headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown',
    country: headers.get('x-geo-country') || headers.get('cf-ipcountry') || 'CN',
    region: headers.get('x-geo-region') || '',
    city: headers.get('x-geo-city') || '',
    latitude: headers.get('x-geo-latitude') || '',
    longitude: headers.get('x-geo-longitude') || '',
    timezone: headers.get('x-geo-timezone') || 'Asia/Shanghai',
  };

  const edgeNode = headers.get('x-edge-node') ||
                   headers.get('cf-ray')?.split('-')[1] ||
                   'CN-Shanghai';

  return new Response(JSON.stringify({
    success: true,
    timestamp: startTime,
    geo: geoInfo,
    edgeNode: edgeNode,
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Edge-Time': `${Date.now() - startTime}ms`,
    },
  });
}

// Ping 延迟测量
function handlePing(request) {
  const startTime = Date.now();
  return new Response(JSON.stringify({
    pong: true,
    timestamp: startTime,
    latency: Date.now() - startTime,
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

// 画板相关处理
async function handleBoard(request, path) {
  // 同步画板数据
  if (request.method === 'POST' && path.endsWith('/sync')) {
    const body = await request.json();
    const { boardId, data, timestamp } = body;

    if (!boardId || !data) {
      return new Response(JSON.stringify({ error: 'Missing boardId or data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    boardCache.set(`board:${boardId}`, {
      ...data,
      syncedAt: timestamp || Date.now(),
    });

    return new Response(JSON.stringify({
      success: true,
      syncedAt: Date.now(),
      message: '画板已同步到边缘节点',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 更新光标位置
  if (request.method === 'POST' && path.endsWith('/cursor')) {
    const body = await request.json();
    const { boardId, userId, position, userInfo } = body;

    if (!boardId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const collaborators = boardCache.get(`collaborators:${boardId}`) || [];
    const existingIndex = collaborators.findIndex((c) => c.id === userId);

    const collaboratorData = {
      id: userId,
      name: userInfo?.name || 'Anonymous',
      color: userInfo?.color || '#14b8a6',
      position,
      lastActive: Date.now(),
    };

    if (existingIndex >= 0) {
      collaborators[existingIndex] = collaboratorData;
    } else {
      collaborators.push(collaboratorData);
    }

    boardCache.set(`collaborators:${boardId}`, collaborators);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 获取画板数据
  if (request.method === 'GET') {
    const boardId = path.split('/board/')[1]?.split('/')[0];
    const data = boardCache.get(`board:${boardId}`);

    if (!data) {
      return new Response(JSON.stringify({ error: 'Board not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// AI 思维导图生成
async function handleMindMap(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { elements } = body;

    if (!elements || elements.length === 0) {
      return new Response(JSON.stringify({ error: 'No elements provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildMindMapPrompt(elements);

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的思维导图生成助手。分析白板内容，生成结构化思维导图。
输出格式必须是有效的 JSON：
{
  "id": "root",
  "text": "主题",
  "children": [{ "id": "branch1", "text": "分支1", "children": [] }]
}
只输出 JSON，不要有其他文字。`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // 流式响应
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  await writer.write(encoder.encode(content));
                }
              } catch (e) {}
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function buildMindMapPrompt(elements) {
  const descriptions = [];
  elements.forEach((el, index) => {
    switch (el.type) {
      case 'text':
      case 'sticky':
        descriptions.push(`${el.type === 'sticky' ? '便签' : '文本'} ${index + 1}: "${el.text}"`);
        break;
      case 'rect':
        descriptions.push(`矩形框 ${index + 1}`);
        break;
      case 'circle':
        descriptions.push(`圆形 ${index + 1}`);
        break;
    }
  });

  return `分析以下白板内容，生成思维导图：\n${descriptions.join('\n')}`;
}

export default {
  fetch: handleRequest
}
