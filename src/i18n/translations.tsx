import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'bg' | 'en';

export interface Translations {
  // App Header
  appName: string;
  appSubtitle: string;
  versionBadge: string;
  tabChecker: string;
  tabResearch: string;
  tabDocs: string;
  fullscreen: string;
  addPair: string;
  printCheatSheet: string;
  oemTwinScanner: string;
  language: string;

  // Search & Filters
  searchPlaceholder: string;
  filterByBrand: string;
  allBrands: string;
  selectModel: string;
  foundModels: string;
  showingResultsFor: string;

  // Target Model Specs Card
  targetSpecsTitle: string;
  verifiedSpecs: string;
  dimensions: string;
  screenSpecs: string;
  cameraSpecs: string;
  hardwareFeatures: string;
  height: string;
  width: string;
  thickness: string;
  weight: string;
  diagonal: string;
  curvature: string;
  notch: string;
  aspectRatio: string;
  cameraShape: string;
  lensCount: string;
  bumpHeight: string;
  fingerprint: string;
  headphoneJack: string;
  port: string;
  buttons: string;
  yes: string;
  no: string;
  aliases: string;
  techNotes: string;

  // Categories
  allAccessories: string;
  screenProtectors: string;
  phoneCases: string;

  // Compatibility Results View
  compatibleAlternatives: string;
  alternativesDescription: string;
  confidenceScore: string;
  staffVerified: string;
  verifiedBy: string;
  visualOverlay: string;
  viewEvidence: string;
  toleranceDiff: string;
  fitAnalysis: string;
  caveats: string;
  noMatchesFound: string;
  noMatchesPrompt: string;
  openResearchBtn: string;
  addPairManuallyBtn: string;

  // Confidence Levels
  exactMatch: string;
  confirmedCompatible: string;
  highlyLikely: string;
  possibleWithCaution: string;
  notCompatible: string;
  unknown: string;

  // Visual Overlay Modal
  overlayTitle: string;
  overlaySubtitle: string;
  overlayLegendTarget: string;
  overlayLegendCandidate: string;
  overlayOpacityTarget: string;
  overlayOpacityCandidate: string;
  overlayScale: string;
  sideBySide: string;
  retailRecommendation: string;
  recommendationGoodFit: string;
  recommendationCaution: string;
  close: string;

  // Printable Cheat Sheet
  cheatSheetTitle: string;
  cheatSheetSubtitle: string;
  printBtn: string;
  exportCsvBtn: string;
  tableHeaderTarget: string;
  tableHeaderCandidate: string;
  tableHeaderCategory: string;
  tableHeaderConfidence: string;
  tableHeaderNotes: string;
  tableHeaderVerified: string;
  inferred: string;
  laminatedNotice: string;

  // Bulk Data & OEM Twin Scanner
  oemScannerTitle: string;
  oemScannerSubtitle: string;
  tabScanner: string;
  tabImport: string;
  tabExport: string;
  detectedTwins: string;
  autoRegisterTwins: string;
  importJsonTitle: string;
  importJsonDesc: string;
  importBtn: string;
  exportBackupTitle: string;
  exportBackupDesc: string;
  downloadModelsJson: string;
  downloadPairsJson: string;
  matchPercentage: string;
  activePair: string;
  discoveredNewTwin: string;

  // Admin Add Pair Modal
  addPairTitle: string;
  addPairSubtitle: string;
  donorModel: string;
  targetCustomerModel: string;
  selectCategory: string;
  confidenceTier: string;
  fitNotesPlaceholder: string;
  caveatsPlaceholder: string;
  verifierName: string;
  savePairBtn: string;

  // External Research
  researchTitle: string;
  researchSubtitle: string;
  searchWebQuery: string;
  searchGoogleBtn: string;
  importEvidenceBtn: string;
  alreadyInCatalog: string;

