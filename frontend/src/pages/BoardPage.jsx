import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoardStore, useRealtimeStore } from '../store'
import { syncBoard, fetchBoard, getEdgeInfo, measureLatency, generateMindMap } from '../utils/api'
import Toolbar from '../components/Toolbar'
import Canvas from '../components/Canvas'
import CollaboratorCursors from '../components/CollaboratorCursors'
import AIPanel from '../components/AIPanel'

// 图标
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
}

export default function BoardPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const { boards, user, setCurrentBoard, createBoard, updateBoardElements } = useBoardStore()
  const { geoInfo, setGeoInfo, latency, setLatency, edgeNode, setEdgeNode, isConnected, setConnected } = useRealtimeStore()

  const [showShareModal, setShowShareModal] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [collaborators, setCollaborators] = useState([])

  // 当前画板
  const board = boards[boardId]

  // 初始化
  useEffect(() => {
    setCurrentBoard(boardId)

    // 如果画板不存在，尝试从边缘获取或创建新的
    if (!board) {
      const initBoard = async () => {
        const remoteBoard = await fetchBoard(boardId)
        if (remoteBoard) {
          useBoardStore.setState((state) => ({
            boards: { ...state.boards, [boardId]: remoteBoard }
          }))
        } else {
          // 创建新画板
          useBoardStore.setState((state) => ({
            boards: {
              ...state.boards,
              [boardId]: {
                id: boardId,
                name: `画板 ${boardId}`,
                elements: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
            }
          }))
        }
      }
      initBoard()
    }

    // 获取边缘信息
    const fetchEdgeInfo = async () => {
      const info = await getEdgeInfo()
      if (info) {
        setGeoInfo(info.geo)
        setEdgeNode(info.edgeNode)
      }
      setConnected(true)
    }
    fetchEdgeInfo()

    // 定期测量延迟
    const latencyInterval = setInterval(async () => {
      const lat = await measureLatency()
      setLatency(lat)
    }, 5000)
    measureLatency().then(setLatency)

    // 模拟协作者（实际应通过 WebSocket 或轮询获取）
    const mockCollaborators = [
      { id: 'user1', name: '设计师小王', color: '#f59e0b', position: { x: 200, y: 150 } },
      { id: 'user2', name: '产品经理', color: '#6366f1', position: { x: 400, y: 300 } },
    ]
    setCollaborators(mockCollaborators)

    return () => {
      clearInterval(latencyInterval)
    }
  }, [boardId])

  // 同步画板数据
  const handleSync = useCallback(async () => {
    if (!board) return
    setIsSyncing(true)
    try {
      await syncBoard(boardId, board)
    } catch (error) {
      console.error('同步失败:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [boardId, board])

  // 自动同步
  useEffect(() => {
    if (!board) return
    const syncTimeout = setTimeout(handleSync, 2000)
    return () => clearTimeout(syncTimeout)
  }, [board?.elements])

  // 复制分享链接
  const handleCopyLink = () => {
    const url = `${window.location.origin}/board/${boardId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 导出画板
  const handleExport = () => {
    if (canvasRef.current) {
      canvasRef.current.exportAsImage()
    }
  }

  // AI 生成思维导图
  const handleGenerateMindMap = () => {
    navigate(`/mindmap/${boardId}`)
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-canvas-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots text-primary-600 mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-canvas-500">加载画板中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-canvas-100 overflow-hidden">
      {/* 顶部工具栏 */}
      <header className="h-14 bg-white border-b border-canvas-200 flex items-center justify-between px-4 flex-shrink-0">
        {/* 左侧 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-canvas-100 text-canvas-600 transition-colors"
          >
            <Icons.ArrowLeft />
          </button>
          <div className="h-6 w-px bg-canvas-200" />
          <div>
            <h1 className="font-medium text-canvas-900">{board.name}</h1>
            <div className="flex items-center gap-2 text-xs text-canvas-400">
              <span>ID: {boardId}</span>
              {isSyncing && <span className="text-primary-600">同步中...</span>}
            </div>
          </div>
        </div>

        {/* 中间 - 协作者 */}
        <div className="flex items-center gap-2">
          {/* 当前用户 */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name[0]}
          </div>
          {/* 其他协作者 */}
          {collaborators.slice(0, 3).map((c, i) => (
            <div
              key={c.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white -ml-2"
              style={{ backgroundColor: c.color, zIndex: 10 - i }}
              title={c.name}
            >
              {c.name[0]}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-canvas-200 flex items-center justify-center text-canvas-600 text-xs font-medium ring-2 ring-white -ml-2">
              +{collaborators.length - 3}
            </div>
          )}
          <span className="text-sm text-canvas-500 ml-2">
            {collaborators.length + 1} 人在线
          </span>
        </div>

        {/* 右侧 */}
        <div className="flex items-center gap-2">
          {/* 延迟指示 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas-50 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                latency < 50 ? 'bg-green-500' : latency < 100 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className="text-canvas-600">{latency > 0 ? `${latency}ms` : '--'}</span>
          </div>

          {/* AI 按钮 */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`p-2 rounded-lg transition-colors ${
              showAIPanel ? 'bg-primary-100 text-primary-700' : 'hover:bg-canvas-100 text-canvas-600'
            }`}
            title="AI 智能助手"
          >
            <Icons.Sparkles />
          </button>

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-canvas-100 text-canvas-600 transition-colors"
            title="导出图片"
          >
            <Icons.Download />
          </button>

          {/* 分享按钮 */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Icons.Share />
            分享
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧工具栏 */}
        <Toolbar />

        {/* 画布区域 */}
        <div className="flex-1 relative">
          <Canvas ref={canvasRef} boardId={boardId} />
          <CollaboratorCursors collaborators={collaborators} />
        </div>

        {/* AI 面板 */}
        <AnimatePresence>
          {showAIPanel && (
            <AIPanel
              boardId={boardId}
              onClose={() => setShowAIPanel(false)}
              onGenerateMindMap={handleGenerateMindMap}
            />
          )}
        </AnimatePresence>
      </div>

      {/* 底部状态栏 */}
      <footer className="h-8 bg-white border-t border-canvas-200 flex items-center justify-between px-4 text-xs text-canvas-500 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>{board.elements?.length || 0} 个元素</span>
          {edgeNode && <span>边缘节点: {edgeNode}</span>}
        </div>
        <div className="flex items-center gap-4">
          {geoInfo && <span>{geoInfo.city || geoInfo.country}</span>}
          <span>Powered by 阿里云 ESA</span>
        </div>
      </footer>

      {/* 分享弹窗 */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-canvas-900 mb-2">分享画板</h3>
              <p className="text-canvas-500 text-sm mb-4">
                分享链接给他人，即可实时协作编辑
              </p>

              <div className="flex items-center gap-2 p-3 bg-canvas-50 rounded-xl mb-4">
                <input
                  type="text"
                  value={`${window.location.origin}/board/${boardId}`}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-canvas-700 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-colors ${
                    copied ? 'bg-green-100 text-green-600' : 'bg-canvas-200 text-canvas-600 hover:bg-canvas-300'
                  }`}
                >
                  {copied ? <Icons.Check /> : <Icons.Copy />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-canvas-500 mb-6">
                <Icons.Users />
                <span>当前 {collaborators.length + 1} 人在线协作</span>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-3 bg-canvas-100 text-canvas-700 rounded-xl font-medium hover:bg-canvas-200 transition-colors"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
