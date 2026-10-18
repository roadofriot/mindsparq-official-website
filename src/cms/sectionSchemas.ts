/**
 * MindSparQ Education & Technology (mindsparqeducation.com.np)
 * Homepage & Content Section Registry Schema
 * 
 * Defines schemas, defaults, and field definitions so that every section 
 * can be edited manually from the Admin Visual Editor without writing code.
 */

export interface SectionFieldDescriptor {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'boolean' | 'number' | 'list';
  hint?: string;
  placeholder?: string;
}

export interface SectionSchemaDefinition {
  sectionKey: string;
  name: string;
  category: 'core' | 'content' | 'curriculum' | 'conversion' | 'media';
  description: string;
  fields: SectionFieldDescriptor[];
}

export const SECTION_SCHEMAS: Record<string, SectionSchemaDefinition> = {
  hero: {
    sectionKey: 'hero',
    name: 'Hero Carousel & Announcement',
    category: 'core',
    description: 'Top-of-page interactive slide show, featured announcement flyer, and primary call to action.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow Tag', type: 'text', placeholder: 'EDUCATION • INNOVATION • AI' },
      { key: 'headline', label: 'Primary Headline', type: 'text', placeholder: 'Empowering Minds, Sparking Innovation.' },
      { key: 'description', label: 'Overview Paragraph', type: 'textarea', placeholder: 'Enter introductory mission statement...' },
      { key: 'ctaText', label: 'Primary Button Label', type: 'text', placeholder: 'Explore Programs' },
      { key: 'ctaLink', label: 'Primary Button Link', type: 'url', placeholder: '/programs' },
      { key: 'phone', label: 'Contact Phone Hotline', type: 'text', placeholder: '+977 9857058666' }
    ]
  },
  focus_strip: {
    sectionKey: 'focus_strip',
    name: '4 Core Pillars Strip',
    category: 'core',
    description: 'Four foundational learning pillars (Abacus, AI/Robotics, Penmanship, Teacher Enablement).',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow Tag', type: 'text', placeholder: 'Our 4 Core Pillars' },
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Next-Gen Cognitive & Tech Foundation' },
      { key: 'subtitle', label: 'Subtitle Paragraph', type: 'textarea', placeholder: 'From mental arithmetic to autonomous robotics...' }
    ]
  },
  about_snippet: {
    sectionKey: 'about_snippet',
    name: 'About MindSparQ Overview',
    category: 'content',
    description: 'Institutional narrative, verified address, founder credential, and mission highlights.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'About MindSparQ' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Empowering Minds, Sparking Innovation in Nepal' },
      { key: 'paragraph1', label: 'Primary Paragraph', type: 'textarea' },
      { key: 'paragraph2', label: 'Secondary Paragraph', type: 'textarea' },
      { key: 'location', label: 'Registered Center Address', type: 'text', placeholder: 'Butwal 11, Gyanbhoomi Path, Nepal' },
      { key: 'founder', label: 'Founder & CEO Name', type: 'text', placeholder: 'Samay Budhathoki Chhetri' }
    ]
  },
  programs_overview: {
    sectionKey: 'programs_overview',
    name: 'Curriculum Programs Showcase',
    category: 'curriculum',
    description: 'Filterable program directory cards displaying key outcomes and age ranges.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Specialized Programs' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Structured Learning for Every Stage' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' }
    ]
  },
  ai_robotics_feature: {
    sectionKey: 'ai_robotics_feature',
    name: 'AI & Robotics Spotlight',
    category: 'content',
    description: 'Split section spotlighting hands-on physical computing, terminal code simulator, and hardware logic.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Technology & Future Skills' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Connecting Coding, Electronics, and Creative Thinking' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'feature1Title', label: 'Feature 1 Title', type: 'text', placeholder: 'Algorithmic Thinking' },
      { key: 'feature1Desc', label: 'Feature 1 Description', type: 'textarea' },
      { key: 'feature2Title', label: 'Feature 2 Title', type: 'text', placeholder: 'Physical Computing' },
      { key: 'feature2Desc', label: 'Feature 2 Description', type: 'textarea' }
    ]
  },
  who_we_support: {
    sectionKey: 'who_we_support',
    name: 'Who We Support Section',
    category: 'content',
    description: 'Audience cohorts: learners, parents, teachers, partner schools, and community makers.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Community & Ecosystem' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Who We Support' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' }
    ]
  },
  learning_approach: {
    sectionKey: 'learning_approach',
    name: 'Learning Approach & Pedagogy',
    category: 'content',
    description: 'Four-stage pedagogical progression (Tinkering, Deliberate Practice, Problem Solving, Feedback).',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Pedagogical Framework' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'Our Learning Approach' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' }
    ]
  },
  inquiry_cta: {
    sectionKey: 'inquiry_cta',
    name: 'Direct Inquiry Call-to-Action',
    category: 'conversion',
    description: 'Closing call to action for parents and school collaboration inquiries.',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Admissions & School Inquiries' },
      { key: 'title', label: 'Headline', type: 'text', placeholder: 'Have Questions About Programs, Schedules, or School Collaboration?' },
      { key: 'description', label: 'Paragraph', type: 'textarea' },
      { key: 'ctaText', label: 'Button Label', type: 'text', placeholder: 'Send An Inquiry' },
      { key: 'ctaLink', label: 'Button Link', type: 'url', placeholder: '/contact' }
    ]
  }
};
