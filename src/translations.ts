export interface TranslationKeys {
  appName: string;
  appSubtitle: string;
  tabWelcome: string;
  tabAutoMod: string;
  tabRoles: string;
  tabSetup: string;
  tabChat: string;
  languageLabel: string;
  
  // Welcome Manager
  welcomeTitle: string;
  welcomeDesc: string;
  enableWelcome: string;
  channelSelect: string;
  messageTemplateLabel: string;
  messageTemplateDesc: string;
  messageTemplatePlaceholder: string;
  embedToggle: string;
  embedColorLabel: string;
  avatarAsThumbnailLabel: string;
  bannerUrlLabel: string;
  bannerUrlPlaceholder: string;
  saveSettings: string;
  savedSuccess: string;
  
  // AutoMod Manager
  autoModTitle: string;
  autoModDesc: string;
  filterSpam: string;
  filterSpamDesc: string;
  filterLinks: string;
  filterLinksDesc: string;
  filterBadWords: string;
  filterBadWordsDesc: string;
  filterInvites: string;
  filterInvitesDesc: string;
  listBadWords: string;
  ruleAction: string;
  actionDelete: string;
  actionTimeout: string;
  actionWarn: string;
  ruleEnabled: string;
  
  // Role Manager
  roleTitle: string;
  roleDesc: string;
  roleNamePlaceholder: string;
  roleColorLabel: string;
  assignableToggle: string;
  addRoleBtn: string;
  deleteRoleBtn: string;
  rolesListHeader: string;
  rolesListSub: string;
  selfRolesHeader: string;
  
  // Setup Guide
  setupTitle: string;
  setupDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  inviteBtn: string;
  inviteHint: string;
  
  // Discord Playground
  playgroundTitle: string;
  playgroundDesc: string;
  simJoinBtn: string;
  simLeaveBtn: string;
  inputMessagePlaceholder: string;
  activeRolesLabel: string;
  botStatusText: string;

  // Landing Page
  navHome: string;
  navDashboard: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCTAConfigure: string;
  heroCTAInvite: string;
  statsServers: string;
  statsServersVal: string;
  statsUsers: string;
  statsUsersVal: string;
  statsUptime: string;
  statsUptimeVal: string;
  featureWelcomeTitleOverride: string;
  featureWelcomeTextOverride: string;
  featureAutoModTitleOverride: string;
  featureAutoModTextOverride: string;
  featureRolesTitleOverride: string;
  featureRolesTextOverride: string;
  featureInteractiveTitle: string;
  featureInteractiveText: string;
}

