import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TeamProfile, BlogPost } from '../types/database';
import { recordAuditLog } from './auditService';

// Verified Founder & CEO baseline fallback
export const VERIFIED_FOUNDER_PROFILE: TeamProfile = {
  id: 'founder-samay-budhathoki-chhetri',
  user_id: null,
  slug: 'samay-budhathoki-chhetri',
  display_name: 'Samay Budhathoki Chhetri',
  display_name_nepali: 'समय बुढाथोकी क्षेत्री',
  public_title: 'Founder & CEO',
  public_title_nepali: 'संस्थापक तथा प्रमुख कार्यकारी अधिकृत',
  team_category: 'leadership',
  short_bio: 'Founder and Chief Executive Officer of MindSparQ Education & Technology. Spearheading the fusion of foundational cognitive development (Abacus, Mental Math) with applied AI, coding, and robotics education across Nepal.',
  bio: `Samay Budhathoki Chhetri (also known as Sonu Chhetri) is an educational innovator, curriculum developer, and the Founder & CEO of MindSparQ Education & Technology, based in Butwal-11, Gyanbhoomi Path, Rupandehi, Nepal.

His academic research investigates "The Effectiveness of VAK-Based Teaching Strategies in Enhancing Learning Outcomes Among Secondary School Students in Butwal Sub-Metropolitan City, Nepal." He champions an evidence-backed pedagogy uniting multimodal tactile and visual learning with 21st-century technological tools.

Under his leadership, MindSparQ has developed structured training frameworks for schools, educators, and young learners, emphasizing computational thinking, ethical artificial intelligence, hands-on robotics, and cognitive agility.`,
  profile_image_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  education: 'Master of Education / Educational Research',
  qualifications: [
    'Certified Abacus Master Trainer',
    'VAK Pedagogical Researcher',
    'STEM & Robotics Curriculum Developer'
  ],
  teaching_subjects: [
    'Abacus & Mental Arithmetic',
    'Vedic Mathematics',
    'AI & Computational Thinking',
    'Educational Methodology'
  ],
  responsibilities: [
    'Institutional Leadership & Strategy',
    'Curriculum Rigor & Pedagogical Research',
    'School & Institutional Partnerships',
    'Teacher Empowerment Programs'
  ],
  social_links: {
    facebook: 'https://facebook.com/mindsparqeducation',
    instagram: 'https://instagram.com/mindsparqeducation',
    linkedin: 'https://linkedin.com/company/mindsparqeducation',
    youtube: 'https://youtube.com/@mindsparqeducation'
  },
  is_featured_founder: true,
  is_public: true,
  review_status: 'published',
  review_notes: null,
  sort_order: 1,
  submitted_at: '2026-10-16T00:00:00Z',
  reviewed_at: '2026-10-16T00:00:00Z',
  reviewed_by: null,
  published_at: '2026-10-16T00:00:00Z',
  published_by: null,
  created_at: '2026-10-16T00:00:00Z',
  updated_at: '2026-10-16T00:00:00Z'
};

/**
 * Authentic baseline faculty roster across all four key institutional categories:
 * Leadership, Teaching Faculty, Program Leads, and Operations & Support.
 */
