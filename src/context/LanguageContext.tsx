import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ne';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const STORAGE_KEY = 'mindsparq_lang';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav items
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.programs': 'Programs',
    'nav.courses': 'Courses',
    'nav.events': 'Events & Workshops',
    'nav.blog': 'Blog & Insights',
    'nav.contact': 'Contact Us',
    'nav.learner': 'Learner Portal',
    'nav.admin': 'Admin Console',
    'nav.signin': 'Sign In',
    'nav.signout': 'Sign Out',

    // Hero & Common CTAs
    'cta.explore_programs': 'Explore Programs',
    'cta.book_demo': 'Book Free Demo Class',
    'cta.contact_us': 'Get In Touch',
    'cta.enroll_now': 'Enroll Now',
    'cta.read_more': 'Read More',
    'cta.show_less': 'Show Less',
    'cta.view_details': 'View Details',
    'cta.call_now': 'Call Directly',

    // Section Eyebrows & Titles
    'section.pillars.eyebrow': 'Our 4 Core Pillars',
    'section.pillars.title': 'Next-Gen Cognitive & Tech Foundation',
    'section.pillars.subtitle': 'From mental arithmetic to autonomous robotics, we prepare young minds for tomorrow.',
    
    'section.programs.eyebrow': 'Specialized Programs',
    'section.programs.title': 'Structured Learning for Every Stage',
    'section.programs.subtitle': 'Hands-on experiential curricula designed to eliminate math anxiety and spark innovation.',
    
    'section.support.eyebrow': 'Community & Ecosystem',
    'section.support.title': 'Who We Support',
    'section.support.subtitle': 'Tailored learning pathways for students, parents, educators, and partner schools.',

    'section.approach.eyebrow': 'Pedagogical Framework',
    'section.approach.title': 'Our Learning Approach',
    'section.approach.subtitle': 'Experiential, hands-on, and project-driven learning without passive rote memorization.',

    'section.inquiry.title': 'Ready to Spark Your Child’s Potential?',
    'section.inquiry.subtitle': 'Visit our learning center in Butwal-11, Kalikanagar or contact our mentors today.',

    // Footer
    'footer.registered_center': 'Registered Center',
    'footer.total_visits': 'Total Visits',
    'footer.all_rights': 'All rights reserved. Butwal, Nepal.',
    'footer.social_connect': 'Connect With Us On Social Media',
    'footer.privacy': 'Privacy Policy'
  },
  ne: {
    // Nav items
    'nav.home': 'गृहपृष्ठ',
    'nav.about': 'हाम्रो बारेमा',
    'nav.programs': 'कार्यक्रमहरू',
    'nav.courses': 'कोर्सहरू',
    'nav.events': 'कार्यशाला तथा कार्यक्रम',
    'nav.blog': 'ब्लग तथा लेखहरू',
    'nav.contact': 'सम्पर्क',
    'nav.learner': 'सिकारु पोर्टल',
    'nav.admin': 'प्रशासन कन्सोल',
    'nav.signin': 'लग इन',
    'nav.signout': 'लग आउट',

    // Hero & Common CTAs
    'cta.explore_programs': 'पाठ्यक्रमहरू हेर्नुहोस्',
    'cta.book_demo': 'नि:शुल्क डेमो कक्षा लिनुहोस्',
    'cta.contact_us': 'सम्पर्क गर्नुहोस्',
    'cta.enroll_now': 'अहिले भर्ना हुनुहोस्',
    'cta.read_more': 'थप पढ्नुहोस्',
    'cta.show_less': 'कम देखाउनुहोस्',
    'cta.view_details': 'विस्तृत विवरण',
    'cta.call_now': 'सिधै फोन गर्नुहोस्',

    // Section Eyebrows & Titles
    'section.pillars.eyebrow': 'हाम्रा ४ प्रमुख स्तम्भहरू',
    'section.pillars.title': 'आधुनिक बौद्धिक तथा प्रविधि जग',
    'section.pillars.subtitle': 'मानसिक गणितदेखि रोबोटिक्स र एआईसम्म, हामी बालबालिकालाई भविष्यका लागि तयार गर्छौं।',
    
    'section.programs.eyebrow': 'विशेष कार्यक्रमहरू',
    'section.programs.title': 'प्रत्येक तहका लागि व्यवस्थित सिकाइ',
    'section.programs.subtitle': 'गणितको डर हटाउने र प्रविधिमा सिर्जनशीलता जगाउने प्रयोगात्मक पाठ्यक्रमहरू।',
    
    'section.support.eyebrow': 'समुदाय तथा वातावरण',
    'section.support.title': 'हामी कसलाई सहयोग गर्छौं',
    'section.support.subtitle': 'विद्यार्थी, अभिभावक, शिक्षक तथा सहकार्य गर्ने विद्यालयहरूका लागि उपयुक्त सिकाइ मार्ग।',

    'section.approach.eyebrow': 'शैक्षिक पद्धति',
    'section.approach.title': 'हाम्रो सिकाइ पद्धति',
    'section.approach.subtitle': 'घोकेर होइन, आफैं गरेर र प्रयोगात्मक रूपमा बुझेर सिक्ने पद्धति।',

    'section.inquiry.title': 'बालबालिकाको प्रतिभा उजागर गर्न तयार हुनुहुन्छ?',
    'section.inquiry.subtitle': 'बुटवल-११, कालिका Quantitative स्थित हाम्रो केन्द्रमा आउनुहोस् वा आजै सम्पर्क गर्नुहोस्।',

    // Footer
    'footer.registered_center': 'दर्ता भएको संस्था',
    'footer.total_visits': 'कुल अवलोकन',
    'footer.all_rights': 'सर्वाधिकार सुरक्षित। बुटवल, नेपाल।',
    'footer.social_connect': 'सामाजिक सञ्जालमा हामीसँग जोडिनुहोस्',
    'footer.privacy': 'गोपनीयता नीति'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      return saved === 'ne' ? 'ne' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    return TRANSLATIONS[language]?.[key] || fallback || TRANSLATIONS['en']?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
