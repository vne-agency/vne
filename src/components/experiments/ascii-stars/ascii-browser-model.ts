export type PageId = 0 | 1 | 2
export type PlaneId = 'main' | 'layers' | 'component'
export type ContentLayer = 'structure' | 'typography' | 'visual'
export type DashboardView = 'overview' | 'projects' | 'activity' | 'settings'
export type CatalogFilter = 'all' | 'new'
export type ObjectId = 0 | 1 | 2

export type PrototypeState = {
  page: PageId
  theme: 'light' | 'dark'
  panels: Record<Exclude<PlaneId, 'main'>, boolean>
  visible: Record<ContentLayer, boolean>
  contactOpen: boolean
  filterOpen: boolean
  filter: CatalogFilter
  selectedObject: ObjectId
  dashboardView: DashboardView
}

export type PrototypeAction =
  | { type: 'select-page'; page: PageId }
  | { type: 'toggle-theme' }
  | { type: 'toggle-panel'; panel: Exclude<PlaneId, 'main'> }
  | { type: 'toggle-layer'; layer: ContentLayer }
  | { type: 'toggle-contact' }
  | { type: 'toggle-filter' }
  | { type: 'select-filter'; filter: CatalogFilter }
  | { type: 'select-object'; object: ObjectId }
  | { type: 'select-dashboard'; view: DashboardView }
  | { type: 'reset' }

export type Cell = { x: number; y: number; character: string; shade: number }
export type PrototypeHotspot = {
  id: string
  label: string
  action: PrototypeAction
  column: number
  row: number
  width: number
  height: number
  pressed?: boolean
  expanded?: boolean
  controlsId?: string
  group?: 'contact' | 'filter'
}
export type Plane = {
  id: PlaneId
  columns: number
  rows: number
  x: number
  y: number
  z: number
  paper: string
  dark: boolean
  cells: Cell[]
  hotspots: PrototypeHotspot[]
}

export const defaultPrototypeState: PrototypeState = {
  page: 0,
  theme: 'light',
  panels: { layers: true, component: true },
  visible: { structure: true, typography: true, visual: true },
  contactOpen: false,
  filterOpen: false,
  filter: 'all',
  selectedObject: 0,
  dashboardView: 'overview',
}

export function reducePrototype(state: PrototypeState, action: PrototypeAction): PrototypeState {
  switch (action.type) {
    case 'select-page':
      return { ...state, page: action.page, contactOpen: false, filterOpen: false }
    case 'toggle-theme':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' }
    case 'toggle-panel':
      return {
        ...state,
        panels: { ...state.panels, [action.panel]: !state.panels[action.panel] },
      }
    case 'toggle-layer':
      return {
        ...state,
        visible: { ...state.visible, [action.layer]: !state.visible[action.layer] },
      }
    case 'toggle-contact':
      return { ...state, contactOpen: !state.contactOpen, filterOpen: false }
    case 'toggle-filter':
      return { ...state, filterOpen: !state.filterOpen, contactOpen: false }
    case 'select-filter':
      return {
        ...state,
        filter: action.filter,
        filterOpen: false,
        selectedObject:
          action.filter === 'new' && state.selectedObject === 0 ? 1 : state.selectedObject,
      }
    case 'select-object':
      return {
        ...state,
        selectedObject: action.object,
        filter: state.filter === 'new' && action.object === 0 ? 'all' : state.filter,
      }
    case 'select-dashboard':
      return { ...state, dashboardView: action.view, contactOpen: false, filterOpen: false }
    case 'reset':
      return {
        ...defaultPrototypeState,
        panels: { ...defaultPrototypeState.panels },
        visible: { ...defaultPrototypeState.visible },
      }
  }
}

const alphabet: Record<string, string[]> = {
  A: ['01110', '11011', '11011', '11111', '11011', '11011', '11011'],
  D: ['11110', '11011', '11011', '11011', '11011', '11011', '11110'],
  F: ['11111', '11000', '11000', '11110', '11000', '11000', '11000'],
  H: ['11011', '11011', '11011', '11111', '11011', '11011', '11011'],
  M: ['11011', '11111', '11111', '11011', '11011', '11011', '11011'],
  O: ['01110', '11011', '11011', '11011', '11011', '11011', '01110'],
  P: ['11110', '11011', '11011', '11110', '11000', '11000', '11000'],
  R: ['11110', '11011', '11011', '11110', '11100', '11010', '11011'],
  S: ['01111', '11000', '11000', '01110', '00011', '00011', '11110'],
  T: ['11111', '01110', '01110', '01110', '01110', '01110', '01110'],
}

