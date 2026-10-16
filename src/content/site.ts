export interface SiteConfig {
  name: string;
  tagline: string;
  domain: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    fullFormatted: string;
    mapQueryUrl?: string;
  };
  registrationStatus: string;
  founder: {
    name: string;
    nameNepali: string;
    altName?: string;
    role: string;
    bio: string;
  };
  coreValues: Array<{
    title: string;
    titleNepali: string;
    desc: string;
  }>;
  nameConcept: {
    mind: string;
    sparq: string;
  };
  contact: {
    phone?: string;
    email?: string;
    officeHours?: string;
    socials: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  inquiry: {
    deliveryMode: 'mailto' | 'hosted' | 'placeholder-notice';
    noticeText: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "MindSparQ Education & Technology",
  tagline: "Empowering Minds, Sparking Innovation",
  domain: "mindsparqeducation.com.np",
  registrationStatus: "Registered, as confirmed by the founder",
  location: {
    address: "Gyanbhoomi Path",
    city: "Butwal 11",
    province: "Lumbini Province",
    country: "Nepal",
    fullFormatted: "Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal",
    mapQueryUrl: "https://www.google.com/maps/search/?api=1&query=Butwal+11+Gyanbhoomi+Path+Rupandehi+Nepal"
  },
  founder: {
    name: 'Samay Budhathoki Chhetri',
    nameNepali: 'समय बुढाथोकी क्षेत्री',
    altName: 'Sonu Chhetri',
    role: 'Founder & CEO',
    bio: 'Educator, technologist, and researcher dedicated to fusing foundational cognitive skills with applied AI and robotics education in Nepal.'
  },
  coreValues: [
    { title: 'Innovation', titleNepali: 'नवीनता', desc: 'Explore new ideas, practical methods, and appropriate technologies that improve learning and solve real problems.' },
    { title: 'Quality Education', titleNepali: 'गुणस्तरीय शिक्षा', desc: 'Prioritize meaningful understanding, measurable learning objectives, suitable instruction, and continuous improvement.' },
    { title: 'Practical Learning', titleNepali: 'व्यवहारिक सिकाइ', desc: 'Connect concepts to exercises, experiments, projects, demonstrations, and real-world applications.' },
    { title: 'Integrity', titleNepali: 'इमानदारी', desc: 'Communicate honestly, protect institutional and user information, and avoid unsupported claims about services or outcomes.' },
    { title: 'Inclusion', titleNepali: 'समावेशिता', desc: 'Respect different backgrounds, abilities, learning needs, and learning speeds.' },
    { title: 'Responsibility', titleNepali: 'जिम्मेवारी', desc: 'Protect children, use technology thoughtfully, respect intellectual property, and handle personal data responsibly.' },
    { title: 'Continuous Improvement', titleNepali: 'निरन्तर सुधार', desc: 'Review programs, gather feedback, evaluate outcomes, and improve teaching materials, software, and operational processes.' }
  ],
  nameConcept: {
    mind: 'Thinking, understanding, knowledge, creativity, and intellectual development.',
    sparq: 'Curiosity, inspiration, fresh ideas, innovation, and the spark that initiates discovery.'
  },
  contact: {
    phone: '+977 9857058666',
    email: 'contact@mindsparqeducation.com.np',
    officeHours: 'Sunday – Friday: 9:00 AM – 6:00 PM',
    socials: {
      facebook: 'https://facebook.com/mindsparqeducation',
      instagram: 'https://instagram.com/mindsparqeducation',
      linkedin: 'https://linkedin.com/company/mindsparqeducation',
      youtube: 'https://youtube.com/@mindsparqeducation'
    }
  },
  inquiry: {
    deliveryMode: "placeholder-notice",
    noticeText: "Direct online automated dispatch is currently awaiting school administration mailbox configuration. Inquiries are validated locally and can be prepared for direct dispatch or in-person consultation at our Butwal center."
  }
};
