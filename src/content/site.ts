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
        role: 'Founder & CEO',
    bio: 'Educator, technologist, and researcher dedicated to fusing foundational cognitive skills with applied AI and robotics education in Nepal.'
  },
  coreValues: [
    { title: 'Innovation', titleNepali: 'नवीनता', desc: 'Embracing fresh ideas, modern technology, and dynamic pedagogy.' },
    { title: 'Quality Education', titleNepali: 'गुणस्तरीय शिक्षा', desc: 'Prioritizing genuine understanding, critical thinking, and skill mastery.' },
    { title: 'Inclusion', titleNepali: 'समावेशिता', desc: 'Empowering diverse learners across varying learning paces and backgrounds.' },
    { title: 'Integrity', titleNepali: 'इमानदारी', desc: 'Transparent claims, data privacy, responsible technology, and ethical conduct.' },
    { title: 'Practical Learning', titleNepali: 'व्यवहारिक सिकाइ', desc: 'Connecting concepts directly to hands-on experiments, circuits, and projects.' },
    { title: 'Continuous Growth', titleNepali: 'निरन्तर विकास', desc: 'Perpetual improvement for learners, educators, platforms, and institutions.' }
  ],
  nameConcept: {
    mind: 'Represents thought, knowledge, mental capacity, and cognitive development (सोच, ज्ञान, मानसिक क्षमता र बौद्धिक विकास).',
    sparq: 'Represents curiosity, spark of new ideas, creativity, and innovation (जिज्ञासा, नयाँ विचार, रचनात्मकता र नवप्रवर्तन).'
  },
  contact: {
    // Left unpopulated until official owner confirmation as strictly instructed
    phone: undefined,
    email: undefined,
    officeHours: undefined,
    socials: {}
  },
  inquiry: {
    deliveryMode: "placeholder-notice",
    noticeText: "Direct online automated dispatch is currently awaiting school administration mailbox configuration. Inquiries are validated locally and can be prepared for direct dispatch or in-person consultation at our Butwal center."
  }
};
