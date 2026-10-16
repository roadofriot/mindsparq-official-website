export interface Program {
  id: string;
  title: string;
  titleNepali?: string;
  category: 'mathematics' | 'technology' | 'skills' | 'institutional';
  imageUrl: string;
  shortDescription: string;
  shortDescriptionNepali: string;
  fullDescription: string;
  fullDescriptionNepali: string;
  keyOutcomes: string[];
  keyOutcomesNepali: string[];
  audience: string;
  audienceNepali: string;
  deliveryFormat: string;
  deliveryFormatNepali: string;
  iconName: 'Calculator' | 'Brain' | 'Cpu' | 'PenTool' | 'Sparkles' | 'School';
}

export const programs: Program[] = [
  {
    id: 'abacus-mental-math',
    title: 'Abacus & Mental Math',
    titleNepali: 'एबाकस तथा मानसिक गणित',
    category: 'mathematics',
    imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Foundational numerical sense, rapid mental calculation, and cognitive focus for primary students.',
    shortDescriptionNepali: 'प्राथमिक तहका विद्यार्थीहरूका लागि आधारभूत संख्यात्मक ज्ञान, द्रुत मानसिक हिसाब र एकाग्रता विकास।',
    fullDescription: 'Our structured Abacus Mental Math program trains young minds to manipulate physical soroban beads and systematically transition to internal mental visualization (Anzan). Focus areas include step-by-step addition, subtraction, multiplication, calculation velocity, and sustained mental concentration.',
    fullDescriptionNepali: 'हाम्रो व्यवस्थित एबाकस मानसिक गणित कार्यक्रमले बालबालिकालाई सोरोबान दानाहरूको माध्यमबाट गणना गर्न सिकाउँदै क्रमशः दिमागमै चित्र बनाएर (अन्जान) गणना गर्ने स्तरसम्म पुर्‍याउँछ। यसले जोड, घटाउ, गुणन, हिसाब गर्ने तीव्र गति र दिगो मानसिक एकाग्रता विकास गर्दछ।',
    keyOutcomes: [
      'Rapid mental calculation without physical aids or electronic calculators',
      'Sharpened focus, photographic memory, and bilateral brain stimulation',
      'Strong numerical intuition eliminating early math anxiety',
      'Tiered milestone evaluations tailored from beginner to advanced levels'
    ],
    keyOutcomesNepali: [
      'कुनै पनि क्याल्कुलेटर वा कागज बिना दिमागमै द्रुत गतिमा गणितीय हिसाब',
      'तीव्र एकाग्रता, फोटोग्राफिक स्मरणशक्ति र मस्तिष्कको दुवै भागको सन्तुलित सक्रियता',
      'गणितप्रतिको डर हटी संख्यात्मक ज्ञानमा उच्च आत्मविश्वास',
      'सुरुवातीदेखि उच्च तहसम्मका चरणबद्ध मूल्याङ्कन तथा प्रमाणपत्र'
    ],
    audience: 'UKG to Grade 5 (Ages 5–11; customized modules available for older learners)',
    audienceNepali: 'युकेजी देखि कक्षा ५ सम्म (उमेर ५–११ वर्ष; ठूला विद्यार्थीका लागि विशेष मोड्युल)',
    deliveryFormat: 'Structured weekly sessions with hands-on practice kits & workbooks',
    deliveryFormatNepali: 'अभ्यास सामग्री तथा कार्यपुस्तिकासहित साप्ताहिक प्रत्यक्ष कक्षाहरू',
    iconName: 'Calculator'
  },
  {
    id: 'vedic-mathematics',
    title: 'Vedic Mathematics',
    titleNepali: 'वैदिक गणित (Vedic Math)',
    category: 'mathematics',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Alternative mental calculation sutras, number pattern recognition, and rapid problem-solving.',
    shortDescriptionNepali: 'छिटो हिसाब गर्ने सुत्रहरू, संख्याका ढाँचा पहिचान र परीक्षामा द्रुत समाधान विधि।',
    fullDescription: 'Rooted in systematic classical sutras, Vedic Mathematics introduces fast calculation algorithms that complement standard school curricula. Students learn pattern identification, cross-multiplication shortcuts, algebraic factorization, and mental verification routines.',
    fullDescriptionNepali: 'शास्त्रीय सुत्रहरूमा आधारित वैदिक गणितले विद्यालयको पाठ्यक्रमलाई थप सहज र रमाइलो बनाउने द्रुत हिसाब विधिहरू प्रदान गर्दछ। यसमा क्रस-ल्टिप्लिकेसन, वर्गमूल, बीजगणितका सुत्रहरू र मौखिक रूपमै हिसाब जाँच गर्ने विधिहरू सिकाइन्छ।',
    keyOutcomes: [
      'Fast mental math shortcuts for multi-digit arithmetic and algebraic forms',
      'Deep pattern recognition and flexible mathematical thinking',
      'High-speed calculation verification for school examinations',
      'Heightened confidence in competitive problem-solving'
    ],
    keyOutcomesNepali: [
      'ठूला अंकहरूको गुणन, भाग र बीजगणितका लागि अचुक सर्टकट सुत्रहरू',
      'संख्याका ढाँचाहरू बुझेर लचिलो गणितीय सोचको विकास',
      'विद्यालय तथा प्रतिस्पर्धात्मक परीक्षाहरूमा समयको बचत र उच्च शुद्धता',
      'गणितीय समस्या समाधानमा उच्च आत्मविश्वास'
    ],
    audience: 'Classes 6 to 12, competitive learners, and secondary school students',
    audienceNepali: 'कक्षा ६ देखि १२ का विद्यार्थीहरू तथा प्रतिस्पर्धात्मक परीक्षाको तयारी गर्नेहरू',
    deliveryFormat: 'Module-based classroom workshops and intensive problem-solving bootcamps',
    deliveryFormatNepali: 'मोड्युलमा आधारित कार्यशालाहरू तथा समस्या समाधान बुटक्याम्पहरू',
    iconName: 'Brain'
  },
  {
    id: 'ai-coding-robotics',
    title: 'AI Coding & Robotics',
    titleNepali: 'एआई, कोडिङ तथा रोबोटिक्स',
    category: 'technology',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Computational thinking, Scratch visual coding, electronics, Arduino/ESP32, and robotic assembly.',
    shortDescriptionNepali: 'कम्प्युटेसनल सोच, स्क्र्याच कोडिङ, इलेक्ट्रोनिक्स, Arduino/ESP32 र रोबोट निर्माण।',
    fullDescription: 'Students move from passive technology consumers to active creators. Starting with visual block coding in Scratch, learners progress into circuit design, sensor integration (ultrasonic, infrared, light), actuators, microcontrollers like Arduino UNO R4 WiFi and ESP32, and introductory artificial intelligence concepts.',
    fullDescriptionNepali: 'विद्यार्थीहरू स्क्रिनमा अल्झिने निष्क्रिय प्रयोगकर्ताबाट सक्रिय प्रविधि निर्माता बन्दछन्। स्क्र्याच भिजुअल कोडिङबाट सुरु गरी सेन्सर, मोटर, ब्रेडबोर्ड, Arduino UNO R4 WiFi र ESP32 माइक्रो-कन्ट्रोलर प्रयोग गरेर स्वचालित रोबोटहरू बनाउन सिकाइन्छ।',
    keyOutcomes: [
      'Algorithmic logic, computational thinking, and systematic debugging',
      'Hands-on assembly of functional autonomous and remote-controlled robots',
      'Electronics comprehension: breadboards, sensors, motors, and microcontrollers',
      'Ethical, responsible understanding of AI and modern smart technology'
    ],
    keyOutcomesNepali: [
      'एल्गोरिदम, तार्किक सोच र कम्प्युटर कोडिङमा गहिरो ज्ञान',
      'स्वचालित सेन्सर रोबोट र रिमोट कन्ट्रोल मेसिनहरू आफैं बनाउने सीप',
      'इलेक्ट्रोनिक्स सर्किट, सेन्सर, मोटर र चिप्सहरूको व्यवहारिक बुझाइ',
      'आधुनिक एआई प्रविधिको सही, नैतिक र सिर्जनशील प्रयोग'
    ],
    audience: 'Classes 3–8 ("Robotics Explorer" & "Young Robot Innovator" tiers) and teen creators',
    audienceNepali: 'कक्षा ३ देखि ८ सम्मका विद्यार्थीहरू तथा किशोर अन्वेषकहरू',
    deliveryFormat: 'Hands-on hardware lab sessions with physical maker kits & project showcases',
    deliveryFormatNepali: 'भौतिक रोबोटिक्स किटसहितको प्रयोगात्मक ल्याब र प्रोजेक्ट प्रदर्शनी',
    iconName: 'Cpu'
  },
  {
    id: 'handwriting-development',
    title: 'Handwriting Improvement',
    titleNepali: 'हस्तलेखन सुधार (Handwriting)',
    category: 'skills',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Bilingual penmanship in English and Nepali (Devanagari) across print, cursive, mono, and italic styles.',
    shortDescriptionNepali: 'अंग्रेजी तथा नेपाली (देवनागरी) लिपिमा सफा, सुन्दर र आकर्षक अक्षर लेख्ने सीप।',
    fullDescription: 'Neat, legible handwriting enhances cognitive retention and academic examination success. We provide biomechanically guided instruction covering ergonomic pen grip, writing posture, baseline alignment, uniform letter sizing, and spacing across English (Print & Cursive) and Nepali (Devanagari script).',
    fullDescriptionNepali: 'सफा र बुझिने अक्षरले विद्यार्थीको परीक्षाको नतिजा र आत्मविश्वासमा ठूलो प्रभाव पार्दछ। कलम समात्ने सही तरिका, शरीरको पोजिसन, रेखाको सन्तुलन, र अक्षरको आकार मिलाएर नेपाली र अंग्रेजी दुवै भाषामा सुन्दर अक्षर लेख्न सिकाइन्छ।',
    keyOutcomes: [
      'Ergonomic tripod pen grip and fatigue-free writing posture',
      'Clear, uniform letter formation in Print, Cursive, Mono, and Italic styles',
      'Full bilingual mastery across English and Nepali (Devanagari) scripts',
      'Measurable penmanship speed and examination presentation clarity'
    ],
    keyOutcomesNepali: [
      'हात नदुख्ने गरी सही तरिकाले कलम समात्ने र बस्ने बानीको विकास',
      'नेपाली र अंग्रेजी दुवै भाषामा सन्तुलित, सफा र चिटिक्क परेका अक्षरहरू',
      'परीक्षामा छिटो र स्पष्टसँग लेख्न सक्ने गति र कला',
      'अक्षरको स्पष्टताले परीक्षामा राम्रो अंक प्राप्त गर्न सहयोग'
    ],
    audience: 'Early learners, school students, and adults seeking penmanship refinement',
    audienceNepali: 'विद्यालयका विद्यार्थीहरू, शिक्षकहरू तथा अक्षर सुधार्न चाहने जो-कोही',
    deliveryFormat: 'Step-by-step workbook practice with individual mentor feedback',
    deliveryFormatNepali: 'चरणबद्ध अभ्यास पुस्तिका र मेन्टरहरूको व्यक्तिगत मार्गदर्शन',
    iconName: 'PenTool'
  },
  {
    id: 'ai-literacy-training',
    title: 'Teacher Training & Digital Education',
    titleNepali: 'शिक्षक तालिम तथा डिजिटल शिक्षा',
    category: 'institutional',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Modern pedagogical strategies, student-centered classrooms, and responsible AI integration for educators.',
    shortDescriptionNepali: 'आधुनिक शिक्षण विधि, विद्यार्थी-केन्द्रित कक्षा र शिक्षकहरूका लागि एआई प्रविधि तालिम।',
    fullDescription: 'Empowering school teachers and educators with 21st-century instructional methodologies. We provide hands-on training on interactive teaching aids, digital classroom tools, responsible educational AI adoption, active lesson planning, and student progress tracking.',
    fullDescriptionNepali: '२१ औं शताब्दीका शिक्षकहरूलाई अन्तरक्रियात्मक शिक्षण सामग्री, डिजिटल कक्षा उपकरणहरू, प्रभावकारी पाठ योजना र जिम्मेवार एआई प्रविधिको प्रयोगबारे व्यवहारिक तालिम प्रदान गरिन्छ। यसले कक्षाकोठालाई जीवन्त र प्रभावकारी बनाउँछ।',
    keyOutcomes: [
      'Student-centered, activity-based pedagogical techniques',
      'Responsible adoption of digital educational tools and AI assistants',
      'Effective lesson planning, formative evaluation, and progress recording',
      'Fostering dynamic classroom participation and experiential inquiry'
    ],
    keyOutcomesNepali: [
      'घोकाउने पुरानो ढाँचाबाट मुक्त, प्रयोगात्मक र विद्यार्थी-केन्द्रित शिक्षण सीप',
      'कक्षाकोठामा डिजिटल सामग्री र एआई टुल्सहरूको सही र प्रभावकारी प्रयोग',
      'रचनात्मक पाठ योजना तथा विद्यार्थीको मूल्याङ्कन गर्ने आधुनिक तरिका',
      'कक्षामा बालबालिकाको उत्साहजनक सहभागिता बढाउने कला'
    ],
    audience: 'School principals, subject teachers, and academic coordinators',
    audienceNepali: 'विद्यालयका प्रधानाध्यापक, विषयगत शिक्षक तथा शैक्षिक संयोजकहरू',
    deliveryFormat: 'On-site institutional workshops, teacher enrichment bootcamps, and certification',
    deliveryFormatNepali: 'विद्यालयमै आयोजना हुने कार्यशाला, सघन बुटक्याम्प र प्रमाणपत्र',
    iconName: 'School'
  },
  {
    id: 'school-teacher-support',
    title: 'Parent Engagement & Student Development',
    titleNepali: 'अभिभावक सहकार्य तथा विद्यार्थी व्यक्तित्व विकास',
    category: 'skills',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'Collaborative parent orientations, supportive home practice environments, and student leadership.',
    shortDescriptionNepali: 'अभिभावक अभिमुखीकरण, घरमा सिकाइको सकारात्मक वातावरण र विद्यार्थी नेतृत्व विकास।',
    fullDescription: 'Strengthening the vital bridge between home and school. We conduct parent orientations on nurturing positive practice routines, setting age-appropriate developmental milestones, positive reinforcement, and helping students cultivate public speaking, communication, and leadership confidence.',
    fullDescriptionNepali: 'घर र विद्यालयबीचको सम्बन्धलाई मजबुत बनाउँदै बालबालिकामा सकारात्मक बानी विकास गर्न अभिभावकहरूलाई परामर्श दिइन्छ। साथै विद्यार्थीहरूमा वक्तृत्वकला, अभिव्यक्ति क्षमता र नेतृत्व विकासका विशेष सत्रहरू सञ्चालन गरिन्छ।',
    keyOutcomes: [
      'Supportive home practice habits and balanced digital routines',
      'Positive reinforcement techniques aligned with developmental stages',
      'Student motivation, communication fluency, and leadership confidence',
      'Transparent academic growth reviews and goal-setting collaboration'
    ],
    keyOutcomesNepali: [
      'घरमा मोबाइलको सट्टा रचनात्मक सिकाइ र अभ्यासको वातावरण निर्माण',
      'उमेर अनुसार बालबालिकाको भावना बुझेर प्रोत्साहन दिने तरिकाहरू',
      'विद्यार्थीहरूमा बोल्ने कला, आत्मविश्वास र नेतृत्व क्षमताको विकास',
      'बालबालिकाको चौतर्फी विकासका लागि अभिभावक र संस्थाबीच नियमित सहकार्य'
    ],
    audience: 'Parents, guardians, and youth development cohorts',
    audienceNepali: 'अभिभावक, संरक्षक तथा व्यक्तित्व विकास गर्न चाहने बालबालिका',
    deliveryFormat: 'Interactive family seminars, weekend masterclasses, and counseling orientations',
    deliveryFormatNepali: 'अन्तरक्रियात्मक पारिवारिक सेमिनार तथा सप्ताहन्त परामर्श कक्षाहरू',
    iconName: 'Sparkles'
  }
];

