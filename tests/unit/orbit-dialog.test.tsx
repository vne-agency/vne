import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useOrbitDialogTransition } from '@/components/experiments/ascii-stars/useOrbitDialogTransition'

const lenis = vi.hoisted(() => ({ stop: vi.fn(), start: vi.fn(), isStopped: false }))
vi.mock('lenis/react', () => ({ useLenis: () => lenis }))

function Dialog({ onClose, returnTarget }: { onClose: () => void; returnTarget?: HTMLElement }) {
  const { dialogRef, panelRef, contentRef, closeRef, requestClose } = useOrbitDialogTransition({
    onClose,
    getReturnFocus: () => returnTarget,
  })
  return (
    <dialog ref={dialogRef} aria-label="Project details">
      <div ref={panelRef}>
        <button ref={closeRef} type="button" onClick={() => requestClose()}>
          Close
        </button>
        <div ref={contentRef}>Project</div>
      </div>
    </dialog>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  lenis.isStopped = false
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.open = true
    }),
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) {
      this.open = false
    }),
  })
})

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  document.documentElement.style.overflow = ''
  document.documentElement.style.scrollbarGutter = ''
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Orbit dialog lifecycle', () => {
  it('locks background scroll and restores its previous state and trigger on close', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    document.documentElement.style.overflow = 'clip'
    document.documentElement.style.scrollbarGutter = 'auto'
    const onClose = vi.fn()
    render(<Dialog onClose={onClose} />)

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(lenis.stop).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(trigger).toHaveFocus()
    expect(document.documentElement.style.overflow).toBe('clip')
    expect(document.documentElement.style.scrollbarGutter).toBe('auto')
    expect(lenis.start).toHaveBeenCalledOnce()
  })

  it('restores focus to the newly selected case without reopening the dialog', () => {
    const trigger = document.createElement('button')
    const nextCase = document.createElement('button')
    document.body.append(trigger, nextCase)
    trigger.focus()
    const onClose = vi.fn()
    const view = render(<Dialog onClose={onClose} />)
    view.rerender(<Dialog onClose={onClose} returnTarget={nextCase} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(nextCase).toHaveFocus()
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('follows the keyboard viewport and leaves native pinch zoom intact', () => {
    vi.useFakeTimers()
    const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 })
    vi.stubGlobal('visualViewport', viewport)
    const view = render(<Dialog onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')

    act(() => {
      viewport.height = 390
      viewport.offsetTop = 60
      viewport.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(20)
    })
    expect(dialog.style.getPropertyValue('--dialog-viewport-height')).toBe('390px')
    expect(dialog.style.getPropertyValue('--dialog-viewport-top')).toBe('60px')

    act(() => {
      viewport.scale = 2
      viewport.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(20)
    })
    expect(dialog.style.getPropertyValue('--dialog-viewport-height')).toBe('')
    expect(dialog.style.getPropertyValue('--dialog-viewport-top')).toBe('')

    view.unmount()
    expect(document.documentElement.style.overflow).toBe('')
    expect(lenis.start).toHaveBeenCalledOnce()
  })
})