  // Footer
  footerText: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  bg: {
    // App Header
    appName: 'CaseScreenChecker',
    appSubtitle: 'Справка за съвместимост на протектори и калъфи за смартфони',
    versionBadge: 'Магазин Ref v1.0',
    tabChecker: 'Справка за съвместимост',
    tabResearch: 'Външно проучване и източници',
    tabDocs: 'Архитектурна документация',
    fullscreen: 'Цял екран',
    addPair: 'Добави съвместимост',
    printCheatSheet: 'Печат за каса',
    oemTwinScanner: 'OEM Twin Скенер',
    language: 'Език',

    // Search & Filters
    searchPlaceholder: 'Търси модел (напр. A05s, iPhone 14, Redmi 13C, SM-A155F)...',
    filterByBrand: 'Марка:',
    allBrands: 'Всички',
    selectModel: 'Изберете телефон',
    foundModels: 'Намерени модели',
    showingResultsFor: 'Показване на резултати за:',

    // Target Model Specs Card
    targetSpecsTitle: 'Физически параметри на търсения модел',
    verifiedSpecs: 'Проверени параметри',
    dimensions: 'Размери на шасито',
    screenSpecs: 'Екран и стъкло',
    cameraSpecs: 'Камера модул',
    hardwareFeatures: 'Хардуер и портове',
    height: 'Вис.',
    width: 'Шир.',
    thickness: 'Деб.',
    weight: 'Тегло',
    diagonal: 'Диагонал',
    curvature: 'Извивка',
    notch: 'Изрез / Ноч',
    aspectRatio: 'Съотношение',
    cameraShape: 'Форма на острова',
    lensCount: 'Брой камери',
    bumpHeight: 'Височина на борда',
    fingerprint: 'Пръстов отпечатък',
    headphoneJack: '3.5мм жак',
    port: 'Порт за зареждане',
    buttons: 'Разположение на бутони',
    yes: 'Да',
    no: 'Не',
    aliases: 'Алиаси и фабрични кодове:',
    techNotes: 'Бележки на техника:',

    // Categories
    allAccessories: 'Всички аксесоари',
    screenProtectors: 'Протектори за екран',
    phoneCases: 'Калъфи и кейсове',

    // Compatibility Results View
    compatibleAlternatives: 'Съвместими алтернативи (Донори)',
    alternativesDescription: 'Модели, чиито протектори или калъфи пасват на избрания телефон според точния физически толеранс',
    confidenceScore: 'Увереност',
    staffVerified: 'Потвърдено от персонал',
    verifiedBy: 'Проверил:',
    visualOverlay: '2D Визуален слой',
    viewEvidence: 'Източници',
    toleranceDiff: 'Физическа разлика (Толеранс):',
    fitAnalysis: 'Анализ на съвместимостта:',
    caveats: 'Внимание / Особености:',
    noMatchesFound: 'Няма намерени съвместими алтернативи в локалната база.',
    noMatchesPrompt: 'Можете да стартирате онлайн проучване или да въведете ръчно проверена двойка.',
    openResearchBtn: 'Стартирай онлайн проучване',
    addPairManuallyBtn: 'Добави съвместимост ръчно',

    // Confidence Levels
    exactMatch: 'ТОЧНО СЪВПАДЕНИЕ',
    confirmedCompatible: 'ПОТВЪРДЕНА СЪВМЕСТИМОСТ',
    highlyLikely: 'ВИСОКА ВЕРОЯТНОСТ',
    possibleWithCaution: 'ВЪЗМОЖНО С ВНИМАНИЕ',
    notCompatible: 'НЕСЪВМЕСТИМО',
    unknown: 'НЕИЗВЕСТНО',

    // Visual Overlay Modal
    overlayTitle: '2D Визуално наслагване и сравнение',
    overlaySubtitle: 'Прецизно наслагване на шасито, дисплея и модула на камерата за проверка на геометрията',
    overlayLegendTarget: 'Търсен телефон (Син контур)',
    overlayLegendCandidate: 'Алтернативен донор (Зелен контур)',
    overlayOpacityTarget: 'Прозрачност на търсения:',
    overlayOpacityCandidate: 'Прозрачност на донора:',
    overlayScale: 'Мащаб:',
    sideBySide: 'Един до друг',
    retailRecommendation: 'Препоръка за търговеца',
    recommendationGoodFit: 'Силиконов TPU кейс и стъклен протектор от донора могат сигурно да бъдат предложени на клиента.',
    recommendationCaution: 'Стъкленият протектор пасва точно. Избягвайте твърди пластмасови калъфи от донора поради леки разлики в шасито.',
    close: 'Затвори',

    // Printable Cheat Sheet
    cheatSheetTitle: 'Бърза справочна таблица за касовото работно място',
    cheatSheetSubtitle: 'Форматирана таблица за принтиране и ламиниране на съвместими протектори и калъфи',
    printBtn: 'Принтирай таблица',
    exportCsvBtn: 'Експорт CSV',
    tableHeaderTarget: 'Търсен от клиента модел',
    tableHeaderCandidate: 'Съвместима алтернатива (Донор)',
    tableHeaderCategory: 'Категория',
    tableHeaderConfidence: 'Ниво на съвместимост',
    tableHeaderNotes: 'Бележки за монтаж / особености',
    tableHeaderVerified: 'Проверка',
    inferred: 'Изчислено',
    laminatedNotice: 'CaseScreenChecker • Таблица за бърза справка в търговски обект',

    // Bulk Data & OEM Twin Scanner
    oemScannerTitle: 'Каталог & Автоматичен OEM Twin Скенер',
    oemScannerSubtitle: 'Групови операции, импорт/експорт и автоматично засичане на клонинги',
    tabScanner: 'Автоматичен OEM Twin Скенер',
    tabImport: 'Импорт на модели (JSON)',
    tabExport: 'Експорт на база данни',
    detectedTwins: 'Засечени хардуерни OEM близнаци',
    autoRegisterTwins: 'Запиши нови съвместимости',
    importJsonTitle: 'Групов импорт на телефонни модели (JSON)',
    importJsonDesc: 'Поставете JSON масив с обекти от тип PhoneModel за обновяване на каталога.',
    importBtn: 'Импортирай в каталога',
    exportBackupTitle: 'Експорт на архив от базата данни',
    exportBackupDesc: 'Изтеглете текущото състояние на моделите и съвместимостите като JSON файлове.',
    downloadModelsJson: 'Изтегли модели (JSON)',
    downloadPairsJson: 'Изтегли съвместимости (JSON)',
    matchPercentage: 'Съвпадение',
    activePair: 'Активна двойка',
    discoveredNewTwin: 'Новооткрит близнак',

    // Admin Add Pair Modal
    addPairTitle: 'Добавяне / Верификация на съвместимост',
    addPairSubtitle: 'Запишете тествана в магазина съвместимост между два модела',
    donorModel: 'Модел донор (аксесоарът е произведен за)',
    targetCustomerModel: 'Целеви модел (на който ще се постави)',
    selectCategory: 'Категория аксесоар',
    confidenceTier: 'Ниво на увереност',
    fitNotesPlaceholder: 'Опишете как пасва (напр. 100% покритие на дисплея, пасва идеално на изреза)',
    caveatsPlaceholder: 'Особености (напр. калъфът покрива леко микрофона или е с 0.2мм по-стегнат)',
    verifierName: 'Име на техника / магазина',
    savePairBtn: 'Запази съвместимост',

    // External Research
    researchTitle: 'Външно проучване и база данни с доказателства',
    researchSubtitle: 'Търсене на споделени платформи, фабрични съвместимости и тестове от техници',
    searchWebQuery: 'Търсене по модел или ключова дума...',
    searchGoogleBtn: 'Търси онлайн доказателства',
    importEvidenceBtn: 'Импортирай като съвместима двойка',
    alreadyInCatalog: 'Вече е в каталога',

    // Footer
    footerText: 'CaseScreenChecker • Прецизна система за физически толеранс и съвместимост на аксесоари за смартфони'
  },
  en: {
    // App Header
    appName: 'CaseScreenChecker',
    appSubtitle: 'Smartphone Case & Screen Protector Cross-Model Compatibility Reference',
    versionBadge: 'Retail Ref v1.0',
    tabChecker: 'Compatibility Reference',
    tabResearch: 'External Research & Evidence',
    tabDocs: 'Architecture Docs (docs/)',
    fullscreen: 'Fullscreen',
    addPair: 'Add / Verify Pair',
    printCheatSheet: 'Print Cheat Sheet',
    oemTwinScanner: 'OEM Twin Scanner',
    language: 'Language',

    // Search & Filters
    searchPlaceholder: 'Search model (e.g. A05s, iPhone 14, Redmi 13C, SM-A155F)...',
    filterByBrand: 'Brand:',
    allBrands: 'All',
    selectModel: 'Select phone model',
    foundModels: 'Found models',
    showingResultsFor: 'Showing results for:',

    // Target Model Specs Card
    targetSpecsTitle: 'Target Phone Physical Specifications',
    verifiedSpecs: 'Verified Specs',
    dimensions: 'Chassis Dimensions',
    screenSpecs: 'Screen & Glass',
    cameraSpecs: 'Camera Island',
    hardwareFeatures: 'Hardware & Ports',
    height: 'H',
    width: 'W',
    thickness: 'T',
    weight: 'Weight',
    diagonal: 'Diagonal',
    curvature: 'Curvature',
    notch: 'Notch / Cutout',
    aspectRatio: 'Aspect Ratio',
    cameraShape: 'Camera Shape',
    lensCount: 'Lenses',
    bumpHeight: 'Bump Height',
    fingerprint: 'Fingerprint',
    headphoneJack: '3.5mm Jack',
    port: 'Charge Port',
    buttons: 'Button Layout',
    yes: 'Yes',
    no: 'No',
    aliases: 'Aliases & Model Codes:',
    techNotes: 'Store Technician Notes:',

    // Categories
    allAccessories: 'All Accessories',
    screenProtectors: 'Screen Protectors',
    phoneCases: 'Phone Cases',

    // Compatibility Results View
    compatibleAlternatives: 'Compatible Alternatives (Donors)',
    alternativesDescription: 'Models whose screen protectors or cases fit this target device within precise physical tolerance',
    confidenceScore: 'Confidence',
    staffVerified: 'Staff Verified',
    verifiedBy: 'Verified by:',
    visualOverlay: '2D Visual Overlay',
    viewEvidence: 'Evidence',
    toleranceDiff: 'Physical Difference (Tolerance):',
    fitAnalysis: 'Fit Analysis:',
    caveats: 'Caveats / Notes:',
    noMatchesFound: 'No confirmed compatibility matches found in the local database.',
    noMatchesPrompt: 'You can launch online research or register a newly tested pair.',
    openResearchBtn: 'Launch Online Research',
    addPairManuallyBtn: 'Add Pair Manually',

    // Confidence Levels
    exactMatch: 'EXACT MATCH',
    confirmedCompatible: 'CONFIRMED COMPATIBLE',
    highlyLikely: 'HIGHLY LIKELY',
    possibleWithCaution: 'POSSIBLE WITH CAUTION',
    notCompatible: 'NOT COMPATIBLE',
    unknown: 'UNKNOWN',

    // Visual Overlay Modal
    overlayTitle: '2D Visual Alignment & Dimensional Overlay',
    overlaySubtitle: 'Visual comparison of chassis, display bounds, and camera island geometry',
    overlayLegendTarget: 'Target Phone (Blue Outline)',
    overlayLegendCandidate: 'Alternative Donor (Green Outline)',
    overlayOpacityTarget: 'Target Opacity:',
    overlayOpacityCandidate: 'Donor Opacity:',
    overlayScale: 'Scale:',
    sideBySide: 'Side by Side',
    retailRecommendation: 'Retail Staff Recommendation',
    recommendationGoodFit: 'TPU silicone case and glass protector from donor can safely be recommended to the customer.',
    recommendationCaution: 'Glass protector fits precisely. Avoid rigid plastic cases from donor due to slight chassis differences.',
    close: 'Close',

    // Printable Cheat Sheet
    cheatSheetTitle: 'Retail Counter Quick-Reference Cheat Sheet',
    cheatSheetSubtitle: 'Print-ready laminated matrix of interchangeable screen protectors and cases',
    printBtn: 'Print Cheat Sheet',
    exportCsvBtn: 'Export CSV',
    tableHeaderTarget: 'Target Customer Model',
    tableHeaderCandidate: 'Compatible Alternative (Donor)',
    tableHeaderCategory: 'Category',
    tableHeaderConfidence: 'Confidence Level',
    tableHeaderNotes: 'Store Tech Notes / Fit Caveats',
    tableHeaderVerified: 'Verified',
    inferred: 'Inferred',
    laminatedNotice: 'CaseScreenChecker Retail Knowledge Base • Strict Physical Tolerance Engine',

    // Bulk Data & OEM Twin Scanner
    oemScannerTitle: 'Catalog Tools & Automated OEM Twin Scanner',
    oemScannerSubtitle: 'Bulk data operations, database export/import, and automatic rebrand detection',
    tabScanner: 'Automated OEM Twin Scanner',
    tabImport: 'Bulk JSON / Catalog Import',
    tabExport: 'Export Database Backup',
    detectedTwins: 'Detected Hardware Platform Twins',
    autoRegisterTwins: 'Auto-Register Unpaired Twins',
    importJsonTitle: 'Bulk Import Phone Models (JSON)',
    importJsonDesc: 'Paste a JSON array containing phone specification objects matching the PhoneModel schema.',
    importBtn: 'Import Into Catalog',
    exportBackupTitle: 'Export Catalog & Compatibility Backup',
    exportBackupDesc: 'Download the current state of phone models and verified pairings as JSON backup files.',
    downloadModelsJson: 'Download Models JSON',
    downloadPairsJson: 'Download Pairs JSON',
    matchPercentage: 'Match',
    activePair: 'Active Pair',
    discoveredNewTwin: 'Discovered New Twin',

    // Admin Add Pair Modal
    addPairTitle: 'Add / Verify Cross-Model Compatibility',
    addPairSubtitle: 'Record staff-tested compatibility between two phone models',
    donorModel: 'Donor Model (Accessory made for)',
    targetCustomerModel: 'Target Customer Model (Device receiving accessory)',
    selectCategory: 'Accessory Category',
    confidenceTier: 'Confidence Tier',
    fitNotesPlaceholder: 'Describe physical fit (e.g. 100% screen active area match, smooth edge alignment)',
    caveatsPlaceholder: 'Caveats (e.g. power button cutout sits 0.5mm higher, tight corner fit on hard cases)',
    verifierName: 'Technician / Store Name',
    savePairBtn: 'Save Compatibility Pair',

    // External Research
    researchTitle: 'External Research & Evidence Repository',
    researchSubtitle: 'Cross-reference teardowns, OEM platform twins, and certified retail fit tests',
    searchWebQuery: 'Search model or keyword...',
    searchGoogleBtn: 'Search Evidence Online',
    importEvidenceBtn: 'Import As Compatible Pair',
    alreadyInCatalog: 'Already In Catalog',

    // Footer
    footerText: 'CaseScreenChecker • High-Precision Physical Dimensional Tolerance & Accessory Reference Engine'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'casescreenchecker_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved === 'bg' || saved === 'en') return saved;
    } catch (_) {}
    return 'bg'; // Default to Bulgarian
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (_) {}
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
