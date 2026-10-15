import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  MapPin, 
  Target, 
  Eye, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Layers, 
  BookOpen, 
  Cpu, 
  Award,
  Globe
} from 'lucide-react';
import { siteConfig } from '../content/site';
import { learningPillars, whoWeSupport, digitalEcosystemModules } from '../content/programs';

export const AboutPage: React.FC = () => {
  const { hash } = useLocation();
  const [profileLanguage, setProfileLanguage] = useState<'en' | 'np'>('en');

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

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
          <div style={{ maxWidth: '840px' }}>
            <div className="eyebrow">
              <Compass size={14} />
              <span>Institutional Profile & Vision</span>
            </div>
            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>
              Empowering Minds, Sparking Innovation
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
              <strong>{siteConfig.name}</strong> is an education and technology initiative based in Butwal, Nepal. We integrate foundational cognitive faculties—Abacus, Mental Math, Vedic Mathematics, and Bilingual Penmanship—with forward-looking technological competencies in AI, Coding, Robotics, and digital platforms.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              <span className="badge" style={{ backgroundColor: 'var(--color-brand-primary-soft)', color: 'var(--color-brand-primary)' }}>
                Education • Innovation • AI • STEM • Digital Learning
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} style={{ color: 'var(--color-accent-teal)' }} />
                Butwal-11, Gyanbhoomi Path, Rupandehi, Nepal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bilingual Institutional Introduction Tabs */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div 
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-8)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <div>
                  <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Official Institutional Introduction</h2>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>संस्थागत आधिकारिक परिचय</span>
                </div>
              </div>

              {/* Language Switcher */}
              <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-full)', padding: '3px', backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setProfileLanguage('en')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: profileLanguage === 'en' ? 'var(--color-brand-primary)' : 'transparent',
                    color: profileLanguage === 'en' ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  English Profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfileLanguage('np')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: profileLanguage === 'np' ? 'var(--color-brand-primary)' : 'transparent',
                    color: profileLanguage === 'np' ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  नेपाली परिचय
                </button>
              </div>
            </div>

            {profileLanguage === 'en' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.7, fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
                <p>
                  <strong>MindSparQ Education & Technology</strong> is an education and technology initiative focused on making learning more practical, engaging, innovative, and relevant to the needs of a changing world.
                </p>
                <p>
                  Our approach brings together foundational learning, mental mathematics, handwriting development, STEM education, artificial intelligence, coding, robotics, and digital learning solutions. We aim to create opportunities for students to strengthen their understanding, explore new ideas, develop problem-solving skills, and apply their knowledge through practical activities and projects.
                </p>
                <p>
                  MindSparQ also seeks to support teachers, parents, and educational institutions through training, learning resources, technology-enabled educational services, and collaborative school programs.
                </p>
                <p>
                  Our long-term vision is to contribute to an education ecosystem in Nepal where creativity, critical thinking, technological literacy, and lifelong learning are valued alongside academic knowledge. Through responsible innovation, practical education, and collaboration, MindSparQ aspires to help learners prepare for emerging opportunities and become confident, capable, and responsible contributors to society.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', lineHeight: 1.8, fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
                <p>
                  <strong>MindSparQ Education & Technology</strong> शिक्षा र प्रविधिलाई एकीकृत गर्दै विद्यार्थी, शिक्षक, अभिभावक तथा शैक्षिक संस्थाका लागि नवीन र व्यवहारिक सिकाइका अवसर विकास गर्ने उद्देश्यसहित अघि बढाइएको पहल हो।
                </p>
                <p>
                  हाम्रो प्राथमिकता विद्यार्थीलाई केवल सैद्धान्तिक ज्ञानमा सीमित नराखी गणितीय सोच, सिर्जनात्मकता, समस्या समाधान, प्रविधिको प्रयोग र व्यवहारिक सीप विकास गर्न सहयोग गर्नु हो। हाम्रा प्रमुख कार्यक्षेत्रमा Abacus Mental Math, Vedic Mathematics, Handwriting Improvement, AI Coding & Robotics, STEM Education, Teacher Training, Digital Learning तथा शैक्षिक सफ्टवेयरको विकास समावेश छन्।
                </p>
                <p>
                  हामी विद्यालय, शिक्षक र अभिभावकसँग सहकार्य गर्दै विद्यार्थीको सिकाइलाई थप अर्थपूर्ण, सहभागितामूलक र भविष्यका आवश्यकतासँग सम्बन्धित बनाउन चाहन्छौँ। हाम्रो दीर्घकालीन लक्ष्य नेपालमा शिक्षा र प्रविधिको क्षेत्रमा नवीन, जिम्मेवार र विश्वासयोग्य इकोसिस्टम निर्माण गर्न योगदान पुर्याउनु हो।
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Name Concept & Founder Section */}
      <section className="section-spacing">
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-8)'
            }}
          >
            {/* The Brand Name Concept */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-primary-soft)',
                  color: 'var(--color-brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>The Story Behind "MindSparQ"</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                The name encapsulates our core philosophy of transitioning from curiosity to ideation, and from ideation to creation (<strong>सिकाइबाट विचार र विचारबाट सिर्जना</strong>).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <strong style={{ color: 'var(--color-brand-primary)', fontSize: 'var(--text-sm)' }}>Mind (सोच र मानसिक क्षमता):</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    {siteConfig.nameConcept.mind}
                  </p>
                </div>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <strong style={{ color: 'var(--color-accent-teal)', fontSize: 'var(--text-sm)' }}>SparQ (जिज्ञासा र नवप्रवर्तन):</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    {siteConfig.nameConcept.sparq}
                  </p>
                </div>
              </div>
            </div>

            {/* Founder & Leadership */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-teal-soft)',
                  color: 'var(--color-accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Founder & Leadership</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>
                    {siteConfig.founder.name}
                  </h3>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                    {siteConfig.founder.nameNepali} ({siteConfig.founder.altName}) • {siteConfig.founder.role}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                Under the leadership of Samay Budhathoki Chhetri, MindSparQ prioritizes fusing foundational cognitive skills with applied AI and robotics education. The focus is on practical problem-solving, structured curriculum development, and creating meaningful school partnerships across Nepal.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    Leadership Priorities
                  </span>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    Curriculum rigor, teacher empowerment, data privacy compliance, ethical AI education, and building indigenous digital learning tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Core Values */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-12)'
            }}
          >
            {/* Vision */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-teal-soft)',
                  color: 'var(--color-accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Eye size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Vision — दीर्घकालीन दृष्टिकोण</h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                To establish a credible, innovative, and impactful education and technology institution in Nepal where every learner discovers their potential, acquires modern competencies, and prepares for future global opportunities. In the long term, MindSparQ aspires to build an educational technology brand capable of serving South Asia and international markets.
              </p>
            </div>

            {/* Mission */}
            <div 
              className="card"
              style={{
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-brand-primary-soft)',
                  color: 'var(--color-brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Target size={22} />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Mission — संस्थाको मूल उद्देश्य</h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Deliver practical, creative, and experiential supplementary learning</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Nurture mathematical thinking via Abacus, Mental Math, and Vedic Mathematics</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Provide age-tailored AI, Coding, Robotics, and hands-on STEM curricula</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Empower educators with modern pedagogical strategies and digital tools</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--color-accent-teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Partner with schools for turnkey co-curricular and lab management solutions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Core Values Grid */}
          <div>
            <div className="section-header" style={{ marginBottom: 'var(--space-8)' }}>
              <div className="eyebrow eyebrow-amber">
                <Award size={14} />
                <span>Foundational Principles</span>
              </div>
              <h2>Core Institutional Values (संस्थाका मूल मूल्यहरू)</h2>
              <p>The seven unshakeable commitments that govern every MindSparQ classroom, platform, and partnership.</p>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--space-6)'
              }}
            >
              {siteConfig.coreValues.map((val) => (
                <div 
                  key={val.title}
                  className="card"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    padding: 'var(--space-6)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', margin: 0, color: 'var(--color-brand-primary)' }}>
                      {val.title}
                    </h3>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {val.titleNepali}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Research & VAK-Based Teaching */}
      <section className="section-spacing">
        <div className="container">
          <div 
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--space-10) var(--space-8)'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'var(--space-8)',
                alignItems: 'center'
              }}
              className="research-grid"
            >
              <div>
                <div className="eyebrow eyebrow-teal">
                  <BookOpen size={14} />
                  <span>Academic Research & Pedagogy</span>
                </div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
                  VAK-Based Teaching Strategies Research
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-3)' }}>
                  Academic research spearheaded by our founder investigates: <em>“The Effectiveness of VAK-Based Teaching Strategies in Enhancing Learning Outcomes Among Secondary School Students in Butwal Sub-Metropolitan City, Nepal.”</em>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  We treat pedagogical research with scientific rigor. Rather than adopting unverified commercial fads, MindSparQ continuously tests and incorporates verified sensory feedback methods to ensure multi-modal learning for every student.
                </p>
              </div>

              <div 
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-6)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)'
                }}
              >
                <h4 style={{ fontSize: 'var(--text-sm)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  The Multi-Sensory Approach
                </h4>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>Visual (V):</strong> Graphical block diagrams, abacus bead imagery, and circuit visualizers.
                  </div>
                  <div>
                    <strong>Auditory (A):</strong> Guided mental math dictation, phonetic stroke pacing, and conceptual discussions.
                  </div>
                  <div>
                    <strong>Kinesthetic (K):</strong> Physical bead manipulation, tactile circuit breadboarding, and physical robot assembly.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 860px) {
            .research-grid {
              grid-template-columns: 1.3fr 0.9fr !important;
            }
          }
        `}</style>
      </section>

      {/* Learning Methodology Pillars (Anchor: #approach) */}
      <section 
        id="approach" 
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
              <Sparkles size={14} />
              <span>Pedagogical Framework</span>
            </div>
            <h2>The MindSparQ Learning Methodology</h2>
            <p>
              We firmly avoid unverified shortcuts or hyperbole. Our methodology is rooted in steady cognitive development, hands-on experimentation, and deliberate practice.
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {learningPillars.map((pillar) => (
              <div 
                key={pillar.step}
                className="card"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  padding: 'var(--space-6)'
                }}
              >
                <div 
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 800,
                    color: 'var(--color-brand-primary)',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  Step {pillar.step}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences We Serve */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">
              <Layers size={14} />
              <span>Beneficiaries</span>
            </div>
            <h2>Target Audiences We Serve (लक्षित समूह)</h2>
            <p>Our structured educational and technological frameworks address the specific developmental needs of distinct stakeholders.</p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {whoWeSupport.map((item) => (
              <div 
                key={item.title}
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-6)'
                }}
              >
                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MindSparQ Digital & AI Ecosystem Preview */}
      <section className="section-spacing">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow eyebrow-teal">
              <Cpu size={14} />
              <span>Technology Architecture</span>
            </div>
            <h2>The MindSparQ Digital & AI Ecosystem</h2>
            <p>Our long-term roadmap connects physical classroom instruction with purpose-built digital learning and administration tools.</p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {digitalEcosystemModules.map((mod) => (
              <div 
                key={mod.id}
                className="card"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-6)'
                }}
              >
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-brand-primary)', marginBottom: 'var(--space-2)' }}>
                  {mod.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Center & Verified Location */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div 
            className="card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'clamp(24px, 4vw, 44px)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'var(--space-8)',
                alignItems: 'stretch'
              }}
              className="location-grid"
            >
              {/* Left Column: Physical Presence */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="eyebrow eyebrow-amber" style={{ marginBottom: 'var(--space-3)' }}>
                    <MapPin size={14} />
                    <span>Physical Presence</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                    Our Learning Center in Butwal
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-5)' }}>
                    MindSparQ is physically located at <strong>{siteConfig.location.fullFormatted}</strong>. We welcome educators, school principals, and parents to visit our facility to explore our soroban abacus models, sensor maker kits, and bilingual penmanship curricula.
                  </p>

                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      padding: '16px 20px',
                      backgroundColor: 'var(--color-surface-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      marginBottom: 'var(--space-6)'
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                        flexShrink: 0
                      }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                        Registered Address
                      </span>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', margin: '2px 0 4px', fontWeight: 600 }}>
                        {siteConfig.location.fullFormatted}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        Official Portal: {siteConfig.domain}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link 
                    to="/contact" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 24px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
                      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                    }}
                  >
                    <span>Contact & Location Directions</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Ethical Standards Commitment */}
              <div 
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(20px, 3vw, 28px)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-3)' }}>
                    <ShieldCheck size={22} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                      Commitment to Truth & Child Protection
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 'var(--space-4)' }}>
                    We adhere strictly to factual representations. We do not manufacture student awards, make false claims of international affiliations, or guarantee instant grade improvements.
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    Student photographs, project videos, and personal information are treated with rigorous privacy safeguards and parental consent. DMIT or learning style observations are treated strictly as supplementary behavioral guides, never as deterministic scientific or career predictions.
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 'var(--space-5)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    color: '#2dd4bf',
                    fontWeight: 600
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>Verified Institutional Ethics & Child Safety Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (min-width: 860px) {
            .location-grid {
              grid-template-columns: 1.15fr 0.85fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
};
