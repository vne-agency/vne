import { siteConfig } from '@/lib/site'

export const LEGAL_VERSION = '2026-09-12'
export const LEGAL_EMAIL = siteConfig.email
export const LEGAL_HOME = '/'

type Copy = { ru: string; en: string }
type Section = { title: Copy; paragraphs: Copy[] }
export type LegalDocument = {
  slug: string
  number: string
  title: Copy
  summary: Copy
  sections: Section[]
}
const c = (ru: string, en: string): Copy => ({ ru, en })
const operator = c(
  'Оператор — индивидуальный предприниматель Баров Евгений Алексеевич, ИНН 165034797000, ОГРНИП 326169000079011. По вопросам сайта и персональных данных: vne.agency@internet.ru.',
  'The operator is individual entrepreneur Evgeny Alekseevich Barov, taxpayer ID (INN) 165034797000, registration number (OGRNIP) 326169000079011. For website and personal data inquiries: vne.agency@internet.ru.',
)
const rights = c(
  'Вы можете запросить сведения об обработке своих данных, потребовать их уточнения, блокирования или удаления при наличии оснований и отозвать согласие. Напишите на vne.agency@internet.ru, указав контакт из обращения и сведения, достаточные для поиска данных. Оператор может уточнить принадлежность данных без запроса избыточных документов. Вы вправе обратиться в Роскомнадзор или суд.',
  'You may ask how your data is processed, request correction, restriction or deletion where applicable, and withdraw consent. Email vne.agency@internet.ru with the contact details you used in your inquiry and enough information to locate your data. The operator may verify that the data belongs to you without asking for unnecessary documents. You may also contact Roskomnadzor or a court.',
)

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'privacy',
    number: '01',
    title: c('Политика обработки персональных данных', 'Personal data policy'),
    summary: c(
      'Какие данные мы получаем, для чего используем и как вы можете ими управлять.',
      'What data we receive, why we use it and how you can manage it.',
    ),
    sections: [
      {
        title: c('Оператор и область действия', 'Operator and scope'),
        paragraphs: [
          operator,
          c(
            'Эта политика относится к посетителям vne.agency, заявителям и представителям заказчиков студии ВНЕ. Мы руководствуемся Федеральным законом № 152-ФЗ «О персональных данных» и применимым законодательством РФ. Данные клиентских проектов и работников требуют отдельного определения условий обработки.',
            'This policy applies to visitors to vne.agency, people making inquiries and representatives of VNE studio clients. We follow Federal Law No. 152-FZ on Personal Data and applicable Russian law. Processing arrangements for client project data and employee data must be defined separately.',
          ),
        ],
      },
      {
        title: c('Обращения и консультации', 'Inquiries and consultations'),
        paragraphs: [
          c(
            'Форма запрашивает ФИО и телефон, чтобы мы могли ответить, уточнить задачу и подготовить предложение. В переписке вы можете дополнительно сообщить email, сведения о компании и проекте. Вместе с обращением могут сохраняться адрес страницы, источник перехода и рекламные метки, если они передаются формой.',
            'The form asks for your full name and telephone number so we can reply, clarify your project requirements and prepare a proposal. You may also share your email address and details about your company and project in correspondence. The page URL, referral source and campaign tags may be stored with your inquiry if the form submits them.',
          ),
          c(
            'Основание обработки заявки — отдельное согласие. Для заключения договора по инициативе самого субъекта и исполнения договора с ним может применяться самостоятельное основание статьи 6 Закона № 152-ФЗ. Для данных представителей организаций основание определяется отдельно. Согласие на заявку не разрешает рекламные рассылки.',
            'An inquiry is processed on the basis of separate consent. Entering into a contract at the data subject’s initiative and performing that contract may have an independent basis under Article 6 of Law No. 152-FZ. The basis for processing company representatives’ data is assessed separately. Inquiry consent does not authorize advertising messages.',
          ),
          c(
            'Не присылайте паспортные данные, сведения о здоровье, пароли или данные третьих лиц без надлежащего основания. Для первого обсуждения проекта они не нужны.',
            'Please do not send passport details, health information, passwords or third-party data without a proper basis. We do not need them for an initial project discussion.',
          ),
        ],
      },
      {
        title: c('Технические данные и аналитика', 'Technical data and analytics'),
        paragraphs: [
          c(
            'Для работы и безопасности сайта инфраструктура может обрабатывать IP-адрес, время и адрес запроса, сведения о браузере и устройстве, ошибки и события безопасности. Такие сведения используются в необходимом объёме для обеспечения законных интересов оператора с соблюдением прав посетителей. Выбранный язык сохраняется в localStorage под ключом vne-language.',
            'To operate and secure the website, the infrastructure may process an IP address, request time and URL, browser and device information, errors and security events. This information is used to the extent necessary for the operator’s legitimate interests while respecting visitors’ rights. Your selected language is stored in localStorage under vne-language.',
          ),
          c(
            'Яндекс.Метрика используется только после отдельного разрешения на аналитику. Она получает технические сведения о посещении, идентификаторы браузера, просмотренные страницы, источник перехода и события взаимодействия. Цель — статистика и улучшение сайта. Обработчик — ООО «ЯНДЕКС», Россия, Москва, ул. Льва Толстого, д. 16.',
            'Yandex Metrica is used only with your separate permission for analytics. It receives technical information about your visit, browser identifiers, pages viewed, referral sources and interaction events to compile statistics and improve the website. The processor is YANDEX LLC, 16 Leo Tolstoy Street, Moscow, Russia.',
          ),
          c(
            'Предусмотренная сайтом конфигурация не передаёт ФИО, телефон или текст заявки в Метрику. Вебвизор и рекламные интеграции не включены. Отказ от аналитики не ограничивает просмотр сайта и отправку обращения. Изменить решение можно через «Настройки cookie».',
            'The website’s analytics configuration does not send your full name, telephone number or inquiry text to Metrica. Session Replay and advertising integrations are not enabled. You can still browse and send an inquiry if you decline analytics. To change your choice, open Cookie settings.',
          ),
        ],
      },
      {
        title: c('Хранение и подключённые сервисы', 'Storage and connected services'),
        paragraphs: [
          c(
            'Основной сайт и база заявок размещаются на одном сервере Timeweb Cloud в Российской Федерации. Поставщик — ООО «ТАЙМВЭБ.КЛАУД», ИНН 7810945525, Россия, Республика Татарстан, г. Иннополис, ул. Университетская, д. 7, оф. 605. Необходимый доступ предоставляется оператору и уполномоченным лицам, отвечающим за обращения и обслуживание инфраструктуры.',
            'The main website and inquiry database are hosted on a single Timeweb Cloud server in the Russian Federation. The provider is TIMEWEB.CLOUD LLC, INN 7810945525, office 605, 7 Universitetskaya Street, Innopolis, Republic of Tatarstan, Russia. Access is limited to what the operator and authorized people need to handle inquiries and maintain the infrastructure.',
          ),
          c(
            'Для служебных уведомлений используется интеграция с Telegram: при её включении контактные данные и содержание заявки передаются через Bot API в чат ответственных за обращения. Cloudflare Turnstile при его включении получает технические данные браузера для защиты формы от автоматических отправок. Работа через внешний прокси также может включать обработку сетевых данных его поставщиком.',
            'The website has a Telegram integration for internal notifications. When enabled, it sends contact details and inquiry content through the Bot API to a chat for the people handling inquiries. Cloudflare Turnstile, when enabled, receives technical browser data to protect the form against automated submissions. Using an external proxy may also involve its provider processing network data.',
          ),
          c(
            'Российское размещение основной базы не исключает обработку за рубежом подключёнными сервисами. Условия и основания такой передачи оцениваются отдельно, с выполнением требований статьи 12 Закона № 152-ФЗ до её начала. Согласие посетителя не заменяет обязанности оператора по локализации и уведомлению Роскомнадзора. Общедоступная публикация данных заявителей не входит в цели обработки.',
            'Hosting the main database in Russia does not rule out processing abroad by connected services. The conditions and legal basis for such transfers must be assessed separately, and the requirements of Article 12 of Law No. 152-FZ must be met before any transfer begins. Visitor consent does not replace the operator’s duties to localize data and notify Roskomnadzor. Public disclosure of inquiry data is not a purpose of processing.',
          ),
        ],
      },
      {
        title: c('Сроки, защита и удаление', 'Retention, security and deletion'),
        paragraphs: [
          c(
            'Обращение обрабатывается до завершения обсуждения, но не более шести месяцев с получения. После заключения договора необходимые данные используются для исполнения договора и обязательных требований закона. Обычные технические журналы ограничиваются сроком до 30 дней; записи конкретного инцидента могут сохраняться дольше при отдельном законном основании.',
            'An inquiry is processed until the discussion is complete, for no longer than six months from receipt. After a contract is concluded, the necessary data is used to fulfill the contract and meet statutory duties. Routine technical logs are kept for up to 30 days; records of a specific incident may be retained longer on a separate lawful basis.',
          ),
          c(
            'Оператор организует ограничение доступа, защиту учётных записей и соединений, обновление программ, резервирование и удаление данных. В зависимости от цели выполняются сбор, запись, систематизация, хранение, уточнение, извлечение, использование, предоставление необходимого доступа, блокирование, удаление и уничтожение, с автоматизацией и участием уполномоченных лиц.',
            'The operator arranges access restrictions, account and connection protection, software updates, backups and deletion. Depending on the purpose, processing includes collection, recording, organization, storage, correction, retrieval, use, necessary access, restriction, deletion and destruction, using automated systems and authorized personnel.',
          ),
          c(
            'После достижения цели или отзыва согласия данные уничтожаются в предусмотренный законом срок, обычно не позднее 30 дней, если отсутствует другое законное основание хранения. Это касается также копий у обработчиков. Истечение cookie не означает автоматического удаления уже полученных сервером данных; с запросом об их обработке можно обратиться к оператору.',
            'Once the purpose of processing has been fulfilled or consent is withdrawn, data is destroyed within the statutory period, generally within 30 days unless another lawful basis for retention applies. This also covers copies held by processors. When a cookie expires, data already received by a server is not automatically deleted. You can contact the operator about how that data is processed.',
          ),
        ],
      },
      {
        title: c('Ваши права и связь с нами', 'Your rights and how to contact us'),
        paragraphs: [
          rights,
          c(
            'Ответ на запрос информации об обработке предоставляется в течение десяти рабочих дней; мотивированное продление возможно ещё не более чем на пять рабочих дней. Для других требований действуют соответствующие сроки закона. Отзыв не отменяет законность предыдущей обработки. Новая редакция политики сама по себе не является согласием на новые цели.',
            'Requests for information about data processing are answered within ten working days. This may be extended by up to five additional working days if a reason is provided. Other requests are subject to the applicable statutory deadlines. Withdrawing consent does not invalidate earlier lawful processing. Publishing a revised policy does not, by itself, establish consent to new purposes.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'consent',
    number: '02',
    title: c('Согласие на обработку данных', 'Inquiry data consent'),
    summary: c(
      'Отдельное согласие для ответа на ваше обращение и обсуждения проекта.',
      'Separate consent for responding to your inquiry and discussing your project.',
    ),
    sections: [
      {
        title: c('Кому и для чего', 'Who processes your data and why'),
        paragraphs: [
          operator,
          c(
            'Самостоятельно устанавливая отметку согласия и отправляя форму, я добровольно разрешаю оператору обрабатывать мои данные для ответа на обращение, уточнения задачи, подготовки предложения и обсуждения проекта.',
            'By choosing to check the consent checkbox and submitting the form, I voluntarily authorize the operator to process my data to respond to my inquiry, clarify my project requirements, prepare a proposal and discuss my project.',
          ),
        ],
      },
      {
        title: c('Какие данные и действия', 'Data and processing'),
        paragraphs: [
          c(
            'Согласие относится к ФИО, телефону, сведениям о задаче и дополнительным контактам, которые я сам сообщу при обсуждении обращения. С заявкой может сохраняться её страница и источник, включая фактически переданные рекламные метки.',
            'Consent covers my full name, telephone number, project information and any additional contact details I choose to provide while discussing my inquiry. The page URL and referral source may be stored with the inquiry, including any campaign tags actually submitted.',
          ),
          c(
            'Разрешены сбор, запись, систематизация, накопление, хранение, уточнение, извлечение, использование для ответа, необходимое предоставление доступа указанным обработчикам, блокирование, удаление и уничтожение. Обработка осуществляется автоматически и уполномоченными лицами.',
            'Permitted operations include collection, recording, organization, accumulation, storage, correction, retrieval, use to respond, necessary access by the stated processors, restriction, deletion and destruction. Processing is automated and carried out by authorized personnel.',
          ),
          c(
            'Заявка хранится в российской инфраструктуре Timeweb Cloud, поставщик — ООО «ТАЙМВЭБ.КЛАУД», ИНН 7810945525. При включённых служебных уведомлениях контактные данные и содержание обращения также передаются ответственным за заявки через Telegram. Условия использования подключённых сервисов раскрываются в Политике обработки персональных данных; согласие не отменяет обязательных требований к передаче данных.',
            'The inquiry is stored on Timeweb Cloud infrastructure in Russia, provided by TIMEWEB.CLOUD LLC, INN 7810945525. When internal notifications are enabled, contact details and inquiry content are also sent through Telegram to the people handling inquiries. The terms for using connected services are described in the Personal data policy. Consent does not remove mandatory requirements for data transfers.',
          ),
        ],
      },
      {
        title: c('Срок и отзыв', 'Duration and withdrawal'),
        paragraphs: [
          c(
            'Согласие действует до завершения обсуждения, но не более шести месяцев с отправки заявки, или до отзыва, если он поступит раньше. Для заключённого договора и предусмотренных законом обязанностей могут действовать самостоятельные основания обработки необходимых данных.',
            'Consent remains valid until the discussion is complete, for no longer than six months after the inquiry is submitted, unless withdrawn sooner. A concluded contract and statutory duties may provide independent grounds for processing the necessary data.',
          ),
          c(
            'Для отзыва напишите на vne.agency@internet.ru, указав контакт из заявки. Данные удаляются в установленные законом сроки, если другое законное основание хранения отсутствует. Отзыв не отменяет правомерность обработки до его получения.',
            'To withdraw consent, email vne.agency@internet.ru and include the contact details you used in your inquiry. Data will be deleted within the statutory deadlines unless another lawful basis for retention applies. Withdrawal does not invalidate lawful processing carried out before the withdrawal was received.',
          ),
        ],
      },
      {
        title: c('Ваш отдельный выбор', 'Your separate choice'),
        paragraphs: [
          c(
            'Отметка не установлена заранее. Без согласия можно продолжить просмотр сайта. Это согласие не разрешает рекламные рассылки, аналитику посещений и публикацию моих данных. Эти цели не объединяются с отправкой заявки.',
            'The checkbox is unchecked by default. You may continue browsing without giving consent. This consent does not permit advertising messages, visit analytics or public disclosure of my data. Consent for those purposes is kept separate from submitting an inquiry.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    number: '03',
    title: c('Политика cookie', 'Cookie policy'),
    summary: c(
      'Небольшие настройки. Понятный выбор. Только та аналитика, которую вы разрешили.',
      'Simple settings, a clear choice, and only the analytics you allow.',
    ),
    sections: [
      {
        title: c('Cookie и хранилища браузера', 'Cookies and browser storage'),
        paragraphs: [
          operator,
          c(
            'Cookie — небольшие записи, которые браузер сохраняет для сайта. localStorage — отдельное хранилище; его записи не являются cookie. Мы используем настройки браузера для выбранного языка и сохранения вашего решения об аналитике.',
            'Cookies are small records that your browser saves for a website. localStorage is a separate form of storage, and its records are not cookies. The website saves preferences in your browser to remember your chosen language and your decision about analytics.',
          ),
        ],
      },
      {
        title: c('Функциональные настройки', 'Functional preferences'),
        paragraphs: [
          c(
            'vne-language хранит только ru или en, чтобы сохранять выбранный язык. Запись остаётся до изменения языка или очистки данных сайта. vne-cookie-choice хранит решение об аналитике, дату выбора, дату истечения и редакцию согласия. Решение действует шесть месяцев; после истечения мы запрашиваем его снова. Эти записи не содержат данные вашей заявки.',
            'vne-language stores only ru or en to remember your chosen language. It remains until the language is changed or site data is cleared. vne-cookie-choice stores your analytics choice, selection time, expiration time and consent version. The choice lasts six months, after which we ask again. These records do not contain your inquiry data.',
          ),
          c(
            'Функциональные записи не включают аналитический счётчик. При недоступном хранилище решение действует только в текущей вкладке. После очистки браузера язык и выбор могут быть сброшены.',
            'These functional preferences do not activate analytics. If browser storage is unavailable, your choice applies only in the current tab. Clearing browser data may reset your language and analytics choice.',
          ),
        ],
      },
      {
        title: c('Яндекс Метрика', 'Yandex Metrica'),
        paragraphs: [
          c(
            'После нажатия «Разрешить аналитику» может загружаться настроенный счётчик Яндекс.Метрики. Он помогает оценить посещаемость и взаимодействие с сайтом. Вебвизор, содержимое формы и рекламные интеграции не используются в этой конфигурации.',
            'After you select Allow analytics, a configured Yandex Metrica counter may load. It helps measure visits and website interactions. Session Replay, form contents and advertising integrations are not used in this configuration.',
          ),
          c(
            'Метрика может использовать _ym_uid и _ym_d со сроком до года, _ym_isad — до 20 часов, _ym_metrika_enabled — до 60 минут, а также аналитические ключи localStorage. Состав зависит от настроек счётчика и браузера. Срок cookie не равен сроку хранения данных на сервере. Подробный справочник: https://yandex.ru/support/metrica/ru/general/cookie-usage.',
            'Metrica may use _ym_uid and _ym_d for up to one year, _ym_isad for up to 20 hours, _ym_metrika_enabled for up to 60 minutes, and analytics keys in localStorage. The exact set depends on counter and browser settings. The lifetime of a cookie is different from the period for which data is retained on the server. Full reference: https://yandex.ru/support/metrica/ru/general/cookie-usage.',
          ),
        ],
      },
      {
        title: c('Разрешение и отказ', 'Allowing and declining'),
        paragraphs: [
          c(
            'До согласия счётчик не загружается. «Отклонить аналитику» сохраняет отказ; сайт и форма продолжают работать. Прокрутка, закрытие окна и продолжение просмотра не считаются согласием. После разрешения не отправляются задним числом события, совершённые до него.',
            'The counter does not load before you give consent. Selecting Decline analytics saves your choice; the website and inquiry form continue to work. Scrolling, closing the panel or continuing to browse does not count as consent. Events that occurred before you gave permission are not sent later.',
          ),
          c(
            'Откройте «Настройки cookie» внизу страницы, чтобы изменить решение. При отзыве дальнейшая аналитика отключается и удаляются доступные сайту аналитические записи. Записи сторонних доменов можно удалить в настройках браузера. По поводу ранее переданных данных обратитесь на vne.agency@internet.ru.',
            'Open Cookie settings at the bottom of the page to change your choice. Withdrawing consent stops further analytics and removes analytics records that the website can access. You can clear records from third-party domains in your browser settings. For questions about data already transferred, contact vne.agency@internet.ru.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'analytics-consent',
    number: '04',
    title: c('Согласие на аналитику', 'Analytics consent'),
    summary: c(
      'Добровольное разрешение на статистику посещений с Яндекс.Метрикой.',
      'Your choice to allow visit statistics through Yandex Metrica.',
    ),
    sections: [
      {
        title: c('Цель и оператор', 'Purpose and operator'),
        paragraphs: [
          operator,
          c(
            'Нажимая «Разрешить аналитику» или сохраняя включённую аналитику в настройках, я отдельно и добровольно соглашаюсь на обработку данных посещения vne.agency для статистики и улучшения сайта.',
            'By selecting Allow analytics or saving settings with analytics enabled, I separately and voluntarily consent to processing my visit data on vne.agency for statistics and website improvement.',
          ),
        ],
      },
      {
        title: c('Состав и получатель данных', 'Data and recipient'),
        paragraphs: [
          c(
            'Согласие охватывает IP-адрес, технические сведения о браузере и устройстве, идентификаторы браузера, время посещения, страницы, источник перехода и события взаимодействия. ФИО, телефон, email и содержимое заявки в аналитику не передаются.',
            'Consent covers your IP address, technical information about your browser and device, browser identifiers, visit time, pages, referral sources and interaction events. Your full name, telephone number, email address and inquiry content are not sent to analytics.',
          ),
          c(
            'Используется Яндекс.Метрика; обработку по поручению оператора осуществляет ООО «ЯНДЕКС», Россия, Москва, ул. Льва Толстого, д. 16. Разрешены автоматизированные сбор, запись, систематизация, накопление, хранение, уточнение, извлечение, использование, передача этому обработчику, обезличивание, блокирование, удаление и уничтожение.',
            'Yandex Metrica is used, with processing on the operator’s behalf by YANDEX LLC, 16 Leo Tolstoy Street, Moscow, Russia. Permitted automated operations include collection, recording, organization, accumulation, storage, correction, retrieval, use, transfer to this processor, de-identification, restriction, deletion and destruction.',
          ),
          c(
            'Разрешение включает аналитические cookie и localStorage, описанные в Политике cookie. Вебвизор и рекламные интеграции в эту конфигурацию не включены. Это согласие не касается рекламных рассылок и не заменяет согласие на заявку.',
            'Permission includes analytics cookies and localStorage described in the Cookie policy. Session Replay and advertising integrations are not included. This consent does not cover advertising messages or replace inquiry consent.',
          ),
        ],
      },
      {
        title: c('Срок и отзыв', 'Duration and withdrawal'),
        paragraphs: [
          c(
            'Согласие действует шесть месяцев или до более раннего отзыва через «Настройки cookie». После отзыва дальнейшая отправка событий прекращается. Истечение срока согласия не означает автоматического удаления всех данных, ранее полученных сервисом; их обработка и удаление регулируются законом и условиями сервиса.',
            'Consent remains valid for six months unless you withdraw it sooner through Cookie settings. Withdrawing consent stops further events from being sent. When consent expires, data previously received by the service is not automatically erased; its processing and deletion are governed by law and the service’s terms.',
          ),
          c(
            'Отказ не ограничивает доступ к сайту или форме. По вопросам ранее переданных данных и их удаления напишите на vne.agency@internet.ru. При необходимости мы уточним минимальные сведения для поиска вашего посещения и рассмотрим запрос в предусмотренном законом порядке.',
            'Declining analytics does not restrict access to the website or inquiry form. For questions about data already sent or its deletion, email vne.agency@internet.ru. If needed, we will ask for the minimum information required to locate your visit and will handle your request as required by law.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'terms',
    number: '05',
    title: c('Пользовательское соглашение', 'Website terms'),
    summary: c(
      'Условия знакомства со студией, её проектами и услугами.',
      'The terms for exploring the studio, its projects and services.',
    ),
    sections: [
      {
        title: c('О сайте', 'About the website'),
        paragraphs: [
          operator,
          c(
            'Сайт vne.agency представляет услуги и проекты студии ВНЕ. Эти условия регулируют использование сайта и не ограничивают обязательные права пользователя по законодательству РФ. Просмотр страниц сам по себе не означает согласия на рекламу или любую обработку данных.',
            'vne.agency presents VNE studio’s services and projects. These terms govern website use and do not restrict mandatory rights under Russian law. Browsing alone does not constitute consent to advertising or any data processing.',
          ),
        ],
      },
      {
        title: c('Обсуждение и заказ проекта', 'Discussing and commissioning a project'),
        paragraphs: [
          c(
            'Описание услуг и кейсов приглашает обсудить задачу. Объём работ, стоимость, сроки, оплата, приёмка и передача прав определяются отдельным договором и заданием. Отправка заявки и подтверждение её получения сами по себе не заключают договор на услуги и не создают обязанности оплаты.',
            'Service descriptions and case studies are an invitation to discuss your project. The scope of work, price, schedule, payment, acceptance and transfer of rights are set out in a separate contract and brief. Sending an inquiry and receiving an acknowledgment does not, by itself, create a service contract or an obligation to pay.',
          ),
          c(
            'Результаты конкретного кейса не гарантируют такие же показатели у другого заказчика. Согласованные требования и критерии результата фиксируются в договоре. Если на сайте появится отдельная процедура онлайн-заказа, её условия должны быть предоставлены до оформления заказа.',
            'Results from a particular case study do not guarantee the same outcomes for another client. Agreed requirements and success criteria are recorded in the contract. If a separate online ordering process is introduced, its terms must be available before an order is placed.',
          ),
        ],
      },
      {
        title: c('Обращения и материалы', 'Inquiries and materials'),
        paragraphs: [
          c(
            'Указывайте актуальные собственные контакты либо действуйте с надлежащими полномочиями. Не присылайте пароли, платёжные данные и конфиденциальные материалы до согласования подходящего канала и условий. Для передачи чужих материалов нужны соответствующие права.',
            'Provide your own current contact details or act with proper authority. Do not send passwords, payment details or confidential material before an appropriate channel and terms are agreed. You must have the necessary rights to provide third-party materials.',
          ),
          c(
            'Запрещены несанкционированный доступ, вредоносные загрузки и действия, мешающие работе сайта или нарушающие права других лиц. Ограничения доступа применяются соразмерно нарушению.',
            'Unauthorized access, malicious uploads and actions that disrupt the website or infringe others’ rights are prohibited. Any access restrictions are applied in proportion to the violation.',
          ),
        ],
      },
      {
        title: c('Интеллектуальные права', 'Intellectual property'),
        paragraphs: [
          c(
            'Дизайн, тексты, код, изображения и анимации охраняются законом. Права могут принадлежать студии, её заказчикам и другим правообладателям. Просмотр кейса не передаёт права на представленные материалы. Использование допускается в пределах закона или разрешения правообладателя.',
            'Design, text, code, images and animations are legally protected. Rights may belong to the studio, its clients or other rights holders. Viewing a case study does not transfer rights to its materials. Use is allowed within legal exceptions or with the rights holder’s permission.',
          ),
          c(
            'Направление сообщения или брифа не означает безусловной передачи исключительных прав студии. Разрешение на использование материалов сайта можно запросить по email оператора.',
            'Sending a message or brief does not unconditionally transfer exclusive rights to the studio. Permission to use website materials can be requested by emailing the operator.',
          ),
        ],
      },
      {
        title: c('Внешние сайты и доступность', 'External websites and availability'),
        paragraphs: [
          c(
            'Кейсы могут содержать ссылки и открываемый пользователем просмотр внешних сайтов. Их владельцы самостоятельно определяют условия использования и обработки данных. Возможны изменения или недоступность таких ресурсов. На сайте студии также возможны перерывы для обслуживания и исправлений.',
            'Case studies may include links to external websites or a preview that you choose to open. Their owners set their own terms of use and data processing. These websites may change or become unavailable. The studio website may also be temporarily unavailable for maintenance and fixes.',
          ),
          c(
            'Ответственность определяется законом. Эти условия не исключают ответственность, которую нельзя исключить соглашением, и не отменяют обязательные права потребителя.',
            'Liability is determined by law. These terms do not exclude liability that cannot legally be excluded or remove mandatory consumer rights.',
          ),
        ],
      },
      {
        title: c('Данные, обращения и изменения', 'Data, inquiries and changes'),
        paragraphs: [
          c(
            'Обработка данных раскрывается в отдельных политиках и согласиях. Условия сайта не заменяют согласий на заявку и аналитику. По вопросам и претензиям: vne.agency@internet.ru. Применяется право РФ; предусмотренные законом способы защиты и правила подсудности сохраняются.',
            'Data processing is explained in separate policies and consent documents. Website terms do not replace inquiry or analytics consent. For inquiries and complaints: vne.agency@internet.ru. Russian law applies; statutory remedies and jurisdiction rules remain available.',
          ),
          c(
            'Новая редакция публикуется с датой. Изменения не меняют задним числом заключённые договоры и предоставленные согласия. Английская версия передаёт содержание русской; при обнаружении расхождений можно обратиться к оператору для уточнения без ограничения обязательных прав.',
            'Each revision is published with its date. Changes do not retroactively alter existing contracts or consent already given. The English version conveys the content of the Russian text. If you find a discrepancy, you can contact the operator for clarification; your statutory rights remain unaffected.',
          ),
        ],
      },
    ],
  },
]

export function getLegalDocument(slug: string) {
  return legalDocuments.find((document) => document.slug === slug)
}
