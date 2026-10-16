import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Info, Sparkles, Filter, Building2, Handshake, Shield, Clock, Users } from 'lucide-react';
import { programs, Program, schoolPartnershipModel } from '../content/programs';
import { ProgramIcon } from '../components/ui/ProgramIcon';
import { updatePageSeo } from '../utils/seo';
import { useLanguage } from '../context/LanguageContext';

type FilterCategory = 'all' | 'mathematics' | 'technology' | 'skills' | 'institutional';

export const ProgramsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const { hash } = useLocation();
  const { language, t } = useLanguage();
  const isNe = language === 'ne';

  useEffect(() => {
    updatePageSeo({
      title: 'Educational Programs & School Partnerships',
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

  return (
    <div style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Page Header */}
      <section 
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div className="eyebrow">
              <Sparkles size={14} />
              <span>{isNe ? 'पाठ्यक्रम तथा सिकाइ मार्गहरू' : 'Curriculum & Pathways'}</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
              {isNe ? 'MindSparQ सिकाइ कार्यक्रमहरू' : 'MindSparQ Learning Programs'}
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {isNe 
                ? 'मानसिक गणितीय चपलता, कम्प्युटेसनल सिर्जनशीलता र आधुनिक प्रविधिमा व्यवहारिक दक्षता विकास गर्न तयार पारिएका बृहत् पाठ्यक्रमहरू।'
                : 'Discover our comprehensive range of programs designed to nurture mental calculation agility, computational creativity, and practical literacy in modern technology.'}
            </p>
          </div>
        </div>
      </section>

      {/* Program Disclaimers & Filter Bar */}
      <section style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-8) 0' }}>
        <div className="container">
          {/* Transparent Availability Notice */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <Info size={20} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              <strong>{isNe ? 'कक्षा तालिका तथा भर्ना सूचना:' : 'Notice on Program Schedules:'}</strong>{' '}
              {isNe 
                ? 'नयाँ ब्याच तालिका, उमेर समूह र सिट उपलब्धता नियमित अपडेट गरिन्छ। विद्यालय सहकार्य कार्यक्रमहरू सम्बन्धित विद्यालयको क्यालेन्डर अनुसार चल्दछन्। बुटवलमा हाल भर्ना भइरहेका ब्याचहरूबारे जान्न हाम्रो डेस्कमा सम्पर्क गर्नुहोस्।'
                : 'Batch schedules, age suitability, and cohort availability are updated periodically. Specific school partnership sessions follow academic term timetables. Contact our coordinator to confirm currently enrolling batches in Butwal.'}
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: 'var(--space-2)', textTransform: 'uppercase' }}>
              <Filter size={14} /> {isNe ? 'वर्ग छनोट:' : 'Filter:'}
            </span>
            {(
              [
                { id: 'all', label: isNe ? 'सबै कार्यक्रमहरू' : 'All Programs' },
                { id: 'mathematics', label: isNe ? 'गणित तथा मानसिक हिसाब' : 'Mathematics & Mental Math' },
                { id: 'technology', label: isNe ? 'कोडिङ, एआई तथा रोबोटिक्स' : 'Coding, AI & Robotics' },
                { id: 'skills', label: isNe ? 'हस्तलेखन तथा सीप विकास' : 'Handwriting & Skills' },
                { id: 'institutional', label: isNe ? 'शिक्षक तथा विद्यालय सहयोग' : 'School & Teacher Support' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className="btn"
                style={{
                  minHeight: '38px',
                  padding: '6px 16px',
                  fontSize: 'var(--text-xs)',
                  backgroundColor: activeCategory === tab.id ? 'var(--color-brand-primary)' : 'var(--color-surface)',
                  color: activeCategory === tab.id ? 'var(--color-text-on-brand)' : 'var(--color-text-primary)',
                  borderColor: activeCategory === tab.id ? 'var(--color-brand-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Programs List with Rich Images & Bilingual Descriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            {filteredPrograms.map((program: Program) => {
              const displayTitle = isNe && program.titleNepali ? program.titleNepali : program.title;
              const displayFullDesc = isNe && program.fullDescriptionNepali ? program.fullDescriptionNepali : program.fullDescription;
              const displayOutcomes = isNe && program.keyOutcomesNepali ? program.keyOutcomesNepali : program.keyOutcomes;
              const displayAudience = isNe && program.audienceNepali ? program.audienceNepali : program.audience;
              const displayDelivery = isNe && program.deliveryFormatNepali ? program.deliveryFormatNepali : program.deliveryFormat;

              return (
                <article 
                  key={program.id}
                  id={program.id}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: 0,
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-md)',
                    scrollMarginTop: '100px'
                  }}
                >
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 0
                    }}
                    className="program-article-grid"
                  >
                    {/* Visual Media & Overview Column */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRight: '1px solid var(--color-border)'
                      }}
                      className="program-media-col"
                    >
                      <div
                        style={{
                          height: '240px',
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
                            transition: 'transform var(--transition-normal)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
                          }}
                        />
                        <span 
                          style={{
                            position: 'absolute',
                            top: '14px',
                            left: '14px',
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)'
                          }}
                        >
                          {program.category}
                        </span>

                        <div
                          style={{
                            position: 'absolute',
                            bottom: '14px',
                            right: '14px',
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--color-surface)',
                            boxShadow: 'var(--shadow-md)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}
                        >
                          <ProgramIcon name={program.iconName} size={22} />
                        </div>
                      </div>

                      {/* Program Metadata Block */}
                      <div style={{ padding: 'var(--space-6)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                          {displayTitle}
                        </h2>
                        {isNe && program.titleNepali && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {program.title}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={15} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
                            <span><strong>{isNe ? 'लक्षित समूह:' : 'Target Audience:'}</strong> {displayAudience}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={15} style={{ color: 'var(--color-accent-teal)', flexShrink: 0 }} />
                            <span><strong>{isNe ? 'कक्षा ढाँचा:' : 'Format:'}</strong> {displayDelivery}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Content & Outcomes Column */}
                    <div 
                      style={{ 
                        padding: 'var(--space-8)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--color-surface)'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                          {isNe ? 'पाठ्यक्रमको विस्तृत विवरण' : 'Curriculum Deep Dive'}
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-6)' }}>
                          {displayFullDesc}
                        </p>

                        <div 
                          style={{
                            backgroundColor: 'var(--color-surface-hover)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-5)',
                            border: '1px solid var(--color-border)',
                            marginBottom: 'var(--space-6)'
                          }}
                        >
                          <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>
                            {isNe ? 'प्रमुख सिकाइ उपलब्धिहरू (Core Outcomes)' : 'Core Learning Outcomes'}
                          </h4>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                            {displayOutcomes.map((outcome, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        <Link 
                          to={`/contact?program=${encodeURIComponent(program.title)}`}
                          className="btn btn-primary btn-lg"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <span>{isNe ? `यस ${displayTitle} का लागि सोधपुछ गर्नुहोस्` : `Enquire for ${program.title}`}</span>
                          <ArrowRight size={16} />
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
            .program-article-grid {
              grid-template-columns: 1fr 1.25fr !important;
            }
          }
        `}</style>
      </section>

      {/* School Partnership Model (Bilingual) */}
      <section 
        id="school-partnerships" 
        className="section-spacing"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div className="section-header">
            <div className="eyebrow eyebrow-teal">
              <Handshake size={14} />
              <span>{isNe ? 'संस्थागत सहकार्य तथा साझेदारी' : 'Institutional Collaboration'}</span>
            </div>
            <h2>{isNe ? schoolPartnershipModel.titleNepali : schoolPartnershipModel.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
              {isNe ? schoolPartnershipModel.overviewNepali : schoolPartnershipModel.overview}
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-10)'
            }}
          >
            {/* School's Role */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                  {isNe ? 'विद्यालयको भूमिका तथा योगदान' : "School's Contribution"}
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                {(isNe ? schoolPartnershipModel.schoolRoleNepali : schoolPartnershipModel.schoolRole).map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--color-brand-primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* MindSparQ's Role */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} style={{ color: 'var(--color-accent-teal)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                  {isNe ? 'MindSparQ को जिम्मेवारी तथा डेलिभरेबल्स' : 'MindSparQ Deliverables'}
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                {(isNe ? schoolPartnershipModel.mindsparqRoleNepali : schoolPartnershipModel.mindsparqRole).map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Operational Commitments & CTA */}
          <div 
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-6)'
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <Shield size={18} style={{ color: 'var(--color-accent-teal)' }} />
                <h4 style={{ fontSize: 'var(--text-base)', margin: 0 }}>
                  {isNe ? 'सञ्चालन मापदण्ड तथा बाल सुरक्षा नीति' : 'Operational Standards & Child Protection'}
                </h4>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {isNe
                  ? 'प्रत्येक साझेदारी लिखित सम्झौतापत्र (MOU), विद्यालयको परीक्षा क्यालेन्डरसँग अनुकूल समय तालिका, प्रशिक्षकहरूको पृष्ठभूमि प्रमाणीकरण र बाल सुरक्षा अनुपालनका साथ सञ्चालन हुन्छ।'
                  : 'Every partnership operates under written MOUs, customized timetable integration, transparent trainer background verification, and child safety compliance. Commercial terms, device kit fees, and revenue sharing are formalised strictly through verified mutual contracts.'}
              </p>
            </div>

            <Link 
              to="/contact?inquiryType=school-partnership" 
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            >
              <span>{isNe ? 'साझेदारी प्रस्ताव अनुरोध गर्नुहोस्' : 'Request Partnership Proposal'}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