export const translations: Record<"ru" | "en", TranslationKeys> = {
  en: {
    appName: "nyanchi",
    appSubtitle: "Discord Bot Configurator & Live Playground",
    tabWelcome: "Welcome Manager",
    tabAutoMod: "AutoMod System",
    tabRoles: "Role Manager",
    tabSetup: "Setup Guide",
    tabChat: "Chat Playground",
    languageLabel: "Language / Язык",
    
    welcomeTitle: "Greetings & Departures",
    welcomeDesc: "Configure highly engaging rich card alerts when a user boards your Discord guild. Utilize live templates, custom embeds, and banner backdrops.",
    enableWelcome: "Enable Welcome System",
    channelSelect: "Target Chat Channel",
    messageTemplateLabel: "Greeting Message Template",
    messageTemplateDesc: "Available tags: {user} - mention user, {guild} - server name, {count} - member count.",
    messageTemplatePlaceholder: "Hey {user}, welcome to {guild}! You are our #{count} member! 🌸",
    embedToggle: "Use Stylized Embed Card",
    embedColorLabel: "Embed Accent Border (HEX)",
    avatarAsThumbnailLabel: "Display User Avatar as Thumbnail",
    bannerUrlLabel: "Greeting Card Banner URL",
    bannerUrlPlaceholder: "https://images.unsplash.com/... (leave empty for cute default)",
    saveSettings: "Save Configurations",
    savedSuccess: "Settings synchronized successfully!",
    
    autoModTitle: "AutoMod Defense Grid",
    autoModDesc: "Establish real-time behavioral filters to protect your server. System logic instantly flags violation metrics and logs administrative actions.",
    filterSpam: "Anti-Spam Rapid-Fire",
    filterSpamDesc: "Detects multiple duplicate messages sent within rapid seconds.",
    filterLinks: "Hyperlink Verification",
    filterLinksDesc: "Prevents unauthorized outward advertising and dangerous URL domains.",
    filterBadWords: "Profanity & Toxicity Filter",
    filterBadWordsDesc: "Block custom prohibited list and clean general toxic vocabularies.",
    filterInvites: "Discord Invite Blocker",
    filterInvitesDesc: "Disallow links containing discord.gg invite paths to keep users loyal.",
    listBadWords: "Prohibited Words Separated by Comma",
    ruleAction: "Action on Infraction",
    actionDelete: "Delete message instantly",
    actionTimeout: "Timeout user (60 seconds)",
    actionWarn: "Issue formal warning label",
    ruleEnabled: "Rule Status Enabled",
    
    roleTitle: "Dynamic Role Desk",
    roleDesc: "Create server ranks and self-assignable options. Reaction roles let community members pick roles by simple click interactions.",
    roleNamePlaceholder: "e.g. Gamer, Artist, Cat Lover",
    roleColorLabel: "Role Theme Color",
    assignableToggle: "Self-Assignable by Members",
    addRoleBtn: "Generate Custom Role",
    deleteRoleBtn: "Delete Rank",
    rolesListHeader: "Configured Server Ranks",
    rolesListSub: "Managing hierarchy and user permissions.",
    selfRolesHeader: "Reaction Role Station (Click to assign)",
    
    setupTitle: "Quick Start Guide",
    setupDesc: "Follow these simple, illustrated instructions to unlock Nyanchi's comprehensive automated bot power.",
    step1Title: "1. Invite Nyanchi Bot",
    step1Desc: "Use the link below to request our application into your active server and safe permissions registry.",
    step2Title: "2. Position the Bot Role",
    step2Desc: "Make sure 'Nyanchi' role is placed HIGHER than normal user roles in settings, otherwise moderation commands will fail.",
    step3Title: "3. Choose Alert Target",
    step3Desc: "Designate specific text channels like #general or #welcome to handle greetings and telemetry updates.",
    step4Title: "4. Test the Integration",
    step4Desc: "Use our interactive sandbox chat on the right to send messages and test the automation rules before deploying live.",
    inviteBtn: "Authorize & Add to Server",
    inviteHint: "🌸 Trusted by active servers worldwide.",
    
    playgroundTitle: "Discord Interface Simulator",
    playgroundDesc: "A complete real-time sandbox of your guild's chat stream. Simulate join events, self-assign ranks, and attempt bad words to test AutoMod filters.",
    simJoinBtn: "Simulate Member Join",
    simLeaveBtn: "Simulate Member Leave",
    inputMessagePlaceholder: "Type message as active participant (Press Enter to send)...",
    activeRolesLabel: "Assigned Roles",
    botStatusText: "Nyanchi Bot: Active & Defending Server",

    // Landing Page
    navHome: "Home",
    navDashboard: "Configurator Dashboard",
    heroTitle: "Meet Nyanchi, Guard of Your Server",
    heroSubtitle: "A beautifully automated, ultra-kawaii Discord bot combining professional moderation defense, customizable greeting embeds, and self-assignable roles.",
    heroCTAConfigure: "Launch Configurator",
    heroCTAInvite: "Invite Nyanchi",
    statsServers: "Defense System",
    statsServersVal: "Active",
    statsUsers: "Interactive Simulator",
    statsUsersVal: "Ready",
    statsUptime: "Live Status Tracker",
    statsUptimeVal: "Online",
    featureWelcomeTitleOverride: "Premium Welcome Cards",
    featureWelcomeTextOverride: "Instantly greet new players with stunning, auto-generated graphics and status-matched embeddings.",
    featureAutoModTitleOverride: "Dynamic AutoMod Shield",
    featureAutoModTextOverride: "Safeguard chats from toxic behavior, spam attacks, invite links, and aggressive text patterns.",
    featureRolesTitleOverride: "Reaction-Driven Roles",
    featureRolesTextOverride: "Let players customize profiles natively by self-claiming custom text tags and vanity roles in real-time.",
    featureInteractiveTitle: "Interactive Live Sandbox",
    featureInteractiveText: "Test out your entire configuration instantly inside an automated live browser Discord clone simulation."
  },
  ru: {
    appName: "nyanchi",
    appSubtitle: "Конфигуратор и Интерактивный Симулятор Discord Бота",
    tabWelcome: "Приветствия",
    tabAutoMod: "Модерация AutoMod",
    tabRoles: "Управление Ролями",
    tabSetup: "Гайд по Установке",
    tabChat: "Симулятор Чата",
    languageLabel: "Язык / Language",
    
    welcomeTitle: "Премиальные Приветствия",
    welcomeDesc: "Настройте яркие карточки приветствий, когда новый участник заходит на ваш Discord сервер. Используйте динамический текст, эмбеды и фоновые баннеры.",
    enableWelcome: "Включить систему приветствий",
    channelSelect: "Целевой текстовый канал",
    messageTemplateLabel: "Шаблон приветственного сообщения",
    messageTemplateDesc: "Тэги: {user} - упомянуть юзера, {guild} - имя сервера, {count} - число участников.",
    messageTemplatePlaceholder: "Привет, {user}! Добро пожаловать на {guild}! Ты наш {count}-й участник! 🌸",
    embedToggle: "Использовать оформленные Embed карточки",
    embedColorLabel: "Цвет рамки карточки (HEX)",
    avatarAsThumbnailLabel: "Показывать аватар жителя как иконку",
    bannerUrlLabel: "Фоновая картинка приветствия (URL)",
    bannerUrlPlaceholder: "https://images.unsplash.com/... (оставьте пустым для базовой красоты)",
    saveSettings: "Сохранить Конфигурацию",
    savedSuccess: "Конфигурация успешно синхронизирована!",
    
    autoModTitle: "Защитный периметр AutoMod",
    autoModDesc: "Установите правила безопасности для автоматического сканирования чата. Робот мгновенно удаляет нарушения и наказывает злоумышленников.",
    filterSpam: "Анти-Спам (Частые сообщения)",
    filterSpamDesc: "Предотвращает отправку множества сообщений подряд за доли секунд.",
    filterLinks: "Фильтр Внешних Ссылок",
    filterLinksDesc: "Блокирует нежелательную рекламу сайтов и подозрительные ссылки.",
    filterBadWords: "Фильтр Запрещенных Слов",
    filterBadWordsDesc: "Автоматически блокирует нецензурную лексику или токсичные оскорбления.",
    filterInvites: "Защита от приглашений в сторонние Discord сервера",
    filterInvitesDesc: "Стирает ссылки типа discord.gg, чтобы снизить утечку своей аудитории.",
    listBadWords: "Список плохих слов (через запятую)",
    ruleAction: "Санкция за зафиксированное нарушение",
    actionDelete: "Удалить сообщение мгновенно",
    actionTimeout: "Режим тишины (Таймаут 60 сек)",
    actionWarn: "Выдать предупреждение (Варн)",
    ruleEnabled: "Статус правила активен",
    
    roleTitle: "Управление Ролями Сервера",
    roleDesc: "Создавайте роли сообщества и настраивайте самовыдаваемые роли. Реакции под сообщением позволят участникам брать роли одним нажатием клика.",
    roleNamePlaceholder: "Например: Геймер, Художник, Кошатник",
    roleColorLabel: "Цвет отображения роли",
    assignableToggle: "Самовыдаваемая роль участников",
    addRoleBtn: "Создать Роль",
    deleteRoleBtn: "Удалить Роль",
    rolesListHeader: "Созданная иерархия званий",
    rolesListSub: "Структура прав и красивых цветовых тегов в списке сервера.",
    selfRolesHeader: "Реакции выдачи ролей (Нажми для назначения)",
    
    setupTitle: "Гайд по Быстрой Настройке",
    setupDesc: "Пройдите 4 легких шага для полной автоматизации вашего игрового сервера с помощью няшной кошечки Nyanchi.",
    step1Title: "1. Приглашение Бота",
    step1Desc: "Используйте персональную кнопку для авторизции робота в вашем списке пользователей сервера.",
    step2Title: "2. Позиция роли Nyanchi",
    step2Desc: "Перетащите звание 'Nyanchi' как можно выше в настройках ролей, чтобы она могла банить и мутить нарушителей.",
    step3Title: "3. Выберите Каналы",
    step3Desc: "Обозначьте чат для логирования админ-действий и чат для публикации крутых приветствий новоприбывшим.",
    step4Title: "4. Проверка Симуляции",
    step4Desc: "Протестируйте фильтрацию ругательств, ссылок и выдачи на панели симулятора справа прямо сейчас.",
    inviteBtn: "Пригласить Бота на Сервер",
    inviteHint: "🌸 С каждым днем все больше сообществ доверяют модерацию Nyanchi.",
    
    playgroundTitle: "Интерактивный Эмулятор Discord",
    playgroundDesc: "Полнофункциональный симулятор чата. Имитируйте входы пользователей, выдавайте роли и пишите тестовые фразы для тестирования AutoMod.",
    simJoinBtn: "Имитировать Вход Юзера",
    simLeaveBtn: "Имитировать Выход Юзера",
    inputMessagePlaceholder: "Напишите сообщение от своего лица (Enter для отправки)...",
    activeRolesLabel: "Ваши роли на сервере",
    botStatusText: "Бот Nyanchi: Активен и Защищает Сервер",

    // Landing Page
    navHome: "Главная",
    navDashboard: "Конфигуратор",
    heroTitle: "Познакомьтесь с Няньчи — защитником вашего сервера",
    heroSubtitle: "Супер-милый и надёжный Discord-бот, объединяющий умную модерацию, красочные приветствия и интерактивную выдачу ролей.",
    heroCTAConfigure: "Открыть конфигуратор",
    heroCTAInvite: "Пригласить Няньчи",
    statsServers: "Система защиты",
    statsServersVal: "Активна",
    statsUsers: "Песочница и симуляция",
    statsUsersVal: "Готова",
    statsUptime: "Статус бота",
    statsUptimeVal: "В сети",
    featureWelcomeTitleOverride: "Красочные приветствия",
    featureWelcomeTextOverride: "Встречайте новых игроков великолепными автогенерируемыми карточками и персонализированными эмбедами.",
    featureAutoModTitleOverride: "Умный щит AutoMod",
    featureAutoModTextOverride: "Держите свои чаты в безопасности без ручного труда: умная фильтрация спама, оскорблений и внешних ссылок.",
    featureRolesTitleOverride: "Самовыдаваемые роли",
    featureRolesTextOverride: "Позвольте вашему сообществу самостоятельно настраивать профиль и выбирать теги простым кликом.",
    featureInteractiveTitle: "Интерактивная песочница",
    featureInteractiveText: "Тестируйте изменения моментально во встроенном интерактивном симуляторе чата Discord."
  }
};
