/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageMode = 'en' | 'ar' | 'bilingual';

export interface TranslationStrings {
  appTitle: string;
  appSubtitle: string;
  badgeAdmin: string;
  plainLangBadge: string;
  langEn: string;
  langAr: string;
  langBilingual: string;
  
  // Splash Screen Strings
  splashTitle: string;
  splashSubtitle: string;
  studentNameLabel: string;
  studentNamePlaceholder: string;
  badgeNumberLabel: string;
  badgeNumberPlaceholder: string;
  startDrillBtn: string;
  studentRequiredAlert: string;
  changeStudent: string;
  traineeLabel: string;
  badgeLabel: string;
  officialRecordNote: string;
  
  drillRulesTitle: string;
  drillRulesDesc: string;
  rule1: string;
  rule2: string;
  rule3: string;
  rule4: string;
  selectIncidentTitle: string;
  selectIncidentSubtitle: string;
  filterAll: string;
  filterHr: string;
  filterFinance: string;
  filterIt: string;
  filterExecutive: string;
  filterGround: string;
  searchPlaceholder: string;
  readingPhaseTitle: string;
  listenScenario: string;
  stopListening: string;
  proceedToReport: string;
  reportingPhaseTitle: string;
  reportingPhaseSubtitle: string;
  timeRemaining: string;
  scenarioLabel: string;
  lnnhGuideBtn: string;
  quickPhrasesBtn: string;
  submitReport: string;
  submittingReport: string;
  missingFieldsAlert: string;
  drillCompletedTitle: string;
  drillCompletedSubtitle: string;
  readingTime: string;
  reportingTime: string;
  yourReport: string;
  standardKey: string;
  downloadPdf: string;
  shareWhatsApp: string;
  newDrill: string;
  copyFeedback: string;
  copied: string;
  guideTitle: string;
  guideSubtitle: string;
  close: string;

  // Section Headers & Operational Context
  part1SectionTitle: string;
  part1SectionBadge: string;
  part1SectionDesc: string;
  part2SectionTitle: string;
  part2SectionBadge: string;
  part2SectionDesc: string;
  
  // LNNH Questions & Plain English Explanations (Initial Discovery)
  l_title: string;
  l_question: string;
  l_subtext: string;
  l_placeholder: string;
  
  n1_title: string;
  n1_question: string;
  n1_subtext: string;
  n1_placeholder: string;
  
  n2_title: string;
  n2_question: string;
  n2_subtext: string;
  n2_placeholder: string;
  
  h_title: string;
  h_question: string;
  h_subtext: string;
  h_placeholder: string;

  // ZSH Questions & Rapid Check-In Explanations (Ongoing Operations)
  z_title: string;
  z_question: string;
  z_subtext: string;
  z_placeholder: string;

  s_title: string;
  s_question: string;
  s_subtext: string;
  s_placeholder: string;

  hz_title: string;
  hz_question: string;
  hz_subtext: string;
  hz_placeholder: string;

  // Results & Comparison
  part1InitialTitle: string;
  part2ZshTitle: string;
  zshRadioDisciplineRule: string;

  // Helpful quick-phrase chips for non-native English speakers
  suggestedPhrasesTitle: string;
  clickToInsert: string;
}

