'use client'

import { motion } from 'framer-motion'

interface FloatingShapeProps {
  color: string
  size: number | string
  top?: string | number
  left?: string | number
  right?: string | number
  bottom?: string | number
  delay: number
  rotate?: number
  shape?: 'circle' | 'square' | 'triangle'
  type?: 'circle' | 'square' | 'triangle' // Alias for shape
  opacity?: number
}

export function FloatingShape({
  color,
  size,
  top,
  left,
  right,
  bottom,
  delay,
  rotate = 0,
  shape,
  type,
  opacity = 0.3
}: FloatingShapeProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size
  const actualShape = shape || type || 'circle'

  return (
    <motion.div
      initial={{ y: 0, rotate: rotate, scale: 0.8 }}
      animate={{
        y: [0, -30, 0],
        rotate: [rotate, rotate + 15, rotate - 15, rotate],
        scale: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut',
      }}
      className={`absolute neo-border neo-shadow-sm pointer-events-none ${
        actualShape === 'circle' ? 'rounded-full' : ''
      }`}
      style={{
        backgroundColor: color.startsWith('var(') ? color : color,
        width: sizeValue,
        height: sizeValue,
        top,
        left,
        right,
        bottom,
        opacity,
        zIndex: 0,
        clipPath:
          actualShape === 'triangle'
            ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
            : undefined,
      }}
    />
  )
}

