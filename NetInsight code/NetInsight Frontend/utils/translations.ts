export const translations = {
  en: {
    // Onboarding
    selectLanguage: 'Select Language',
    english: 'English',
    french: 'French',
    continue: 'Continue',
    privacyTitle: 'Privacy & Permission',
    privacyDescription:
      'This application anonymously collects mobile network measurements to help improve subscribers\u2019 QoE in Cameroon.',
    agreePrivacyPolicy: 'I have read and agree to the privacy policy',
    agreeLocation: 'I understand that location access is required for network mapping',
    agreeDataCollection: 'I consent to anonymous data collection',
    getStarted: 'Get Started',

    // Tab bar
    tabHome: 'Home',
    tabMetrics: 'Metrics',
    tabFeedback: 'Feedback',
    tabSettings: 'Settings',

    // Dashboard header
    qoeActive: 'QoE Monitoring Active',

    // Dashboard screen
    measuringNetwork: 'Measuring your network...',
    todayOverview: "Today's Overview",
    rateExperience: '\uD83D\uDCDD  Rate Experience',
    fullMetrics: '\uD83D\uDCCA  Full Metrics',

    // Status cards
    signalStrength: 'Signal Strength',
    downloadSpeed: 'Download Speed',
    uploadSpeed: 'Upload Speed',
    latency: 'Latency',

    // Status labels
    statusExcellent: 'Excellent',
    statusGood: 'Good',
    statusFair: 'Fair',
    statusPoor: 'Poor',
    statusUnknown: 'Unknown',
    latencyVeryLow: 'Very Low',
    latencyLow: 'Low',
    latencyModerate: 'Moderate',
    latencyHigh: 'High',

    // Network status
    offline: 'Offline',
    connected: 'Connected',
    noInternet: 'No internet connection',
    connectedWifi: 'Connected \u00b7 Wi-Fi',
    connectedMobile: 'Connected \u00b7 Mobile Data',

    // Feedback prompt (home card)
    networkExperienceToday: 'How is your network experience today?',
    good: 'Good',
    poor: 'Poor',
    details: 'Details',
    thankYouFeedback: '\u2713 Thank you for your feedback!',

    // Metrics summary
    avgDownload: 'Avg. Download',
    avgUpload: 'Avg. Upload',
    avgLatency: 'Avg. Latency',

    // Metrics screen
    networkMetrics: 'Network Metrics',
    statistics: 'Statistics',
    notes: 'Notes',
    metricsNote:
      'Data is collected in the background while you use your device. The more you use the app, the more accurate your network metrics will be.',
    signal: 'Signal',
    speed: 'Speed',
    reliability: 'Reliability',

    // Time periods
    periodDay: 'day',
    periodWeek: 'week',
    periodMonth: 'month',
    periodYear: 'year',

    // Feedback screen
    provideFeedback: 'Provide Feedback',
    rateNetwork: 'Rate your network experience (1\u20135)',
    selectCategory: 'Select Feedback Category',
    selectLocation: 'Select Location',
    chooseLocation: 'Choose your location...',
    additionalComments: 'Additional Comments (must not be less than 10 characters)',
    describeExperience: 'Describe your experience...',
    submitFeedback: 'Submit Feedback',
    missingInfo: 'Missing Information',
    completeFields: 'Please complete all required fields.',
    thankYou: '\u2705 Thank you!',
    feedbackSubmitted: 'Your feedback has been submitted.',
    ok: 'OK',
    errorTitle: 'Error',
    failedSubmit: 'Failed to submit feedback.',
    requestTimedOut: 'Request Timed Out',
    serverSlow:
      'The server is taking too long to respond. It may be waking up from sleep \u2014 please try again in a moment.',
    somethingWrong: 'Something went wrong. Try again later.',

    // Feedback categories
    catCallQuality: 'Call Quality',
    catInternetSpeed: 'Internet Speed',
    catSignalStrength: 'Signal Strength',
    catAppExperience: 'App Experience',
    catCustomerService: 'Customer Service',
    catOther: 'Other',

    // Settings screen
    settings: 'Settings',
    networkMonitoring: 'Network Monitoring',
    backgroundTracking: 'Background Tracking',
    backgroundTrackingDesc: 'Monitor network quality when app is in background',
    locationServices: 'Location Services',
    locationServicesDesc: 'Use location to map network quality',
    batteryImpact: 'Battery impact',
    batteryMedium: 'Medium',
    batteryLow: 'Low',
    dataPrivacy: 'Data & Privacy',
    dataCollection: 'Data Collection',
    dataCollectionDesc: 'Share anonymous network statistics',
    manageMyData: 'Manage My Data',
    manageMyDataDesc: 'Download or delete your collected data',
    preferences: 'Preferences',
    notifications: 'Notifications',
    notificationsDesc: 'Receive alerts and feedback requests',
    darkTheme: 'Dark Theme',
    darkThemeDesc: 'Use dark colors for the interface',
    about: 'About',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    resetOnboarding: 'Reset Onboarding',
    resetOnboardingDesc: 'Show language & privacy screens again on next start',
    version: 'Version 1.0.0',
    manageDataTitle: 'Manage My Data',
    manageDataMessage: 'Download or delete the network data collected on this device.',
    download: 'Download',
    delete: 'Delete',
    cancel: 'Cancel',
    noData: 'No Data',
    noDataFound: 'No collected data was found on this device.',
    dataDeleted: 'Data Deleted',
    dataDeletedMsg: 'Your collected network data has been removed from this device.',
    resetOnboardingTitle: 'Reset Onboarding',
    resetOnboardingMessage:
      'This will show the language and privacy screens again the next time you restart the app.',
    reset: 'Reset',
    resetDone: 'Done',
    resetDoneMsg: 'Onboarding reset. Restart the app to see the screens again.',
    exportError: 'Could not export your data. Please try again.',
    deleteError: 'Could not delete your data. Please try again.',

    // Feedback prompt notifications
    feedbackReminderSection: 'Feedback Reminders',
    feedbackReminderEnable: 'Enable Feedback Reminders',
    feedbackReminderEnableDesc: 'Get notified to rate your network even when the app is closed',
    feedbackReminderInterval: 'Reminder Interval',
    feedbackReminderIntervalDesc: 'How often the app will ask for your feedback',
    interval30min: 'Every 30 minutes',
    interval1h: 'Every 1 hour',
    interval2h: 'Every 2 hours',
    interval3h: 'Every 3 hours',
    interval6h: 'Every 6 hours',
    interval12h: 'Every 12 hours',
    interval24h: 'Every 24 hours',
    notifTitle: 'How is your network? \uD83D\uDCF6',
    notifBody: 'Tap to quickly rate your network experience right now.',
    permissionDenied: 'Permission Denied',
    permissionDeniedMsg: 'Please enable notifications in your phone Settings to receive feedback reminders.',
    reminderSaved: 'Reminder Set',
    reminderSavedMsg: 'You will be reminded every {{interval}} to rate your network.',
    reminderDisabled: 'Reminders Disabled',
    reminderDisabledMsg: 'You will no longer receive feedback reminders.',
    chooseInterval: 'Choose Reminder Interval',
  },

  fr: {
    // Onboarding
    selectLanguage: 'S\u00e9lectionner la langue',
    english: 'Anglais',
    french: 'Fran\u00e7ais',
    continue: 'Continuer',
    privacyTitle: 'Confidentialit\u00e9 et autorisations',
    privacyDescription:
      'Cette application collecte anonymement des mesures du r\u00e9seau mobile afin d\u2019am\u00e9liorer la qualit\u00e9 d\u2019exp\u00e9rience (QoE) des abonn\u00e9s au Cameroun.',
    agreePrivacyPolicy: 'J\u2019ai lu et j\u2019accepte la politique de confidentialit\u00e9',
    agreeLocation:
      'Je comprends que l\u2019acc\u00e8s \u00e0 la localisation est requis pour la cartographie du r\u00e9seau',
    agreeDataCollection: 'Je consens \u00e0 la collecte anonyme de donn\u00e9es',
    getStarted: 'Commencer',

    // Tab bar
    tabHome: 'Accueil',
    tabMetrics: 'M\u00e9triques',
    tabFeedback: 'Avis',
    tabSettings: 'Param\u00e8tres',

    // Dashboard header
    qoeActive: 'Surveillance QoE active',

    // Dashboard screen
    measuringNetwork: 'Mesure de votre r\u00e9seau...',
    todayOverview: "Aper\u00e7u d'aujourd'hui",
    rateExperience: '\uD83D\uDCDD  \u00C9valuer',
    fullMetrics: '\uD83D\uDCCA  M\u00e9triques',

    // Status cards
    signalStrength: 'Force du signal',
    downloadSpeed: 'Vitesse de t\u00e9l\u00e9chargement',
    uploadSpeed: "Vitesse d'envoi",
    latency: 'Latence',

    // Status labels
    statusExcellent: 'Excellent',
    statusGood: 'Bon',
    statusFair: 'Moyen',
    statusPoor: 'Mauvais',
    statusUnknown: 'Inconnu',
    latencyVeryLow: 'Tr\u00e8s faible',
    latencyLow: 'Faible',
    latencyModerate: 'Mod\u00e9r\u00e9e',
    latencyHigh: '\u00c9lev\u00e9e',

    // Network status
    offline: 'Hors ligne',
    connected: 'Connect\u00e9',
    noInternet: 'Pas de connexion internet',
    connectedWifi: 'Connect\u00e9 \u00b7 Wi-Fi',
    connectedMobile: 'Connect\u00e9 \u00b7 Donn\u00e9es mobiles',

    // Feedback prompt (home card)
    networkExperienceToday: 'Comment est votre exp\u00e9rience r\u00e9seau aujourd\u2019hui\u00a0?',
    good: 'Bon',
    poor: 'Mauvais',
    details: 'D\u00e9tails',
    thankYouFeedback: '\u2713 Merci pour votre avis\u00a0!',

    // Metrics summary
    avgDownload: 'T\u00e9l. moyen',
    avgUpload: 'Envoi moyen',
    avgLatency: 'Latence moy.',

    // Metrics screen
    networkMetrics: 'M\u00e9triques r\u00e9seau',
    statistics: 'Statistiques',
    notes: 'Notes',
    metricsNote:
      "Les donn\u00e9es sont collect\u00e9es en arri\u00e8re-plan pendant l'utilisation. Plus vous utilisez l'application, plus vos m\u00e9triques seront pr\u00e9cises.",
    signal: 'Signal',
    speed: 'Vitesse',
    reliability: 'Fiabilit\u00e9',

    // Time periods
    periodDay: 'jour',
    periodWeek: 'semaine',
    periodMonth: 'mois',
    periodYear: 'ann\u00e9e',

    // Feedback screen
    provideFeedback: 'Donner un avis',
    rateNetwork: 'Not\u00e9 votre exp\u00e9rience r\u00e9seau (1\u20135)',
    selectCategory: "Cat\u00e9gorie d'avis",
    selectLocation: 'S\u00e9lectionner un lieu',
    chooseLocation: 'Choisissez votre lieu...',
    additionalComments: 'Commentaires (minimum 10 caract\u00e8res)',
    describeExperience: 'D\u00e9crivez votre exp\u00e9rience...',
    submitFeedback: 'Envoyer',
    missingInfo: 'Informations manquantes',
    completeFields: 'Veuillez remplir tous les champs requis.',
    thankYou: '\u2705 Merci\u00a0!',
    feedbackSubmitted: 'Votre avis a \u00e9t\u00e9 soumis.',
    ok: 'OK',
    errorTitle: 'Erreur',
    failedSubmit: "Impossible d'envoyer l'avis.",
    requestTimedOut: 'D\u00e9lai d\u00e9pass\u00e9',
    serverSlow:
      'Le serveur met trop de temps \u00e0 r\u00e9pondre. Il se r\u00e9veille peut-\u00eatre \u2014 r\u00e9essayez dans un instant.',
    somethingWrong: "Une erreur s'est produite. R\u00e9essayez plus tard.",

    // Feedback categories
    catCallQuality: 'Qualit\u00e9 des appels',
    catInternetSpeed: 'Vitesse internet',
    catSignalStrength: 'Force du signal',
    catAppExperience: "Exp\u00e9rience de l'application",
    catCustomerService: 'Service client',
    catOther: 'Autre',

    // Settings screen
    settings: 'Param\u00e8tres',
    networkMonitoring: 'Surveillance r\u00e9seau',
    backgroundTracking: 'Suivi en arri\u00e8re-plan',
    backgroundTrackingDesc: "Surveiller la qualit\u00e9 du r\u00e9seau quand l'application est en arri\u00e8re-plan",
    locationServices: 'Services de localisation',
    locationServicesDesc: 'Utiliser la localisation pour cartographier la qualit\u00e9 du r\u00e9seau',
    batteryImpact: 'Impact batterie',
    batteryMedium: 'Moyen',
    batteryLow: 'Faible',
    dataPrivacy: 'Donn\u00e9es et confidentialit\u00e9',
    dataCollection: 'Collecte de donn\u00e9es',
    dataCollectionDesc: 'Partager des statistiques r\u00e9seau anonymes',
    manageMyData: 'G\u00e9rer mes donn\u00e9es',
    manageMyDataDesc: 'T\u00e9l\u00e9charger ou supprimer vos donn\u00e9es collect\u00e9es',
    preferences: 'Pr\u00e9f\u00e9rences',
    notifications: 'Notifications',
    notificationsDesc: 'Recevoir des alertes et demandes de retour',
    darkTheme: 'Th\u00e8me sombre',
    darkThemeDesc: "Utiliser des couleurs sombres pour l'interface",
    about: '\u00c0 propos',
    helpCenter: "Centre d'aide",
    privacyPolicy: 'Politique de confidentialit\u00e9',
    termsOfService: "Conditions d'utilisation",
    resetOnboarding: "R\u00e9initialiser l'introduction",
    resetOnboardingDesc: "Afficher \u00e0 nouveau les \u00e9crans de langue et de confidentialit\u00e9 au prochain d\u00e9marrage",
    version: 'Version 1.0.0',
    manageDataTitle: 'G\u00e9rer mes donn\u00e9es',
    manageDataMessage: 'T\u00e9l\u00e9charger ou supprimer les donn\u00e9es r\u00e9seau collect\u00e9es sur cet appareil.',
    download: 'T\u00e9l\u00e9charger',
    delete: 'Supprimer',
    cancel: 'Annuler',
    noData: 'Aucune donn\u00e9e',
    noDataFound: "Aucune donn\u00e9e collect\u00e9e n'a \u00e9t\u00e9 trouv\u00e9e sur cet appareil.",
    dataDeleted: 'Donn\u00e9es supprim\u00e9es',
    dataDeletedMsg: 'Vos donn\u00e9es r\u00e9seau ont \u00e9t\u00e9 supprim\u00e9es de cet appareil.',
    resetOnboardingTitle: "R\u00e9initialiser l'introduction",
    resetOnboardingMessage:
      "Cela affichera \u00e0 nouveau les \u00e9crans de langue et de confidentialit\u00e9 au prochain red\u00e9marrage.",
    reset: 'R\u00e9initialiser',
    resetDone: 'Termin\u00e9',
    resetDoneMsg: "Introduction r\u00e9initialis\u00e9e. Red\u00e9marrez l'application pour voir les \u00e9crans.",
    exportError: "Impossible d'exporter vos donn\u00e9es. Veuillez r\u00e9essayer.",
    deleteError: 'Impossible de supprimer vos donn\u00e9es. Veuillez r\u00e9essayer.',

    // Feedback prompt notifications
    feedbackReminderSection: 'Rappels de retour',
    feedbackReminderEnable: 'Activer les rappels de retour',
    feedbackReminderEnableDesc: "Recevoir des notifications pour \u00e9valuer votre r\u00e9seau m\u00eame quand l'app est ferm\u00e9e",
    feedbackReminderInterval: 'Fr\u00e9quence des rappels',
    feedbackReminderIntervalDesc: "Fr\u00e9quence \u00e0 laquelle l'application demande votre avis",
    interval30min: 'Toutes les 30 minutes',
    interval1h: 'Toutes les heures',
    interval2h: 'Toutes les 2 heures',
    interval3h: 'Toutes les 3 heures',
    interval6h: 'Toutes les 6 heures',
    interval12h: 'Toutes les 12 heures',
    interval24h: 'Toutes les 24 heures',
    notifTitle: 'Comment est votre r\u00e9seau\u00a0? \uD83D\uDCF6',
    notifBody: 'Appuyez pour \u00e9valuer votre exp\u00e9rience r\u00e9seau maintenant.',
    permissionDenied: 'Permission refus\u00e9e',
    permissionDeniedMsg: 'Veuillez activer les notifications dans les Param\u00e8tres de votre t\u00e9l\u00e9phone pour recevoir les rappels.',
    reminderSaved: 'Rappel enregistr\u00e9',
    reminderSavedMsg: 'Vous serez rappel\u00e9(e) toutes les {{interval}} pour \u00e9valuer votre r\u00e9seau.',
    reminderDisabled: 'Rappels d\u00e9sactiv\u00e9s',
    reminderDisabledMsg: 'Vous ne recevrez plus de rappels de retour.',
    chooseInterval: "Choisir la fr\u00e9quence",
  },
};

export type TranslationKey = keyof typeof translations.en;