const objectNames = ['FORM', 'ORBIT', 'EDGE'] as const
const layerNames: { id: ContentLayer; name: string; label: string }[] = [
  { id: 'structure', name: 'STRUCTURE', label: 'Структура интерфейса' },
  { id: 'typography', name: 'TYPOGRAPHY', label: 'Тексты интерфейса' },
  { id: 'visual', name: 'VISUAL', label: 'Графика интерфейса' },
]

function createPlane(
  id: PlaneId,
  columns: number,
  rows: number,
  x: number,
  y: number,
  z: number,
  paper: string,
  dark = false,
) {
  const cells = new Map<number, Cell>()
  let hotspots: PrototypeHotspot[] = []
  const put = (column: number, row: number, character: string, shade = 0) => {
    if (column < 0 || column >= columns || row < 0 || row >= rows || character === ' ') return
    cells.set(row * columns + column, { x: column, y: row, character, shade })
  }
  const text = (column: number, row: number, value: string, shade = 0) => {
    Array.from(value).forEach((character, index) => put(column + index, row, character, shade))
  }
  const line = (column: number, row: number, length: number, shade = 1) => {
    for (let index = 0; index < length; index++) put(column + index, row, '-', shade)
  }
  const box = (column: number, row: number, width: number, height: number, shade = 0) => {
    line(column, row, width, shade)
    line(column, row + height - 1, width, shade)
    for (let index = 1; index < height - 1; index++) {
      put(column, row + index, '|', shade)
      put(column + width - 1, row + index, '|', shade)
    }
    for (const dx of [0, width - 1]) {
      for (const dy of [0, height - 1]) put(column + dx, row + dy, '+', shade)
    }
  }
  const word = (column: number, row: number, value: string) => {
    Array.from(value).forEach((letter, index) => {
      alphabet[letter]?.forEach((pixels, dy) => {
        Array.from(pixels).forEach((pixel, dx) => {
          if (pixel === '1') put(column + index * 6 + dx, row + dy, '#')
        })
      })
    })
  }
  const shape = (column: number, row: number, width: number, height: number, kind: number) => {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const px = (dx / (width - 1)) * 2 - 1
        const py = (dy / (height - 1)) * 2 - 1
        const radius = Math.hypot(px, py)
        const inside =
          kind === 0
            ? Math.sqrt(Math.abs(px)) + Math.sqrt(Math.abs(py)) < 1.18
            : kind === 1
              ? radius < 0.95 && radius > 0.48
              : Math.abs(px) + Math.abs(py) < 1.1
        if (!inside) continue
        const shade = px * 0.45 + py * 0.25 + 0.45
        put(
          column + dx,
          row + dy,
          shade > 0.7 ? ':' : shade > 0.4 ? '+' : '#',
          shade > 0.72 ? 2 : 0,
        )
      }
    }
  }
  const hotspot = (entry: PrototypeHotspot) => hotspots.push(entry)
  const button = (
    entry: Omit<PrototypeHotspot, 'width' | 'height'> & { text: string },
    shade = 0,
  ) => {
    const { text: value, ...action } = entry
    text(entry.column, entry.row, value, shade)
    hotspot({
      ...action,
      column: entry.column - 1,
      row: entry.row - 1,
      width: value.length + 2,
      height: 3,
    })
  }
  const clear = (column: number, row: number, width: number, height: number) => {
    for (const [key, cell] of cells) {
      if (cell.x >= column && cell.x < column + width && cell.y >= row && cell.y < row + height)
        cells.delete(key)
    }
    // A dropdown's surface must not leave an active control underneath it.
    hotspots = hotspots.filter(
      (entry) =>
        entry.column + entry.width <= column ||
        entry.column >= column + width ||
        entry.row + entry.height <= row ||
        entry.row >= row + height,
    )
  }
  return {
    put,
    text,
    line,
    box,
    word,
    shape,
    hotspot,
    button,
    clear,
    finish: (): Plane => ({
      id,
      columns,
      rows,
      x,
      y,
      z,
      paper,
      dark,
      cells: [...cells.values()],
      hotspots,
    }),
  }
}

