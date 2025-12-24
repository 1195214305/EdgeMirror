import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useBoardStore } from '../store'

const Canvas = forwardRef(({ boardId }, ref) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [currentPath, setCurrentPath] = useState([])

  const {
    boards,
    currentTool,
    strokeColor,
    strokeWidth,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    showGrid,
    addElement,
    updateElement,
    deleteElement,
  } = useBoardStore()

  const board = boards[boardId]
  const elements = board?.elements || []

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    exportAsImage: () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // 创建临时画布用于导出
      const exportCanvas = document.createElement('canvas')
      const ctx = exportCanvas.getContext('2d')
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height

      // 填充白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

      // 复制内容
      ctx.drawImage(canvas, 0, 0)

      // 下载
      const link = document.createElement('a')
      link.download = `edgemirror-${boardId}-${Date.now()}.png`
      link.href = exportCanvas.toDataURL('image/png')
      link.click()
    },
    getElements: () => elements,
  }))

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // 重绘
      redraw()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // 重绘画布
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制网格
    if (showGrid) {
      drawGrid(ctx, width, height)
    }

    // 应用变换
    ctx.save()
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(zoom, zoom)

    // 绘制所有元素
    elements.forEach((element) => {
      drawElement(ctx, element)
    })

    // 绘制当前正在绘制的路径
    if (isDrawing && currentPath.length > 0) {
      drawPath(ctx, currentPath, strokeColor, strokeWidth)
    }

    ctx.restore()
  }, [elements, zoom, panOffset, showGrid, isDrawing, currentPath, strokeColor, strokeWidth])

  // 监听变化重绘
  useEffect(() => {
    redraw()
  }, [redraw])

  // 绘制网格
  const drawGrid = (ctx, width, height) => {
    const gridSize = 20 * zoom
    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 0.5

    const offsetX = panOffset.x % gridSize
    const offsetY = panOffset.y % gridSize

    ctx.beginPath()
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
  }

  // 绘制元素
  const drawElement = (ctx, element) => {
    ctx.strokeStyle = element.strokeColor || '#171717'
    ctx.fillStyle = element.fillColor || 'transparent'
    ctx.lineWidth = element.strokeWidth || 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (element.type) {
      case 'path':
        drawPath(ctx, element.points, element.strokeColor, element.strokeWidth)
        break
      case 'line':
        ctx.beginPath()
        ctx.moveTo(element.x1, element.y1)
        ctx.lineTo(element.x2, element.y2)
        ctx.stroke()
        break
      case 'rect':
        ctx.beginPath()
        ctx.rect(element.x, element.y, element.width, element.height)
        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fill()
        }
        ctx.stroke()
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2)
        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fill()
        }
        ctx.stroke()
        break
      case 'text':
        ctx.font = `${element.fontSize || 16}px Inter, sans-serif`
        ctx.fillStyle = element.strokeColor || '#171717'
        ctx.fillText(element.text, element.x, element.y)
        break
      case 'sticky':
        // 便签背景
        ctx.fillStyle = element.bgColor || '#fef3c7'
        ctx.fillRect(element.x, element.y, element.width || 150, element.height || 100)
        // 便签边框
        ctx.strokeStyle = '#fcd34d'
        ctx.lineWidth = 1
        ctx.strokeRect(element.x, element.y, element.width || 150, element.height || 100)
        // 便签文字
        ctx.fillStyle = '#171717'
        ctx.font = '14px Inter, sans-serif'
        const lines = (element.text || '').split('\n')
        lines.forEach((line, i) => {
          ctx.fillText(line, element.x + 10, element.y + 25 + i * 20)
        })
        break
    }
  }

  // 绘制路径
  const drawPath = (ctx, points, color, width) => {
    if (points.length < 2) return

    ctx.strokeStyle = color || '#171717'
    ctx.lineWidth = width || 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1]
      const p1 = points[i]
      const midX = (p0.x + p1.x) / 2
      const midY = (p0.y + p1.y) / 2
      ctx.quadraticCurveTo(p0.x, p0.y, midX, midY)
    }

    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
    ctx.stroke()
  }

  // 获取鼠标在画布上的坐标
  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    }
  }

  // 鼠标按下
  const handleMouseDown = (e) => {
    const point = getCanvasPoint(e)
    setStartPoint(point)

    if (currentTool === 'hand') {
      setIsDrawing(true)
      return
    }

    if (currentTool === 'pen') {
      setIsDrawing(true)
      setCurrentPath([point])
    } else if (['line', 'rect', 'circle'].includes(currentTool)) {
      setIsDrawing(true)
    } else if (currentTool === 'text') {
      const text = prompt('输入文字:')
      if (text) {
        addElement(boardId, {
          type: 'text',
          x: point.x,
          y: point.y,
          text,
          strokeColor,
          fontSize: 16,
        })
      }
    } else if (currentTool === 'sticky') {
      const text = prompt('输入便签内容:')
      if (text) {
        addElement(boardId, {
          type: 'sticky',
          x: point.x,
          y: point.y,
          text,
          width: 150,
          height: 100,
          bgColor: '#fef3c7',
        })
      }
    } else if (currentTool === 'eraser') {
      // 查找并删除点击位置的元素
      const clickedElement = findElementAtPoint(point)
      if (clickedElement) {
        deleteElement(boardId, clickedElement.id)
      }
    }
  }

  // 鼠标移动
  const handleMouseMove = (e) => {
    if (!isDrawing) return

    const point = getCanvasPoint(e)

    if (currentTool === 'hand') {
      const dx = e.movementX
      const dy = e.movementY
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy,
      })
      return
    }

    if (currentTool === 'pen') {
      setCurrentPath((prev) => [...prev, point])
    }

    redraw()

    // 实时预览形状
    if (['line', 'rect', 'circle'].includes(currentTool) && startPoint) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      ctx.save()
      ctx.translate(panOffset.x, panOffset.y)
      ctx.scale(zoom, zoom)

      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.setLineDash([5, 5])

      if (currentTool === 'line') {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      } else if (currentTool === 'rect') {
        ctx.beginPath()
        ctx.rect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y)
        ctx.stroke()
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
        )
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    }
  }

  // 鼠标松开
  const handleMouseUp = (e) => {
    if (!isDrawing) return

    const point = getCanvasPoint(e)

    if (currentTool === 'pen' && currentPath.length > 1) {
      addElement(boardId, {
        type: 'path',
        points: currentPath,
        strokeColor,
        strokeWidth,
      })
    } else if (currentTool === 'line' && startPoint) {
      addElement(boardId, {
        type: 'line',
        x1: startPoint.x,
        y1: startPoint.y,
        x2: point.x,
        y2: point.y,
        strokeColor,
        strokeWidth,
      })
    } else if (currentTool === 'rect' && startPoint) {
      addElement(boardId, {
        type: 'rect',
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y),
        strokeColor,
        strokeWidth,
      })
    } else if (currentTool === 'circle' && startPoint) {
      const radius = Math.sqrt(
        Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
      )
      addElement(boardId, {
        type: 'circle',
        x: startPoint.x,
        y: startPoint.y,
        radius,
        strokeColor,
        strokeWidth,
      })
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPath([])
  }

  // 查找点击位置的元素
  const findElementAtPoint = (point) => {
    // 简单的碰撞检测
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i]
      if (el.type === 'rect') {
        if (
          point.x >= el.x &&
          point.x <= el.x + el.width &&
          point.y >= el.y &&
          point.y <= el.y + el.height
        ) {
          return el
        }
      } else if (el.type === 'circle') {
        const dist = Math.sqrt(Math.pow(point.x - el.x, 2) + Math.pow(point.y - el.y, 2))
        if (dist <= el.radius) {
          return el
        }
      } else if (el.type === 'sticky') {
        if (
          point.x >= el.x &&
          point.x <= el.x + (el.width || 150) &&
          point.y >= el.y &&
          point.y <= el.y + (el.height || 100)
        ) {
          return el
        }
      }
      // 路径和线条的碰撞检测更复杂，这里简化处理
    }
    return null
  }

  // 滚轮缩放
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta))
    setZoom(newZoom)
  }

  // 获取光标样式
  const getCursor = () => {
    switch (currentTool) {
      case 'select':
        return 'default'
      case 'hand':
        return isDrawing ? 'grabbing' : 'grab'
      case 'pen':
        return 'crosshair'
      case 'eraser':
        return 'pointer'
      default:
        return 'crosshair'
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full canvas-container"
      style={{ cursor: getCursor() }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="block"
      />

      {/* 缩放控制 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-canvas-200 p-1">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="w-8 h-8 flex items-center justify-center hover:bg-canvas-100 rounded transition-colors"
        >
          -
        </button>
        <span className="text-sm text-canvas-600 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(5, zoom + 0.1))}
          className="w-8 h-8 flex items-center justify-center hover:bg-canvas-100 rounded transition-colors"
        >
          +
        </button>
        <div className="w-px h-6 bg-canvas-200" />
        <button
          onClick={() => {
            setZoom(1)
            setPanOffset({ x: 0, y: 0 })
          }}
          className="px-2 h-8 flex items-center justify-center hover:bg-canvas-100 rounded transition-colors text-sm text-canvas-600"
        >
          重置
        </button>
      </div>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