export const focusAreas = [
  {
    title: 'Mathematics & Mental Skills',
    titleNepali: 'गणित तथा मानसिक क्षमता',
    description: 'Abacus, mental arithmetic, and Vedic math methods that build cognitive speed and confidence.',
    descriptionNepali: 'एबाकस, मानसिक हिसाब र वैदिक गणित जसले बालबालिकामा हिसाब गर्ने तीव्र गति र आत्मविश्वास बढाउँछ।',
    badge: 'Core Math',
    badgeNepali: 'आधारभूत गणित'
  },
  {
    title: 'AI, Coding & Robotics',
    titleNepali: 'एआई, कोडिङ तथा रोबोटिक्स',
    description: 'Experiential STEM education connecting hardware, algorithmic logic, and real-world tinkering.',
    descriptionNepali: 'हार्डवेयर, कोडिङ लजिक र प्रयोगात्मक मेसिन निर्माण जोड्ने आधुनिक STEM शिक्षा।',
    badge: 'Technology',
    badgeNepali: 'प्रविधि'
  },
  {
    title: 'Creative Learning & Penmanship',
    titleNepali: 'सिर्जनशील सिकाइ तथा हस्तलेखन',
    description: 'Bilingual handwriting development in English and Nepali for academic clarity and artistic expression.',
    descriptionNepali: 'अंग्रेजी र नेपाली दुवै भाषामा सफा, बुझिने र चिटिक्क परेका अक्षर लेख्ने सीप।',
    badge: 'Foundational',
    badgeNepali: 'आधारभूत सीप'
  },
  {
    title: 'Teacher & School Enablement',
    titleNepali: 'शिक्षक तथा विद्यालय सशक्तीकरण',
    description: 'Collaborative curriculum support, teacher workshops, and institution-wide STEM lab enablement.',
    descriptionNepali: 'पाठ्यक्रम सहकार्य, शिक्षक कार्यशाला र विद्यालयमा आधुनिक STEM ल्याब स्थापना।',
    badge: 'Institutional',
    badgeNepali: 'संस्थागत'
  }
];

