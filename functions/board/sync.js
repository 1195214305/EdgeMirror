/**
 * EdgeMirror - 画板同步边缘函数
 * 路径: /api/board/sync
 */

// 模拟边缘 KV 存储
const boardCache = new Map();

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    // 同步画板数据
    if (request.method === 'POST' && path.endsWith('/sync')) {
      return await handleSync(request);
    }

    // 获取画板数据
    if (request.method === 'GET' && path.includes('/board/')) {
      const boardId = path.split('/board/')[1]?.split('/')[0];
      return await handleGetBoard(boardId);
    }

    // 获取协作者
    if (request.method === 'GET' && path.includes('/collaborators')) {
      const boardId = path.split('/board/')[1]?.split('/')[0];
      return await handleGetCollaborators(boardId);
    }

    // 更新光标位置
    if (request.method === 'POST' && path.endsWith('/cursor')) {
      return await handleCursorUpdate(request);
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 同步画板数据
async function handleSync(request) {
  const body = await request.json();
  const { boardId, data, timestamp } = body;

  if (!boardId || !data) {
    return new Response(JSON.stringify({ error: 'Missing boardId or data' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  boardCache.set(`board:${boardId}`, {
    ...data,
    syncedAt: timestamp || Date.now(),
  });

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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Edge-Sync': 'true',
    },
  });
}

// 获取画板数据
async function handleGetBoard(boardId) {
  if (!boardId) {
    return new Response(JSON.stringify({ error: 'Missing boardId' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const data = boardCache.get(`board:${boardId}`);

  if (!data) {
    return new Response(JSON.stringify({ error: 'Board not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'X-Edge-Cache': 'HIT',
    },
  });
}

// 获取协作者列表
async function handleGetCollaborators(boardId) {
  const collaborators = boardCache.get(`collaborators:${boardId}`) || [];

  const activeCollaborators = collaborators.filter(
    (c) => Date.now() - c.lastActive < 30000
  );

  return new Response(JSON.stringify(activeCollaborators), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    },
  });
}

// 更新光标位置
async function handleCursorUpdate(request) {
  const body = await request.json();
  const { boardId, userId, position, userInfo } = body;

  if (!boardId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
