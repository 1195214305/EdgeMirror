import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// 生成随机颜色
const generateColor = () => {
  const colors = [
    '#14b8a6', '#f59e0b', '#6366f1', '#ec4899',
    '#10b981', '#8b5cf6', '#f97316', '#06b6d4'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成随机用户名
const generateUsername = () => {
  const adjectives = ['快乐的', '聪明的', '勤奋的', '创意的', '友善的', '活力的']
  const nouns = ['设计师', '开发者', '创作者', '思考者', '探索者', '梦想家']
  return adjectives[Math.floor(Math.random() * adjectives.length)] +
         nouns[Math.floor(Math.random() * nouns.length)]
}

// 画板状态
export const useBoardStore = create(
  persist(
    (set, get) => ({
      // 当前用户信息
      user: {
        id: uuidv4(),
        name: generateUsername(),
        color: generateColor(),
      },

      // 当前画板ID
      currentBoardId: null,

      // 画板数据
      boards: {},

      // 协作者列表
      collaborators: [],

      // 当前工具
      currentTool: 'select',

      // 画笔颜色
      strokeColor: '#171717',

      // 画笔粗细
      strokeWidth: 2,

      // 是否显示网格
      showGrid: true,

      // 缩放级别
      zoom: 1,

      // 画布偏移
      panOffset: { x: 0, y: 0 },

      // 历史记录
      history: [],
      historyIndex: -1,

      // 设置当前画板
      setCurrentBoard: (boardId) => set({ currentBoardId: boardId }),

      // 创建新画板
      createBoard: (name = '未命名画板') => {
        const boardId = uuidv4().slice(0, 8)
        const newBoard = {
          id: boardId,
          name,
          elements: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({
          boards: { ...state.boards, [boardId]: newBoard },
          currentBoardId: boardId,
        }))
        return boardId
      },

      // 更新画板元素
      updateBoardElements: (boardId, elements) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              elements,
              updatedAt: Date.now(),
            },
          },
        }))
      },

      // 添加元素
      addElement: (boardId, element) => {
        const newElement = {
          id: uuidv4(),
          ...element,
          createdAt: Date.now(),
          createdBy: get().user.id,
        }
        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                elements: [...board.elements, newElement],
                updatedAt: Date.now(),
              },
            },
          }
        })
        return newElement
      },

      // 更新元素
      updateElement: (boardId, elementId, updates) => {
        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                elements: board.elements.map((el) =>
                  el.id === elementId ? { ...el, ...updates } : el
                ),
                updatedAt: Date.now(),
              },
            },
          }
        })
      },

      // 删除元素
      deleteElement: (boardId, elementId) => {
        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                elements: board.elements.filter((el) => el.id !== elementId),
                updatedAt: Date.now(),
              },
            },
          }
        })
      },

      // 设置工具
      setTool: (tool) => set({ currentTool: tool }),

      // 设置画笔颜色
      setStrokeColor: (color) => set({ strokeColor: color }),

      // 设置画笔粗细
      setStrokeWidth: (width) => set({ strokeWidth: width }),

      // 切换网格显示
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

      // 设置缩放
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

      // 设置偏移
      setPanOffset: (offset) => set({ panOffset: offset }),

      // 更新协作者
      updateCollaborators: (collaborators) => set({ collaborators }),

      // 更新用户名
      updateUsername: (name) => set((state) => ({
        user: { ...state.user, name }
      })),

      // 清空画板
      clearBoard: (boardId) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              elements: [],
              updatedAt: Date.now(),
            },
          },
        }))
      },
    }),
    {
      name: 'edgemirror-storage',
      partialize: (state) => ({
        user: state.user,
        boards: state.boards,
      }),
    }
  )
)

// AI 思维导图状态
export const useMindMapStore = create((set, get) => ({
  // 思维导图数据
  mindMapData: null,

  // 生成状态
  isGenerating: false,

  // 生成进度
  progress: '',

  // 错误信息
  error: null,

  // 设置思维导图数据
  setMindMapData: (data) => set({ mindMapData: data }),

  // 设置生成状态
  setGenerating: (isGenerating) => set({ isGenerating }),

  // 设置进度
  setProgress: (progress) => set({ progress }),

  // 设置错误
  setError: (error) => set({ error }),

  // 重置状态
  reset: () => set({
    mindMapData: null,
    isGenerating: false,
    progress: '',
    error: null,
  }),
}))

// 实时协作状态
export const useRealtimeStore = create((set, get) => ({
  // 连接状态
  isConnected: false,

  // 协作者光标位置
  cursors: {},

  // 地理位置信息
  geoInfo: null,

  // 延迟信息
  latency: 0,

  // 边缘节点信息
  edgeNode: null,

  // 设置连接状态
  setConnected: (isConnected) => set({ isConnected }),

  // 更新光标位置
  updateCursor: (userId, position) => {
    set((state) => ({
      cursors: {
        ...state.cursors,
        [userId]: position,
      },
    }))
  },

  // 移除光标
  removeCursor: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.cursors
      return { cursors: rest }
    })
  },

  // 设置地理信息
  setGeoInfo: (geoInfo) => set({ geoInfo }),

  // 设置延迟
  setLatency: (latency) => set({ latency }),

  // 设置边缘节点
  setEdgeNode: (edgeNode) => set({ edgeNode }),
}))
