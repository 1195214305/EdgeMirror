/**
 * EdgeMirror - 边缘信息获取函数
 * 路径: /api/edge/info
 */

export default async function handler(request) {
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

  // 获取请求头中的地理信息
  const headers = request.headers;

  // 阿里云 ESA 提供的地理位置头
  const geoInfo = {
    ip: headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown',
    country: headers.get('x-geo-country') || headers.get('cf-ipcountry') || 'CN',
    region: headers.get('x-geo-region') || '',
    city: headers.get('x-geo-city') || '',
    latitude: headers.get('x-geo-latitude') || '',
    longitude: headers.get('x-geo-longitude') || '',
    timezone: headers.get('x-geo-timezone') || 'Asia/Shanghai',
  };

  // 边缘节点信息
  const edgeNode = headers.get('x-edge-node') ||
                   headers.get('cf-ray')?.split('-')[1] ||
                   'CN-Shanghai';

  // 计算请求处理时间
  const startTime = Date.now();

  const response = {
    success: true,
    timestamp: startTime,
    geo: geoInfo,
    edgeNode: edgeNode,
    headers: {
      userAgent: headers.get('user-agent'),
      acceptLanguage: headers.get('accept-language'),
    },
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Edge-Time': `${Date.now() - startTime}ms`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