type PlaneBuilder = ReturnType<typeof createPlane>

function drawSite(main: PlaneBuilder, state: PrototypeState) {
  const { structure, typography, visual } = state.visible
  if (typography) {
    main.text(6, 11, 'DIGITAL / WITH INTENT', 1)
    main.word(6, 14, 'FORM')
    main.text(6, 23, 'BEYOND THE EXPECTED.', 1)
    main.text(6, 25, 'A CLEAR IDEA. A NEW PERSPECTIVE.', 1)
    for (let index = 0; index < 3; index++) {
      main.text(6 + index * 25, 36, ['01 / STRATEGY', '02 / DESIGN', '03 / DEVELOPMENT'][index])
    }
  }
  if (structure) {
    main.box(6, 28, 24, 3)
    main.box(44, 11, 33, 20, 1)
    main.line(5, 34, 74)
    for (let index = 0; index < 3; index++) main.line(6 + index * 25, 39, 17, 1)
  }
  if (visual) main.shape(50, 12, 21, 18, state.selectedObject)
  if (structure || typography) {
    main.button({
      id: 'main-start-project',
      column: 8,
      row: 29,
      text: 'START A PROJECT ->',
      label: 'Показать направления для проекта',
      action: { type: 'toggle-contact' },
      expanded: state.contactOpen,
      controlsId: 'prototype-contact-list',
    })
  }
}

function drawCatalog(main: PlaneBuilder, state: PrototypeState) {
  const { structure, typography, visual } = state.visible
  if (typography) {
    main.word(6, 11, 'SHOP')
    main.text(
      42,
      13,
      `${objectNames[state.selectedObject]} / OBJECT 0${state.selectedObject + 1}`,
      1,
    )
  }
  const objects: ObjectId[] = state.filter === 'new' ? [1, 2] : [0, 1, 2]
  objects.forEach((object, index) => {
    const x = state.filter === 'new' ? 17 + index * 29 : 6 + index * 25
    const selected = state.selectedObject === object
    if (structure) {
      main.box(x, 21, 22, 17, selected ? 0 : 1)
      main.line(x + 1, 35, 20)
    }
    if (visual) main.shape(x + 3, 23, 16, 11, object)
    if (typography) {
      main.text(x + 2, 36, `OBJECT 0${object + 1}     [${selected ? '*' : '+'}]`)
      main.text(x, 40, `${objectNames[object]} / 0${object + 1}`, 1)
    }
    if (structure || typography || visual) {
      main.hotspot({
        id: `main-object-${object}`,
        label: `Объект ${objectNames[object]}`,
        action: { type: 'select-object', object },
        column: x,
        row: 21,
        width: 22,
        height: 17,
        pressed: selected,
      })
    }
  })
  if (state.filterOpen) {
    main.clear(40, 18, 27, 7)
    main.box(40, 18, 27, 7)
    main.button({
      id: 'main-filter-all',
      column: 43,
      row: 20,
      text: `${state.filter === 'all' ? '(*)' : '( )'} ALL OBJECTS`,
      label: 'Все объекты',
      action: { type: 'select-filter', filter: 'all' },
      pressed: state.filter === 'all',
      group: 'filter',
    })
    main.button({
      id: 'main-filter-new',
      column: 43,
      row: 23,
      text: `${state.filter === 'new' ? '(*)' : '( )'} NEW OBJECTS`,
      label: 'Новые объекты',
      action: { type: 'select-filter', filter: 'new' },
      pressed: state.filter === 'new',
      group: 'filter',
    })
  }
  main.button({
    id: 'main-filter',
    column: 42,
    row: 16,
    text: `[ ${state.filter.toUpperCase()} ${state.filterOpen ? '^' : 'v'} ]`,
    label: 'Фильтр объектов',
    action: { type: 'toggle-filter' },
    expanded: state.filterOpen,
    controlsId: 'prototype-catalog-filter',
  })
}

