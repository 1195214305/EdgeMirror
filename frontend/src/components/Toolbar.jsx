import { motion } from 'framer-motion'
import { useBoardStore } from '../store'

// 工具图标
const ToolIcons = {
  select: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  pen: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  line: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20L20 4" />
    </svg>
  ),
  rect: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
    </svg>
  ),
  circle: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  ),
  text: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  ),
  sticky: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  eraser: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  hand: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  ),
}

// 颜色选项
const colors = [
  '#171717', // 黑色
  '#dc2626', // 红色
  '#ea580c', // 橙色
  '#ca8a04', // 黄色
  '#16a34a', // 绿色
  '#0891b2', // 青色
  '#2563eb', // 蓝色
  '#7c3aed', // 紫色
  '#db2777', // 粉色
]

// 线条粗细选项
const strokeWidths = [1, 2, 4, 6, 8]

// 工具配置
const tools = [
  { id: 'select', name: '选择', icon: ToolIcons.select },
  { id: 'hand', name: '移动', icon: ToolIcons.hand },
  { id: 'pen', name: '画笔', icon: ToolIcons.pen },
  { id: 'line', name: '直线', icon: ToolIcons.line },
  { id: 'rect', name: '矩形', icon: ToolIcons.rect },
  { id: 'circle', name: '圆形', icon: ToolIcons.circle },
  { id: 'text', name: '文字', icon: ToolIcons.text },
  { id: 'sticky', name: '便签', icon: ToolIcons.sticky },
  { id: 'eraser', name: '橡皮擦', icon: ToolIcons.eraser },
]

export default function Toolbar() {
  const { currentTool, setTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useBoardStore()

  return (
    <div className="w-16 bg-white border-r border-canvas-200 flex flex-col items-center py-4 gap-1">
      {/* 工具按钮 */}
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = currentTool === tool.id
        return (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTool(tool.id)}
            className={`tool-btn relative ${isActive ? 'active' : ''}`}
            title={tool.name}
          >
            <Icon />
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 bg-primary-100 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}

      {/* 分隔线 */}
      <div className="w-8 h-px bg-canvas-200 my-2" />

      {/* 颜色选择 */}
      <div className="relative group">
        <button
          className="w-8 h-8 rounded-lg border-2 border-canvas-200 transition-transform hover:scale-110"
          style={{ backgroundColor: strokeColor }}
          title="颜色"
        />
        {/* 颜色面板 */}
        <div className="absolute left-full ml-2 top-0 bg-white rounded-xl shadow-lg border border-canvas-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="grid grid-cols-3 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${
                  strokeColor === color ? 'ring-2 ring-primary-500 ring-offset-1' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 线条粗细 */}
      <div className="relative group mt-2">
        <button
          className="w-8 h-8 rounded-lg border border-canvas-200 flex items-center justify-center hover:bg-canvas-50 transition-colors"
          title="线条粗细"
        >
          <div
            className="rounded-full bg-canvas-800"
            style={{ width: strokeWidth * 2, height: strokeWidth * 2 }}
          />
        </button>
        {/* 粗细面板 */}
        <div className="absolute left-full ml-2 top-0 bg-white rounded-xl shadow-lg border border-canvas-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="flex flex-col gap-1">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`w-20 h-8 rounded-lg flex items-center justify-center hover:bg-canvas-50 transition-colors ${
                  strokeWidth === width ? 'bg-primary-50' : ''
                }`}
              >
                <div
                  className="rounded-full bg-canvas-800"
                  style={{ width: width * 3, height: width }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 底部空间 */}
      <div className="flex-1" />

      {/* 快捷键提示 */}
      <div className="text-[10px] text-canvas-400 text-center px-2">
        <div>V 选择</div>
        <div>P 画笔</div>
        <div>R 矩形</div>
      </div>
    </div>
  )
}
