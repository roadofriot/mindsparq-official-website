export interface Program {
  id: string;
  title: string;
  category: 'mathematics' | 'technology' | 'skills' | 'institutional';
  shortDescription: string;
  fullDescription: string;
  keyOutcomes: string[];
  audience: string;
  deliveryFormat: string;
  iconName: 'Calculator' | 'Brain' | 'Cpu' | 'PenTool' | 'Sparkles' | 'School';
}

export const programs: Program[] = [
  {
    id: 'abacus-mental-math',
    title: 'Abacus & Mental Math',
    category: 'mathematics',
    shortDescription: 'Foundational numerical sense, rapid mental calculation, and cognitive focus for primary students.',
    fullDescription: 'Our structured Abacus Mental Math program trains young minds to manipulate physical soroban beads and systematically transition to internal mental visualization (Anzan). Focus areas include step-by-step addition, subtraction, multiplication, calculation velocity, and sustained mental concentration.',
    keyOutcomes: [
      'Rapid mental calculation without physical aids or electronic calculators',
      'Sharpened focus, photographic memory, and bilateral brain stimulation',
      'Strong numerical intuition eliminating early math anxiety',
      'Tiered milestone evaluations tailored from beginner to advanced levels'
    ],
    audience: 'UKG to Grade 5 (Ages 5–11; customized modules available for older learners)',
    deliveryFormat: 'Structured weekly sessions with hands-on practice kits & workbooks',
    iconName: 'Calculator'
  },
  {
    id: 'vedic-mathematics',
    title: 'Vedic Mathematics',
    category: 'mathematics',
    shortDescription: 'Alternative mental calculation sutras, number pattern recognition, and rapid problem-solving.',
    fullDescription: 'Rooted in systematic classical sutras, Vedic Mathematics introduces fast calculation algorithms that complement standard school curricula. Students learn pattern identification, cross-multiplication shortcuts, algebraic factorization, and mental verification routines.',
    keyOutcomes: [
      'Fast mental math shortcuts for multi-digit arithmetic and algebraic forms',
      'Deep pattern recognition and flexible mathematical thinking',
      'High-speed calculation verification for school examinations',
      'Heightened confidence in competitive problem-solving'
    ],
    audience: 'Classes 6 to 12, competitive learners, and secondary school students',
    deliveryFormat: 'Module-based classroom workshops and intensive problem-solving bootcamps',
    iconName: 'Brain'
  },
  {
    id: 'ai-coding-robotics',
    title: 'AI Coding & Robotics',
    category: 'technology',
    shortDescription: 'Computational thinking, Scratch visual coding, electronics, Arduino/ESP32, and robotic assembly.',
    fullDescription: 'Students move from passive technology consumers to active creators. Starting with visual block coding in Scratch, learners progress into circuit design, sensor integration (ultrasonic, infrared, light), actuators, microcontrollers like Arduino UNO R4 WiFi and ESP32, and introductory artificial intelligence concepts.',
    keyOutcomes: [
      'Algorithmic logic, computational thinking, and systematic debugging',
      'Hands-on assembly of functional autonomous and remote-controlled robots',
      'Electronics comprehension: breadboards, sensors, motors, and microcontrollers',
      'Ethical, responsible understanding of AI and modern smart technology'
    ],
    audience: 'Classes 3–8 ("Robotics Explorer" & "Young Robot Innovator" tiers) and teen creators',
    deliveryFormat: 'Hands-on hardware lab sessions with physical maker kits & project showcases',
    iconName: 'Cpu'
  },
  {
    id: 'handwriting-development',
    title: 'Handwriting Improvement',
    category: 'skills',
    shortDescription: 'Bilingual penmanship in English and Nepali (Devanagari) across print, cursive, mono, and italic styles.',
    fullDescription: 'Neat, legible handwriting enhances cognitive retention and academic examination success. We provide biomechanically guided instruction covering ergonomic pen grip, writing posture, baseline alignment, uniform letter sizing, and spacing across English (Print & Cursive) and Nepali (Devanagari script).',
    keyOutcomes: [
      'Ergonomic tripod pen grip and fatigue-free writing posture',
      'Clear, uniform letter formation in Print, Cursive, Mono, and Italic styles',
      'Full bilingual mastery across English and Nepali (Devanagari) scripts',
      'Measurable penmanship speed and examination presentation clarity'
    ],
    audience: 'Early learners, school students, and adults seeking penmanship refinement',
    deliveryFormat: 'Step-by-step workbook practice with individual mentor feedback',
    iconName: 'PenTool'
  },
  {
    id: 'ai-literacy-training',
    title: 'Teacher Training & Digital Education',
    category: 'institutional',
    shortDescription: 'Modern pedagogical strategies, student-centered classrooms, and responsible AI integration for educators.',
    fullDescription: 'Empowering school teachers and educators with 21st-century instructional methodologies. We provide hands-on training on interactive teaching aids, digital classroom tools, responsible educational AI adoption, active lesson planning, and student progress tracking.',
    keyOutcomes: [
      'Student-centered, activity-based pedagogical techniques',
      'Responsible adoption of digital educational tools and AI assistants',
      'Effective lesson planning, formative evaluation, and progress recording',
      'Fostering dynamic classroom participation and experiential inquiry'
    ],
    audience: 'School principals, subject teachers, and academic coordinators',
    deliveryFormat: 'On-site institutional workshops, teacher enrichment bootcamps, and certification',
    iconName: 'School'
  },
  {
    id: 'school-teacher-support',
    title: 'Parent Engagement & Student Development',
    category: 'skills',
    shortDescription: 'Collaborative parent orientations, supportive home practice environments, and student leadership.',
    fullDescription: 'Strengthening the vital bridge between home and school. We conduct parent orientations on nurturing positive practice routines, setting age-appropriate developmental milestones, positive reinforcement, and helping students cultivate public speaking, communication, and leadership confidence.',
    keyOutcomes: [
      'Supportive home practice habits and balanced digital routines',
      'Positive reinforcement techniques aligned with developmental stages',
      'Student motivation, communication fluency, and leadership confidence',
      'Transparent academic growth reviews and goal-setting collaboration'
    ],
    audience: 'Parents, guardians, and youth development cohorts',
    deliveryFormat: 'Interactive family seminars, weekend masterclasses, and counseling orientations',
    iconName: 'Sparkles'
  }
];