function drawDashboard(main: PlaneBuilder, state: PrototypeState) {
  const { structure, typography, visual } = state.visible
  const views: { id: DashboardView; name: string; label: string }[] = [
    { id: 'overview', name: 'OVERVIEW', label: 'Обзор показателей' },
    { id: 'projects', name: 'PROJECTS', label: 'Список проектов' },
    { id: 'activity', name: 'ACTIVITY', label: 'Активность команды' },
    { id: 'settings', name: 'SETTINGS', label: 'Настройки интерфейса' },
  ]
  views.forEach((view, index) => {
    main.button(
      {
        id: `main-view-${view.id}`,
        column: 5,
        row: 13 + index * 4,
        text: `${state.dashboardView === view.id ? '>' : ' '} ${view.name}`,
        label: view.label,
        action: { type: 'select-dashboard', view: view.id },
        pressed: state.dashboardView === view.id,
      },
      state.dashboardView === view.id ? 0 : 1,
    )
  })
  if (structure) {
    main.line(1, 10, 20)
    for (let row = 10; row < 42; row++) main.put(22, row, '|', 1)
  }
  if (typography) {
    main.word(28, 10, 'DATA')
    main.text(59, 13, state.dashboardView.toUpperCase(), 1)
    main.text(5, 37, '[ VNE / TEAM ]', 2)
  }
  if (state.dashboardView === 'settings') {
    layerNames.forEach((layer, index) => {
      main.button({
        id: `main-setting-${layer.id}`,
        column: 29,
        row: 22 + index * 5,
        text: `[${state.visible[layer.id] ? 'x' : ' '}] ${layer.name}`,
        label: layer.label,
        action: { type: 'toggle-layer', layer: layer.id },
        pressed: state.visible[layer.id],
      })
    })
    main.text(29, 39, 'CHANGES APPLY TO ALL PAGES', 1)
    return
  }
  if (state.dashboardView === 'projects') {
    for (let index = 0; index < 3; index++) {
      const row = 21 + index * 6
      if (structure) main.box(28, row, 50, 5, 1)
      if (typography)
        main.text(
          31,
          row + 2,
          [
            '01 / WEBSITE       IN DESIGN',
            '02 / CATALOG       IN REVIEW',
            '03 / CAMPAIGN      RELEASED',
          ][index],
        )
      if (visual) main.text(71, row + 2, ['+++', '++:', '###'][index], 2)
    }
    return
  }
  if (state.dashboardView === 'overview') {
    for (let index = 0; index < 3; index++) {
      const x = 28 + index * 17
      if (structure) main.box(x, 20, 15, 7, 1)
      if (typography) {
        main.text(x + 2, 22, ['PROJECTS', 'TASKS', 'PROGRESS'][index], 1)
        main.text(x + 2, 24, ['08  +2', '24  +6', '92%  +8'][index])
      }
    }
  } else if (typography) {
    main.text(28, 21, 'MON   TUE   WED   THU   FRI   SAT', 1)
    main.text(28, 25, '24 EVENTS / 08 PROJECTS / +6 TODAY')
  }
  if (typography) main.text(28, 30, 'ACTIVITY / THIS WEEK', 1)
  if (structure) main.line(28, 39, 50)
  if (visual) {
    for (let index = 0; index < 12; index++) {
      const height = [2, 3, 2, 4, 3, 5, 4, 6, 4, 5, 6, 7][index]
      for (let row = 0; row < height; row++) {
        main.text(29 + index * 4, 38 - row, index > 8 ? '###' : '+++', index > 8 ? 0 : 2)
      }
    }
  }
}

function drawContact(main: PlaneBuilder) {
  main.clear(20, 12, 38, 20)
  main.box(20, 12, 38, 20)
  main.text(23, 14, "LET'S MAKE SOMETHING.")
  main.line(21, 16, 36)
  main.button({
    id: 'main-contact-site',
    column: 23,
    row: 19,
    text: '[ WEBSITE + DESIGN ]',
    label: 'Посмотреть макет сайта',
    action: { type: 'select-page', page: 0 },
    group: 'contact',
  })
  main.button({
    id: 'main-contact-product',
    column: 23,
    row: 23,
    text: '[ PRODUCT + EXPERIENCE ]',
    label: 'Посмотреть макет рабочего интерфейса',
    action: { type: 'select-page', page: 2 },
    group: 'contact',
  })
  main.text(23, 27, 'DEMO / LOCAL PREVIEW', 1)
  main.button({
    id: 'main-contact-close',
    column: 44,
    row: 30,
    text: '[ CLOSE ]',
    label: 'Закрыть список направлений',
    action: { type: 'toggle-contact' },
    group: 'contact',
  })
}

