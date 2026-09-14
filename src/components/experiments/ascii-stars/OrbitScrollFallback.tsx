'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import approach from '@/components/sections/ApproachSection.module.css'
import cases from './OrbitCases.module.css'
import directions from './OrbitDirections.module.css'
import faq from './OrbitFaq.module.css'
import services from './OrbitServices.module.css'
import styles from './OrbitScrollFallback.module.css'

const classSelector = (...names: string[]) => names.map((name) => `.${name}`).join(', ')

/** Readable, one-time entrances for Safari versions without scroll timelines. */
export function OrbitScrollFallback() {
  const pathname = usePathname()
  useEffect(() => {
    const nativeMotion =
      CSS.supports('animation-timeline: view()') &&
      CSS.supports('animation-range: entry 30svh entry 48svh') &&
      CSS.supports('animation-range: contain 0% contain 120svh') &&
      CSS.supports('animation-range: cover 0 cover 28svh') &&
      CSS.supports('animation-range: entry 100% entry calc(100% + 80svh)')
    if (nativeMotion || !('IntersectionObserver' in window)) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    const host = document.getElementById('site-content')
    if (!host) return
    const copySelector = [
      `.${cases.heading} > *`,
      `.${cases.details} > *`,
      classSelector(cases.mediaButton, cases.mediaFooter),
      classSelector(
        directions.introduction,
        directions.heading,
        directions.panelHeader,
        directions.panelFooter,
      ),
      classSelector(faq.headingContent, faq.questionHeading),
      classSelector(services.introduction, services.heading, services.serviceHeading),
      `.${services.details} > *`,
      `.${services.contactStrip} > *`,
      classSelector(
        approach.topLead,
        approach.topRight,
        approach.card,
        approach.bottomLead,
        approach.bottomCenter,
        approach.bottomRight,
      ),
      '[data-closing-copy]',
      '[data-pricing-form] form > :is(div, button, p)',
    ].join(', ')
    const ruleSelector = [
      classSelector(cases.heading, cases.project, cases.media),
      classSelector(directions.header, directions.panelHeader, directions.panelFooter),
      classSelector(faq.section, faq.item),
      classSelector(services.header, services.row, services.contactStrip, services.more),
      classSelector(
        approach.titleGraphic,
        approach.topLead,
        approach.topRight,
        approach.bottomLead,
        approach.bottomCenter,
        approach.bottomRight,
      ),
      '[data-closing-rule]',
      '[data-closing-stage]',
    ].join(', ')
    const nodes = new Set<HTMLElement>()
    const groups = new Map<Element, HTMLElement[]>()
    const selector = `${copySelector}, ${ruleSelector}`
    const reveal = (target: Element) => {
      groups.get(target)?.forEach((node) => {
        node.dataset.fallbackVisible = 'true'
      })
      observer.unobserve(target)
    }
    const createObserver = () =>
      new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) reveal(target)
          })
        },
        { rootMargin: `0px 0px -${Math.round(innerHeight * 0.12)}px 0px`, threshold: 0 },
      )
    let observer = createObserver()
    const enhance = (candidates: Iterable<HTMLElement>) => {
      // Batch geometry reads before writes, including asynchronously opened dialogs.
      const fresh = Array.from(candidates).filter((node) => !nodes.has(node) && node.isConnected)
      const measurements = fresh.map((node) => {
        const rule = node.matches(ruleSelector)
        const computed = rule ? getComputedStyle(node) : null
        const trigger = node.closest(`.${approach.hero}`) ?? node
        return {
          node,
          trigger,
          rule,
          flow: computed?.position === 'static',
          copy: node.matches(copySelector),
          visible: reduced.matches || trigger.getBoundingClientRect().top < innerHeight * 0.4,
          start: computed?.borderTopWidth ?? '0px',
          end: computed?.borderBottomWidth ?? '0px',
          color:
            computed?.borderTopWidth !== '0px'
              ? computed?.borderTopColor
              : computed?.borderBottomColor,
        }
      })
      measurements.forEach(({ node, trigger, rule, flow, copy, visible, start, end, color }) => {
        nodes.add(node)
        groups.set(trigger, [...(groups.get(trigger) ?? []), node])
        if (copy) node.classList.add(styles.copy)
        if (rule) {
          node.style.setProperty('--fallback-line-start', start)
          node.style.setProperty('--fallback-line-end', end)
          node.style.setProperty('--fallback-line-color', color ?? 'currentColor')
          node.classList.add(styles.rule)
          node.classList.toggle(styles.flowRule, flow)
        }
        if (visible) reveal(trigger)
        else observer.observe(trigger)
      })
    }
    enhance(host.querySelectorAll<HTMLElement>(selector))
    const restore = (node: HTMLElement) => {
      node.classList.remove(styles.copy, styles.rule, styles.flowRule)
      delete node.dataset.fallbackVisible
      for (const name of ['start', 'end', 'color'])
        node.style.removeProperty(`--fallback-line-${name}`)
    }
    const pending = new Set<HTMLElement>()
    let mutationFrame = 0
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const added of record.addedNodes) {
          if (!(added instanceof HTMLElement)) continue
          if (added.matches(selector)) pending.add(added)
          added.querySelectorAll<HTMLElement>(selector).forEach((node) => pending.add(node))
        }
      }
      // Release removed dialog nodes instead of retaining each opened case.
      groups.forEach((group, target) => {
        if (!target.isConnected) {
          observer.unobserve(target)
          group.forEach((node) => {
            restore(node)
            nodes.delete(node)
          })
          groups.delete(target)
        }
      })
      if (!pending.size || mutationFrame) return
      mutationFrame = requestAnimationFrame(() => {
        mutationFrame = 0
        enhance(pending)
        pending.clear()
      })
    })
    mutations.observe(host, { childList: true, subtree: true })
    const onResize = () => {
      // Re-read the responsive borders and positioning without our overrides.
      const rules = Array.from(nodes).filter((node) => node.matches(ruleSelector))
      rules.forEach((node) => node.classList.remove(styles.rule, styles.flowRule))
      const borders = rules.map((node) => {
        const computed = getComputedStyle(node)
        return {
          node,
          flow: computed.position === 'static',
          start: computed.borderTopWidth,
          end: computed.borderBottomWidth,
          color:
            computed.borderTopWidth !== '0px'
              ? computed.borderTopColor
              : computed.borderBottomColor,
        }
      })
      borders.forEach(({ node, flow, start, end, color }) => {
        node.style.setProperty('--fallback-line-start', start)
        node.style.setProperty('--fallback-line-end', end)
        node.style.setProperty('--fallback-line-color', color)
        node.classList.add(styles.rule)
        node.classList.toggle(styles.flowRule, flow)
      })
      observer.disconnect()
      observer = createObserver()
      groups.forEach((group, target) => {
        if (group.some((node) => node.dataset.fallbackVisible !== 'true')) observer.observe(target)
      })
    }
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      const focused = event.target
      groups.forEach((group, target) => {
        if (group.some((node) => node.contains(focused))) reveal(target)
      })
    }
    const showAll = () => {
      if (reduced.matches) groups.forEach((_, target) => reveal(target))
    }
    host.addEventListener('focusin', onFocus)
    window.addEventListener('resize', onResize)
    reduced.addEventListener('change', showAll)
    return () => {
      observer.disconnect()
      mutations.disconnect()
      cancelAnimationFrame(mutationFrame)
      host.removeEventListener('focusin', onFocus)
      window.removeEventListener('resize', onResize)
      reduced.removeEventListener('change', showAll)
      nodes.forEach(restore)
    }
  }, [pathname])
  return null
}
