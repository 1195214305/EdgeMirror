import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBoardStore, useMindMapStore } from '../store'
import { generateMindMap, organizeCanvas } from '../utils/api'

// 图标
const Icons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  MindMap: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  Organize: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Summarize: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Wand: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
}

// AI 功能卡片
const AIFeatureCard = ({ icon: Icon, title, description, onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="w-full p-4 bg-canvas-50 rounded-xl text-left hover:bg-canvas-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-200 transition-colors">
        <Icon />
      </div>
      <div>
        <h4 className="font-medium text-canvas-900 mb-1">{title}</h4>
        <p className="text-sm text-canvas-500">{description}</p>
      </div>
    </div>
  </button>
)

export default function AIPanel({ boardId, onClose, onGenerateMindMap }) {
  const { boards } = useBoardStore()
  const { isGenerating, setGenerating, progress, setProgress } = useMindMapStore()
  const [activeFeature, setActiveFeature] = useState(null)
  const [result, setResult] = useState(null)

  const board = boards[boardId]
  const elements = board?.elements || []

  // 生成思维导图
  const handleGenerateMindMap = async () => {
    if (elements.length === 0) {
      alert('画板上还没有内容，请先绑制一些内容')
      return
    }

    setActiveFeature('mindmap')
    setGenerating(true)
    setProgress('正在分析画板内容...')

    try {
      const result = await generateMindMap(elements, (chunk) => {
        setProgress((prev) => prev + chunk)
      })
      setResult(result)
      // 跳转到思维导图页面
      onGenerateMindMap()
    } catch (error) {
      console.error('生成失败:', error)
      setProgress('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  // 智能整理
  const handleOrganize = async () => {
    if (elements.length === 0) {
      alert('画板上还没有内容')
      return
    }

    setActiveFeature('organize')
    setGenerating(true)
    setProgress('正在智能整理...')

    try {
      const result = await organizeCanvas(elements)
      setResult(result)
      setProgress('整理完成！')
    } catch (error) {
      console.error('整理失败:', error)
      setProgress('整理失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  // 内容总结
  const handleSummarize = async () => {
    if (elements.length === 0) {
      alert('画板上还没有内容')
      return
    }

    setActiveFeature('summarize')
    setGenerating(true)
    setProgress('正在生成总结...')

    // 模拟 AI 总结
    setTimeout(() => {
      setResult({
        summary: '这是一个关于项目规划的白板，包含了多个任务节点和流程图。主要涉及用户界面设计、后端开发和测试部署三个阶段。',
        keywords: ['项目规划', 'UI设计', '后端开发', '测试'],
        suggestions: [
          '建议添加时间节点',
          '可以细化每个阶段的子任务',
          '考虑添加负责人信息',
        ],
      })
      setProgress('')
      setGenerating(false)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="w-80 bg-white border-l border-canvas-200 flex flex-col"
    >
      {/* 头部 */}
      <div className="p-4 border-b border-canvas-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Sparkles />
          <h3 className="font-semibold text-canvas-900">AI 智能助手</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-canvas-100 text-canvas-500 transition-colors"
        >
          <Icons.Close />
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 画板状态 */}
        <div className="mb-6 p-3 bg-canvas-50 rounded-xl">
          <div className="text-sm text-canvas-500 mb-1">当前画板</div>
          <div className="font-medium text-canvas-900">{board?.name}</div>
          <div className="text-xs text-canvas-400 mt-1">
            {elements.length} 个元素
          </div>
        </div>

        {/* AI 功能列表 */}
        <div className="space-y-3">
          <AIFeatureCard
            icon={Icons.MindMap}
            title="生成思维导图"
            description="将画板内容智能转化为结构化思维导图"
            onClick={handleGenerateMindMap}
            isLoading={isGenerating && activeFeature === 'mindmap'}
          />

          <AIFeatureCard
            icon={Icons.Organize}
            title="智能整理"
            description="自动对齐、分组和美化画板元素"
            onClick={handleOrganize}
            isLoading={isGenerating && activeFeature === 'organize'}
          />

          <AIFeatureCard
            icon={Icons.Summarize}
            title="内容总结"
            description="AI 分析画板内容，生成摘要和建议"
            onClick={handleSummarize}
            isLoading={isGenerating && activeFeature === 'summarize'}
          />
        </div>

        {/* 进度显示 */}
        {isGenerating && (
          <div className="mt-6 p-4 bg-primary-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="loading-dots text-primary-600">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="text-sm text-primary-700">处理中...</span>
            </div>
            {progress && (
              <p className="text-xs text-primary-600 line-clamp-3">{progress}</p>
            )}
          </div>
        )}

        {/* 结果显示 */}
        {result && !isGenerating && activeFeature === 'summarize' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-canvas-50 rounded-xl">
              <h4 className="font-medium text-canvas-900 mb-2">内容摘要</h4>
              <p className="text-sm text-canvas-600">{result.summary}</p>
            </div>

            <div className="p-4 bg-canvas-50 rounded-xl">
              <h4 className="font-medium text-canvas-900 mb-2">关键词</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords?.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-canvas-50 rounded-xl">
              <h4 className="font-medium text-canvas-900 mb-2">优化建议</h4>
              <ul className="space-y-1">
                {result.suggestions?.map((suggestion, i) => (
                  <li key={i} className="text-sm text-canvas-600 flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-4 border-t border-canvas-200">
        <p className="text-xs text-canvas-400 text-center">
          AI 功能由通义千问提供支持
          <br />
          通过阿里云 ESA 边缘函数加速
        </p>
      </div>
    </motion.div>
  )
}
