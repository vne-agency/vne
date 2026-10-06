// The launch package has its own terms; it does not replace the general price list.
export const turnkeyOffer = {
  id: 'turnkey-11999',
  path: '/services/sayt-pod-klyuch',
  amount: 11999,
  name: { ru: 'Сайт под ключ за 11 999 ₽', en: 'A turnkey website for ₽11,999' },
  introduction:
    'Ваша идея — готовый лендинг. Индивидуальный дизайн, админка, заявки в Telegram и базовая SEO-настройка в одном пакете.',
  description:
    'Создание лендинга под ключ за 11 999 ₽: индивидуальный дизайн, админка, форма, Telegram-бот и базовая SEO-настройка. Метрика, Вебмастер, домен на год и хостинг на месяц.',
} as const

export const turnkeyPackage = [
  {
    title: 'Индивидуальный дизайн и разработка',
    text: 'Лендинг под ваш бизнес с адаптацией для телефона и компьютера. Продумываем структуру, заголовки и текстовое наполнение, чтобы посетитель понял предложение.',
    enTitle: 'Custom design and development',
    enText:
      'A landing page for your business, adapted for phones and computers. Structure, headings and copy help visitors understand your offer.',
  },
  {
    title: 'Админка для контента',
    text: 'Управляйте содержимым сайта через административную панель. Покажем, как обновлять тексты и изображения.',
    enTitle: 'Content administration',
    enText:
      'Manage website content through an admin panel. We show you how to update text and images.',
  },
  {
    title: 'Форма заявки и Telegram-бот',
    text: 'Посетитель оставляет заявку на сайте, а бот присылает уведомление в Telegram. Проверяем форму и доставку уведомлений перед запуском.',
    enTitle: 'Enquiry form and Telegram bot',
    enText:
      'Visitors send an enquiry on the website and a bot notifies you in Telegram. We check the form and notification delivery before launch.',
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
    question: 'У меня только идея. Можно без ТЗ?',
    answer:
      'Да. Расскажите простыми словами, чем занимаетесь, кому предлагаете услугу и что хотите показать на сайте. Поможем собрать структуру и текстовое наполнение. Фотографии, контакты и факты о бизнесе уточним вместе.',
    enQuestion: 'Can I start with an idea and no specification?',
    enAnswer:
      'Yes. Tell us what you do, who your customers are and what the website should explain. We help with structure and copy, and clarify photos, contact details and business facts together.',
  },
  {
    question: 'Сколько стоит сайт под ключ и что входит?',
    answer:
      'Весь описанный пакет: лендинг с индивидуальным дизайном, админка, форма, Telegram-уведомления, подключение Метрики и Вебмастера, базовая SEO-настройка и текстовое наполнение. До начала зафиксируем структуру и состав работ. Если понадобятся функции за пределами пакета, обсудим их отдельно до выполнения.',
    enQuestion: 'What does ₽11,999 cover?',
    enAnswer:
      'The complete package described here: a custom landing page, admin panel, enquiry form, Telegram notifications, Metrika, Webmaster, foundational SEO and page copy. We agree on structure and scope before starting. Any features beyond this package are discussed separately before implementation.',
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