export const translations: Record<'en' | 'ar', TranslationStrings> = {
  en: {
    appTitle: "KSIA ERT Administrative Offices Drill",
    appSubtitle: "Topic 2.3 • L-N-N-H Initial Discovery & Z-S-H Operational Zone Check-In",
    badgeAdmin: "Administrative Offices Only",
    plainLangBadge: "Everyday Plain Language",
    langEn: "English",
    langAr: "العربية",
    langBilingual: "Bilingual (EN / AR)",

    // Splash Screen
    splashTitle: "Student & Trainee Badging",
    splashSubtitle: "Enter your full name and airport employee badge number before starting the drill activity. This official identification will be stamped on your radio report evaluation.",
    studentNameLabel: "Student / Employee Full Name",
    studentNamePlaceholder: "e.g. Mohammed Al-Otaibi",
    badgeNumberLabel: "Airport Badge / Employee ID #",
    badgeNumberPlaceholder: "e.g. KSIA-78421",
    startDrillBtn: "Enter Activity & Select Scenario",
    studentRequiredAlert: "Please provide both your Full Name and Badge Number to begin the drill.",
    changeStudent: "Change Trainee",
    traineeLabel: "Trainee",
    badgeLabel: "Badge #",
    officialRecordNote: "This identification will be permanently embedded in your final L-N-N-H & Z-S-H Reports, PDF certificate, and WhatsApp broadcast.",

    drillRulesTitle: "How This Office Drill Works",
    drillRulesDesc: "Designed for all airport administrative employees, non-technical staff, and non-native English speakers. No technical jargon required.",
    rule1: "2 minutes to read and understand the office incident details.",
    rule2: "5 minutes to complete Part 1 (L-N-N-H) and Part 2 (Z-S-H).",
    rule3: "Initial discovery uses L-N-N-H: Where? What? Numbers? Hazards?",
    rule4: "Active operations shift to Z-S-H: Zone, Status, and Hazard for high-velocity check-ins.",
    selectIncidentTitle: "Select an Administrative Office Scenario",
    selectIncidentSubtitle: "Choose an office situation to practice your initial emergency report and ongoing tactical check-in.",
    filterAll: "All Offices (20)",
    filterHr: "HR & Training",
    filterFinance: "Finance & Contracts",
    filterIt: "IT & Server Rooms",
    filterExecutive: "Executive & Legal",
    filterGround: "Lobby & Archives",
    searchPlaceholder: "Search scenarios by room, floor, or incident type...",
    readingPhaseTitle: "Incident Briefing • Reading Time",
    listenScenario: "Listen Aloud",
    stopListening: "Stop Audio",
    proceedToReport: "Start Radio Report",
    reportingPhaseTitle: "Structured Radio Reporting Area",
    reportingPhaseSubtitle: "Topic 2.3 • Part 1 Initial Discovery (L-N-N-H) & Part 2 Recurring Operational Check-In (Z-S-H)",
    timeRemaining: "Time Left",
    scenarioLabel: "Incident",
    lnnhGuideBtn: "Reporting Protocol Guide",
    quickPhrasesBtn: "Everyday Phrases Helper",
    submitReport: "Submit Both Reports",
    submittingReport: "Processing Broadcast...",
    missingFieldsAlert: "Please fill in all 4 L-N-N-H fields and all 3 Z-S-H fields before submitting.",
    drillCompletedTitle: "Drill Completed Successfully!",
    drillCompletedSubtitle: "Compare your dual-format emergency transmissions with the approved facilitator extraction keys.",
    readingTime: "Reading Phase",
    reportingTime: "Reporting Phase",
    yourReport: "Your Radio Transmissions",
    standardKey: "Facilitator Standard Extraction Keys",
    downloadPdf: "Download PDF Summary",
    shareWhatsApp: "Share to WhatsApp",
    newDrill: "Start Another Drill",
    copyFeedback: "Copy Text",
    copied: "Copied!",
    guideTitle: "Topic 2.3: Radio Reporting Protocol Guide",
    guideSubtitle: "Mastering the two essential reporting phases: Initial Discovery (L-N-N-H) and Active Operations Check-In (Z-S-H).",
    close: "Close Guide",

    // Section Titles & Operational Rationale
    part1SectionTitle: "Part 1: Initial Incident Discovery Report (L-N-N-H)",
    part1SectionBadge: "Initial Discovery Only • First Dispatch Alert",
    part1SectionDesc: "Deployed exclusively upon initial incident discovery to alert emergency dispatch and mobilize first responders.",
    
    part2SectionTitle: "Part 2: Streamlined Zone Status Check-In (Z-S-H)",
    part2SectionBadge: "Active Operations • High-Velocity Sector Update",
    part2SectionDesc: "Ongoing operations require a much leaner format. When multiple ERT members are deployed across different zones—conducting sweeps, monitoring fire barriers, or overseeing evacuations—clogging the radio network with detailed narratives disrupts command control. Shift to Z-S-H for recurring check-ins.",

    // LNNH Questions & Plain English Explanations
    l_title: "L - Location",
    l_question: "Where is the problem?",
    l_subtext: "State the Building, Floor number, and specific Office or Room name.",
    l_placeholder: "Example: Airport Admin Building, 3rd Floor, HR Kitchenette Room 305...",

    n1_title: "N - Nature",
    n1_question: "What is happening?",
    n1_subtext: "What do you see or smell? (Small fire, smoke, water leak, chemical smell, fall).",
    n1_placeholder: "Example: Coffee machine caught fire with thick smoke from burning napkins...",

    n2_title: "N - Numbers",
    n2_question: "Who and how many need help?",
    n2_subtext: "How many people are hurt? Are they awake (conscious) or passed out (unconscious)?",
    n2_placeholder: "Example: 1 employee conscious with burned hand, 10 colleagues evacuated safely...",

    h_title: "H - Hazards",
    h_question: "What danger is nearby right now?",
    h_subtext: "What could make it worse? (Live electricity, spreading flames, slippery floor, locked door).",
    h_placeholder: "Example: Wall plug is still powered, wooden cabinets above flames, smoke in hallway...",

    // ZSH Questions & Rapid Check-In Explanations
    z_title: "Z - Zone",
    z_question: "Which operational sector are you sweeping/monitoring?",
    z_subtext: "Specific tactical zone, wing corridor, or sector assignment where you are operating.",
    z_placeholder: "Example: Zone 3-HR (3rd Floor East Wing, Corridor & Kitchenette 305)...",

    s_title: "S - Status",
    s_question: "What is the zone status / sweep condition?",
    s_subtext: "Primary sweep completed, evacuation progress, barrier containment, or tasks accomplished.",
    s_placeholder: "Example: Sweep complete, 10 staff evacuated to Stairwell B, burn casualty receiving first aid...",

    hz_title: "H - Hazard",
    hz_question: "What active or emerging hazard exists in this zone?",
    hz_subtext: "Secondary hazard, spreading smoke, live power, barricaded exit, or 'Sector all clear'.",
    hz_placeholder: "Example: Black smoke banking down hallway, live wall socket unisolated...",

    // Results & Comparison
    part1InitialTitle: "Part 1: Initial Discovery (L-N-N-H)",
    part2ZshTitle: "Part 2: Operational Check-In (Z-S-H)",
    zshRadioDisciplineRule: "Radio Net Discipline: Keep recurring Z-S-H check-ins under 15 seconds to keep channel clear for Command.",

    suggestedPhrasesTitle: "Common Everyday Phrases (Tap to add)",
    clickToInsert: "Tap any phrase to insert into the box"
  },
  ar: {
    appTitle: "تدريب الاستجابة للطوارئ بمكاتب المطار الإدارية",
    appSubtitle: "الموضوع 2.3 • تقرير الاكتشاف الأولي (L-N-N-H) والتحديث الميداني للقطاعات (Z-S-H)",
    badgeAdmin: "خاص بالمكاتب الإدارية فقط",
    plainLangBadge: "لغة يومية واضحة ومبسطة",
    langEn: "English",
    langAr: "العربية",
    langBilingual: "ثنائي اللغة (إنجليزي / عربي)",

    // Splash Screen
    splashTitle: "تسجيل بيانات المتدرب والبطاقة الوظيفية",
    splashSubtitle: "يرجى إدخال اسمك ورقم بطاقة الموظف قبل بدء النشاط التدريبي. سيتم تثبيت هذه البيانات الرسمية في تقرير الطوارئ الصادر وشهادة التقييم.",
    studentNameLabel: "اسم المتدرب / الموظف كاملاً",
    studentNamePlaceholder: "مثال: محمد العتيبي",
    badgeNumberLabel: "رقم بطاقة المطار / الرقم الوظيفي",
    badgeNumberPlaceholder: "مثال: KSIA-78421",
    startDrillBtn: "بدء النشاط واختيار السيناريو",
    studentRequiredAlert: "يرجى كتابة الاسم ورقم البطاقة للمتابعة وبدء النشاط.",
    changeStudent: "تغيير المتدرب",
    traineeLabel: "المتدرب",
    badgeLabel: "رقم البطاقة",
    officialRecordNote: "سيتم إدراج هذه البيانات في تقريري L-N-N-H و Z-S-H النهائيين وملخص PDF ورسالة الواتساب الرسمية.",

    drillRulesTitle: "كيف يعمل هذا التدريب الإداري؟",
    drillRulesDesc: "مخصص لجميع موظفي مكاتب المطار الإدارية وغير التقنيين ولغير الناطقين بالإنجليزية كلغة أم. لا يتطلب أي مصطلحات معقدة.",
    rule1: "دقيقتان لقراءة تفاصيل الحادث الإداري واستيعاب ما حدث.",
    rule2: "5 دقائق لكتابة تقرير الاكتشاف الأولي (L-N-N-H) والتحديث الميداني (Z-S-H).",
    rule3: "الاكتشاف الأولي يعتمد على نموذج L-N-N-H: أين؟ ماذا حدث؟ المصابون؟ المخاطر؟",
    rule4: "أثناء انتشار الفريق الميداني، يتحول الإبلاغ إلى Z-S-H: القطاع، الحالة، والخطر للحفاظ على جاهزية اللاسلكي.",
    selectIncidentTitle: "اختر سيناريو من المكاتب الإدارية",
    selectIncidentSubtitle: "اختر موقفاً طارئاً في بيئة المكاتب لبدء كتابة تقرير الطوارئ الأولي وتحديث القطاع الميداني.",
    filterAll: "جميع المكاتب (20)",
    filterHr: "الموارد البشرية والتدريب",
    filterFinance: "المالية والعقود",
    filterIt: "تقنية المعلومات والخوادم",
    filterExecutive: "الإدارة العليا والقانونية",
    filterGround: "الاستقبال والأرشيف",
    searchPlaceholder: "ابحث برقم الغرفة أو الطابق أو نوع الحادث...",
    readingPhaseTitle: "إيجاز الحادث • وقت القراءة والاستيعاب",
    listenScenario: "الاستماع الصوتي",
    stopListening: "إيقاف الصوت",
    proceedToReport: "الانتقال إلى كتابة التقارير اللاسلكية",
    reportingPhaseTitle: "منطقة كتابة التقارير اللاسلكية المنظمة",
    reportingPhaseSubtitle: "الموضوع 2.3 • القسم الأول: بلاغ الاكتشاف (L-N-N-H) والقسم الثاني: تحديث القطاعات (Z-S-H)",
    timeRemaining: "الوقت المتبقي",
    scenarioLabel: "رقم الحادث",
    lnnhGuideBtn: "دليل بروتوكول التقارير اللاسلكية",
    quickPhrasesBtn: "عبارات يومية مساعدة",
    submitReport: "إرسال التقريرين الميدانيين",
    submittingReport: "جاري الإرسال...",
    missingFieldsAlert: "يرجى تعبئة جميع حقول L-N-N-H الأربعة وحقول Z-S-H الثلاثة قبل الإرسال.",
    drillCompletedTitle: "اكتمل التدريب بنجاح!",
    drillCompletedSubtitle: "قارن تقاريرك الميدانية المرسلة مع مفاتيح الإجابة المعيارية المعتمدة للمدربين.",
    readingTime: "وقت القراءة",
    reportingTime: "وقت كتابة التقرير",
    yourReport: "تقاريرك اللاسلكية المرسلة",
    standardKey: "مفاتيح الإجابة المعيارية للمدرب",
    downloadPdf: "تحميل ملخص PDF",
    shareWhatsApp: "مشاركة عبر واتساب",
    newDrill: "بدء تمرين جديد",
    copyFeedback: "نسخ النص",
    copied: "تم النسخ!",
    guideTitle: "الموضوع 2.3: دليل بروتوكول التقارير اللاسلكية للطوارئ",
    guideSubtitle: "إتقان مرحلتي الإبلاغ الأساسيتين: الاكتشاف الأولي (L-N-N-H) والتحديث الميداني للقطاعات (Z-S-H).",
    close: "إغلاق الدليل",

    // Section Titles & Operational Rationale
    part1SectionTitle: "القسم 1: تقرير الاكتشاف الأولي للحادث (L-N-N-H)",
    part1SectionBadge: "حصري للاكتشاف الأولي • نداء العمليات الأول",
    part1SectionDesc: "يُبث هذا التقرير حصرياً وفور اكتشاف الحادث لأول مرة لإبلاغ العمليات واستنفار فرق الطوارئ الأولية.",

    part2SectionTitle: "القسم 2: التحديث السريع لحالة القطاع (Z-S-H)",
    part2SectionBadge: "العمليات الجارية • تحديث قطاعي عالي السرعة",
    part2SectionDesc: "تتطلب العمليات الجارية تنسيقاً أكثر إيجازاً وسرعة. فبمجرد انتشار عدة أعضاء من فريق الطوارئ عبر قطاعات مختلفة (لإجراء المسح، مراقبة حواجز الحريق، أو إدارة الإخلاء)، فإن شغل الشبكة اللاسلكية بروايات وسرد طويل يعطل سيطرة غرفة القيادة. لذا يتحول الفريق إلى نموذج Z-S-H الميداني السريع (القطاع، الحالة، الخطر).",

    // LNNH Questions & Plain English Explanations
    l_title: "L - الموقع (Location)",
    l_question: "أين يقع الحادث بالضبط؟",
    l_subtext: "اذكر اسم المبنى، رقم الطابق، ورقم الغرفة أو اسم الإدارة/القسم.",
    l_placeholder: "مثال: مبنى إدارة المطار، الطابق الثالث، مطبخ قسم الموارد البشرية غرفة 305...",

    n1_title: "N - طبيعة الحادث (Nature)",
    n1_question: "ماذا حدث؟ ما نوع المشكلة؟",
    n1_subtext: "صف ما تراه أو تشمه ببساطة: حريق، دخان، تسرب ماء، شخص سقط، رائحة غاز.",
    n1_placeholder: "مثال: اشتعلت ماكينة القهوة وتصاعد دخان أسود كثيف من احتراق المناديل...",

    n2_title: "N - الأعداد والإصابات (Numbers)",
    n2_question: "كم عدد المحتاجين للمساعدة وحالتهم؟",
    n2_subtext: "كم عدد المصابين؟ هل هم في وعيهم (يقظون) أم فاقدون للوعي؟ وهل تم إخلاء البقية؟",
    n2_placeholder: "مثال: موظف واحد واعٍ مصاب بحروق في اليد، وإخلاء عشرة موظفين بسلام...",

    h_title: "H - المخاطر الحالية (Hazards)",
    h_question: "ما هي المخاطر القريبة في المكان الآن؟",
    h_subtext: "ما الذي قد يزيد الوضع خطورة؟ (كهرباء نشطة، لهب يمتد، أرضية زلقة، دخان ينتشر).",
    h_placeholder: "مثال: مقبس الكهرباء بالجدار لا يزال موصولاً، خزائن خشبية ملاصقة، دخان بالممر...",

    // ZSH Questions & Rapid Check-In Explanations
    z_title: "Z - القطاع / المنطقة (Zone)",
    z_question: "ما هو قطاع عملياتك أو منطقة المسح الحالية؟",
    z_subtext: "القطاع التكتيكي المعين لك، الجناح، الممر، أو الموقع المحدد لعمليات المسح والمراقبة.",
    z_placeholder: "مثال: منطقة 3-HR (الجناح الشرقي، الطابق الثالث، ممر ومطبخ 305)...",

    s_title: "S - الحالة التشغيلية (Status)",
    s_question: "ما هي حالة القطاع والإخلاء والمسح؟",
    s_subtext: "اكتمال المسح الميداني، تقدم الإخلاء، سلامة حواجز الحريق، أو المهام المنجزة بالموقع.",
    s_placeholder: "مثال: اكتمل المسح، تم إخلاء 10 موظفين إلى الدرج B، جاري تقديم إسعاف أولي لمصاب الحروق...",

    hz_title: "H - الخطر الميداني (Hazard)",
    hz_question: "ما هو الخطر النشط أو المستجد في هذا القطاع؟",
    hz_subtext: "أي خطر مستجد (دخان يتسرب، أسلاك كهرباء، باب مغلق) أو التأكيد بأن 'القطاع آمن وخالٍ من المخاطر'.",
    hz_placeholder: "مثال: تصاعد دخان أسود نحو سقف الممر، مقبس كهربائي نشط يحتاج للعزل...",

    // Results & Comparison
    part1InitialTitle: "القسم 1: تقرير الاكتشاف الأولي (L-N-N-H)",
    part2ZshTitle: "القسم 2: التحديث الميداني للقطاع (Z-S-H)",
    zshRadioDisciplineRule: "انضباط الشبكة اللاسلكية: احرص ألا يتجاوز تحديث Z-S-H مدة 15 ثانية للحفاظ على جاهزية القناة لغرفة القيادة.",

    suggestedPhrasesTitle: "عبارات يومية مساعدة (انقر لإضافتها)",
    clickToInsert: "انقر على أي عبارة لإدراجها في صندوق النص"
  }
};
