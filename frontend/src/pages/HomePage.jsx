import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoardStore, useRealtimeStore } from '../store'
import { getEdgeInfo, measureLatency } from '../utils/api'

// 图标组件
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Board: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
}

// 特性卡片
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white rounded-xl p-6 shadow-sm border border-canvas-100 hover:shadow-md transition-shadow"
  >
    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
      <Icon />
    </div>
    <h3 className="text-lg font-semibold text-canvas-900 mb-2">{title}</h3>
    <p className="text-canvas-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
)

// 画板卡片
const BoardCard = ({ board, onOpen, onDelete }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-xl border border-canvas-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* 预览区域 */}
      <div
        className="h-32 bg-canvas-50 relative cursor-pointer"
        onClick={() => onOpen(board.id)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {board.elements?.length > 0 ? (
            <div className="text-canvas-400 text-sm">
              {board.elements.length} 个元素
            </div>
          ) : (
            <div className="text-canvas-300 text-sm">空白画板</div>
          )}
        </div>
        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/5 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 font-medium text-sm">
            点击打开
          </span>
        </div>
      </div>

      {/* 信息区域 */}
      <div className="p-4">
        <h3 className="font-medium text-canvas-900 truncate mb-1">
          {board.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-canvas-400 text-xs">
            <Icons.Clock />
            <span>{formatDate(board.updatedAt)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(board.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-canvas-400 hover:text-red-500 transition-all"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// 状态指示器
const StatusIndicator = ({ latency, edgeNode, geoInfo }) => (
  <div className="fixed bottom-6 right-6 flex items-center gap-3">
    {/* 延迟显示 */}
    <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm">
      <span
        className={`w-2 h-2 rounded-full ${
          latency < 50 ? 'bg-green-500' : latency < 100 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />
      <span className="text-canvas-600">
        {latency > 0 ? `${latency}ms` : '测量中...'}
      </span>
    </div>

    {/* 边缘节点 */}
    {edgeNode && (
      <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-sm">
        <Icons.Globe />
        <span className="text-canvas-600">{edgeNode}</span>
      </div>
    )}

    {/* 地理位置 */}
    {geoInfo && (
      <div className="glass rounded-full px-4 py-2 text-sm text-canvas-600">
        {geoInfo.city || geoInfo.country || '未知位置'}
      </div>
    )}
  </div>
)

export default function HomePage() {
  const navigate = useNavigate()
  const { boards, createBoard, user } = useBoardStore()
  const { geoInfo, setGeoInfo, latency, setLatency, edgeNode, setEdgeNode } = useRealtimeStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [joinBoardId, setJoinBoardId] = useState('')

  // 获取边缘信息
  useEffect(() => {
    const fetchEdgeInfo = async () => {
      const info = await getEdgeInfo()
      if (info) {
        setGeoInfo(info.geo)
        setEdgeNode(info.edgeNode)
      }
    }
    fetchEdgeInfo()

    // 定期测量延迟
    const measureInterval = setInterval(async () => {
      const lat = await measureLatency()
      setLatency(lat)
    }, 5000)

    // 初始测量
    measureLatency().then(setLatency)

    return () => clearInterval(measureInterval)
  }, [])

  // 创建新画板
  const handleCreateBoard = () => {
    const name = newBoardName.trim() || '未命名画板'
    const boardId = createBoard(name)
    setNewBoardName('')
    setIsCreating(false)
    navigate(`/board/${boardId}`)
  }

  // 加入画板
  const handleJoinBoard = () => {
    if (joinBoardId.trim()) {
      navigate(`/board/${joinBoardId.trim()}`)
    }
  }

  // 删除画板
  const handleDeleteBoard = (boardId) => {
    if (confirm('确定要删除这个画板吗？')) {
      useBoardStore.setState((state) => {
        const { [boardId]: _, ...rest } = state.boards
        return { boards: rest }
      })
    }
  }

  const boardList = Object.values(boards).sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="min-h-screen bg-canvas-50">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-canvas-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="EdgeMirror" className="w-8 h-8" />
            <span className="text-xl font-semibold text-canvas-900">EdgeMirror</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-canvas-500">
              欢迎, <span className="text-canvas-700 font-medium">{user.name}</span>
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: user.color }}
            >
              {user.name[0]}
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero 区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-canvas-900 mb-4">
            全球实时协作白板
          </h1>
          <p className="text-lg text-canvas-500 max-w-2xl mx-auto mb-8">
            基于阿里云 ESA 边缘计算，毫秒级同步，AI 智能整理。
            <br />
            无需注册，分享链接即可开始协作。
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <Icons.Plus />
              创建新画板
            </button>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={joinBoardId}
                onChange={(e) => setJoinBoardId(e.target.value)}
                placeholder="输入画板 ID 加入"
                className="px-4 py-3 border border-canvas-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-48"
              />
              <button
                onClick={handleJoinBoard}
                disabled={!joinBoardId.trim()}
                className="px-4 py-3 bg-canvas-100 text-canvas-700 rounded-xl font-medium hover:bg-canvas-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                加入
              </button>
            </div>
          </div>
        </motion.div>

        {/* 特性展示 */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={Icons.Zap}
            title="毫秒级同步"
            description="基于 ESA 边缘节点，全球用户实时协作，延迟低至 10ms"
            delay={0.1}
          />
          <FeatureCard
            icon={Icons.Users}
            title="多人协作"
            description="支持多人同时编辑，实时显示协作者光标和操作"
            delay={0.2}
          />
          <FeatureCard
            icon={Icons.Sparkles}
            title="AI 智能整理"
            description="一键将涂鸦转化为专业思维导图，AI 自动分析归类"
            delay={0.3}
          />
          <FeatureCard
            icon={Icons.Globe}
            title="边缘存储"
            description="画板数据存储在边缘节点，就近访问，极速加载"
            delay={0.4}
          />
        </div>

        {/* 我的画板 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-canvas-900">我的画板</h2>
            <span className="text-sm text-canvas-400">{boardList.length} 个画板</span>
          </div>

          {boardList.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {boardList.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onOpen={(id) => navigate(`/board/${id}`)}
                    onDelete={handleDeleteBoard}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-canvas-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-canvas-100 flex items-center justify-center">
                <Icons.Board />
              </div>
              <p className="text-canvas-500 mb-4">还没有画板，创建一个开始协作吧</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                创建画板
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 创建画板弹窗 */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-canvas-900 mb-4">创建新画板</h3>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="输入画板名称"
                className="w-full px-4 py-3 border border-canvas-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-3 bg-canvas-100 text-canvas-700 rounded-xl font-medium hover:bg-canvas-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateBoard}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 状态指示器 */}
      <StatusIndicator latency={latency} edgeNode={edgeNode} geoInfo={geoInfo} />

      {/* 页脚 */}
      <footer className="border-t border-canvas-100 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-canvas-500">
              <span>Powered by</span>
              <a
                href="https://www.aliyun.com/product/esa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                阿里云 ESA
              </a>
            </div>
            <div className="text-sm text-canvas-400">
              EdgeMirror - 全球实时协作白板
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