export function createPrototype(state: PrototypeState): Plane[] {
  const dark = state.theme === 'dark'
  const main = createPlane('main', 84, 43, 0, 0, 0, dark ? '#22231f' : '#f4f3ee', dark)
  main.box(0, 0, 84, 43)
  main.text(3, 2, 'o o o', 2)
  main.text(25, 2, `VNE / PROTOTYPE / 0${state.page + 1}`, 1)
  main.button({
    id: 'main-theme',
    column: 70,
    row: 2,
    text: dark ? '[ DARK ]' : '[ LIGHT ]',
    label: 'Тёмная тема главного окна',
    action: { type: 'toggle-theme' },
    pressed: dark,
  })
  main.line(1, 4, 82)
  const navigation: { id: PageId; column: number; name: string; label: string }[] = [
    { id: 0, column: 5, name: 'SITE', label: 'Главная страница' },
    { id: 1, column: 17, name: 'CATALOG', label: 'Каталог объектов' },
    { id: 2, column: 32, name: 'DATA', label: 'Рабочая панель' },
  ]
  navigation.forEach((page) => {
    main.button(
      {
        id: `main-page-${page.id}`,
        column: page.column,
        row: 7,
        text: `[ ${page.name} ]`,
        label: page.label,
        action: { type: 'select-page', page: page.id },
        pressed: state.page === page.id,
      },
      state.page === page.id ? 0 : 1,
    )
  })
  main.button({
    id: 'main-contact',
    column: 46,
    row: 7,
    text: `[ CONTACT ${state.contactOpen ? '-' : '+'} ]`,
    label: 'Направления для проекта',
    action: { type: 'toggle-contact' },
    expanded: state.contactOpen,
    controlsId: 'prototype-contact-list',
  })

  if (state.page === 0) drawSite(main, state)
  else if (state.page === 1) drawCatalog(main, state)
  else drawDashboard(main, state)
  if (state.contactOpen) drawContact(main)

  const planes = [main.finish()]
  if (state.panels.layers) {
    const layers = createPlane('layers', 23, 17, -39, 12, 16, '#e5dbf0')
    layers.box(0, 0, 23, 17, 2)
    layers.text(2, 2, 'LAYERS')
    layers.button({
      id: 'layers-close',
      column: 19,
      row: 2,
      text: '[x]',
      label: 'Скрыть окно слоёв',
      action: { type: 'toggle-panel', panel: 'layers' },
    })
    layers.line(1, 4, 21, 2)
    layerNames.forEach((layer, index) => {
      layers.button({
        id: `layers-${layer.id}`,
        column: 2,
        row: 6 + index * 3,
        text: `[${state.visible[layer.id] ? 'x' : ' '}] ${layer.name}`,
        label: layer.label,
        action: { type: 'toggle-layer', layer: layer.id },
        pressed: state.visible[layer.id],
      })
    })
    layers.text(2, 15, `${Object.values(state.visible).filter(Boolean).length} LAYERS VISIBLE`, 1)
    planes.push(layers.finish())
  }

  if (state.panels.component) {
    const component = createPlane('component', 22, 22, 36, -7, 23, '#ece4f3')
    component.box(0, 0, 22, 22, 2)
    component.text(2, 2, `OBJECT / 0${state.selectedObject + 1}`)
    component.button({
      id: 'component-close',
      column: 18,
      row: 2,
      text: '[x]',
      label: 'Скрыть окно компонента',
      action: { type: 'toggle-panel', panel: 'component' },
    })
    component.line(1, 4, 20, 2)
    component.shape(3, 6, 16, 11, state.selectedObject)
    component.line(1, 18, 20, 2)
    component.button({
      id: 'component-next',
      column: 3,
      row: 20,
      text: '[ NEXT OBJECT > ]',
      label: 'Показать следующий объект',
      action: { type: 'select-object', object: ((state.selectedObject + 1) % 3) as ObjectId },
    })
    planes.push(component.finish())
  }
  return planes
}
