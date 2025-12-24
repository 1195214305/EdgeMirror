/**
 * EdgeMirror - Ping 延迟测量边缘函数
 * 路径: /api/ping
 */

export default async function handler(request) {
  const startTime = Date.now();

  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // 获取边缘节点信息
  const edgeNode = request.headers.get('x-edge-node') ||
                   request.headers.get('cf-ray')?.split('-')[1] ||
                   'unknown';

  return new Response(JSON.stringify({
    pong: true,
    timestamp: startTime,
    edgeNode: edgeNode,
    serverTime: new Date().toISOString(),
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}