export const focusAreas = [
  {
    title: 'Mathematics & Mental Skills',
    description: 'Abacus, mental arithmetic, and Vedic math methods that build cognitive speed and confidence.',
    badge: 'Core Math'
  },
  {
    title: 'AI, Coding & Robotics',
    description: 'Experiential STEM education connecting hardware, algorithmic logic, and real-world tinkering.',
    badge: 'Technology'
  },
  {
    title: 'Creative Learning & Penmanship',
    description: 'Bilingual handwriting development in English and Nepali for academic clarity and artistic expression.',
    badge: 'Foundational'
  },
  {
    title: 'Teacher & School Enablement',
    description: 'Collaborative curriculum support, teacher workshops, and institution-wide STEM lab enablement.',
    badge: 'Institutional'
  }
];

export const learningPillars = [
  {
    title: 'Learn By Doing',
    description: 'Tactile tools, interactive software, and physical components turn abstract theory into tangible discovery.',
    step: '01'
  },
  {
    title: 'Practice & Build Understanding',
    description: 'Step-by-step progression and deliberate practice build deep fluency without rote memorization.',
    step: '02'
  },
  {
    title: 'Explore & Solve Problems',
    description: 'Open-ended challenges encourage curiosity, trial-and-error resilience, and creative innovation.',
    step: '03'
  },
  {
    title: 'Grow Through Guided Feedback',
    description: 'Experienced mentors provide encouraging, individualized guidance at every stage of learning.',
    step: '04'
  }
];

export const whoWeSupport = [
  {
    title: 'Students & Learners',
    description: 'Nurturing mathematical intuition, computational thinking, robotics tinkering, and analytical confidence.',
    iconName: 'Brain'
  },
  {
    title: 'Parents & Guardians',
    description: 'Providing positive practice guidance, developmental orientations, and transparent progress reports.',
    iconName: 'Sparkles'
  },
  {
    title: 'Teachers & Educators',
    description: 'Upskilling in student-centered pedagogy, responsible AI tools, and hands-on activity design.',
    iconName: 'School'
  },
  {
    title: 'Partner Schools',
    description: 'Turnkey co-curricular clubs, STEM lab establishment, trainer deployment, and institutional reporting.',
    iconName: 'School'
  },
  {
    title: 'Educational Institutions',
    description: 'Digital curriculum systems, LMS/CMS portals, and custom academic management integration.',
    iconName: 'Cpu'
  },
  {
    title: 'Young Innovators & Tech Creators',
    description: 'Physical maker labs, Arduino/ESP32 prototyping, sensor projects, and robotics exhibition mentorship.',
    iconName: 'Cpu'
  }
];

export const schoolPartnershipModel = {
  title: 'School Partnership & Co-Curricular Excellence Model',
  overview: 'MindSparQ engages with schools as genuine educational partners rather than transactional vendors. Together, we establish vibrant STEM, Abacus, and Robotics learning environments within school ecosystems.',
  schoolRole: [
    'Institutional coordination, timetable alignment, and classroom/lab facility allocation',
    'Student cohort organization and parental communication support',
    'Collaborative academic monitoring alongside MindSparQ mentors'
  ],
  mindsparqRole: [
    'Provision of structured, age-appropriate curriculum and lesson milestones',
    'Deployment of certified, rigorously vetted trainers and academic mentors',
    'Supply of hardware kits (Abacus frames, sensor kits, Arduino/ESP32 robotics sets)',
    'Continuous quality assurance, student attendance records, and term progress reports'
  ],
  operationalCommitments: [
    'Bespoke batch scheduling respecting school examinations and annual calendar',
    'Strict adherence to Child Protection, student safety, and data privacy policies',
    'Formal written partnership memorandums with clear, transparent operational terms'
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
