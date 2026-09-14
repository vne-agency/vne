import { describe, expect, it } from 'vitest'

import {
  createPrototype,
  defaultPrototypeState,
  reducePrototype,
  type PlaneId,
  type PrototypeState,
} from '@/components/experiments/ascii-stars/ascii-browser-model'

function plane(state: PrototypeState, id: PlaneId) {
  const result = createPrototype(state).find((candidate) => candidate.id === id)
  if (!result) throw new Error(`Expected the ${id} plane to be visible`)
  return result
}

function objectControls(state: PrototypeState) {
  return plane(state, 'main').hotspots.filter((hotspot) => hotspot.action.type === 'select-object')
}

describe('interactive ASCII browser model', () => {
  it('restores closed panels without resetting the chosen theme or object', () => {
    let state = reducePrototype(defaultPrototypeState, { type: 'toggle-theme' })
    state = reducePrototype(state, { type: 'select-object', object: 2 })
    const beforeClosing = createPrototype(state)

    state = reducePrototype(state, { type: 'toggle-panel', panel: 'layers' })
    state = reducePrototype(state, { type: 'toggle-panel', panel: 'component' })
    expect(createPrototype(state).map((item) => item.id)).toEqual(['main'])
    expect(state).toMatchObject({ theme: 'dark', selectedObject: 2 })

    state = reducePrototype(state, { type: 'toggle-panel', panel: 'component' })
    state = reducePrototype(state, { type: 'toggle-panel', panel: 'layers' })
    expect(createPrototype(state)).toEqual(beforeClosing)
  })

  it('keeps navigation and recovery controls usable when every content layer is hidden', () => {
    let state = defaultPrototypeState
    for (const layer of ['structure', 'typography', 'visual'] as const) {
      state = reducePrototype(state, { type: 'toggle-layer', layer })
    }
    const emptyContent = plane(state, 'main')
    const actions = emptyContent.hotspots.map((hotspot) => hotspot.action)
    expect(emptyContent.cells.length).toBeGreaterThan(0)
    expect(actions).toEqual(
      expect.arrayContaining([
        { type: 'toggle-theme' },
        { type: 'select-page', page: 0 },
        { type: 'select-page', page: 1 },
        { type: 'select-page', page: 2 },
        { type: 'toggle-contact' },
      ]),
    )

    const restoreVisual = plane(state, 'layers').hotspots.find(
      (hotspot) => hotspot.action.type === 'toggle-layer' && hotspot.action.layer === 'visual',
    )!
    state = reducePrototype(state, restoreVisual.action)
    expect(state.visible).toEqual({ structure: false, typography: false, visual: true })
    expect(plane(state, 'main').cells.length).toBeGreaterThan(emptyContent.cells.length)
  })

  it('closes temporary menus when changing pages while preserving appearance settings', () => {
    let state = reducePrototype(defaultPrototypeState, { type: 'toggle-theme' })
    state = reducePrototype(state, { type: 'toggle-panel', panel: 'component' })
    state = reducePrototype(state, { type: 'select-page', page: 1 })
    state = reducePrototype(state, { type: 'toggle-filter' })
    expect(plane(state, 'main').hotspots.some((hotspot) => hotspot.group === 'filter')).toBe(true)

    state = reducePrototype(state, { type: 'select-page', page: 2 })
    expect(state).toMatchObject({ page: 2, filterOpen: false, theme: 'dark' })
    expect(state.panels.component).toBe(false)
    expect(plane(state, 'main').hotspots.some((hotspot) => hotspot.group === 'filter')).toBe(false)

    state = reducePrototype(state, { type: 'toggle-contact' })
    expect(plane(state, 'main').hotspots.some((hotspot) => hotspot.group === 'contact')).toBe(true)
    state = reducePrototype(state, { type: 'select-page', page: 0 })
    expect(state.contactOpen).toBe(false)
    expect(plane(state, 'main').hotspots.some((hotspot) => hotspot.group === 'contact')).toBe(false)
  })

  it('filters catalog controls and keeps the selected object consistent with visible cards', () => {
    const catalog = reducePrototype(defaultPrototypeState, { type: 'select-page', page: 1 })
    const allObjects = objectControls(catalog).map((hotspot) => hotspot.action)
    let state = reducePrototype(catalog, { type: 'select-filter', filter: 'new' })
    const filteredControls = objectControls(state)
    expect(filteredControls.length).toBeGreaterThan(0)
    expect(filteredControls.length).toBeLessThan(allObjects.length)
    expect(allObjects).toEqual(
      expect.arrayContaining(filteredControls.map((hotspot) => hotspot.action)),
    )
    expect(filteredControls.map((hotspot) => hotspot.action)).toContainEqual({
      type: 'select-object',
      object: state.selectedObject,
    })

    const nextObject = filteredControls.find((hotspot) => !hotspot.pressed)!
    const previousDetail = plane(state, 'component').cells
    state = reducePrototype(state, nextObject.action)
    expect(objectControls(state).find((hotspot) => hotspot.pressed)?.id).toBe(nextObject.id)
    expect(plane(state, 'component').cells).not.toEqual(previousDetail)

    state = reducePrototype(state, { type: 'select-filter', filter: 'all' })
    expect(objectControls(state).map((hotspot) => hotspot.action)).toEqual(allObjects)
  })

  it('changes the main window theme without recoloring the floating panels', () => {
    const light = createPrototype(defaultPrototypeState)
    const darkState = reducePrototype(defaultPrototypeState, { type: 'toggle-theme' })
    const dark = createPrototype(darkState)
    expect(plane(defaultPrototypeState, 'main').dark).toBe(false)
    expect(plane(darkState, 'main').dark).toBe(true)
    expect(plane(darkState, 'main').paper).not.toBe(plane(defaultPrototypeState, 'main').paper)
    expect(dark.filter((item) => item.id !== 'main')).toEqual(
      light.filter((item) => item.id !== 'main'),
    )
  })

  it('updates nested state immutably and resets an edited prototype', () => {
    const original: PrototypeState = {
      ...defaultPrototypeState,
      panels: { ...defaultPrototypeState.panels },
      visible: { ...defaultPrototypeState.visible },
    }
    Object.freeze(original.panels)
    Object.freeze(original.visible)
    Object.freeze(original)

    const closed = reducePrototype(original, { type: 'toggle-panel', panel: 'layers' })
    const edited = reducePrototype(closed, { type: 'toggle-layer', layer: 'typography' })
    expect(original).toEqual(defaultPrototypeState)
    expect(closed.visible.typography).toBe(true)
    expect(edited.visible.typography).toBe(false)
    expect(edited.panels).not.toBe(original.panels)
    expect(edited.visible).not.toBe(original.visible)
    expect(reducePrototype(edited, { type: 'reset' })).toEqual(defaultPrototypeState)
  })
})
