export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Programs', href: '/programs' },
  { label: 'Contact', href: '/contact' }
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
  company: [
    { label: 'About MindSparQ', href: '/about' },
    { label: 'Learning Approach', href: '/about#approach' },
    { label: 'Contact & Location', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' }
  ]
};
