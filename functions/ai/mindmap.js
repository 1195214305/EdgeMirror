/**
 * EdgeMirror - AI 思维导图生成边缘函数
 * 路径: /api/ai/mindmap
 */

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-54ae495d0e8e4dfb92607467bfcdf357';

export default async function handler(request) {
  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const body = await request.json();
    const { elements } = body;

    if (!elements || elements.length === 0) {
      return new Response(JSON.stringify({ error: 'No elements provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 构建 Prompt
    const prompt = buildMindMapPrompt(elements);

    // 调用通义千问 API（流式响应）
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
            content: `你是一个专业的思维导图生成助手。你的任务是分析用户提供的白板内容，将其整理成结构化的思维导图。
输出格式必须是有效的 JSON，结构如下：
{
  "id": "root",
  "text": "主题",
  "children": [
    {
      "id": "branch1",
      "text": "分支1",
      "children": [
        { "id": "leaf1", "text": "叶子节点" }
      ]
    }
  ]
}
只输出 JSON，不要有其他文字。`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // 创建流式响应
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 处理流式响应
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
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Edge-AI': 'streaming',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('MindMap generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 构建思维导图生成 Prompt
function buildMindMapPrompt(elements) {
  const descriptions = [];

  elements.forEach((el, index) => {
    switch (el.type) {
      case 'text':
        descriptions.push(`文本 ${index + 1}: "${el.text}"`);
        break;
      case 'sticky':
        descriptions.push(`便签 ${index + 1}: "${el.text}"`);
        break;
      case 'rect':
        descriptions.push(`矩形框 ${index + 1}: 位置 (${Math.round(el.x)}, ${Math.round(el.y)})`);
        break;
      case 'circle':
        descriptions.push(`圆形 ${index + 1}: 位置 (${Math.round(el.x)}, ${Math.round(el.y)})`);
        break;
      case 'line':
        descriptions.push(`连接线 ${index + 1}: 从 (${Math.round(el.x1)}, ${Math.round(el.y1)}) 到 (${Math.round(el.x2)}, ${Math.round(el.y2)})`);
        break;
      case 'path':
        descriptions.push(`手绘路径 ${index + 1}: ${el.points?.length || 0} 个点`);
        break;
    }
  });

  return `请分析以下白板内容，生成一个结构化的思维导图：

白板元素：
${descriptions.join('\n')}

要求：
1. 识别主题和关键概念
2. 建立合理的层级关系
3. 每个分支不超过 5 个子节点
4. 总节点数不超过 20 个
5. 输出有效的 JSON 格式`;
}
