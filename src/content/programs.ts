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
    shortDescription: 'Mental arithmetic, number sense, concentration, and structured practice-based learning.',
    fullDescription: 'Our Abacus & Mental Math program guides young learners to master mental arithmetic calculations using tactile abacus methods transitioning to mental imagery. The focus is on building steady concentration, sharp number sense, and mathematical confidence through guided practice.',
    keyOutcomes: [
      'Rapid calculation skills using mental visualization',
      'Enhanced focus, memory retention, and listening ability',
      'Positive attitude towards numerical challenges',
      'Strong cognitive foundation for school mathematics'
    ],
    audience: 'Children and primary-to-middle school students',
    deliveryFormat: 'Structured weekly sessions with hands-on practice kits',
    iconName: 'Calculator'
  },
  {
    id: 'vedic-mathematics',
    title: 'Vedic Mathematics',
    category: 'mathematics',
    shortDescription: 'Alternative calculation strategies, speed arithmetic, and deep mathematical fluency.',
    fullDescription: 'Derived from classical principles, Vedic Mathematics offers systematic sutras and mental short-cuts for complex arithmetic, algebraic manipulations, and quick verification of answers. Ideal for building flexibility in mathematical thinking.',
    keyOutcomes: [
      'Alternative calculation strategies and mental agility',
      'Cross-checking algorithms to prevent computation errors',
      'Fluency in multiplication, division, squares, and roots',
      'Exam preparation and problem-solving speed'
    ],
    audience: 'Middle school, high school students, and competitive learners',
    deliveryFormat: 'Module-based classroom or workshop curriculum',
    iconName: 'Brain'
  },
  {
    id: 'ai-coding-robotics',
    title: 'AI Coding & Robotics',
    category: 'technology',
    shortDescription: 'Age-appropriate coding, electronics, robotics, computational thinking, and hands-on projects.',
    fullDescription: 'A practical, exploratory journey introducing modern computing concepts. Learners explore block-based to text-based coding, sensors, microcontrollers, and foundational robotics mechanics. Students construct real working prototypes while developing critical computational thinking.',
    keyOutcomes: [
      'Algorithmic logic and systematic problem decomposition',
      'Hands-on experience with hardware sensors and controllers',
      'Creative project prototyping and teamwork',
      'Demystification of artificial intelligence and automated systems'
    ],
    audience: 'Young innovators, school students, and technology enthusiasts',
    deliveryFormat: 'Interactive lab workshops and project-based cohorts',
    iconName: 'Cpu'
  },
  {
    id: 'handwriting-development',
    title: 'Handwriting Development',
    category: 'skills',
    shortDescription: 'English and Nepali handwriting practice, including print and cursive styles.',
    fullDescription: 'Legible, comfortable handwriting remains an essential academic and personal skill. Our program systematically trains pencil grip, posture, letter formation, spacing, and rhythm in both English (Print & Cursive) and Nepali (Devanagari script) styles.',
    keyOutcomes: [
      'Correct ergonomic grip and fatigue-free writing posture',
      'Neat, consistent character proportion and alignment',
      'Bilingual proficiency across English and Devanagari scripts',
      'Enhanced presentation confidence in academic evaluations'
    ],
    audience: 'Early learners, students seeking penmanship improvement',
    deliveryFormat: 'Guided practice workbooks and individualized feedback',
    iconName: 'PenTool'
  },
  {
    id: 'ai-literacy-training',
    title: 'AI Literacy & Training',
    category: 'technology',
    shortDescription: 'Practical AI education for students, teachers, parents, and working professionals.',
    fullDescription: 'Understanding the implications, ethical considerations, and real-world tools of Artificial Intelligence is vital today. This literacy program provides balanced, accessible training covering generative tools, data awareness, everyday productivity, and responsible technology usage.',
    keyOutcomes: [
      'Fundamental understanding of how AI models function',
      'Effective prompt engineering and tool workflow adoption',
      'Critical thinking regarding privacy, ethics, and truthfulness',
      'Empowerment for teachers and professionals in digital transformation'
    ],
    audience: 'Educators, senior students, parents, and institutional professionals',
    deliveryFormat: 'Interactive seminars, intensive bootcamps, and executive modules',
    iconName: 'Sparkles'
  },
  {
    id: 'school-teacher-support',
    title: 'School & Teacher Support',
    category: 'institutional',
    shortDescription: 'Curriculum integration, pedagogical training, and STEM/math lab enablement for schools.',
    fullDescription: 'MindSparQ collaborates with educational institutions across Nepal to augment existing school curricula. We offer specialized teacher training workshops, turnkey abacus and robotics club integration, and ongoing pedagogical support.',
    keyOutcomes: [
      'Teacher upskilling in activity-based math and STEM pedagogy',
      'Seamless co-curricular club setup and resource planning',
      'Student competition preparation and school STEM exhibitions',
      'Structured assessment frameworks for continuous progress'
    ],
    audience: 'School principals, academic coordinators, and classroom educators',
    deliveryFormat: 'Institutional partnerships, on-site educator workshops, and custom programs',
    iconName: 'School'
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
    title: 'Children & Students',
    description: 'From primary math learners to teen robotics creators, we provide engaging pathways to build real skills and confidence.',
    iconName: 'Brain'
  },
  {
    title: 'Parents & Families',
    description: 'Transparent guidance on children’s cognitive development and supportive resources for home practice.',
    iconName: 'Sparkles'
  },
  {
    title: 'Teachers & Schools',
    description: 'Pedagogical training, modern STEM curricula, and practical classroom teaching aids to elevate student engagement.',
    iconName: 'School'
  },
  {
    title: 'Young Innovators',
    description: 'Mentorship and collaborative project spaces for learners passionate about coding, electronics, and future technology.',
    iconName: 'Cpu'
  }
];
