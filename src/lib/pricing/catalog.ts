export type PriceCopy = { ru: string; en: string }
export type PricingGroup = 'web' | 'bots-crm' | 'ai' | 'video-content' | 'support'
export type PricingOffer = {
  id: string
  category: PricingGroup
  amount: number | null
  priceType: 'fixed' | 'from' | 'custom' | 'monthly'
  pilot: boolean
  name: PriceCopy
  scope: PriceCopy
  limits: PriceCopy
  timing: PriceCopy
}

// One catalogue for the price page, service dialogs and enquiry context.
export const pricingGroups: {
  id: PricingGroup
  name: PriceCopy
  description: PriceCopy
  summary: PriceCopy
}[] = [
  {
    id: 'web',
    name: {
      ru: 'Сайты, дизайн и приложения',
      en: 'Websites, design and apps',
    },
    description: {
      ru: 'От небольшой страницы до цифрового продукта. Дизайн можно заказать отдельно.',
      en: 'From a small page to a digital product. Design can be commissioned separately.',
    },
    summary: {
      ru: 'Компактный запуск — 29 000 ₽ · Индивидуальный лендинг — 45 000 ₽',
      en: 'Compact launch — ₽29,000 · Custom landing page — ₽45,000',
    },
  },
  {
    id: 'bots-crm',
    name: {
      ru: 'Боты и CRM',
      en: 'Bots and CRM',
    },
    description: {
      ru: 'Отдельный бот, настройка CRM или связка сервисов. Состав выбираем под процесс.',
      en: 'A standalone bot, CRM setup or connected services. Scope follows the process.',
    },
    summary: {
      ru: 'Telegram-бот — от 30 000 ₽ · CRM — от 70 000 ₽',
      en: 'Telegram bot — from ₽30,000 · CRM — from ₽70,000',
    },
  },
  {
    id: 'ai',
    name: {
      ru: 'ИИ и автоматизация',
      en: 'AI and automation',
    },
    description: {
      ru: 'Начинаем с одного процесса и проверяем пользу на пилоте.',
      en: 'Start with one process and test its value in a pilot.',
    },
    summary: {
      ru: 'Автоматизация — от 100 000 ₽ · AI — от 150 000 ₽',
      en: 'Automation — from ₽100,000 · AI — from ₽150,000',
    },
  },
  {
    id: 'video-content',
    name: {
      ru: 'Видеоконтент для социальных сетей',
      en: 'Video content for social media',
    },
    description: {
      ru: 'Комплексное продвижение через видеоконтент. Состав пакета адаптируем под задачи, сферу бизнеса и аудиторию. Отдельные ролики и этапы не предоставляются.',
      en: 'A complete video marketing package, tailored to your goals, industry and audience. Individual videos and production stages are not sold separately.',
    },
    summary: {
      ru: 'Пакет видеопродвижения — от 100 000 ₽',
      en: 'Video marketing package — from ₽100,000',
    },
  },
  {
    id: 'support',
    name: {
      ru: 'Поддержка и развитие',
      en: 'Support and development',
    },
    description: {
      ru: 'Разовая доработка без подписки или регулярная работа в согласованном объёме.',
      en: 'One-off updates without a subscription, or ongoing work within an agreed allowance.',
    },
    summary: {
      ru: 'Разовые задачи — по смете · Поддержка — от 30 000 ₽/мес.',
      en: 'One-off work — quoted · Support — from ₽30,000/month',
    },
  },
]
export const pricingOffers: PricingOffer[] = [
  {
    id: 'compact',
    category: 'web',
    amount: 29000,
    priceType: 'fixed',
    pilot: true,
    name: {
      ru: 'Компактный запуск',
      en: 'Compact launch',
    },
    scope: {
      ru: 'До пяти секций на готовой основе, один язык, ваши тексты и изображения. Мобильная версия, одна форма до пяти полей, один канал заявок, аналитика и до двух целей.',
      en: 'Up to five sections on an existing foundation, one language, your copy and images. Responsive layout, one form with up to five fields, one enquiry channel, analytics and up to two goals.',
    },
    limits: {
      ru: 'Одна итерация правок в выбранной структуре. Без индивидуальной концепции, CRM, оплаты и написания текстов с нуля.',
      en: 'One revision round within the chosen structure. Custom concepts, CRM, payments and copywriting from scratch are separate.',
    },
    timing: {
      ru: '5–7 рабочих дней',
      en: '5–7 working days',
    },
  },
  {
    id: 'landing',
    category: 'web',
    amount: 45000,
    priceType: 'fixed',
    pilot: true,
    name: {
      ru: 'Индивидуальный лендинг',
      en: 'Custom landing page',
    },
    scope: {
      ru: 'Структура под задачу, индивидуальная визуальная концепция и до семи секций. Один язык, адаптивная сборка, одна форма, аналитика и базовая SEO-подготовка.',
      en: 'A structure built around your task, an individual visual concept and up to seven sections. One language, responsive build, one form, analytics and basic SEO setup.',
    },
    limits: {
      ru: 'Одна концепция, две итерации правок. Редактируем предоставленные тексты; контент с нуля, 3D и сложные подключения — отдельно.',
      en: 'One concept and two revision rounds. Editing of supplied copy is included; new content, 3D and complex integrations are separate.',
    },
    timing: {
      ru: '7–20 рабочих дней',
      en: '7–20 working days',
    },
  },
  {
    id: 'company',
    category: 'web',
    amount: 120000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Сайт компании',
      en: 'Company website',
    },
    scope: {
      ru: 'До пяти страниц и пяти уникальных шаблонов, один язык. Дизайн, разработка, CMS, стандартный каталог услуг, форма, аналитика и базовая SEO-подготовка.',
      en: 'Up to five pages and five unique layouts in one language. Design, development, CMS, a standard service catalogue, a form, analytics and basic SEO setup.',
    },
    limits: {
      ru: 'Одна концепция, две итерации по дизайну. Готовые материалы клиента. Дополнительные страницы, перенос данных, поиск и внешние интеграции — отдельно.',
      en: 'One concept and two design revision rounds. Client-supplied content. Extra pages, data migration, search and external integrations are separate.',
    },
    timing: {
      ru: '20–45 рабочих дней',
      en: '20–45 working days',
    },
  },
  {
    id: 'image-site',
    category: 'web',
    amount: 250000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Имиджевый сайт',
      en: 'Brand website',
    },
    scope: {
      ru: 'Индивидуальная концепция промостраницы до восьми секций и до трёх согласованных анимационных сцен. Адаптивная сборка и запуск.',
      en: 'An individual concept for a promotional page of up to eight sections and up to three agreed animation scenes. Responsive build and launch.',
    },
    limits: {
      ru: '3D, игровые механики, специальная серверная часть и нестандартные интеграции рассчитываются отдельно.',
      en: '3D, game mechanics, custom backend and non-standard integrations are quoted separately.',
    },
    timing: {
      ru: 'От 45 рабочих дней, после проектирования',
      en: 'From 45 working days, following scoping',
    },
  },
  {
    id: 'landing-design',
    category: 'web',
    amount: 30000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Дизайн лендинга',
      en: 'Landing page design',
    },
    scope: {
      ru: 'Структура, прототип и индивидуальный дизайн до восьми секций. Макеты для компьютера и телефона в Figma, компоненты и пояснения разработчику.',
      en: 'Structure, prototype and individual design for up to eight sections. Desktop and mobile Figma layouts, components and developer handover notes.',
    },
    limits: {
      ru: 'Одна концепция, две итерации. Результат — макеты. Разработка и публикация не входят; в готовый сайт дизайн уже включён.',
      en: 'One concept and two revision rounds. You receive design files. Development and publishing are separate; full website packages already include design.',
    },
    timing: {
      ru: '5–14 рабочих дней',
      en: '5–14 working days',
    },
  },
  {
    id: 'website-design',
    category: 'web',
    amount: 70000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Дизайн многостраничного сайта',
      en: 'Multi-page website design',
    },
    scope: {
      ru: 'До пяти уникальных шаблонов, компьютерная и мобильная версии, компоненты и стили в Figma.',
      en: 'Up to five unique layouts, desktop and mobile versions, components and styles in Figma.',
    },
    limits: {
      ru: 'Одна концепция, две итерации. Дополнительные шаблоны и полноценная дизайн-система — отдельный объём. Разработка не входит.',
      en: 'One concept and two revision rounds. Extra layouts and a full design system are separate scopes. Development is not included.',
    },
    timing: {
      ru: '14–30 рабочих дней',
      en: '14–30 working days',
    },
  },
  {
    id: 'interface',
    category: 'web',
    amount: 150000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Дизайн интерфейса сервиса',
      en: 'Service interface design',
    },
    scope: {
      ru: 'Один основной сценарий, одна роль, до десяти основных экранов и согласованные состояния. Прототип, компоненты и передача в разработку.',
      en: 'One main user journey, one role, up to ten main screens and agreed states. Prototype, components and developer handover.',
    },
    limits: {
      ru: 'Одна платформа. Дополнительные роли, сценарии, исследования с респондентами и разработка оцениваются отдельно.',
      en: 'One platform. Extra roles, journeys, participant research and development are quoted separately.',
    },
    timing: {
      ru: 'От 30 рабочих дней',
      en: 'From 30 working days',
    },
  },
  {
    id: 'mvp',
    category: 'web',
    amount: 300000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'MVP приложения',
      en: 'App MVP',
    },
    scope: {
      ru: 'Один основной сценарий, одна роль, одна платформа и до пяти основных экранов. Рабочая сборка, хранение данных в пределах сценария и подготовка материалов к публикации.',
      en: 'One main journey, one role, one platform and up to five main screens. A working build, data storage for the agreed journey and store preparation materials.',
    },
    limits: {
      ru: 'Подача в магазин согласуется отдельно. Дополнительная платформа, сложные платежи и административная система не входят. Срок модерации магазина не контролируем.',
      en: 'Store submission is agreed separately. Extra platforms, complex payments and an admin system are not included. Store review times are outside our control.',
    },
    timing: {
      ru: '1–3 календарных месяца',
      en: '1–3 calendar months',
    },
  },
  {
    id: 'business-app',
    category: 'web',
    amount: 700000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Бизнес-приложение',
      en: 'Business app',
    },
    scope: {
      ru: 'Одна платформа, один личный кабинет и до десяти основных экранов. Ограниченная серверная часть, одно подключение, согласованные push-уведомления и аналитика.',
      en: 'One platform, one user account area and up to ten main screens. A scoped backend, one integration, agreed push notifications and analytics.',
    },
    limits: {
      ru: 'Роли, нагрузка, работа без интернета, дополнительные платформы и этап публикации фиксируются в смете.',
      en: 'Roles, load requirements, offline use, extra platforms and the publishing stage are defined in the quote.',
    },
    timing: {
      ru: 'От 3 календарных месяцев',
      en: 'From 3 calendar months',
    },
  },
  {
    id: 'complex-app',
    category: 'web',
    amount: null,
    priceType: 'custom',
    pilot: false,
    name: {
      ru: 'Сложное приложение',
      en: 'Complex app',
    },
    scope: {
      ru: 'Сначала согласуем требования и архитектуру, затем оценим функции, платформы и этапы разработки.',
      en: 'We scope requirements and architecture first, then estimate features, platforms and development stages.',
    },
    limits: {
      ru: 'Стоимость первого этапа не является ценой всего приложения. Каждый этап имеет свой результат и бюджет.',
      en: 'The first-stage price is not the total app price. Each stage has its own deliverable and budget.',
    },
    timing: {
      ru: 'По плану проекта',
      en: 'According to the project plan',
    },
  },
  {
    id: 'basic-bot',
    category: 'bots-crm',
    amount: 30000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Telegram-бот для заявок',
      en: 'Telegram enquiry bot',
    },
    scope: {
      ru: 'Один сценарий до десяти шагов, меню, сбор заявки и уведомление в один согласованный канал. Запуск и инструкция.',
      en: 'One flow of up to ten steps, a menu, enquiry collection and notification to one agreed channel. Launch and instructions.',
    },
    limits: {
      ru: 'Без CRM, оплаты и отдельной панели управления. Один бот и один язык.',
      en: 'No CRM, payments or separate admin panel. One bot in one language.',
    },
    timing: {
      ru: '5–14 рабочих дней',
      en: '5–14 working days',
    },
  },
  {
    id: 'business-bot',
    category: 'bots-crm',
    amount: 80000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Telegram-бот для бизнеса',
      en: 'Telegram business bot',
    },
    scope: {
      ru: 'До трёх согласованных сценариев, хранение необходимых данных и одно подключение через доступный API.',
      en: 'Up to three agreed flows, storage of necessary data and one integration through an available API.',
    },
    limits: {
      ru: 'Для базового состава выбираем CRM или стандартную оплату. Дополнительные подключения и отдельный кабинет — по смете.',
      en: 'The base scope includes either CRM or standard payments. Extra integrations and a separate account area are quoted.',
    },
    timing: {
      ru: '14–30 рабочих дней',
      en: '14–30 working days',
    },
  },
  {
    id: 'crm',
    category: 'bots-crm',
    amount: 70000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Настройка CRM',
      en: 'CRM setup',
    },
    scope: {
      ru: 'Одна воронка до пяти этапов, до двух ролей и трёх простых автоматизаций. Одно обучение до 60 минут и инструкция.',
      en: 'One pipeline with up to five stages, up to two roles and three simple automations. One training session up to 60 minutes and instructions.',
    },
    limits: {
      ru: 'Лицензии, миграция и очистка данных, телефония и внешние подключения — отдельно.',
      en: 'Licences, data migration and cleaning, telephony and external integrations are separate.',
    },
    timing: {
      ru: '7–21 рабочий день',
      en: '7–21 working days',
    },
  },
  {
    id: 'max',
    category: 'bots-crm',
    amount: null,
    priceType: 'custom',
    pilot: false,
    name: {
      ru: 'Бот для MAX',
      en: 'MAX bot',
    },
    scope: {
      ru: 'Оценим выбранный сценарий, возможности платформы и необходимые подключения.',
      en: 'We assess the selected flow, platform capabilities and required integrations.',
    },
    limits: {
      ru: 'Цены Telegram-ботов не переносятся на MAX автоматически.',
      en: 'Telegram bot prices do not automatically apply to MAX.',
    },
    timing: {
      ru: 'После оценки сценария',
      en: 'After scoping the flow',
    },
  },
  {
    id: 'automation',
    category: 'ai',
    amount: 100000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Автоматизация процесса',
      en: 'Process automation',
    },
    scope: {
      ru: 'Один процесс между двумя системами, до пяти согласованных правил передачи данных, журнал ошибок и проверка результата.',
      en: 'One process between two systems, up to five agreed data-transfer rules, error logging and result checks.',
    },
    limits: {
      ru: 'Предполагаются доступные API. Новые процессы, двусторонняя синхронизация и перенос исторических данных — отдельно.',
      en: 'Available APIs are assumed. Extra processes, two-way synchronisation and historical data migration are separate.',
    },
    timing: {
      ru: 'От 14 рабочих дней',
      en: 'From 14 working days',
    },
  },
  {
    id: 'ai-bot',
    category: 'ai',
    amount: 150000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'AI-бот по базе знаний',
      en: 'Knowledge-base AI bot',
    },
    scope: {
      ru: 'Один канал, подготовленная текстовая база до 20 документов и 100 000 знаков, согласованный сценарий ответов и передача сложных вопросов человеку.',
      en: 'One channel, a prepared text knowledge base of up to 20 documents and 100,000 characters, an agreed answer flow and human handover.',
    },
    limits: {
      ru: 'Проверяем на 30 согласованных вопросах. Подготовка данных, OCR, обучение своей модели и внутренние подключения — отдельно.',
      en: 'Tested on 30 agreed questions. Data preparation, OCR, custom model training and internal integrations are separate.',
    },
    timing: {
      ru: 'От 20 рабочих дней',
      en: 'From 20 working days',
    },
  },
  {
    id: 'ai-process',
    category: 'ai',
    amount: 150000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'AI-автоматизация',
      en: 'AI automation',
    },
    scope: {
      ru: 'Один тип материалов, одна задача обработки и одно место передачи результата. Пилот, критерии качества и контроль расходов.',
      en: 'One type of input, one processing task and one destination for the result. A pilot, quality criteria and cost controls.',
    },
    limits: {
      ru: 'Звонки, документы и сообщения — разные объёмы. Использование AI-сервисов оплачивается отдельно по согласованным лимитам.',
      en: 'Calls, documents and messages are separate scopes. AI service usage is billed separately within agreed limits.',
    },
    timing: {
      ru: 'От 20 рабочих дней',
      en: 'From 20 working days',
    },
  },
  {
    id: 'video-marketing',
    category: 'video-content',
    amount: 100000,
    priceType: 'from',
    pilot: false,
    name: {
      ru: 'Пакет видеопродвижения',
      en: 'Video marketing package',
    },
    scope: {
      ru: 'Индивидуальная программа продвижения: анализ и стратегия, контент-план, сценарии, производство, публикация и аналитика. Состав пакета подбираем под задачи, сферу бизнеса и аудиторию.',
      en: 'A tailored marketing programme spanning research, strategy, content planning, scripts, production, publishing and analytics. The package is built around your goals, industry and audience.',
    },
    limits: {
      ru: 'Работаем только комплексным пакетом от 100 000 ₽. Отдельные Reels, сценарии, съёмка или монтаж не предоставляются. Площадки, объём контента, этапы и итоговую стоимость согласуем индивидуально до начала работы.',
      en: 'Available only as a complete package, starting at ₽100,000. Reels, scripts, filming and editing are not sold separately. Platforms, content volume, stages and the final price are agreed individually before work begins.',
    },
    timing: {
      ru: 'Сроки и график продвижения согласуем индивидуально',
      en: 'The timeline and publishing schedule are agreed individually',
    },
  },
  {
    id: 'one-off',
    category: 'support',
    amount: null,
    priceType: 'custom',
    pilot: false,
    name: {
      ru: 'Разовая задача',
      en: 'One-off task',
    },
    scope: {
      ru: 'Конкретная доработка существующего проекта после проверки доступов и состояния.',
      en: 'A specific update to an existing project, after reviewing access and its condition.',
    },
    limits: {
      ru: 'Без обязательной подписки. Результат, цену и срок фиксируем до начала.',
      en: 'No subscription required. Deliverable, price and schedule are agreed before work begins.',
    },
    timing: {
      ru: 'По согласованной задаче',
      en: 'According to the agreed task',
    },
  },
  {
    id: 'maintenance',
    category: 'support',
    amount: 30000,
    priceType: 'monthly',
    pilot: false,
    name: {
      ru: 'Техническая поддержка',
      en: 'Technical support',
    },
    scope: {
      ru: 'До 10 часов сопровождения одного проекта в месяц: диагностика, небольшие исправления, контент и согласованные проверки.',
      en: 'Up to 10 hours of monthly support for one project: diagnosis, minor fixes, content and agreed checks.',
    },
    limits: {
      ru: 'Новые функции — отдельная смета или пакет развития независимо от остатка часов. Общий регламент ниже.',
      en: 'New features require a separate quote or development plan regardless of remaining hours. Shared terms below.',
    },
    timing: {
      ru: 'Ежемесячно',
      en: 'Monthly',
    },
  },
  {
    id: 'development',
    category: 'support',
    amount: 70000,
    priceType: 'monthly',
    pilot: false,
    name: {
      ru: 'Развитие проекта',
      en: 'Ongoing development',
    },
    scope: {
      ru: 'До 20 часов в месяц на согласованный список страниц, функций, дизайна и аналитики. Планирование, реализация и проверка входят в часы.',
      en: 'Up to 20 monthly hours for an agreed list of pages, features, design and analytics. Planning, implementation and testing count towards the allowance.',
    },
    limits: {
      ru: 'Количество функций зависит от их трудоёмкости. Крупные задачи делим на согласованные этапы.',
      en: 'The number of features depends on their complexity. Larger tasks are split into agreed stages.',
    },
    timing: {
      ru: 'Ежемесячно',
      en: 'Monthly',
    },
  },
]

export function formatPrice(offer: PricingOffer, language: 'ru' | 'en') {
  if (offer.amount === null) return language === 'ru' ? 'Индивидуально' : 'Custom quote'
  const amount = new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-GB').format(offer.amount)
  const price = language === 'ru' ? `${amount} ₽` : `₽${amount}`
  const prefix =
    offer.priceType === 'from' || offer.priceType === 'monthly'
      ? language === 'ru'
        ? 'от '
        : 'from '
      : ''
  const suffix = offer.priceType === 'monthly' ? (language === 'ru' ? '/мес.' : '/month') : ''
  return prefix + price + suffix
}
