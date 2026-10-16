export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Programs', href: '/programs' },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

export const exploreNavItems: NavItem[] = [
  { label: 'Meet Our Team', href: '/team' },
  { label: 'Blog & Insights', href: '/blog' },
  { label: 'Events & Exhibitions', href: '/events' }
];

export const footerLinks = {
  programs: [
    { label: 'Abacus & Mental Math', href: '/programs#abacus-mental-math' },
    { label: 'Vedic Mathematics', href: '/programs#vedic-mathematics' },
    { label: 'AI Coding & Robotics', href: '/programs#ai-coding-robotics' },
    { label: 'Handwriting Development', href: '/programs#handwriting-development' },
    { label: 'AI Literacy & Training', href: '/programs#ai-literacy-training' },
    { label: 'School & Teacher Support', href: '/programs#school-teacher-support' }
  ],
  learning: [
    { label: 'Course Catalog', href: '/courses' },
    { label: 'Events & Workshops', href: '/events' },
    { label: 'Blog & Articles', href: '/blog' },
    { label: 'Learner Portal', href: '/learner' }
  ],
  company: [
    { label: 'About MindSparQ', href: '/about' },
    { label: 'Meet Our Team', href: '/team' },
    { label: 'Learning Approach', href: '/about#approach' },
    { label: 'Contact & Location', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' }
  ]
};