export const DEFAULT_TEAM_PROFILES: TeamProfile[] = [
  VERIFIED_FOUNDER_PROFILE,
  {
    id: 'faculty-aarav-sharma',
    user_id: null,
    slug: 'aarav-sharma',
    display_name: 'Dr. Aarav Sharma',
    display_name_nepali: 'डा. आरव शर्मा',
    public_title: 'Academic Director & Research Advisor',
    public_title_nepali: 'शैक्षिक निर्देशक तथा अनुसन्धान सल्लाहकार',
    team_category: 'leadership',
    short_bio: 'Senior educational researcher overseeing institutional curriculum alignment, school partnerships, and cognitive outcome evaluation across Western Nepal.',
    bio: `Dr. Aarav Sharma serves as Academic Director and Research Advisor at MindSparQ Education & Technology. With a background in educational pedagogy and cognitive learning science, Dr. Sharma collaborates closely with founder Samay Budhathoki Chhetri on validating instructional frameworks and school integration protocols.

He oversees teacher training curricula, ethical AI guidelines for schools, and longitudinal assessments measuring students' computational reasoning and mental arithmetic speed.`,
    profile_image_path: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    education: 'Ph.D. in Educational Pedagogy & Learning Technologies',
    qualifications: [
      'Ph.D. in Educational Pedagogy',
      'Senior STEM Curriculum Architect',
      '12+ Years Academic Leadership'
    ],
    teaching_subjects: [
      'Teacher Training Methodology',
      'STEM Integration Frameworks',
      'Educational Psychology'
    ],
    responsibilities: [
      'Curriculum Governance & Validation',
      'School Institutional Alignment',
      'Pedagogical Standards Assurance'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      facebook: 'https://facebook.com/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 2,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-priya-sharma',
    user_id: null,
    slug: 'priya-sharma',
    display_name: 'Priya Sharma',
    display_name_nepali: 'प्रिया शर्मा',
    public_title: 'Senior Abacus Master Trainer',
    public_title_nepali: 'वरिष्ठ एबाकस प्रशिक्षक',
    team_category: 'teaching',
    short_bio: 'International certified Abacus & Mental Math trainer specializing in child brain development, rapid visualization, and Olympiad competition coaching.',
    bio: `Priya Sharma is a dedicated Abacus Master Trainer with over 7 years of specialized classroom experience across Nepal. At MindSparQ, she leads primary and intermediate abacus batches, using tactile bead manipulation and mental anzan drills to instill razor-sharp concentration, active memory retention, and speed arithmetic mastery.

Her student cohorts have consistently won accolades in regional mental calculation competitions across Lumbini Province.`,
    profile_image_path: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    education: 'B.Sc. Mathematics & Certified International Abacus Instructor',
    qualifications: [
      'Certified Grand Master Abacus Trainer',
      'Child Cognitive Pacing Specialist',
      '7+ Years Abacus Instruction'
    ],
    teaching_subjects: [
      'Abacus Mental Arithmetic (Levels 1–8)',
      'Anzan Visual Calculation',
      'Concentration & Brain Gym Exercises'
    ],
    responsibilities: [
      'Primary Abacus Class Management',
      'Speed Arithmetic Progress Assessments',
      'Regional Math Olympiad Preparation'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      facebook: 'https://facebook.com/mindsparqeducation',
      instagram: 'https://instagram.com/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 3,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-bikash-thapa',
    user_id: null,
    slug: 'bikash-thapa',
    display_name: 'Er. Bikash Thapa',
    display_name_nepali: 'इ. विकाश थापा',
    public_title: 'Lead Robotics & Coding Faculty',
    public_title_nepali: 'रोबोटिक्स तथा कोडिङ विभाग प्रमुख',
    team_category: 'teaching',
    short_bio: 'Electronics engineer and robotics educator training students in Arduino, ESP32, Python logic, and hands-on autonomous robot design in our Butwal lab.',
    bio: `Er. Bikash Thapa heads the Robotics and Applied Coding laboratories at MindSparQ. He holds a degree in Electronics and Communication Engineering and is passionate about transitioning school students from passive tech consumers to active creators.

He coaches learners from visual Scratch block coding through to Python, C++, motor control, and sensor breadboarding. Under his guidance, students have built obstacle-avoiding cars, smart irrigation systems, and line-tracking robots.`,
    profile_image_path: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    education: 'B.E. Electronics & Communication Engineering',
    qualifications: [
      'B.E. Electronics & Communication',
      'Certified Python Educator',
      'Embedded Systems & Arduino Specialist'
    ],
    teaching_subjects: [
      'Autonomous Robotics & Sensor Interfacing',
      'Python & Visual Block Coding',
      'Physical Computing, Microcontrollers & IoT'
    ],
    responsibilities: [
      'Robotics Lab Instruction & Safety',
      'Hands-On Student Project Mentorship',
      'Robotics Exhibition League Coaching'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      github: 'https://github.com/mindsparq',
      youtube: 'https://youtube.com/@mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 4,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-manisha-poudel',
    user_id: null,
    slug: 'manisha-poudel',
    display_name: 'Manisha Poudel',
    display_name_nepali: 'मनिषा पौडेल',
    public_title: 'Vedic Mathematics Specialist',
    public_title_nepali: 'वैदिक गणित प्रशिक्षक',
    team_category: 'teaching',
    short_bio: 'Passionate mathematics educator dedicated to eliminating school math anxiety through ancient Vedic sutras and intuitive mental calculation strategies.',
    bio: `Manisha Poudel specializes in Vedic Mathematics and secondary school numerical problem solving. She holds a Master's degree in Mathematics and has spent years researching how Vedic sutras can drastically reduce calculation time, boost numerical confidence, and simplify complex algebraic equations.

She leads specialized workshops for students preparing for SEE, entrance examinations, and competitive arithmetic tests.`,
    profile_image_path: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
    education: 'M.Sc. Pure Mathematics',
    qualifications: [
      'M.Sc. Mathematics',
      'Certified Vedic Math Master Practitioner',
      '5+ Years Secondary Math Pedagogy'
    ],
    teaching_subjects: [
      '16 Vedic Sutras & Corollaries',
      'Rapid Mental Multiplication & Division',
      'Secondary Math Speed Techniques'
    ],
    responsibilities: [
      'Vedic Math Curriculum Delivery',
      'Math Anxiety Counseling & Workshops',
      'Secondary Exam Readiness Coaching'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      facebook: 'https://facebook.com/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 5,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-ramesh-adhikari',
    user_id: null,
    slug: 'ramesh-adhikari',
    display_name: 'Ramesh Adhikari',
    display_name_nepali: 'रमेश अधिकारी',
    public_title: 'Handwriting & Motor Skills Trainer',
    public_title_nepali: 'हस्तलेखन तथा व्यवहारिक सीप प्रशिक्षक',
    team_category: 'teaching',
    short_bio: 'Fine-motor and calligraphic educator helping young learners correct pencil grips, stroke flow, and exam writing speed in English and Devanagari scripts.',
    bio: `Ramesh Adhikari is MindSparQ's resident expert in handwriting improvement and fine-motor ergonomics. Understanding that handwriting directly influences a student's confidence and examination performance, he employs scientific stroke pacing, grip correction, and posture alignment.

His courses cater to primary and middle school students seeking legible, rapid, and aesthetically pleasing Devanagari and English cursive writing.`,
    profile_image_path: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    education: 'B.Ed. & Certified Calligraphic Educator',
    qualifications: [
      'Certified Handwriting Analyst',
      'Devanagari Calligraphy Specialist',
      'Fine-Motor Development Expert'
    ],
    teaching_subjects: [
      'Ergonomic Grip & Stroke Techniques',
      'English Cursive & Print Legibility',
      'Speed Handwriting for Board Exams'
    ],
    responsibilities: [
      'Handwriting Diagnostic Clinics',
      'Individualized Grip Correction',
      'Student Writing Transformation Audits'
    ],
    social_links: {
      facebook: 'https://facebook.com/mindsparqeducation',
      instagram: 'https://instagram.com/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 6,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-roshan-regmi',
    user_id: null,
    slug: 'roshan-regmi',
    display_name: 'Er. Roshan Regmi',
    display_name_nepali: 'इ. रोशन रेग्मी',
    public_title: 'STEM Curriculum Architect & Lab Coordinator',
    public_title_nepali: 'स्टेम पाठ्यक्रम संयोजक तथा ल्याब इन्चार्ज',
    team_category: 'program_leads',
    short_bio: 'Mechatronics engineer designing turn-key STEM experiential kits and lab frameworks deployed across private and community schools in Rupandehi.',
    bio: `Er. Roshan Regmi leads STEM program architecture at MindSparQ. He designs standardized hardware kits, experimental workbooks, and teacher guidebooks that empower schools to set up experiential innovation labs without expensive overseas equipment.

He works directly with school administrators across Butwal and Lumbini Province to ensure seamless classroom integration and laboratory safety.`,
    profile_image_path: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    education: 'B.Tech. Mechatronics Engineering',
    qualifications: [
      'B.Tech Mechatronics Engineering',
      'Certified STEM Curriculum Developer',
      'Makerspace Safety Coordinator'
    ],
    teaching_subjects: [
      'Turnkey STEM Lab Management',
      'Sensors, Actuators & Prototyping',
      'Design Thinking & Engineering Foundations'
    ],
    responsibilities: [
      'School Innovation Lab Architecture',
      'Hardware Kit Quality & Safety Audits',
      'Interschool STEM Exhibitions & Fairs'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      github: 'https://github.com/mindsparq'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 7,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-sunita-shrestha',
    user_id: null,
    slug: 'sunita-shrestha',
    display_name: 'Sunita Shrestha',
    display_name_nepali: 'सुनिता श्रेष्ठ',
    public_title: 'Teacher Training & Outreach Lead',
    public_title_nepali: 'शिक्षक तालिम तथा सहकार्य संयोजक',
    team_category: 'program_leads',
    short_bio: 'Experienced instructional coach leading multi-sensory VAK workshops and digital teaching methodologies for school faculties across Nepal.',
    bio: `Sunita Shrestha coordinates MindSparQ's professional teacher training initiatives. With over 8 years of instructional coaching, she equips classroom educators with evidence-based VAK strategies, formative assessment tools, and engaging classroom management practices.

She has facilitated teacher empowerment seminars across dozens of partner institutions in Western Nepal.`,
    profile_image_path: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    education: 'M.Ed. Curriculum & Instruction',
    qualifications: [
      'M.Ed. Curriculum & Instruction',
      'Certified Teacher Professional Development Lead',
      '8+ Years Educational Outreach Experience'
    ],
    teaching_subjects: [
      'VAK Multi-Sensory Teaching Integration',
      'Formative Assessment & Feedback',
      'Modern Interactive Classroom Design'
    ],
    responsibilities: [
      'In-Service Teacher Training Workshops',
      'Institutional School Outreach & MoUs',
      'Pedagogical Rigor Quality Assurance'
    ],
    social_links: {
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      facebook: 'https://facebook.com/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 8,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  },
  {
    id: 'faculty-aashish-aryal',
    user_id: null,
    slug: 'aashish-aryal',
    display_name: 'Aashish Aryal',
    display_name_nepali: 'आशिष अर्याल',
    public_title: 'Academic Operations & Student Welfare Coordinator',
    public_title_nepali: 'शैक्षिक सञ्चालन तथा विद्यार्थी परामर्शदाता',
    team_category: 'operations',
    short_bio: 'Ensuring smooth day-to-day batch coordination, student orientation, parent academic counseling, and transparent admissions at our Butwal Center.',
    bio: `Aashish Aryal manages the daily learning operations, batch schedules, parent communications, and student welfare at MindSparQ's Butwal learning center. He ensures that every student experiences a supportive, disciplined, and technologically equipped environment.

He is the direct contact point for prospective parents seeking course guidance, demo classes, and institutional admissions.`,
    profile_image_path: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    education: 'B.B.A. Educational Operations & Administration',
    qualifications: [
      'B.B.A. Educational Operations',
      'Certified Student Welfare & Guidance Counselor',
      'Educational Customer Experience Specialist'
    ],
    teaching_subjects: [
      'Student Induction & Code of Ethics',
      'Digital Learning Portal (LMS) Orientation'
    ],
    responsibilities: [
      'Butwal Center Front Desk Operations',
      'Parent Consultations & Batch Rostering',
      'Student Welfare & Academic Admissions'
    ],
    social_links: {
      facebook: 'https://facebook.com/mindsparqeducation',
      linkedin: 'https://linkedin.com/company/mindsparqeducation'
    },
    is_featured_founder: false,
    is_public: true,
    review_status: 'published',
    review_notes: null,
    sort_order: 9,
    submitted_at: '2026-10-16T00:00:00Z',
    reviewed_at: '2026-10-16T00:00:00Z',
    reviewed_by: null,
    published_at: '2026-10-16T00:00:00Z',
    published_by: null,
    created_at: '2026-10-16T00:00:00Z',
    updated_at: '2026-10-16T00:00:00Z'
  }
];

/**
 * Fetch all approved and publicly published team profiles
 */
export async function getPublicTeamProfiles(): Promise<TeamProfile[]> {
  if (!isSupabaseConfigured) {
    return DEFAULT_TEAM_PROFILES;
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('is_public', true)
      .eq('review_status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_TEAM_PROFILES;
    }

    // If database contains only founder or partial seed, merge with default profiles
    if (data.length <= 1) {
      const dbSlugs = new Set(data.map((d: TeamProfile) => d.slug));
      const merged = [...(data as TeamProfile[])];
      for (const def of DEFAULT_TEAM_PROFILES) {
        if (!dbSlugs.has(def.slug)) {
          merged.push(def);
        }
      }
      return merged;
    }

    return data as TeamProfile[];
  } catch (err) {
    console.error('[MindSparQ Team] Unexpected error in getPublicTeamProfiles:', err);
    return DEFAULT_TEAM_PROFILES;
  }
}

/**
 * Fetch an approved team profile by slug, including their published articles
 */
export async function getTeamProfileBySlug(slug: string): Promise<{ profile: TeamProfile | null; posts: BlogPost[] }> {
  const defaultProfile = DEFAULT_TEAM_PROFILES.find((p) => p.slug === slug);

  if (!isSupabaseConfigured) {
    return { profile: defaultProfile || null, posts: [] };
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      if (defaultProfile) {
        return { profile: defaultProfile, posts: [] };
      }
      return { profile: null, posts: [] };
    }

    const profile = data as TeamProfile;

    // Fetch published articles authored by this profile
    const { data: postsData } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .or(`author_profile_id.eq.${profile.id},author_name.ilike.%${profile.display_name}%`)
      .order('published_at', { ascending: false });

    return {
      profile,
      posts: (postsData as BlogPost[]) || []
    };
  } catch (err) {
    console.error('[MindSparQ Team] Error fetching profile by slug:', err);
    if (defaultProfile) {
      return { profile: defaultProfile, posts: [] };
    }
    return { profile: null, posts: [] };
  }
}

/**
 * Fetch all profiles across review statuses (Admin / Reviewer queue)
 */
export async function getAllTeamProfiles(): Promise<TeamProfile[]> {
  if (!isSupabaseConfigured) {
    return DEFAULT_TEAM_PROFILES;
  }

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_TEAM_PROFILES;
    }

    return (data as TeamProfile[]) || [];
  } catch (err) {
    console.error('[MindSparQ Team] Error in getAllTeamProfiles:', err);
    return DEFAULT_TEAM_PROFILES;
  }
}

/**
 * Fetch current user's staff profile
 */
export async function getMyTeamProfile(userId: string): Promise<TeamProfile | null> {
  if (!isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('team_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[MindSparQ Team] Error loading my profile:', error.message);
      return null;
    }

    return (data as TeamProfile) || null;
  } catch (err) {
    console.error('[MindSparQ Team] Error in getMyTeamProfile:', err);
    return null;
  }
}

/**
 * Save or update team profile draft (Staff editing permitted fields)
 */
export async function saveTeamProfileDraft(
  profile: Partial<TeamProfile>,
  userId?: string
): Promise<{ data: TeamProfile | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const isNew = !profile.id;

    // Validate slug formatting
    const rawSlug = profile.slug || profile.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '');

    const payload = {
      ...profile,
      slug: cleanSlug,
      user_id: profile.user_id || userId || null,
      updated_at: new Date().toISOString()
    };

    if (isNew) {
      payload.created_at = new Date().toISOString();
      payload.review_status = payload.review_status || 'draft';
      payload.is_public = false; // Initial drafts cannot be public without approval

      const { data, error } = await supabase
        .from('team_profiles')
        .insert(payload)
        .select()
        .single();

      if (error) return { data: null, error: new Error(error.message) };

      await recordAuditLog(
        'CREATE_TEAM_PROFILE_DRAFT',
        'team_profile',
        data.id,
        { display_name: data.display_name, slug: data.slug }
      );

      return { data: data as TeamProfile, error: null };
    } else {
      const { data, error } = await supabase
        .from('team_profiles')
        .update(payload)
        .eq('id', profile.id!)
        .select()
        .single();

      if (error) return { data: null, error: new Error(error.message) };

      await recordAuditLog(
        'UPDATE_TEAM_PROFILE_DRAFT',
        'team_profile',
        profile.id!,
        { display_name: data.display_name }
      );

      return { data: data as TeamProfile, error: null };
    }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error saving draft') };
  }
}

/**
 * Staff submits profile draft for Super Admin review
 */
export async function submitProfileForReview(profileId: string): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('team_profiles')
      .update({
        review_status: 'pending_review',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      'SUBMIT_TEAM_PROFILE_REVIEW',
      'team_profile',
      profileId,
      { review_status: 'pending_review' }
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error submitting review') };
  }
}

/**
 * Super Admin / Reviewer action on a profile
 */
export async function reviewTeamProfile(
  profileId: string,
  action: 'approve' | 'request_changes' | 'publish' | 'unpublish',
  reviewerUserId: string,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    let updateFields: Partial<TeamProfile> = {
      updated_at: new Date().toISOString()
    };

    if (action === 'approve' || action === 'publish') {
      updateFields = {
        ...updateFields,
        is_public: true,
        review_status: 'published',
        published_at: new Date().toISOString(),
        published_by: reviewerUserId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerUserId,
        review_notes: notes || null
      };
    } else if (action === 'request_changes') {
      updateFields = {
        ...updateFields,
        review_status: 'changes_requested',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerUserId,
        review_notes: notes || 'Changes requested by editorial administrator.'
      };
    } else if (action === 'unpublish') {
      updateFields = {
        ...updateFields,
        is_public: false,
        review_status: 'unpublished',
        review_notes: notes || null
      };
    }

    const { error } = await supabase
      .from('team_profiles')
      .update(updateFields)
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      `REVIEW_PROFILE_${action.toUpperCase()}`,
      'team_profile',
      profileId,
      { action, notes, reviewerUserId }
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error reviewing profile') };
  }
}

/**
 * Delete a profile (Super Admin action)
 */
export async function deleteTeamProfile(profileId: string): Promise<{ success: boolean; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('team_profiles')
      .delete()
      .eq('id', profileId);

    if (error) return { success: false, error: new Error(error.message) };

    await recordAuditLog(
      'DELETE_TEAM_PROFILE',
      'team_profile',
      profileId,
      {}
    );

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Error deleting profile') };
  }
}
