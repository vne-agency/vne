type Copy = { ru: string; en: string }
const copy = (ru: string, en: string): Copy => ({ ru, en })

export type KazanService = {
  slug: string
  serviceId: 'web' | 'bots-crm' | 'ai' | 'video-content'
  title: Copy
  description: Copy
  introduction: Copy
  offerIds: string[]
  scenarios: { title: Copy; description: Copy }[]
  proof: { slug: string; title: Copy; description: Copy }[]
  faq: { question: Copy; answer: Copy }[]
}

export const kazanServices: KazanService[] = [
  {
    slug: 'razrabotka-saytov',
    serviceId: 'web',
    title: copy('Разработка сайтов в Казани', 'Website development for Kazan businesses'),
    description: copy(
      'Создание сайтов для бизнеса в Казани: лендинги, корпоративные сайты и интернет-магазины. Дизайн, разработка, формы и интеграции. Кейсы и цены студии ВНЕ.',
      'Landing pages, company websites and online stores for Kazan businesses. Design, development, enquiry forms and integrations. Explore VNE projects and pricing.',
    ),
    introduction: copy(
      'Сайт должен помогать человеку понять ваше предложение и сделать следующий шаг. Для компаний из Казани проектируем этот путь целиком: от структуры и дизайна до рабочей формы, адаптации и запуска. Можно начать с небольшой страницы и развивать её по мере роста задачи.',
      'A website should help people understand your offer and take the next step. For businesses in Kazan, the work covers structure, design, responsive development and launch. Start with a focused page and expand when the business needs more.',
    ),
    offerIds: ['compact', 'landing', 'company', 'image-site'],
    scenarios: [
      {
        title: copy('Лендинг для одной услуги', 'A landing page for one service'),
        description: copy(
          'Когда важно объяснить предложение и получать обращения из рекламы или поиска. Согласуем структуру, покажем условия и преимущества, разместим контакты и форму. Для первого запуска не обязательно заказывать большой сайт.',
          'Explain an offer and receive enquiries from ads or search. The page brings together the service, terms, benefits, contact details and an enquiry form. A first launch does not need a large website.',
        ),
      },
      {
        title: copy('Сайт компании или клиники', 'A company or clinic website'),
        description: copy(
          'Когда услуг несколько, посетителю нужны отдельные страницы с понятными условиями. На примере казанского «Котопса» показываем, как связать описание услуг, стоимость, информацию о клинике и запись. Редактирование контента через CMS включаем по согласованному объёму.',
          'Several services need clear pages and a consistent route to contact. The Kazan veterinary clinic Kotopes shows how service information, prices and appointment requests can work together. CMS editing is included according to the agreed scope.',
        ),
      },
      {
        title: copy('Интернет-магазин и личный кабинет', 'An online store and customer account'),
        description: copy(
          'Если нужны каталог, поиск, оплата и работа с заказами, сначала описываем сценарии покупателя и команды. В ARC store разработали витрину и административную систему. Подключения к платёжным сервисам, CRM и учётным системам оцениваем отдельно.',
          'A catalogue, search, payments and orders start with customer and team workflows. ARC store combines a storefront with an administration system. Payment, CRM and accounting integrations are estimated separately.',
        ),
      },
    ],
    proof: [
      {
        slug: 'kotopes',
        title: copy('«Котопёс» / Казань', 'Kotopes / Kazan'),
        description: copy(
          'Сайт ветеринарной клиники в Казани: дизайн, разработка, услуги и запись, админ-панель для контента, уведомления о заявках, Метрика и Вебмастер.',
          'A Kazan veterinary clinic website: design, development, services and booking, content administration, enquiry notifications, Metrika and Webmaster setup.',
        ),
      },
      {
        slug: 'arc-store',
        title: copy('ARC store / интернет-магазин', 'ARC store / digital commerce'),
        description: copy(
          'Интернет-магазин цифровых товаров: каталог, поиск, оплата, управление товарами и общение с покупателями в одной системе.',
          'A digital goods store with a catalogue, search, payments, product management and customer communication in one system.',
        ),
      },
    ],
    faq: [
      {
        question: copy('Сколько стоит разработка сайта в Казани?', 'How much does a website cost?'),
        answer: copy(
          'Цена зависит от структуры, дизайна и функций. На странице приведены действующие форматы из общего прайса. Компактный запуск и индивидуальный лендинг по фиксированной цене относятся к пилотной серии: соответствие задачи и участие подтверждаем до начала. Для остальных проектов составляем смету.',
          'Pricing depends on structure, design and functionality. The options on this page use the current studio price list. Fixed-price compact and landing-page packages belong to a pilot series; scope fit and participation are confirmed before starting. Other projects receive an individual estimate.',
        ),
      },
      {
        question: copy(
          'Можно заказать только дизайн или доработку?',
          'Can I commission design or a small update separately?',
        ),
        answer: copy(
          'Да. Можно начать с макета в Figma, отдельной страницы, адаптации или исправления существующего сайта. Объём и результат фиксируем до начала; дизайн отдельно не включает разработку.',
          'Yes. Start with a Figma design, a page, responsive improvements or an update to an existing website. Scope and deliverables are agreed first; design-only work does not include development.',
        ),
      },
      {
        question: copy(
          'Как строится работа с заказчиком из Казани?',
          'How do you work with clients in Kazan?',
        ),
        answer: copy(
          'Бриф, обсуждение структуры и демонстрации проводим онлайн. Материалы и решения собираем в одном рабочем пространстве, передаём результат по согласованным этапам. Для старта достаточно описания задачи, материалов и ориентиров по бюджету.',
          'Briefing, structure reviews and demonstrations take place online. Materials and decisions stay in one workspace, with delivery at agreed milestones. A task description, available materials and a budget range are enough to start.',
        ),
      },
      {
        question: copy(
          'Будет ли сайт адаптирован для телефона?',
          'Will the website work on mobile?',
        ),
        answer: copy(
          'Адаптация входит в перечисленные форматы разработки сайта. Проверяем навигацию, чтение, формы и согласованные сценарии на разных размерах экрана. Сложные эффекты адаптируем под устройство и настройки уменьшенного движения.',
          'Responsive layouts are included in the listed website packages. Navigation, reading, forms and agreed workflows are checked at different screen sizes. Complex effects respect device constraints and reduced-motion preferences.',
        ),
      },
      {
        question: copy('Входит ли продвижение в поиске?', 'Is search promotion included?'),
        answer: copy(
          'Базовая SEO-подготовка и её состав зависят от формата и фиксируются в смете: заголовки, метаданные, индексируемые страницы и технические настройки. Продвижение, регулярный контент и ссылки — отдельная работа. Позиции в поиске и число заявок не гарантируем.',
          'Basic SEO setup depends on the package and is specified in the estimate: headings, metadata, indexable pages and technical settings. Ongoing promotion, content and links are separate work. Search positions and enquiry volumes are not guaranteed.',
        ),
      },
    ],
  },
  {
    slug: 'telegram-boty',
    serviceId: 'bots-crm',
    title: copy(
      'Разработка Telegram-ботов в Казани',
      'Telegram bot development for Kazan businesses',
    ),
    description: copy(
      'Telegram-боты для бизнеса в Казани: заявки, запись, уведомления и интеграции с CRM. Сценарий, разработка и передача команде. Базовый бот от 30 000 ₽ — ВНЕ.',
      'Telegram bots for Kazan businesses: enquiries, booking, notifications and CRM integrations. Workflow design, development and handover. Basic bots from ₽30,000 — VNE.',
    ),
    introduction: copy(
      'Когда обращения теряются между сайтом, мессенджером и таблицей, полезнее начать с одного понятного сценария. Разрабатываем Telegram-ботов для компаний из Казани: собирать заявки, уведомлять сотрудников и передавать данные в рабочую систему. Сначала описываем процесс, затем выбираем нужные подключения.',
      'When enquiries get lost between a website, a messenger and a spreadsheet, start with one clear workflow. Telegram bots can collect requests, notify staff and pass data to the right system. Define the process first, then choose the integrations.',
    ),
    offerIds: ['basic-bot', 'business-bot'],
    scenarios: [
      {
        title: copy('Заявки и первичные вопросы', 'Enquiries and initial questions'),
        description: copy(
          'Бот уточняет услугу, контакт и удобное время связи, затем передаёт обращение менеджеру. Согласуем ветки диалога, обязательные поля и действие при неполном ответе. Не нужно сразу переносить в бота всю работу отдела продаж.',
          'The bot asks about the service, contact details and preferred callback time, then passes the request to a manager. Agree the conversation branches, required fields and incomplete-answer handling without moving the whole sales process into a bot.',
        ),
      },
      {
        title: copy('Запись и уведомления', 'Booking and notifications'),
        description: copy(
          'Для клиники, сервиса или образовательного проекта можно связать запрос клиента и уведомление сотруднику. Подтверждение свободного времени и напоминания требуют связи с расписанием: отдельно определяем, какая система хранит актуальные слоты и кто подтверждает запись.',
          'Connect customer requests with staff notifications for a clinic, service business or education project. Availability checks and reminders need a scheduling source; define which system owns the time slots and who confirms each booking.',
        ),
      },
      {
        title: copy('CRM и внутренние процессы', 'CRM and internal workflows'),
        description: copy(
          'Если менеджеры работают в CRM, бот может передавать согласованные поля в нужную воронку. Проверяем API, роли, повторную отправку и журнал ошибок. CRM, платежи, админ-панель и ИИ не входят в базового бота автоматически — это отдельные сценарии и смета.',
          'A bot can pass agreed fields into the team’s CRM workflow. Check the API, permissions, retries and error logging. CRM, payments, an admin panel and AI are not automatically included in a basic bot; each requires its own scope and estimate.',
        ),
      },
    ],
    proof: [
      {
        slug: 'kotopes',
        title: copy('Уведомления для «Котопса» / Казань', 'Kotopes enquiry notifications / Kazan'),
        description: copy(
          'Для сайта казанской ветеринарной клиники создали бота, который сообщает команде о новых заявках. Это пример конкретного выполненного сценария уведомлений; полноценную запись внутри Telegram согласуем как отдельный проект.',
          'The Kazan veterinary clinic website includes a bot that alerts the team to new enquiries. This is an implemented notification workflow; full booking inside Telegram would be scoped as a separate project.',
        ),
      },
    ],
    faq: [
      {
        question: copy('Сколько стоит Telegram-бот?', 'How much does a Telegram bot cost?'),
        answer: copy(
          'Базовый бот в действующем прайсе — от 30 000 ₽, бизнес-бот — от 80 000 ₽. Итог зависит от веток диалога, подключений, хранения данных и интерфейса сотрудников. После описания процесса согласуем состав и стоимость.',
          'The current price list starts at ₽30,000 for a basic bot and ₽80,000 for a business bot. The total depends on conversation branches, integrations, storage and staff tools. Scope and cost are agreed after the workflow review.',
        ),
      },
      {
        question: copy(
          'Чем обычный бот отличается от Mini App?',
          'How does a bot differ from a Mini App?',
        ),
        answer: copy(
          'Обычный бот работает через сообщения и кнопки. Mini App — отдельный веб-интерфейс внутри Telegram: он уместен для сложного каталога или личного кабинета. Сначала проверяем, решается ли задача обычным ботом; Mini App оцениваем отдельно.',
          'A standard bot uses messages and buttons. A Mini App is a web interface inside Telegram, useful for a complex catalogue or customer account. First check whether a standard bot meets the need; a Mini App is estimated separately.',
        ),
      },
      {
        question: copy('Подключите бота к нашей CRM?', 'Can you connect our CRM?'),
        answer: copy(
          'Сначала проверим возможности API и доступы. Зафиксируем поля, направление обмена, правила создания и обновления записей. Лицензия CRM, платные API и интеграция оцениваются отдельно от базового сценария бота.',
          'First review API capabilities and access. Define fields, data flow and record creation or update rules. CRM licences, paid APIs and integration work are separate from a basic bot workflow.',
        ),
      },
      {
        question: copy('Что нужно для начала работы?', 'What do you need to get started?'),
        answer: copy(
          'Опишите, кто пользуется ботом, какую задачу он выполняет и куда должен передавать результат. Покажите текущий процесс, список систем и примеры вопросов. Токен бота и другие секреты передаются отдельно по согласованному защищённому каналу, не через публичную форму.',
          'Describe who uses the bot, what task it performs and where results should go. Share the current workflow, connected systems and sample questions. Bot tokens and other secrets are exchanged separately through an agreed secure channel, never through the public form.',
        ),
      },
      {
        question: copy('Какие расходы остаются после запуска?', 'What costs remain after launch?'),
        answer: copy(
          'Возможны расходы на сервер, лицензии подключённых систем и платные API. Поддержка, новые сценарии и ИИ-запросы, если они нужны, согласуются отдельно. Перед запуском обсуждаем, какие сервисы используются и кто ими управляет.',
          'Ongoing costs may include hosting, connected-system licences and paid APIs. Support, new workflows and AI usage, if needed, are agreed separately. Before launch, review the services in use and who maintains them.',
        ),
      },
    ],
  },
  {
    slug: 'avtomatizatsiya-biznesa',
    serviceId: 'ai',
    title: copy('Автоматизация бизнеса в Казани', 'Business automation for Kazan teams'),
    description: copy(
      'Автоматизация бизнес-процессов в Казани: CRM, интеграции сервисов, обработка заявок и ИИ. Начинаем с одного процесса. Состав работ и цены студии ВНЕ.',
      'Business process automation for Kazan teams: CRM, service integrations, enquiries and AI workflows. Start with one process. Scope and pricing from VNE.',
    ),
    introduction: copy(
      'Заявки приходится переносить вручную, статусы расходятся между системами, а отчёт собирается из нескольких таблиц. Помогаем компаниям из Казани связать эти действия в понятный процесс: определяем правила, подключаем сервисы и проверяем результат на реальных сценариях команды.',
      'Manually copied enquiries, conflicting records and reports scattered across spreadsheets take time from the team. Connect these steps into a clear workflow: define the rules, integrate the tools and test the result against everyday tasks.',
    ),
    offerIds: ['crm', 'automation', 'ai-process'],
    scenarios: [
      {
        title: copy('От заявки до ответственного', 'From enquiry to owner'),
        description: copy(
          'Для клиники, учебного проекта или сервисной компании связываем форму, CRM и уведомления. Согласуем обязательные поля, назначение сотрудника и обработку повторных обращений, чтобы команда видела, что происходит с каждой заявкой.',
          'Connect forms, CRM and notifications for a clinic, education project or service business. Define required fields, staff assignment and duplicate handling so the team can follow each enquiry.',
        ),
      },
      {
        title: copy('Обмен данными между сервисами', 'Data that moves between tools'),
        description: copy(
          'Для магазина или отдела продаж настраиваем передачу согласованных данных между двумя системами. Проверяем доступность API, правила обновления и поведение при ошибке. Начать можно с одного процесса, который сейчас отнимает больше всего времени.',
          'Connect two systems used by a store or sales team. Review APIs, update rules and failure handling. Start with the process that currently takes the most manual effort.',
        ),
      },
      {
        title: copy('ИИ для конкретной операции', 'AI for a specific task'),
        description: copy(
          'Классификация обращений, извлечение данных из текста или подготовка сводки. Выбираем одну операцию, согласуем примеры и критерии качества. Неуверенный результат передаётся сотруднику; важные решения остаются под его контролем.',
          'Classify enquiries, extract information from text or prepare a summary. Choose one task, agree sample inputs and quality criteria, and route uncertain results to a person for review.',
        ),
      },
    ],
    proof: [
      {
        slug: 'kotopes',
        title: copy('«Котопёс» / работа с заявками', 'Kotopes / enquiry notifications'),
        description: copy(
          'Для казанской клиники связали сайт с уведомлениями о новых заявках через бота. Команда получает обращение из формы в рабочий канал. Этот выполненный сценарий показывает, с какой небольшой связки можно начать автоматизацию.',
          'The Kazan clinic website sends new enquiry notifications through a bot. Form submissions reach the team’s working channel: a practical example of starting with one focused connection.',
        ),
      },
      {
        slug: 'arc-store',
        title: copy('ARC store / управление магазином', 'ARC store / store operations'),
        description: copy(
          'Создали административную систему для работы с товарами, общения с клиентами, управления финансами и анализа данных. Рабочие инструменты собраны вокруг задач команды магазина.',
          'Built an administration system for products, customer communication, finances and data analysis, organised around the store team’s daily tasks.',
        ),
      },
    ],
    faq: [
      {
        question: copy('Сколько стоит автоматизация бизнеса?', 'How much does automation cost?'),
        answer: copy(
          'Настройка CRM — от 70 000 ₽, автоматизация одного процесса — от 100 000 ₽, AI-автоматизация — от 150 000 ₽ по действующему прайсу. Объём, подключения и критерии приёмки фиксируем до разработки. Лицензии и использование внешних сервисов учитываются отдельно.',
          'CRM setup starts at ₽70,000, a single automation workflow at ₽100,000 and AI automation at ₽150,000. Scope, integrations and acceptance criteria are agreed before development. Licences and external service usage are separate.',
        ),
      },
      {
        question: copy('Обязательно менять нашу CRM?', 'Do we need to replace our CRM?'),
        answer: copy(
          'Начинаем с уже используемых систем. Проверяем API, права доступа и ограничения тарифа. Если текущая CRM позволяет решить задачу, подключаем её. Замену платформы обсуждаем только после оценки процесса и стоимости перехода.',
          'Start with the tools already in use. Review APIs, permissions and plan limits. Keep the current CRM when it can support the workflow; consider a replacement only after assessing the process and migration cost.',
        ),
      },
      {
        question: copy('Как проверяется результат?', 'How is the result checked?'),
        answer: copy(
          'До начала согласуем контрольные примеры: правильная передача полей, отсутствие дублей, уведомление об ошибке и повторная обработка. Для ИИ отдельно фиксируем допустимые ошибки и случаи передачи человеку. Эффект по времени можно сравнить с исходным процессом после запуска.',
          'Agree test cases first: correct fields, duplicate prevention, error alerts and retries. For AI, define acceptable errors and human handover conditions. After launch, compare time spent with the original workflow.',
        ),
      },
      {
        question: copy('Можно начать с небольшого этапа?', 'Can we start with a small phase?'),
        answer: copy(
          'Да. Выбираем одну повторяющуюся операцию и описываем, что поступает на вход и каким должен быть результат. После проверки первого этапа решаем, какие процессы подключать дальше. Встречи и демонстрации для команд из Казани проводим онлайн.',
          'Yes. Choose one repeatable task and define its inputs and expected output. Once that phase is tested, decide what to connect next. Reviews and demonstrations for Kazan teams take place online.',
        ),
      },
      {
        question: copy('Что потребуется от команды?', 'What will you need from the team?'),
        answer: copy(
          'Описание текущего процесса, примеры обезличенных данных, список систем и ответственный за согласование. Доступы выдаются в согласованном объёме. После запуска передаём инструкции, а сопровождение и новые процессы обсуждаем отдельно.',
          'A description of the current process, anonymised examples, a list of systems and a person who can approve decisions. Access is limited to the agreed scope. Handover includes instructions; ongoing support and additional workflows are scoped separately.',
        ),
      },
    ],
  },
  {
    slug: 'videoprodvizhenie',
    serviceId: 'video-content',
    title: copy('Видеопродвижение бизнеса в Казани', 'Video marketing for Kazan businesses'),
    description: copy(
      'Комплексное видеопродвижение для бизнеса в Казани от 100 000 ₽: стратегия, сценарии, производство, публикации и аналитика. Индивидуальный пакет студии ВНЕ.',
      'Video marketing for Kazan businesses from ₽100,000: strategy, scripts, production, publishing and analytics. A tailored programme from VNE.',
    ),
    introduction: copy(
      'Видео должно помогать человеку познакомиться с продуктом и сделать следующий шаг. Для бизнеса в Казани собираем цельную программу продвижения: от выбора тем и сценариев до выпуска контента и анализа отклика. Состав подбираем под вашу сферу, аудиторию и задачу. Работаем комплексным пакетом от 100 000 ₽.',
      'Video helps people understand a product and take the next step. Build a complete programme, from topics and scripts to publishing and reviewing audience response. The scope follows your industry, audience and goals. Complete packages start at ₽100,000.',
    ),
    offerIds: ['video-marketing'],
    scenarios: [
      {
        title: copy('Познакомить с продуктом', 'Introduce the product'),
        description: copy(
          'Для магазина, бренда или нового сервиса определяем, что зрителю важно понять перед покупкой. Собираем темы вокруг продукта, его применения и частых вопросов. Для каждой публикации продумываем понятное продолжение: сайт, каталог или обращение.',
          'For a store, brand or new service, identify what viewers need to know before buying. Build topics around the product, its use and common questions, with a clear next step to the website, catalogue or contact.',
        ),
      },
      {
        title: copy('Показать экспертизу команды', 'Show the team’s expertise'),
        description: copy(
          'Для клиники, образовательного проекта или компании услуг готовим контент на основе реальных вопросов клиентов. Помогаем превратить знания команды в понятные объяснения. Участие специалистов, материалы и формат производства согласуем заранее.',
          'For a clinic, education project or service business, develop content around real customer questions. Turn the team’s knowledge into clear explanations and agree expert participation, materials and production format in advance.',
        ),
      },
      {
        title: copy('Выстроить регулярный выпуск', 'Build a publishing rhythm'),
        description: copy(
          'Связываем контент-план, производство, согласование и публикации. Смотрим, какие темы удерживают внимание и приводят к следующему действию. По доступным данным корректируем следующий цикл, а объём и площадки фиксируем в составе пакета.',
          'Connect planning, production, approvals and publishing. Review which topics hold attention and lead to a next step, then adjust the next cycle using available data. Content volume and platforms are agreed in the package.',
        ),
      },
    ],
    proof: [
      {
        slug: 'arc-store',
        title: copy('ARC store / короткие видео', 'ARC store / short-form video'),
        description: copy(
          'Для интернет-магазина ARC Raiders спродюсировали каналы привлечения через короткие видео. Контент стал частью проекта вместе с сайтом, оплатой и витриной для зарубежной аудитории. Подробности — в кейсе.',
          'Produced short-form video acquisition channels for the ARC Raiders store. Content formed part of the project alongside the website, payments and an international storefront. Explore the case for details.',
        ),
      },
    ],
    faq: [
      {
        question: copy('Что входит в пакет от 100 000 ₽?', 'What is included from ₽100,000?'),
        answer: copy(
          'Анализ задачи и аудитории, стратегия, контент-план, сценарии, производство, публикация и аналитика. Конкретные площадки, количество материалов, этапы, период работы и итоговую стоимость согласуем индивидуально. Это стартовая цена комплексного проекта, а не фиксированный набор роликов.',
          'Audience and project research, strategy, a content plan, scripts, production, publishing and analytics. Platforms, content volume, stages, project period and final cost are agreed individually. This is the starting price for a complete project, not a fixed number of videos.',
        ),
      },
      {
        question: copy(
          'Можно заказать один Reels или только монтаж?',
          'Can I order a single Reel or editing only?',
        ),
        answer: copy(
          'В этом направлении работаем только комплексным пакетом продвижения. Отдельные Reels, сценарии, съёмка и монтаж не предоставляются. Состав программы адаптируем под задачу бизнеса и доступные материалы.',
          'This service is available only as a complete marketing package. Individual Reels, scripts, filming and editing are not sold separately. The programme is tailored to the business goal and available materials.',
        ),
      },
      {
        question: copy(
          'Как организуется производство для бизнеса в Казани?',
          'How is production arranged for a Kazan business?',
        ),
        answer: copy(
          'Начинаем с онлайн-брифа и проверки исходных материалов. Если нужны новые съёмки, заранее согласуем локацию, участников, команду и расходы. Формат производства и возможность работы на площадке подтверждаем до старта проекта.',
          'Start with an online brief and a review of existing material. If new filming is needed, agree the location, participants, crew and expenses in advance. Production arrangements and on-site availability are confirmed before the project starts.',
        ),
      },
      {
        question: copy('Как оценивается продвижение?', 'How is progress measured?'),
        answer: copy(
          'Выбираем показатели под задачу: удержание, вовлечённость, переходы на сайт и обращения, если их можно связать с публикациями. Доступы к аналитике и разметку ссылок согласуем заранее. Конкретное число просмотров, подписчиков или продаж не обещаем.',
          'Choose measures that fit the goal: retention, engagement, website visits and enquiries where attribution is available. Agree analytics access and link tracking in advance. Specific view, follower or sales numbers are not guaranteed.',
        ),
      },
      {
        question: copy(
          'Включены ли рекламный бюджет и дополнительные расходы?',
          'Are media spend and extra expenses included?',
        ),
        answer: copy(
          'Смета фиксирует производство и работу команды. Рекламные размещения, аренду, участников съёмки, поездки и другие внешние расходы обсуждаем отдельно, если они нужны. До начала у вас будет согласованный состав и бюджет программы.',
          'The estimate specifies production and team work. Paid placements, rentals, cast, travel and other external costs are discussed separately when required. The scope and programme budget are agreed before work begins.',
        ),
      },
    ],
  },
]

export const getKazanServiceHref = (slug: string) => `/services/kazan/${slug}`
export const getKazanService = (slug: string) => kazanServices.find((page) => page.slug === slug)
