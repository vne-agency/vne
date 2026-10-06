// Limited launch series. Close or revise this offer after three accepted projects; no simulated remaining-slot counter.
export const turnkeyOffer = {
  id: 'turnkey-11999',
  path: '/services/sayt-pod-klyuch',
  amount: 11999,
  name: { ru: 'Сайт под ключ за 11 999 ₽', en: 'A turnkey website for ₽11,999' },
  introduction:
    'ВНЕ запускает стартовую серию из трёх проектов: лендинг для одной услуги за 11 999 ₽. Индивидуальный дизайн, тексты по вашим материалам, админка и уведомления о заявках в Telegram.',
  description:
    'Сайт под ключ за 11 999 ₽ — стартовая серия ВНЕ из трёх проектов. До пяти секций, индивидуальный дизайн, админка, Telegram-уведомления и базовая SEO-настройка.',
} as const

export const turnkeyLaunch = {
  label: { ru: 'Стартовая серия — три проекта', en: 'Launch series — three projects' },
  terms: {
    ru: 'Цена 11 999 ₽ действует для трёх подходящих проектов стартовой серии. Участие подтверждаем после обсуждения задачи; заявка не бронирует место. Для принятого проекта цену и состав фиксируем до начала.',
    en: 'The ₽11,999 price applies to three suitable projects in the launch series. Participation is confirmed after scoping; an enquiry does not reserve a place. The price and scope of an accepted project are agreed before starting.',
  },
  scope: {
    ru: 'Одна страница для одной услуги, до пяти секций, один язык и одна форма. Одна версия индивидуального дизайна и одна собранная итерация правок в согласованном объёме.',
    en: 'One page for one service, up to five sections, one language and one form. One custom design proposal and one consolidated revision round within the agreed scope.',
  },
  payment: {
    ru: 'Оплата: 50% после согласования состава перед началом работы, 50% после проверки результата перед публикацией и передачей доступов. Срок фиксируем до старта. Исправление несоответствий согласованному заданию не расходует итерацию правок.',
    en: 'Payment: 50% after scoping and before work starts; 50% after reviewing the result, before publication and handover. Timing is agreed before starting. Corrections needed to meet the agreed brief do not count against the revision round.',
  },
} as const

export const turnkeyPackage = [
  {
    title: 'Объём и правки',
    text: turnkeyLaunch.scope.ru,
    enTitle: 'Scope and revisions',
    enText: turnkeyLaunch.scope.en,
  },
  {
    title: 'Индивидуальный дизайн и разработка',
    text: 'Лендинг с адаптацией для телефона и компьютера. Оформление под ваш бизнес; заголовки и тексты готовим по предоставленным фактам, услугам и материалам. Отдельное исследование рынка и несколько дизайн-концепций не входят.',
    enTitle: 'Custom design and development',
    enText:
      'A responsive landing page with design for your business. Headings and copy are based on the facts, services and materials you provide. Separate market research and multiple design concepts are not included.',
  },
  {
    title: 'Админка для контента',
    text: 'Меняйте тексты и изображения в согласованных блоках через административную панель. Покажем, как ей пользоваться. Конструктор новых страниц и сложный каталог в пакет не входят.',
    enTitle: 'Content administration',
    enText:
      'Edit text and images in the agreed sections through the admin panel. Handover includes instructions. A page builder and complex catalogue are outside the package.',
  },
  {
    title: 'Форма и Telegram-уведомления',
    text: 'Одна форма отправляет уведомление о заявке в один согласованный Telegram-чат через бота. Проверяем доставку перед запуском. Бот с меню и диалогами, CRM, онлайн-оплата и личный кабинет в пакет не входят.',
    enTitle: 'Enquiry form and Telegram notifications',
    enText:
      'One form sends enquiry notifications to one agreed Telegram chat through a bot. Delivery is checked before launch. A conversational bot with menus, CRM, online payments and user accounts are outside the package.',
  },
  {
    title: 'Яндекс.Метрика и Вебмастер',
    text: 'Подключаем Метрику для анализа посещений и действий на сайте. Вебмастер — для контроля индексации и диагностики сайта в поиске Яндекса.',
    enTitle: 'Yandex Metrika and Webmaster',
    enText:
      'Metrika provides visitor and interaction analytics. Webmaster helps monitor indexing and diagnose the website in Yandex Search.',
  },
  {
    title: 'Профессиональная базовая SEO-настройка',
    text: 'Готовим robots.txt, sitemap.xml, метаданные, иерархию заголовков и текстовое наполнение. Создаём основу для индексации; позиции в поиске не обещаем.',
    enTitle: 'Professional foundational SEO',
    enText:
      'We prepare robots.txt, sitemap.xml, metadata, a heading hierarchy and page copy. This provides a foundation for indexing, without promising search rankings.',
  },
] as const

