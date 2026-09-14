// Virtual scroll: the same viewport-relative entrance / centre / exit sequence
// runs on elapsed time instead of wheel input. No document scroll is changed.
export const INTRO_DURATION = 5600

export const loaderGroups = [
  {
    lane: 0.96,
    target: 0.025,
    at: 0.45,
    cascade: true,
    lines: [
      'ОТ ВОПРОСА К РЕШЕНИЮ',
      'ИССЛЕДОВАНИЕ АУДИТОРИИ',
      'ИНТЕРВЬЮ И НАБЛЮДЕНИЯ',
      'ЦЕЛИ → СЦЕНАРИИ',
      'CUSTOMER JOURNEY',
      'КАРТА КОНТЕНТА',
      'СМЫСЛОВАЯ СТРУКТУРА',
      'ПЕРВЫЙ ЭСКИЗ',
      'ПРОТОТИП В ДВИЖЕНИИ',
      'DESIGN / REVIEW / REFINE',
      'ВИЗУАЛЬНЫЙ ЯЗЫК',
      '8PX / 16PX / 24PX',
      'КОНТРАСТ И ВОЗДУХ',
      'ТИПОГРАФИЧЕСКИЙ РИТМ',
      'СЕТКА БЕЗ ОГРАНИЧЕНИЙ',
      'HOVER / FOCUS / ACTIVE',
      'СВЯЗЬ МЕЖДУ ЭКРАНАМИ',
      'МОБИЛЬНЫЕ СЦЕНАРИИ',
      'АНИМАЦИЯ СО СМЫСЛОМ',
      'TIMING / EASING / FLOW',
      'ОБРАТНАЯ СВЯЗЬ',
      'ПРОВЕРКА НА ПРАКТИКЕ',
      'ДЕТАЛИ СОЗДАЮТ ОПЫТ',
      '[ DESIGN: RESOLVED ]',
    ],
  },
  {
    lane: 0.025,
    target: 0.96,
    at: 1.95,
    cascade: true,
    lines: [
      'АРХИТЕКТУРА ПРОЕКТА',
      'КОМПОНЕНТЫ И СОСТОЯНИЯ',
      'CONST IDEA = CREATE()',
      'ДАННЫЕ → ИНТЕРФЕЙС',
      'ASYNC / AWAIT / RENDER',
      'API / WEBHOOK / EVENT',
      'ЗАЯВКА БЕЗ ПОТЕРЬ',
      'БОТ ОТВЕЧАЕТ КЛИЕНТУ',
      'CRM СОХРАНЯЕТ ИСТОРИЮ',
      'СЕРВИСЫ РАБОТАЮТ ВМЕСТЕ',
      '{ SUCCESS: TRUE }',
      'ПОНЯТНЫЕ ОШИБКИ',
      'БЕЗОПАСНЫЕ ФОРМЫ',
      'СЕМАНТИЧЕСКАЯ РАЗМЕТКА',
      'ПОИСК НАХОДИТ СТРАНИЦЫ',
      'МЕДИА ЗАГРУЖАЮТСЯ БЫСТРО',
      'МЕНЬШЕ ЛИШНИХ ЗАПРОСОВ',
      '60 FPS / SMOOTH MOTION',
      'ПРОВЕРКА НА УСТРОЙСТВАХ',
      'ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ ПУТЕЙ',
      'CODE → BUILD → RELEASE',
      'ПЕРЕДАЧА КОМАНДЕ',
      'ПОДДЕРЖКА ПОСЛЕ ЗАПУСКА',
      '[ READY FOR PEOPLE ]',
    ],
  },
  {
    lane: 0.96,
    target: 0.025,
    at: -0.32,
    cascade: true,
    lines: [
      'ИССЛЕДУЕМ ЗАДАЧУ',
      'СЛУШАЕМ КОМАНДУ',
      'НАХОДИМ СМЫСЛ',
      'СОБИРАЕМ СТРУКТУРУ',
      'СТРОИМ ПУТЬ',
      'SKETCH → WIREFRAME',
      'ПРОВЕРЯЕМ ГИПОТЕЗЫ',
      'УБИРАЕМ ЛИШНЕЕ',
      'ВЫСТРАИВАЕМ ИЕРАРХИЮ',
      'НАСТРАИВАЕМ РИТМ',
      'GRID / SPACE / TYPE',
      'ВЫБИРАЕМ ТИПОГРАФИКУ',
      'СОБИРАЕМ ПАЛИТРУ',
      'ДОБАВЛЯЕМ ХАРАКТЕР',
      'ПРОЕКТИРУЕМ СОСТОЯНИЯ',
      'СВЯЗЫВАЕМ ЭКРАНЫ',
      'DESIGN TOKENS',
      'COMPONENT SYSTEM',
      'СОЗДАЁМ ДВИЖЕНИЕ',
      'УТОЧНЯЕМ ДЕТАЛИ',
      'ИНТЕРФЕЙС СО СМЫСЛОМ',
      'ФОРМА СЛЕДУЕТ ЗАДАЧЕ',
      '[ IDEA → EXPERIENCE ]',
      'VNE / DESIGN STUDIO',
    ],
  },
  {
    lane: 0.025,
    target: 0.96,
    at: 1.2,
    cascade: true,
    lines: [
      '<DESIGN_SYSTEM />',
      'ПИШЕМ КОМПОНЕНТЫ',
      'СВЯЗЫВАЕМ ДАННЫЕ',
      'FRONTEND / BACKEND',
      'TYPE-SAFE INTERFACES',
      'АДАПТИРУЕМ ЭКРАНЫ',
      'MOBILE FIRST',
      'KEYBOARD NAVIGATION',
      'ACCESSIBLE BY DESIGN',
      'СОКРАЩАЕМ ЗАГРУЗКУ',
      'ОПТИМИЗИРУЕМ МЕДИА',
      'CACHE / RENDER / REPEAT',
      'ПОДКЛЮЧАЕМ API',
      'АВТОМАТИЗИРУЕМ ЗАЯВКИ',
      'BOT → CRM → TEAM',
      '{ STATUS: CONNECTED }',
      'ТЕСТИРУЕМ СЦЕНАРИИ',
      'ПРОВЕРЯЕМ ФОРМЫ',
      'ОТЛАЖИВАЕМ АНИМАЦИЮ',
      'СОБИРАЕМ ОБРАТНУЮ СВЯЗЬ',
      'BUILD / TEST / DEPLOY',
      'ЗАПУСКАЕМ ПРОДУКТ',
      'РАЗВИВАЕМ РЕШЕНИЕ',
      '[ 0101 / READY / 1010 ]',
    ],
  },
  {
    lane: 0.96,
    target: 0.025,
    at: 2.65,
    cascade: true,
    lines: [
      'СТРАТЕГИЯ И ДИЗАЙН',
      'САЙТЫ И СЕРВИСЫ',
      'БРЕНД И КОММУНИКАЦИЯ',
      'ЛЕНДИНГИ И КАТАЛОГИ',
      'ИНТЕРАКТИВНЫЕ ИСТОРИИ',
      'БOTЫ И CRM',
      'ДАННЫЕ И ИНТЕГРАЦИИ',
      'СИСТЕМА ВМЕСТО ХАОСА',
      'СМЫСЛ ВМЕСТО ШУМА',
      'РИТМ В КАЖДОЙ ДЕТАЛИ',
      'DESIGN THAT WORKS',
      'CODE WITH PURPOSE',
      'ЛЮДИ В ЦЕНТРЕ',
      'ОТ ИДЕИ ДО ЗАПУСКА',
      'СОЗДАЁМ ВМЕСТЕ',
      'LET’S MAKE IT REAL',
      '{ VNE: READY }',
      '→ ВАШ СЛЕДУЮЩИЙ ПРОЕКТ',
    ],
  },
  {
    lane: 0.72,
    target: 0.24,
    at: 0.12,
    lines: [
      'STRATEGY',
      'CREATIVE DIRECTION',
      'DIGITAL EXPERIENCES',
      'RESEARCH → INSIGHT',
      'IDEA → INTERFACE',
      '[ BUILD WITH INTENT ]',
    ],
  },
  {
    lane: 0.04,
    target: 0.7,
    at: 0.48,
    lines: [
      'БРИФ И ИССЛЕДОВАНИЕ',
      'СТРУКТУРА САЙТА',
      'ПУТЬ ПОЛЬЗОВАТЕЛЯ',
      'ПРОТОТИП',
      'ДИЗАЙН-СИСТЕМА',
      'РАЗРАБОТКА',
    ],
  },
  { lane: 0.12, target: 0.36, at: 0.72, lines: ['В'], large: true },
  {
    lane: 0.64,
    target: 0.08,
    at: 1.05,
    lines: [
      'VISUAL IDENTITY',
      'TYPOGRAPHY',
      'GRID / SPACE / RHYTHM',
      'COLOUR & CONTRAST',
      'MOTION SYSTEMS',
      'DETAILS MATTER',
    ],
  },
  { lane: 0.78, target: 0.54, at: 1.3, lines: ['Н'], large: true },
  {
    lane: 0.25,
    target: 0.66,
    at: 1.57,
    lines: [
      'WEB DESIGN',
      'INTERACTIVE SYSTEMS',
      'RESPONSIVE LAYOUTS',
      'BOTS & CRM',
      'API INTEGRATIONS',
      'CONNECTED SERVICES',
    ],
  },
  { lane: 0.08, target: 0.42, at: 1.94, lines: ['Е'], large: true },
  {
    lane: 0.7,
    target: 0.22,
    at: 2.23,
    lines: [
      'FROM FIRST IDEA',
      'TO FINAL PIXEL',
      'DESIGN → DEVELOP → TEST',
      'ACCESSIBILITY',
      'PERFORMANCE',
      'DESIGNED TO WORK',
    ],
  },
  { lane: 0.73, target: 0.56, at: 2.62, lines: ['↗'], large: true },
  {
    lane: 0.24,
    target: 0.06,
    at: 2.92,
    lines: [
      'VNE STUDIO',
      'STRUCTURE. ORDER. INTENT.',
      'ПРОВЕРЯЕМ ДЕТАЛИ',
      'ЗАПУСКАЕМ ПРОЕКТ',
      'РАЗВИВАЕМ ПРОДУКТ',
      'READY TO EXPLORE',
    ],
  },
  {
    lane: 0.04,
    target: 0.08,
    at: -0.45,
    lines: [
      '<IDEA />',
      '{ DESIGN: TRUE }',
      '[ 01 / RESEARCH ]',
      'СНАЧАЛА — ЗАДАЧА',
      'ПОТОМ — РЕШЕНИЕ',
    ],
  },
  {
    lane: 0.7,
    target: 0.55,
    at: -0.25,
    lines: [
      'VNE / DIGITAL STUDIO',
      'DESIGN + DEVELOPMENT',
      '0101 / 0011 / 1010',
      '→ СМЫСЛ В КАЖДОЙ ДЕТАЛИ',
    ],
  },
  {
    lane: 0.08,
    target: 0.28,
    at: 0.18,
    lines: [
      '[ 02 / STRUCTURE ]',
      'CONTENT ARCHITECTURE',
      'WIREFRAMES',
      'USER FLOWS',
      'СТРОИМ ПОНЯТНЫЙ ПУТЬ',
    ],
  },
  {
    lane: 0.04,
    target: 0.2,
    at: 0.7,
    lines: [
      '[ 03 / VISUAL ]',
      'ТИПОГРАФИКА',
      'СЕТКА И КОМПОЗИЦИЯ',
      'ЦВЕТ И КОНТРАСТ',
      'СОСТОЯНИЯ ИНТЕРФЕЙСА',
      'ПЛАВНОЕ ДВИЖЕНИЕ',
    ],
  },
  {
    lane: 0.8,
    target: 0.7,
    at: 1.23,
    lines: [
      '[ 04 / DEVELOPMENT ]',
      '<COMPONENT />',
      'STATE → INTERACTION',
      'REACT / TYPESCRIPT',
      'FRONTEND + BACKEND',
      'ЧИСТАЯ ЛОГИКА',
    ],
  },
  {
    lane: 0.82,
    target: 0.7,
    at: 1.82,
    lines: [
      '[ 05 / CONNECT ]',
      'ЗАЯВКА → БОТ → CRM',
      'АВТОМАТИЗАЦИЯ',
      'ИНТЕГРАЦИИ СЕРВИСОВ',
      'ДАННЫЕ БЕЗ ПОТЕРЬ',
      '{ STATUS: CONNECTED }',
    ],
  },
  {
    lane: 0.04,
    target: 0.14,
    at: 2.38,
    lines: [
      '[ 06 / QUALITY ]',
      'MOBILE / TABLET / DESKTOP',
      'KEYBOARD + TOUCH',
      'БЫСТРАЯ ЗАГРУЗКА',
      'ПРОВЕРКА СЦЕНАРИЕВ',
      'TEST → REFINE → RELEASE',
    ],
  },
  {
    lane: 0.76,
    target: 0.6,
    at: 3.13,
    lines: [
      '[ 07 / LAUNCH ]',
      'САЙТ ГОТОВ К ЗАПУСКУ',
      'DESIGNED WITH PURPOSE',
      'BUILT FOR PEOPLE',
      '</LET’S BEGIN>',
    ],
  },
]

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const expoInOut = (value: number) => {
  const t = clamp(value)
  if (t === 0 || t === 1) return t
  return t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2
}

