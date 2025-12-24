import { motion, AnimatePresence } from 'framer-motion'

// 光标 SVG
const CursorIcon = ({ color }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1L6 14L8 8L14 6L1 1Z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

export default function CollaboratorCursors({ collaborators }) {
  return (
    <AnimatePresence>
      {collaborators.map((collaborator) => (
        <motion.div
          key={collaborator.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="collaborator-cursor"
          style={{
            left: collaborator.position?.x || 0,
            top: collaborator.position?.y || 0,
            '--cursor-color': collaborator.color,
          }}
          data-name={collaborator.name}
        >
          <CursorIcon color={collaborator.color} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