export const turnkeyFaq = [
  {
    question: 'Почему сайт стоит 11 999 ₽?',
    answer:
      'Это цена стартовой серии из трёх подходящих проектов. Мы отрабатываем пакет запуска и собираем кейсы. Объём ограничен одной услугой и пятью секциями; качество сборки, адаптивность и проверка формы входят. После серии пересмотрим цену для новых заказов. Публикацию кейса согласуем отдельно; положительный отзыв не является условием цены.',
    enQuestion: 'Why does the website cost ₽11,999?',
    enAnswer:
      'This price is for a launch series of three suitable projects, used to refine the package and build case studies. Scope is limited to one service and five sections; responsive development and form testing are included. Pricing for new orders will be reviewed after the series. Case publication is agreed separately; a positive review is not a condition of the price.',
  },
  {
    question: 'Как проходит оплата?',
    answer: turnkeyLaunch.payment.ru,
    enQuestion: 'How does payment work?',
    enAnswer: turnkeyLaunch.payment.en,
  },
  {
    question: 'У меня только идея. Можно без ТЗ?',
    answer:
      'Да. Расскажите, чем занимаетесь и какую одну услугу хотите представить. Вы предоставляете достоверные факты о бизнесе, контакты и доступные изображения, мы помогаем со структурой и текстами на их основе. До оплаты проверим, подходит ли задача под стартовую серию.',
    enQuestion: 'Can I start with an idea and no specification?',
    enAnswer:
      'Yes. Describe your business and the one service you want to present. You provide accurate business facts, contacts and available images; we help with structure and copy. Before payment we confirm that the task fits the launch series.',
  },
  {
    question: 'Сколько стоит сайт под ключ и что входит?',
    answer:
      'Цена 11 999 ₽ включает одну страницу до пяти секций для одной услуги, один язык, одну версию индивидуального дизайна и одну итерацию правок. Также входят тексты по вашим материалам, админка контента, одна форма, Telegram-уведомления, Метрика, Вебмастер и базовая SEO-настройка. Цена действует для трёх подтверждённых проектов стартовой серии; дополнительные функции оцениваем до выполнения.',
    enQuestion: 'What does ₽11,999 cover?',
    enAnswer:
      'The ₽11,999 package covers one page with up to five sections for one service, one language, one custom design and one revision round. It includes copy based on your materials, content admin, one form, Telegram notifications, Metrika, Webmaster and basic SEO. The price applies to three confirmed launch-series projects; extra features are quoted before implementation.',
  },
  {
    question: 'Домен и хостинг останутся бесплатными?',
    answer:
      'В подарок — регистрация одного домена в зоне .ru или .рф на один год стоимостью до 300 ₽ и хостинг на первый месяц. После этих сроков продление оплачивается отдельно по тарифам выбранных провайдеров. Стоимость продления уточняем до регистрации и подключения.',
    enQuestion: 'Will the domain and hosting stay free?',
    enAnswer:
      'The gift covers registration of one .ru or .рф domain for one year, costing up to ₽300, and the first month of hosting. Renewals are paid separately at the selected providers’ rates, which we clarify before registration and setup.',
  },
  {
    question: 'Когда сайт будет готов?',
    answer:
      'Срок согласуем после обсуждения задачи, структуры и материалов. Покажем дизайн, соберём сайт, проверим мобильную версию и форму, затем передадим доступы. Универсальный срок без знакомства с задачей не назначаем.',
    enQuestion: 'When will the website be ready?',
    enAnswer:
      'We agree on a schedule after discussing the task, structure and materials. You review the design, then we build the site, check mobile layouts and the form, and hand over access.',
  },
  {
    question: 'Можно потом менять сайт и развивать его?',
    answer:
      'Да. Содержимым вы управляете через админку. Новые страницы, функции и дальнейшее развитие можно обсудить отдельно. Подключение аналитики помогает видеть, как посетители пользуются сайтом; базовая SEO-настройка сама по себе не гарантирует заявки.',
    enQuestion: 'Can I update and expand the website later?',
    enAnswer:
      'Yes. You manage content through the admin panel. New pages, features and further development can be discussed separately. Analytics shows how visitors use the site; foundational SEO alone does not guarantee enquiries.',
  },
] as const
