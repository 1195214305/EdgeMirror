/**
 * EdgeMirror - Ping 延迟测量边缘函数
 * 用于测量客户端到边缘节点的网络延迟
 */

export async function onRequest(context) {
  const { request } = context;
  const startTime = Date.now();

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