export function animateLoaderScene(root: HTMLElement, onTime: (fraction: number) => void) {
  // Groups only organise the copy. Every row owns its geometry and two FLIP
  // phases, matching ScrollTextMotion's individual `.el` triggers.
  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-loader-group]')).flatMap(
    (group, groupIndex) =>
      Array.from(group.querySelectorAll<HTMLElement>('[data-loader-row]')).map(
        (element, index) => ({
          element,
          textNode: element.firstChild as Text,
          get text() {
            return element.dataset.loaderText ?? loaderGroups[groupIndex].lines[index]
          },
          item: loaderGroups[groupIndex],
          index,
          width: 0,
          height: 0,
          startX: 0,
          targetX: 0,
          startY: 0,
          offsetY: 0,
        }),
      ),
  )
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let height = root.clientHeight
  let frame = 0
  let elapsed = 0
  let previous = performance.now()
  let previousTextTick = -1
  let stopped = false

  const measure = () => {
    const width = root.clientWidth
    height = root.clientHeight
    // Batch layout reads; frames below only write transforms/opacity/filter.
    rows.forEach((row) => {
      row.width = row.element.offsetWidth
      row.height = row.element.offsetHeight
    })
    rows.forEach((row) => {
      const { item } = row
      const maxX = Math.max(16, width - row.width - 16)
      const lane = item.lane
      const target = item.target
      row.startX = Math.min(maxX, Math.max(16, width * lane))
      row.targetX = Math.min(maxX, Math.max(16, width * target))
      row.startY = (item.at + 0.9) * height + row.index * row.height
      // Keep pos-8's vertical offset, with wider horizontal lanes for this intro.
      row.offsetY = item.cascade ? Math.min(50, height * 0.06) : 0
    })
  }
  measure()
  const resize = new ResizeObserver(measure)
  resize.observe(root)

  const tick = (now: number) => {
    if (stopped) return
    elapsed += Math.min(now - previous, 80)
    previous = now
    const cycle = 4.6 * height
    // Travel 17% less in the same presentation time; keep recycling distance
    // separate so slowing down does not compress the row distribution.
    const virtualScroll = (elapsed / INTRO_DURATION) * 3.8 * height
    const textTick = Math.floor(elapsed / 80)
    onTime(Math.min(1, elapsed / INTRO_DURATION))

    rows.forEach((row, index) => {
      const { item, element } = row
      // Wrap each row only outside the viewport. A stalled asset or the final
      // progress fill must not leave an empty scene or restart every row at once.
      const y = ((((row.startY - virtualScroll + row.height) % cycle) + cycle) % cycle) - row.height
      // Same per-line landmarks as the reference:
      // bottom bottom-=10% -> center center -> top top.
      const enterStart = height * 0.9 - row.height
      const centre = height * 0.5 - row.height * 0.5
      const entering = clamp((enterStart - y) / (enterStart - centre))
      const exiting = clamp((centre - y) / centre)
      const flip = y >= centre ? expoInOut(entering) : 1 - expoInOut(exiting)
      const x = row.startX + (row.targetX - row.startX) * flip
      const translatedY = y + row.offsetY * flip
      element.style.transform = `translate3d(${x}px, ${translatedY}px, 0)`
      element.style.opacity = String(item.large ? 1 : 0.6 + flip * 0.4)
      // Only the long cascade uses the soft-focus destination (pos-8).
      if (item.cascade) element.style.filter = `blur(${(flip * 1.2).toFixed(2)}px)`

      if (textTick !== previousTextTick && y < height && y + row.height > 0) {
        const reveal = clamp((height - y) / (height * (item.large ? 0.58 : 0.28)))
        row.textNode.data = Array.from(row.text)
          .map((char, charIndex) => {
            if (char === ' ' || charIndex < Math.floor(reveal * row.text.length)) return char
            return alphabet[(textTick * 7 + charIndex * 11 + index * 3) % alphabet.length]
          })
          .join('')
      }
    })
    previousTextTick = textTick
    frame = requestAnimationFrame(tick)
  }

  const onVisibility = () => {
    cancelAnimationFrame(frame)
    if (!document.hidden && !stopped) {
      previous = performance.now()
      frame = requestAnimationFrame(tick)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  if (!document.hidden) frame = requestAnimationFrame(tick)

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    resize.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
