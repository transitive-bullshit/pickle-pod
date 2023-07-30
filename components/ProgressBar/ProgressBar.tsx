import * as React from 'react'
import cs from 'clsx'

import styles from './styles.module.css'

export interface ProgressBarProps {
  value: number
  backgroundColor?: string
  progressColor?: string
  onSeek?: (value: number) => void
  buffering?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  backgroundColor = 'lightgray',
  progressColor = 'blue',
  onSeek,
  buffering = false
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!onSeek) return
    const rect = (event.target as Element).getBoundingClientRect()
    const x = event.clientX - rect.left // X position within the element.
    const width = rect.right - rect.left // Element width.
    const clickedValue = (x / width) * 100 // Relative (percentage) clicked position.
    onSeek(clickedValue)
  }

  return (
    <div
      className={cs(styles.progressBar)}
      style={{ backgroundColor }}
      onClick={handleClick}
    >
      <div
        className={cs(styles.progressBar__fill, {
          [styles.buffering]: buffering
        })}
        style={{ width: `${value}%`, backgroundColor: progressColor }}
      />
      <div
        className={cs(styles.progressBar__head)}
        style={{ left: `${value}%`, backgroundColor: progressColor }}
      />
    </div>
  )
}