export const learningPillars = [
  {
    title: 'Learn By Doing',
    titleNepali: 'आफैं गरेर सिक्ने',
    description: 'Tactile tools, interactive software, and physical components turn abstract theory into tangible discovery.',
    descriptionNepali: 'प्रत्यक्ष औजार, अन्तरक्रियात्मक सफ्टवेयर र भौतिक कम्पोनेन्टहरूले अमूर्त सिद्धान्तलाई ठोस सिकाइमा बदल्छन्।',
    step: '01'
  },
  {
    title: 'Practice & Build Understanding',
    titleNepali: 'नियमित अभ्यास र गहिरो बुझाइ',
    description: 'Step-by-step progression and deliberate practice build deep fluency without rote memorization.',
    descriptionNepali: 'घोकाएर होइन, चरणबद्ध अभ्यास र प्रयोगात्मक विधिको माध्यमबाट विषयवस्तुको गहिरो बोध गराइन्छ।',
    step: '02'
  },
  {
    title: 'Explore & Solve Problems',
    titleNepali: 'अन्वेषण र समस्या समाधान',
    description: 'Open-ended challenges encourage curiosity, trial-and-error resilience, and creative innovation.',
    descriptionNepali: 'नयाँ-नयाँ चुनौती र अभ्यासहरूले बालबालिकामा कौतूहलता, धैर्यता र सिर्जनशील सोच बढाउँछन्।',
    step: '03'
  },
  {
    title: 'Grow Through Guided Feedback',
    titleNepali: 'मेन्टरहरूको निरन्तर मार्गदर्शन',
    description: 'Experienced mentors provide encouraging, individualized guidance at every stage of learning.',
    descriptionNepali: 'अनुभवी प्रशिक्षकहरूले सिकाइको प्रत्येक चरणमा बालबालिकालाई हौसला र व्यक्तिगत सल्लाह दिन्छन्।',
    step: '04'
  }
];

