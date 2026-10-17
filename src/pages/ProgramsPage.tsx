import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Info, 
  Sparkles, 
  Filter, 
  Building2, 
  Handshake, 
  ShieldCheck, 
  Clock, 
  Users,
  Award,
  BookOpen,
  Cpu,
  Layers
} from 'lucide-react';
import { programs, Program, schoolPartnershipModel } from '../content/programs';
import { ProgramIcon } from '../components/ui/ProgramIcon';
import { updatePageSeo } from '../utils/seo';
import { useLanguage } from '../context/LanguageContext';
import { PageBanner } from '../components/ui/PageBanner';

type FilterCategory = 'all' | 'mathematics' | 'technology' | 'skills' | 'institutional';

export const ProgramsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const { hash } = useLocation();
  const { language } = useLanguage();
  const isNe = language === 'ne';

  useEffect(() => {
    updatePageSeo({
      title: 'Educational Programs & School Partnerships | MindSparQ',
      description: 'Abacus mental arithmetic, robotics lab incubation, coding, and bilingual penmanship programs designed for schools and young learners.',
      canonicalPath: '/programs',
      ogType: 'website'
    });
  }, []);

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const filteredPrograms = activeCategory === 'all'
    ? programs
    : programs.filter(p => p.category === activeCategory);

  const filterTabs = [
    { id: 'all', label: isNe ? 'सबै कार्यक्रमहरू' : 'All Programs', count: programs.length },
    { id: 'mathematics', label: isNe ? 'गणित तथा मानसिक हिसाब' : 'Mathematics & Mental Math', count: programs.filter(p => p.category === 'mathematics').length },
    { id: 'technology', label: isNe ? 'कोडिङ, एआई तथा रोबोटिक्स' : 'Coding, AI & Robotics', count: programs.filter(p => p.category === 'technology').length },
    { id: 'skills', label: isNe ? 'हस्तलेखन तथा सीप विकास' : 'Handwriting & Skills', count: programs.filter(p => p.category === 'skills').length },
    { id: 'institutional', label: isNe ? 'शिक्षक तथा विद्यालय सहयोग' : 'School & Teacher Support', count: programs.filter(p => p.category === 'institutional').length }
  ] as const;

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'mathematics':
        return {
          label: isNe ? 'गणित तथा मानसिक हिसाब' : 'Mathematics & Arithmetic',
          accent: '#2563eb',
          bg: 'rgba(37, 99, 235, 0.1)',
          border: 'rgba(37, 99, 235, 0.25)'
        };
      case 'technology':
        return {
          label: isNe ? 'प्रविधि तथा रोबोटिक्स' : 'Technology & Robotics',
          accent: '#0891b2',
          bg: 'rgba(8, 145, 178, 0.1)',
          border: 'rgba(8, 145, 178, 0.25)'
        };
      case 'skills':
        return {
          label: isNe ? 'व्यवहारिक सीप विकास' : 'Applied Skills & Penmanship',
          accent: '#059669',
          bg: 'rgba(5, 150, 105, 0.1)',
          border: 'rgba(5, 150, 105, 0.25)'
        };
      case 'institutional':
        return {
          label: isNe ? 'संस्थागत सहकार्य' : 'Institutional Partnership',
          accent: '#7c3aed',
          bg: 'rgba(124, 58, 237, 0.1)',
          border: 'rgba(124, 58, 237, 0.25)'
        };
      default:
        return {
          label: 'Specialized Program',
          accent: '#4f46e5',
          bg: 'rgba(79, 70, 229, 0.1)',
          border: 'rgba(79, 70, 229, 0.25)'
        };
    }
  };

  return (
    <div style={{ paddingBottom: 'clamp(80px, 10vw, 140px)', backgroundColor: 'var(--color-bg)' }}>
      {/* Page Hero Banner */}
      <PageBanner
        eyebrowIcon={<Sparkles size={14} />}
        eyebrowText={isNe ? 'पाठ्यक्रम तथा सिकाइ मार्गहरू' : 'Curriculum & Academic Pathways'}
        title={isNe ? 'MindSparQ सिकाइ कार्यक्रमहरू' : 'MindSparQ Learning Programs'}
        subtitle={isNe 
          ? 'मानसिक गणितीय चपलता, कम्प्युटेसनल सिर्जनशीलता र आधुनिक प्रविधिमा व्यवहारिक दक्षता विकास गर्न तयार पारिएका बृहत् पाठ्यक्रमहरू।'
          : 'Discover our comprehensive range of programs designed to nurture mental calculation agility, computational creativity, and practical literacy in modern technology.'}
        backgroundImageUrl="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
        badges={[
          { label: 'Abacus & Mental Math', variant: 'primary' },
          { label: 'Robotics & AI Labs', variant: 'primary' },
          { label: 'Vedic Math', variant: 'accent' },
          { label: 'Bilingual Penmanship', variant: 'neutral' },
          { label: 'School Partnerships', variant: 'neutral' }
        ]}
      />

      {/* Enterprise Capabilities & Trust Strip */}
      <section style={{ backgroundColor: 'var(--color-bg)', marginTop: 'calc(-1 * var(--space-6))', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
              gap: 'var(--space-4)',
              padding: 'clamp(var(--space-4), 3vw, var(--space-6))',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  6+ Specialized Pathways
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Foundational to secondary tiers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(8, 145, 178, 0.12)',
                  color: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Cpu size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  Hands-On STEM & Robotics
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Arduino UNO R4, ESP32 & sensors
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  Turnkey School Partnerships
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Curriculum, kits & master trainers
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  Empirical VAK Pedagogy
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Visual, auditory & tactile mastery
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Disclaimers & Filter Bar */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-10) 0 var(--space-6)' }}>
        <div className="container">
          {/* Transparent Availability Notice */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: '16px 20px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <Info size={20} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.65 }}>
              <strong>{isNe ? 'कक्षा तालिका तथा भर्ना सूचना:' : 'Notice on Batch Admissions & Timetables:'}</strong>{' '}
              {isNe 
                ? 'नयाँ ब्याच तालिका, उमेर समूह र सिट उपलब्धता नियमित अपडेट गरिन्छ। विद्यालय सहकार्य कार्यक्रमहरू सम्बन्धित विद्यालयको क्यालेन्डर अनुसार चल्दछन्। बुटवलमा हाल भर्ना भइरहेका ब्याचहरूबारे जान्न हाम्रो डेस्कमा सम्पर्क गर्नुहोस्।'
                : 'Batch schedules, age suitability, and cohort availability are updated periodically. School partnership co-curricular sessions operate under tailored academic timetables. Contact our academic coordinator to confirm currently enrolling batches at our Butwal Center.'}
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: 'var(--space-10)'
            }}
          >
            <span 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: 'var(--color-text-muted)', 
                marginRight: 'var(--space-2)', 
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Filter size={14} /> {isNe ? 'वर्ग छनोट:' : 'Filter:'}
            </span>
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as FilterCategory)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '38px',
                    padding: '8px 18px',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-600)' : 'var(--color-surface)',
                    color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                    border: `1px solid ${isActive ? 'var(--color-primary-600)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.28)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-surface-hover)',
                      color: isActive ? '#ffffff' : 'var(--color-text-muted)'
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Enterprise Programs List with Generous Spacing */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(48px, 6vw, 72px)' 
            }}
          >
            {filteredPrograms.map((program: Program) => {
              const displayTitle = isNe && program.titleNepali ? program.titleNepali : program.title;
              const displayFullDesc = isNe && program.fullDescriptionNepali ? program.fullDescriptionNepali : program.fullDescription;
              const displayOutcomes = isNe && program.keyOutcomesNepali ? program.keyOutcomesNepali : program.keyOutcomes;
              const displayAudience = isNe && program.audienceNepali ? program.audienceNepali : program.audience;
              const displayDelivery = isNe && program.deliveryFormatNepali ? program.deliveryFormatNepali : program.deliveryFormat;
              const theme = getCategoryTheme(program.category);

              return (
                <article 
                  key={program.id}
                  id={program.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-2xl, 24px)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                    scrollMarginTop: '100px',
                    transition: 'box-shadow var(--transition-normal), border-color var(--transition-normal)'
                  }}
                  className="program-card-hover"
                >
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 0
                    }}
                    className="program-enterprise-grid"
                  >
                    {/* Visual Media & Identity Column */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        backgroundColor: 'var(--color-surface)',
                        borderRight: '1px solid var(--color-border)'
                      }}
                      className="program-visual-col"
                    >
                      {/* Photo Container with Glass Badges */}
                      <div
                        style={{
                          height: '280px',
                          width: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          backgroundColor: 'var(--color-surface-hover)'
                        }}
                      >
                        <img 
                          src={program.imageUrl} 
                          alt={displayTitle}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%)'
                          }}
                        />

                        {/* Category Floating Pill */}
                        <span 
                          style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontWeight: 700,
                            padding: '4px 14px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {theme.label}
                        </span>

                        {/* Program Icon Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '16px',
                            right: '16px',
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            backgroundColor: 'var(--color-surface)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--color-border)',
                            color: theme.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}
                        >
                          <ProgramIcon name={program.iconName} size={24} />
                        </div>
                      </div>

                      {/* Metadata Chips: Audience & Format */}
                      <div 
                        style={{ 
                          padding: 'clamp(20px, 3vw, 24px)', 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px',
                          backgroundColor: 'var(--color-surface)'
                        }}
                      >
                        <div 
                          style={{ 
                            padding: '12px 14px', 
                            backgroundColor: 'var(--color-surface-hover)', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}
                        >
                          <Users size={16} style={{ color: theme.accent, flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            <strong style={{ color: 'var(--color-text)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                              {isNe ? 'लक्षित उमेर / समूह:' : 'Target Cohort:'}
                            </strong>
                            {displayAudience}
                          </div>
                        </div>

                        <div 
                          style={{ 
                            padding: '12px 14px', 
                            backgroundColor: 'var(--color-surface-hover)', 
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}
                        >
                          <Clock size={16} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            <strong style={{ color: 'var(--color-text)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                              {isNe ? 'कक्षा ढाँचा तथा वितरण:' : 'Format & Delivery:'}
                            </strong>
                            {displayDelivery}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Content & Outcomes Column */}
                    <div 
                      style={{ 
                        padding: 'clamp(24px, 4vw, 36px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 'var(--space-6)',
                        backgroundColor: 'var(--color-surface)'
                      }}
                    >
                      <div>
                        {/* Eyebrow & Main Title */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: theme.accent
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.accent }}>
                              {theme.label}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>•</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                              MindSparQ Certified Pathway
                            </span>
                          </div>

                          <h2 
                            style={{ 
                              fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)', 
                              fontWeight: 800, 
                              margin: '0 0 6px 0', 
                              color: 'var(--color-text)',
                              lineHeight: 1.25
                            }}
                          >
                            {displayTitle}
                          </h2>

                          {isNe && program.titleNepali && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                              {program.title}
                            </div>
                          )}
                        </div>

                        {/* Curriculum Deep Dive Paragraph */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                          <h3 
                            style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.05em', 
                              color: 'var(--color-text-muted)', 
                              marginBottom: '8px' 
                            }}
                          >
                            {isNe ? 'पाठ्यक्रमको विस्तृत विवरण' : 'Curriculum Deep Dive'}
                          </h3>
                          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.75, margin: 0 }}>
                            {displayFullDesc}
                          </p>
                        </div>

                        {/* Core Learning Outcomes in Modern Elevated Block */}
                        <div 
                          style={{
                            backgroundColor: 'var(--color-surface-hover)',
                            borderRadius: 'var(--radius-xl)',
                            padding: 'clamp(18px, 3vw, 24px)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <Sparkles size={16} style={{ color: '#10b981' }} />
                            <h4 
                              style={{ 
                                fontSize: '0.8125rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.04em', 
                                margin: 0, 
                                color: 'var(--color-text)' 
                              }}
                            >
                              {isNe ? 'प्रमुख सिकाइ उपलब्धिहरू (Core Outcomes)' : 'Core Learning Outcomes & Competencies'}
                            </h4>
                          </div>

                          <div 
                            style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', 
                              gap: '12px' 
                            }}
                          >
                            {displayOutcomes.map((outcome, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: '10px', 
                                  fontSize: '0.8125rem', 
                                  color: 'var(--color-text-secondary)', 
                                  lineHeight: 1.55 
                                }}
                              >
                                <CheckCircle2 
                                  size={16} 
                                  style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} 
                                />
                                <span>{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Batch Status Indicator & Enquire Button */}
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 'var(--space-4)',
                          paddingTop: 'var(--space-4)',
                          borderTop: '1px solid var(--color-border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: '#10b981',
                              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                            }} 
                          />
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            {isNe ? 'बुटवल केन्द्रमा नयाँ ब्याच भर्ना खुला' : 'Enrolling in Butwal • Individual & School Batches'}
                          </span>
                        </div>

                        <Link 
                          to={`/contact?program=${encodeURIComponent(program.title)}`}
                          className="btn btn-primary"
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 22px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                          }}
                        >
                          <span>{isNe ? `यस कार्यक्रमका लागि सोधपुछ गर्नुहोस्` : `Enquire for ${program.title}`}</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <style>{`
          @media (min-width: 960px) {
            .program-enterprise-grid {
              grid-template-columns: minmax(360px, 420px) 1fr !important;
            }
          }
          .program-card-hover:hover {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
            border-color: rgba(37, 99, 235, 0.3) !important;
          }
        `}</style>
      </section>

      {/* Enterprise School Partnership Model */}
      <section 
        id="school-partnerships" 
        className="section-spacing"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          marginTop: 'var(--space-12)'
        }}
      >
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto var(--space-12)' }}>
            <div className="eyebrow eyebrow-teal" style={{ justifyContent: 'center' }}>
              <Handshake size={14} />
              <span>{isNe ? 'संस्थागत सहकार्य तथा साझेदारी' : 'Institutional Synergy & Turnkey Labs'}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.375rem)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)', lineHeight: 1.25 }}>
              {isNe ? schoolPartnershipModel.titleNepali : schoolPartnershipModel.title}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.75 }}>
              {isNe ? schoolPartnershipModel.overviewNepali : schoolPartnershipModel.overview}
            </p>
          </div>

          {/* Side-by-side Role Architecture */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-12)'
            }}
          >
            {/* School's Contribution */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(var(--space-6), 4vw, var(--space-8))',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-primary-600)' }}>
                    Host Institution
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    {isNe ? 'विद्यालयको भूमिका तथा योगदान' : "School's Role & Contribution"}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Partner schools provide the classroom environment, cohort coordination, and timetable synchronization to foster an uninterrupted STEM culture.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {(isNe ? schoolPartnershipModel.schoolRoleNepali : schoolPartnershipModel.schoolRole).map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--color-primary-600)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* MindSparQ Turnkey Deliverables */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(var(--space-6), 4vw, var(--space-8))',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#10b981' }}>
                    Turnkey Provider
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                    {isNe ? 'MindSparQ को जिम्मेवारी तथा डेलिभरेबल्स' : 'MindSparQ Turnkey Deliverables'}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                We deploy end-to-end hardware sets, certified faculty, milestone-based curricula, and quarterly learning outcome audits directly into your school.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {(isNe ? schoolPartnershipModel.mindsparqRoleNepali : schoolPartnershipModel.mindsparqRole).map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4-Stage Partnership Roadmap */}
          <div 
            style={{ 
              marginBottom: 'var(--space-12)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(24px, 4vw, 36px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} style={{ color: 'var(--color-primary-600)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: 'var(--color-text)' }}>
                  4-Stage Partnership Implementation Lifecycle
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  Structured turnkey rollout designed to integrate effortlessly into partner academic calendars.
                </p>
              </div>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: '16px'
              }}
            >
              {[
                { step: '01', title: 'Needs & Schedule Audit', desc: 'Customizing co-curricular slots with the school calendar.' },
                { step: '02', title: 'Lab & Kit Provisioning', desc: 'Supplying soroban frames, sensors, and Arduino hardware.' },
                { step: '03', title: 'Master Trainer Delivery', desc: 'Rigorously vetted educators conducting hands-on lessons.' },
                { step: '04', title: 'Audits & Exhibitions', desc: 'Term cognitive assessments and regional competition prep.' }
              ].map((phase) => (
                <div 
                  key={phase.step}
                  style={{
                    padding: '20px 18px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                    Phase {phase.step}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {phase.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                    {phase.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Standards & Child Protection Governance Banner */}
          <div 
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(var(--space-6), 4vw, var(--space-8))',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-6)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div style={{ maxWidth: '680px', flex: '1 1 360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ShieldCheck size={22} style={{ color: '#10b981', flexShrink: 0 }} />
                <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  {isNe ? 'सञ्चालन मापदण्ड तथा बाल सुरक्षा नीति' : 'Operational Standards & Child Protection Policy'}
                </h4>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                {isNe
                  ? 'प्रत्येक साझेदारी लिखित सम्झौतापत्र (MOU), विद्यालयको परीक्षा क्यालेन्डरसँग अनुकूल समय तालिका, प्रशिक्षकहरूको पृष्ठभूमि प्रमाणीकरण र बाल सुरक्षा अनुपालनका साथ सञ्चालन हुन्छ।'
                  : 'Every partnership operates under written MOUs, customized timetable integration, transparent trainer background verification, and child safety compliance. Device kit provisioning and terms are governed strictly through verified mutual agreements.'}
              </p>
            </div>

            <div style={{ flexShrink: 0 }}>
              <Link 
                to="/contact?inquiryType=school-partnership" 
                className="btn btn-primary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                }}
              >
                <span>{isNe ? 'साझेदारी प्रस्ताव अनुरोध गर्नुहोस्' : 'Request Partnership Proposal'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
