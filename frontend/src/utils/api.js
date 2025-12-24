import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 获取边缘节点信息和地理位置
export const getEdgeInfo = async () => {
  try {
    const response = await api.get('/edge/info')
    return response.data
  } catch (error) {
    console.error('获取边缘信息失败:', error)
    return null
  }
}

// 同步画板数据到边缘存储
export const syncBoard = async (boardId, data) => {
  try {
    const response = await api.post(`/board/sync`, {
      boardId,
      data,
      timestamp: Date.now(),
    })
    return response.data
  } catch (error) {
    console.error('同步画板失败:', error)
    throw error
  }
}

// 从边缘存储获取画板数据
export const fetchBoard = async (boardId) => {
  try {
    const response = await api.get(`/board/${boardId}`)
    return response.data
  } catch (error) {
    console.error('获取画板失败:', error)
    return null
  }
}

// 发送光标位置（实时协作）
export const sendCursorPosition = async (boardId, userId, position, userInfo) => {
  try {
    await api.post(`/board/cursor`, {
      boardId,
      userId,
      position,
      userInfo,
      timestamp: Date.now(),
    })
  } catch (error) {
    // 静默失败，不影响用户体验
  }
}

// 获取协作者信息
export const getCollaborators = async (boardId) => {
  try {
    const response = await api.get(`/board/${boardId}/collaborators`)
    return response.data
  } catch (error) {
    console.error('获取协作者失败:', error)
    return []
  }
}

// AI 生成思维导图（流式响应）
export const generateMindMap = async (elements, onProgress) => {
  try {
    const response = await fetch('/api/ai/mindmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ elements }),
    })

    if (!response.ok) {
      throw new Error('生成失败')
    }

    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let result = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      result += chunk

      // 回调进度
      if (onProgress) {
        onProgress(chunk)
      }
    }

    // 解析最终结果
    try {
      return JSON.parse(result)
    } catch {
      return { raw: result }
    }
  } catch (error) {
    console.error('生成思维导图失败:', error)
    throw error
  }
}

// AI 智能整理画布内容
export const organizeCanvas = async (elements) => {
  try {
    const response = await api.post('/ai/organize', { elements })
    return response.data
  } catch (error) {
    console.error('整理画布失败:', error)
    throw error
  }
}

// 导出画板为图片
export const exportBoard = async (boardId, format = 'png') => {
  try {
    const response = await api.get(`/board/${boardId}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('导出失败:', error)
    throw error
  }
}

// 获取热门模板
export const getTemplates = async () => {
  try {
    const response = await api.get('/templates')
    return response.data
  } catch (error) {
    console.error('获取模板失败:', error)
    return []
  }
}

// 测量延迟
export const measureLatency = async () => {
  const start = performance.now()
  try {
    await api.get('/ping')
    return Math.round(performance.now() - start)
  } catch {
    return -1
  }
}

export default api