export const whoWeSupport = [
  {
    title: 'Students & Learners',
    titleNepali: 'विद्यार्थी तथा सिकारुहरू',
    description: 'Nurturing mathematical intuition, computational thinking, robotics tinkering, and analytical confidence.',
    descriptionNepali: 'गणितीय क्षमता, कम्प्युटेसनल सोच, रोबोटिक्स निर्माण र विश्लेषणात्मक आत्मविश्वासको विकास।',
    iconName: 'Brain'
  },
  {
    title: 'Parents & Guardians',
    titleNepali: 'अभिभावक तथा संरक्षकहरू',
    description: 'Providing positive practice guidance, developmental orientations, and transparent progress reports.',
    descriptionNepali: 'घरमा सकारात्मक सिकाइ वातावरण बनाउन परामर्श र बालबालिकाको नियमित प्रगति विवरण।',
    iconName: 'Sparkles'
  },
  {
    title: 'Teachers & Educators',
    titleNepali: 'शिक्षक तथा प्राध्यापकहरू',
    description: 'Upskilling in student-centered pedagogy, responsible AI tools, and hands-on activity design.',
    descriptionNepali: 'विद्यार्थी-केन्द्रित शिक्षण विधि, एआई उपकरणको सही प्रयोग र प्रयोगात्मक अभ्यास डिजाइन।',
    iconName: 'School'
  },
  {
    title: 'Partner Schools',
    titleNepali: 'सहकार्य गर्ने विद्यालयहरू',
    description: 'Turnkey co-curricular clubs, STEM lab establishment, trainer deployment, and institutional reporting.',
    descriptionNepali: 'अतिरिक्त क्रियाकलाप क्लब, आधुनिक STEM ल्याब स्थापना, दक्ष प्रशिक्षक व्यवस्थापन र प्रगति प्रतिवेदन।',
    iconName: 'School'
  },
  {
    title: 'Educational Institutions',
    titleNepali: 'शैक्षिक संस्थाहरू',
    description: 'Digital curriculum systems, LMS/CMS portals, and custom academic management integration.',
    descriptionNepali: 'डिजिटल पाठ्यक्रम प्रणाली, अनलाइन सिकाइ पोर्टल (LMS) र शैक्षिक व्यवस्थापन सहयोग।',
    iconName: 'Cpu'
  },
  {
    title: 'Young Innovators & Tech Creators',
    titleNepali: 'युवा अन्वेषक तथा प्रविधि सर्जकहरू',
    description: 'Physical maker labs, Arduino/ESP32 prototyping, sensor projects, and robotics exhibition mentorship.',
    descriptionNepali: 'भौतिक मेकर ल्याब, Arduino/ESP32 सर्किट निर्माण, सेन्सर प्रोजेक्ट र प्रदर्शनी मार्गदर्शन।',
    iconName: 'Cpu'
  }
];

