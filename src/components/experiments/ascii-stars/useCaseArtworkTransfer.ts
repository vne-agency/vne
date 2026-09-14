'use client'

import { animate } from 'motion'
import { useLayoutEffect, type RefObject } from 'react'

import {
  caseInterfaceFreezeEvent,
  caseInterfaceScale,
  type CaseInterfacePose,
} from './case-interface-state'
import type { OrbitDialogMotion, OrbitDialogOrigin } from './useOrbitDialogTransition'

export type CaseArtworkSnapshot = {
  bitmap: HTMLCanvasElement
  host: HTMLElement
  bounds: OrbitDialogOrigin
  pose: CaseInterfacePose
  background: string
}

export function galleryArtwork(slug: string) {
  return document.querySelector<HTMLElement>(
    `[data-case-preview] [data-case-interface="${CSS.escape(slug)}"]`,
  )
}

export function captureCaseArtwork(
  host: HTMLElement | null,
  pose?: CaseInterfacePose,
): CaseArtworkSnapshot | undefined {
  const canvas = host?.querySelector('canvas')
  if (!host || !canvas || !canvas.width || !canvas.height) return
  host.dispatchEvent(new CustomEvent(caseInterfaceFreezeEvent, { detail: pose }))
  const { top, left, width, height } = host.getBoundingClientRect()
  if (!width || !height) return
  const bitmap = document.createElement('canvas')
  bitmap.width = canvas.width
  bitmap.height = canvas.height
  const context = bitmap.getContext('2d')
  if (!context) return
  context.drawImage(canvas, 0, 0)
  return {
    bitmap,
    host,
    bounds: { top, left, width, height },
    pose: { yaw: Number(host.dataset.yaw ?? -0.12), pitch: Number(host.dataset.pitch ?? 0.06) },
    background: host.dataset.caseInterface === 'arc-store' ? '#1c1d19' : '#e8e7e3',
  }
}

/** A single bitmap travels between the two canvases; the live renderers keep their pose. */
export function useCaseArtworkTransfer({
  dialogRef,
  overlayRef,
  motionRef,
  snapshot,
  slug,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>
  overlayRef: RefObject<HTMLCanvasElement | null>
  motionRef: RefObject<OrbitDialogMotion | null>
  snapshot?: CaseArtworkSnapshot
  slug: string
}) {
  useLayoutEffect(() => {
    const overlay = overlayRef.current
    const dialog = dialogRef.current
    const context = overlay?.getContext('2d')
    if (!overlay || !dialog || !context) return
    let flight: { stop: () => void } | undefined
    let progress = 0
    let image = snapshot
    let from: OrbitDialogOrigin | undefined
    let to: OrbitDialogOrigin | undefined
    const hidden = new Set<HTMLElement>()
    const destination = () => dialog.querySelector<HTMLElement>('[data-case-interface]')
    const hide = (host: HTMLElement | null | undefined) => {
      if (!host) return
      hidden.add(host)
      host.setAttribute('data-transfer-hidden', '')
    }
    const show = (host: HTMLElement | null) => {
      host?.removeAttribute('data-transfer-hidden')
      if (host) hidden.delete(host)
    }
    const clear = () => {
      flight?.stop()
      flight = undefined
      context.clearRect(0, 0, overlay.width, overlay.height)
      overlay.dataset.active = 'false'
    }
    const restore = () => {
      clear()
      hidden.forEach((host) => host.removeAttribute('data-transfer-hidden'))
      hidden.clear()
    }
    const draw = (value: number) => {
      progress = value
      if (!image || !from || !to) return
      const mix = (a: number, b: number) => a + (b - a) * value
      const rect = {
        left: mix(from.left, to.left),
        top: mix(from.top, to.top),
        width: mix(from.width, to.width),
        height: mix(from.height, to.height),
      }
      const scale =
        caseInterfaceScale(rect.width, rect.height) /
        caseInterfaceScale(image.bounds.width, image.bounds.height)
      const width = image.bounds.width * scale
      const height = image.bounds.height * scale
      context.clearRect(0, 0, innerWidth, innerHeight)
      context.save()
      context.beginPath()
      context.rect(rect.left, rect.top, rect.width, rect.height)
      context.clip()
      context.fillStyle = image.background
      context.fillRect(rect.left, rect.top, rect.width, rect.height)
      context.drawImage(
        image.bitmap,
        rect.left + (rect.width - width) / 2,
        rect.top + (rect.height - height) / 2,
        width,
        height,
      )
      context.restore()
    }
    const fly = (start: number, end: number, duration: number) => {
      flight?.stop()
      const ratio = Math.min(devicePixelRatio || 1, 2)
      overlay.width = innerWidth * ratio
      overlay.height = innerHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      overlay.dataset.active = 'true'
      draw(start)
      flight = animate(start, end, {
        duration: Math.max(0.001, duration / 1000),
        ease: [0.59, 0, 0.38, 1],
        onUpdate: draw,
      })
    }
    motionRef.current = {
      opening(duration) {
        const target = destination()
        if (!snapshot || !target) return
        image = snapshot
        from = snapshot.bounds
        to = target.getBoundingClientRect()
        hide(snapshot.host)
        hide(target)
        fly(0, 1, duration)
      },
      opened() {
        const target = destination()
        target?.dispatchEvent(new CustomEvent(caseInterfaceFreezeEvent, { detail: snapshot?.pose }))
        clear()
        show(target)
      },
      closeOrigin() {
        return galleryArtwork(slug)?.getBoundingClientRect()
      },
      closing(duration) {
        if (flight && progress < 1) {
          fly(progress, 0, duration)
          return
        }
        restore()
        const source = destination()
        const target = galleryArtwork(slug)
        image = captureCaseArtwork(source)
        if (!image || !target) return
        target.dispatchEvent(new CustomEvent(caseInterfaceFreezeEvent, { detail: image.pose }))
        from = image.bounds
        to = target.getBoundingClientRect()
        hide(source)
        hide(target)
        fly(0, 1, duration)
      },
      closed: restore,
    }
    window.addEventListener('resize', restore)
    return () => {
      restore()
      window.removeEventListener('resize', restore)
      motionRef.current = null
    }
  }, [dialogRef, overlayRef, motionRef, snapshot, slug])
}
