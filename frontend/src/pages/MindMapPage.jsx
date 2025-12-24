import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBoardStore, useMindMapStore } from '../store'

// 图标
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  ZoomIn: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  ),
  ZoomOut: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
  ),
}

// 思维导图节点组件
const MindMapNode = ({ node, level = 0, parentPosition = null, containerRef }) => {
  const nodeRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const colors = [
    { bg: 'bg-primary-100', border: 'border-primary-300', text: 'text-primary-800' },
    { bg: 'bg-accent-100', border: 'border-accent-300', text: 'text-accent-800' },
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
  ]

  const colorScheme = colors[level % colors.length]

  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      const containerRect = containerRef?.current?.getBoundingClientRect() || { left: 0, top: 0 }
      setPosition({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      })
    }
  }, [node])

  return (
    <div className="flex items-start">
      {/* 节点 */}
      <motion.div
        ref={nodeRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: level * 0.1 }}
        className={`
          ${level === 0 ? 'px-6 py-4' : 'px-4 py-2'}
          ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}
          rounded-xl border-2 shadow-sm
          ${level === 0 ? 'text-lg font-semibold' : 'text-sm'}
          max-w-xs
        `}
      >
        {node.text}
      </motion.div>

      {/* 子节点 */}
      {node.children && node.children.length > 0 && (
        <div className="ml-8 flex flex-col gap-3 relative">
          {/* 连接线 */}
          <svg
            className="absolute -left-6 top-0 h-full w-6 overflow-visible"
            style={{ pointerEvents: 'none' }}
          >
            {node.children.map((_, index) => (
              <path
                key={index}
                d={`M 0 ${20 + index * 50} Q 12 ${20 + index * 50} 24 ${20 + index * 50}`}
                stroke="#d4d4d4"
                strokeWidth="2"
                fill="none"
                className="connection-line"
              />
            ))}
          </svg>

          {node.children.map((child, index) => (
            <MindMapNode
              key={child.id || index}
              node={child}
              level={level + 1}
              parentPosition={position}
              containerRef={containerRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MindMapPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const { boards } = useBoardStore()
  const { mindMapData, setMindMapData, isGenerating, setGenerating, progress, setProgress } = useMindMapStore()

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const board = boards[boardId]

  // 模拟生成思维导图数据
  useEffect(() => {
    if (!mindMapData && board) {
      generateMindMapFromBoard()
    }
  }, [board])

  const generateMindMapFromBoard = async () => {
    setGenerating(true)
    setProgress('正在分析画板内容...')

    // 模拟 AI 生成过程
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProgress('正在构建思维导图结构...')

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setProgress('正在优化布局...')

    await new Promise((resolve) => setTimeout(resolve, 500))

    // 根据画板元素生成思维导图
    const elements = board?.elements || []

    // 模拟生成的思维导图数据
    const mockMindMap = {
      id: 'root',
      text: board?.name || '思维导图',
      children: [
        {
          id: 'branch1',
          text: '核心概念',
          children: [
            { id: 'leaf1-1', text: '实时协作' },
            { id: 'leaf1-2', text: '边缘计算' },
            { id: 'leaf1-3', text: 'AI 智能' },
          ],
        },
        {
          id: 'branch2',
          text: '技术架构',
          children: [
            { id: 'leaf2-1', text: 'React 前端' },
            { id: 'leaf2-2', text: 'ESA 边缘函数' },
            { id: 'leaf2-3', text: '通义千问 API' },
          ],
        },
        {
          id: 'branch3',
          text: '应用场景',
          children: [
            { id: 'leaf3-1', text: '团队头脑风暴' },
            { id: 'leaf3-2', text: '在线教学' },
            { id: 'leaf3-3', text: '项目规划' },
          ],
        },
        {
          id: 'branch4',
          text: '用户价值',
          children: [
            { id: 'leaf4-1', text: '提高效率' },
            { id: 'leaf4-2', text: '促进协作' },
          ],
        },
      ],
    }

    // 如果画板有内容，尝试从中提取信息
    if (elements.length > 0) {
      const textElements = elements.filter((el) => el.type === 'text' || el.type === 'sticky')
      if (textElements.length > 0) {
        mockMindMap.children[0].children = textElements.slice(0, 3).map((el, i) => ({
          id: `extracted-${i}`,
          text: el.text || '未命名',
        }))
      }
    }

    setMindMapData(mockMindMap)
    setGenerating(false)
    setProgress('')
  }

  // 重新生成
  const handleRegenerate = () => {
    setMindMapData(null)
    generateMindMapFromBoard()
  }

  // 导出为图片
  const handleExport = () => {
    // 简单的导出实现
    alert('导出功能开发中...')
  }

  // 缩放控制
  const handleZoomIn = () => setZoom((z) => Math.min(2, z + 0.1))
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.1))

  return (
    <div className="h-screen flex flex-col bg-canvas-50">
      {/* 顶部工具栏 */}
      <header className="h-14 bg-white border-b border-canvas-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/board/${boardId}`)}
            className="p-2 rounded-lg hover:bg-canvas-100 text-canvas-600 transition-colors"
          >
            <Icons.ArrowLeft />
          </button>
          <div className="h-6 w-px bg-canvas-200" />
          <div>
            <h1 className="font-medium text-canvas-900">AI 思维导图</h1>
            <p className="text-xs text-canvas-400">基于 "{board?.name}" 生成</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 缩放控制 */}
          <div className="flex items-center gap-1 bg-canvas-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-canvas-200 transition-colors"
            >
              <Icons.ZoomOut />
            </button>
            <span className="text-sm text-canvas-600 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-canvas-200 transition-colors"
            >
              <Icons.ZoomIn />
            </button>
          </div>

          {/* 重新生成 */}
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2 rounded-lg hover:bg-canvas-100 text-canvas-600 transition-colors disabled:opacity-50"
            title="重新生成"
          >
            <Icons.Refresh />
          </button>

          {/* 导出 */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Icons.Download />
            导出
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden relative">
        {isGenerating ? (
          // 加载状态
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="loading-dots text-primary-600 mb-4">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="text-canvas-600">{progress || '生成中...'}</p>
            </div>
          </div>
        ) : mindMapData ? (
          // 思维导图显示
          <div
            ref={containerRef}
            className="w-full h-full overflow-auto p-8"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <div className="min-w-max">
              <MindMapNode node={mindMapData} containerRef={containerRef} />
            </div>
          </div>
        ) : (
          // 空状态
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-canvas-500 mb-4">暂无思维导图数据</p>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                生成思维导图
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部状态栏 */}
      <footer className="h-8 bg-white border-t border-canvas-200 flex items-center justify-between px-4 text-xs text-canvas-500 flex-shrink-0">
        <div>
          {mindMapData && (
            <span>
              {countNodes(mindMapData)} 个节点
            </span>
          )}
        </div>
        <div>
          AI 思维导图由通义千问生成 · Powered by 阿里云 ESA
        </div>
      </footer>
    </div>
  )
}

// 计算节点数量
function countNodes(node) {
  if (!node) return 0
  let count = 1
  if (node.children) {
    node.children.forEach((child) => {
      count += countNodes(child)
    })
  }
  return count
}