export const schoolPartnershipModel = {
  title: 'School Partnership & Co-Curricular Excellence Model',
  titleNepali: 'विद्यालय सहकार्य तथा अतिरिक्त क्रियाकलाप साझेदारी मोडल',
  overview: 'MindSparQ engages with schools as genuine educational partners rather than transactional vendors. Together, we establish vibrant STEM, Abacus, and Robotics learning environments within school ecosystems.',
  overviewNepali: 'MindSparQ ले विद्यालयहरूसँग केवल सेवा प्रदायकका रूपमा होइन, एक सच्चा शैक्षिक साझेदारका रूपमा सहकार्य गर्दछ। हामी विद्यालयभित्रै ऊर्जावान STEM, एबाकस र रोबोटिक्स सिकाइ वातावरण निर्माण गर्दछौं।',
  schoolRole: [
    'Institutional coordination, timetable alignment, and classroom/lab facility allocation',
    'Student cohort organization and parental communication support',
    'Collaborative academic monitoring alongside MindSparQ mentors'
  ],
  schoolRoleNepali: [
    'समय तालिका मिलान, संस्थागत समन्वय र कक्षा/ल्याबको उपयुक्त व्यवस्थापन',
    'विद्यार्थी समूह निर्माण र अभिभावकहरूसँग प्रभावकारी सूचना सम्प्रेषण',
    'MindSparQ का मेन्टरहरूसँग मिलेर विद्यार्थीको नियमित सिकाइ अनुगमन'
  ],
  mindsparqRole: [
    'Provision of structured, age-appropriate curriculum and lesson milestones',
    'Deployment of certified, rigorously vetted trainers and academic mentors',
    'Supply of hardware kits (Abacus frames, sensor kits, Arduino/ESP32 robotics sets)',
    'Continuous quality assurance, student attendance records, and term progress reports'
  ],
  mindsparqRoleNepali: [
    'उमेर सुहाउँदो व्यवस्थित पाठ्यक्रम, अभ्यास सामग्री र कार्यपुस्तिका उपलब्ध गराउने',
    'प्रमाणित, दक्ष र अनुभवी प्रशिक्षक तथा शैक्षिक मेन्टरहरूको व्यवस्थापन',
    'आवश्यक सम्पूर्ण हार्डवेयर किट्स (एबाकस फ्रेम, सेन्सर किट्स, Arduino/ESP32 रोबोटिक्स सेट) प्रदान गर्ने',
    'नियमित गुणस्तर जाँच, उपस्थिति अभिलेख र आवधिक प्रगति प्रतिवेदन तयार गर्ने'
  ],
  operationalCommitments: [
    'Bespoke batch scheduling respecting school examinations and annual calendar',
    'Strict adherence to Child Protection, student safety, and data privacy policies',
    'Formal written partnership memorandums with clear, transparent operational terms'
  ],
  operationalCommitmentsNepali: [
    'विद्यालयको वार्षिक परीक्षा र क्यालेन्डरलाई ध्यानमा राखी कक्षा सञ्चालन',
    'बाल संरक्षण नीति, विद्यार्थी सुरक्षा र व्यक्तिगत गोपनीयताको पूर्ण पालना',
    'स्पष्ट, पारदर्शी र लिखित सम्झौतापत्रका आधारमा व्यावसायिक सहकार्य'
  ]
};

export const digitalEcosystemModules = [
  {
    id: 'lms',
    title: 'MindSparQ Learning (LMS)',
    description: 'Online modular courses, curated video lessons, practice exercises, quizzes, and learner progress tracking.'
  },
  {
    id: 'cms',
    title: 'MindSparQ CMS',
    description: 'Dynamic administrative management for curriculum updates, announcements, event calendars, and multimedia.'
  },
  {
    id: 'crm',
    title: 'MindSparQ CRM / ERP',
    description: 'Streamlined academic records, cohort scheduling, student attendance, inventory, and partner school reporting.'
  },
  {
    id: 'ai',
    title: 'MindSparQ AI',
    description: 'Responsible AI assistants for learning material development, study notes synthesis, and coding guidance.'
  },
  {
    id: 'studio',
    title: 'MindSparQ Arduino Robotics Studio',
    description: 'Integrated desktop and browser environment for flashing code to Arduino UNO R4 WiFi & ESP32 robotics projects.'
  },
  {
    id: 'notes',
    title: 'MindSparQ Note Editor & Reader',
    description: 'Focused reading and note-taking tool designed for students and educators to organize technical and math notes.'
  }
];
