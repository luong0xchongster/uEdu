import { useEffect, useRef } from 'react'

interface AntiCheatConfig {
  enabled?: boolean
  onTabSwitch?: (count: number) => void
  onTabFocus?: () => void
  onCopy?: () => void
  onPaste?: () => void
  maxTabSwitches?: number
  disableRightClick?: boolean
  disableDevTools?: boolean
}

interface AntiCheatReturn {
  tabSwitchCount: React.MutableRefObject<number>
  reset: () => void
  enable: () => void
  disable: () => void
}

export function useAntiCheat(config: AntiCheatConfig = {}): AntiCheatReturn {
  const {
    enabled = true,
    onTabSwitch,
    onTabFocus,
    onCopy,
    onPaste,
    maxTabSwitches = 3,
    disableRightClick = true,
    disableDevTools = true,
  } = config

  const tabSwitchCount = useRef(0)
  const isEnabled = useRef(enabled)
  const lastBlurTime = useRef(0)

  const handleVisibilityChange = () => {
    if (!isEnabled.current) return

    if (document.hidden) {
      lastBlurTime.current = Date.now()
    } else {
      const focusTime = Date.now()
      const timeAway = focusTime - lastBlurTime.current

      if (timeAway > 100) {
        tabSwitchCount.current++
        onTabSwitch?.(tabSwitchCount.current)

        if (tabSwitchCount.current >= maxTabSwitches) {
          disable()
        }
      }

      onTabFocus?.()
    }
  }

  const handleCopy = (e: ClipboardEvent) => {
    if (!isEnabled.current) return
    onCopy?.()

    if (disableDevTools) {
      e.preventDefault()
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    if (!isEnabled.current) return
    onPaste?.()

    if (disableDevTools) {
      e.preventDefault()
    }
  }

  const handleContextMenu = (e: MouseEvent) => {
    if (!isEnabled.current || !disableRightClick) return
    e.preventDefault()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEnabled.current || !disableDevTools) return

    const devToolsKeys = [
      'F12',
      'F5',
      'Control',
      'Shift',
      'Alt',
      'Meta',
    ]

    if (devToolsKeys.includes(e.key)) {
      if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
        e.preventDefault()
      }
    }

    if (e.key === 'F12') {
      e.preventDefault()
    }
  }

  const reset = () => {
    tabSwitchCount.current = 0
  }

  const enable = () => {
    isEnabled.current = true
  }

  const disable = () => {
    isEnabled.current = false
  }

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    if (disableRightClick) {
      document.addEventListener('contextmenu', handleContextMenu)
    }

    if (disableDevTools) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled])

  return {
    tabSwitchCount,
    reset,
    enable,
    disable,
  }
}
