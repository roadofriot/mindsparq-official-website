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
