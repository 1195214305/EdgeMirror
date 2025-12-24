/**
 * EdgeMirror - 画板同步边缘函数
 * 使用边缘 KV 存储实现画板数据的实时同步
 */

// 模拟边缘 KV 存储（实际部署时使用 ESA KV）
const boardCache = new Map();

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 同步画板数据
    if (request.method === 'POST' && path.endsWith('/sync')) {
      return await handleSync(request, env, corsHeaders);
    }

    // 获取画板数据
    if (request.method === 'GET' && path.includes('/board/')) {
      const boardId = path.split('/board/')[1]?.split('/')[0];
      return await handleGetBoard(boardId, env, corsHeaders);
    }

    // 获取协作者
    if (request.method === 'GET' && path.includes('/collaborators')) {
      const boardId = path.split('/board/')[1]?.split('/')[0];
      return await handleGetCollaborators(boardId, env, corsHeaders);
    }

    // 更新光标位置
    if (request.method === 'POST' && path.endsWith('/cursor')) {
      return await handleCursorUpdate(request, env, corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 同步画板数据
async function handleSync(request, env, corsHeaders) {
  const body = await request.json();
  const { boardId, data, timestamp } = body;

  if (!boardId || !data) {
    return new Response(JSON.stringify({ error: 'Missing boardId or data' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 存储到边缘 KV
  // 实际部署时: await env.BOARD_KV.put(`board:${boardId}`, JSON.stringify(data));
  boardCache.set(`board:${boardId}`, {
    ...data,
    syncedAt: timestamp || Date.now(),
  });

  // 记录同步日志
  const syncLog = {
    boardId,
    timestamp: Date.now(),
    elementsCount: data.elements?.length || 0,
    action: 'sync',
  };

  return new Response(JSON.stringify({
    success: true,
    syncedAt: syncLog.timestamp,
    message: '画板已同步到边缘节点',
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-Edge-Sync': 'true',
    },
  });
}

// 获取画板数据
async function handleGetBoard(boardId, env, corsHeaders) {
  if (!boardId) {
    return new Response(JSON.stringify({ error: 'Missing boardId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 从边缘 KV 获取
  // 实际部署时: const data = await env.BOARD_KV.get(`board:${boardId}`, 'json');
  const data = boardCache.get(`board:${boardId}`);

  if (!data) {
    return new Response(JSON.stringify({ error: 'Board not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Edge-Cache': 'HIT',
    },
  });
}

// 获取协作者列表
async function handleGetCollaborators(boardId, env, corsHeaders) {
  // 从边缘存储获取活跃协作者
  // 实际部署时使用 KV 或 Durable Objects
  const collaborators = boardCache.get(`collaborators:${boardId}`) || [];

  // 过滤掉超过 30 秒未活动的用户
  const activeCollaborators = collaborators.filter(
    (c) => Date.now() - c.lastActive < 30000
  );

  return new Response(JSON.stringify(activeCollaborators), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

// 更新光标位置
async function handleCursorUpdate(request, env, corsHeaders) {
  const body = await request.json();
  const { boardId, userId, position, userInfo } = body;

  if (!boardId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 更新协作者列表
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
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
