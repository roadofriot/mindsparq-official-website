import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ExternalLink, MessageCircle, Heart, Eye, Play, Sparkles, CheckCircle2, PhoneCall, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { getActiveSocialLinks } from '../ui/SocialLinksBar';

interface SocialCardItem {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'youtube';
  platformLabel: string;
  platformColor: string;
  badgeBg: string;
  badgeTextColor: string;
  titleEn: string;
  titleNe: string;
  descEn: string;
  descNe: string;
  imageUrl: string;
  mediaType: 'image' | 'video' | 'chat';
  stats: {
    labelEn: string;
    labelNe: string;
    value: string;
  };
  actionUrl: string;
  actionTextEn: string;
  actionTextNe: string;
  timestampEn: string;
  timestampNe: string;
}

export const SocialCommunityHub: React.FC = () => {
  const { language } = useLanguage();
  const isNe = language === 'ne';
  const socialLinks = getActiveSocialLinks();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const cards: SocialCardItem[] = [
    {
      id: 'fb-championship-2026',
      platform: 'facebook',
      platformLabel: 'Facebook',
      platformColor: '#1877F2',
      badgeBg: 'rgba(24, 119, 242, 0.12)',
      badgeTextColor: '#1877F2',
      titleEn: 'Abacus & Mental Math Championship 2026 — Butwal',
      titleNe: 'अबाकस तथा मेन्टल म्याथ प्रतियोगिता २०२६ — बुटवल',
      descEn: 'Over 250 young calculators from Lumbini Province are gearing up for the regional speed arithmetic showdown. Registration now open for grades 1 to 8.',
      descNe: 'लुम्बिनी प्रदेशका २५० भन्दा बढी प्रतिभाशाली विद्यार्थीहरू क्षेत्रीय द्रुत हिसाब प्रतियोगिताको तयारीमा जुटेका छन्। कक्षा १ देखि ८ सम्मका विद्यार्थीहरूका लागि दर्ता खुला छ।',
      imageUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      stats: {
        labelEn: 'Interactions',
        labelNe: 'अन्तरक्रिया',
        value: '1.8k Likes • 320 Shares'
      },
      actionUrl: socialLinks.facebook || 'https://facebook.com/mindsparqeducation',
      actionTextEn: 'Follow on Facebook',
      actionTextNe: 'Facebook मा हेर्नुहोस्',
      timestampEn: 'Active Feed',
      timestampNe: 'ताजा अपडेट'
    },
    {
      id: 'ig-robotics-smart-car',
      platform: 'instagram',
      platformLabel: 'Instagram Reel',
      platformColor: '#E4405F',
      badgeBg: 'rgba(228, 64, 95, 0.12)',
      badgeTextColor: '#E4405F',
      titleEn: 'Obstacle-Avoiding Robot Demo by Junior Creators 🤖',
      titleNe: 'कक्षाका साना वैज्ञानिकहरूले बनाएको अब्स्टाकल रोबोट 🤖',
      descEn: 'Watch 10-year-old MindSparQ learners test ultrasonic sensors and motor drivers on their autonomous obstacle-avoiding cars in our Butwal lab.',
      descNe: 'MindSparQ का १० वर्षे विद्यार्थीहरूले बुटवल ल्याबमा आफैँले कोडेड गरेको अल्ट्रासोनिक सेन्सर र स्मार्ट रोबोट कारको सफल परीक्षण गर्दै।',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      mediaType: 'video',
      stats: {
        labelEn: 'Views',
        labelNe: 'भ्यूज',
        value: '4.6k Views • 680 Likes'
      },
      actionUrl: socialLinks.instagram || 'https://instagram.com/mindsparqeducation',
      actionTextEn: 'Watch on Instagram',
      actionTextNe: 'Instagram मा Reel हेर्नुहोस्',
      timestampEn: 'Trending Reel',
      timestampNe: 'ट्रेन्डिङ रिल'
    },
    {
      id: 'wa-direct-admissions',
      platform: 'whatsapp',
      platformLabel: 'WhatsApp Live Desk',
      platformColor: '#25D366',
      badgeBg: 'rgba(37, 211, 102, 0.14)',
      badgeTextColor: '#15803d',
      titleEn: 'Instant Admissions & Curriculum Support',
      titleNe: 'सिधा भर्ना तथा पाठ्यक्रम परामर्श सहायता',
      descEn: 'Have questions about course timings, school partnership packages, or fee structures? Chat directly with our academic team in Butwal.',
      descNe: 'कक्षा तालिका, विद्यालय साझेदारी कार्यक्रम वा भर्ना शुल्कबारे तुरुन्त परामर्श पाउन हाम्रा शैक्षिक निर्देशकहरूसँग सिधै ह्वाट्सएपमा कुरा गर्नुहोस्।',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      mediaType: 'chat',
      stats: {
        labelEn: 'Response Time',
        labelNe: 'जवाफ समय',
        value: 'Avg 5-10 mins • 9857058666'
      },
      actionUrl: 'https://wa.me/9779857058666?text=Namaste%20MindSparQ%2C%20I%20would%20like%20to%20inquire%20about%20courses%20and%20admissions.',
      actionTextEn: 'Chat on WhatsApp',
      actionTextNe: 'WhatsApp मा सिधै च्याट गर्नुहोस्',
      timestampEn: 'Online Now',
      timestampNe: 'अहिले उपलब्ध'
    },
    {
      id: 'tt-speed-arithmetic',
      platform: 'tiktok',
      platformLabel: 'TikTok Shorts',
      platformColor: '#00F2FE',
      badgeBg: 'rgba(0, 242, 254, 0.12)',
      badgeTextColor: '#0284c7',
      titleEn: '3-Second Mental Math Blitz Challenge ⚡',
      titleNe: '३ सेकेन्डमै द्रुत गतिमा मानसिक हिसाब चुनौती ⚡',
      descEn: 'Watch an 8-year-old student add 10 multi-digit numbers mentally without touching pen or paper. The power of MindSparQ abacus visualization!',
      descNe: 'पेन र कापी नछोई १० वटा अंकहरू ३ सेकेन्डमै जोडेर देखाउने ८ वर्षे विद्यार्थीको प्रतिभा। MindSparQ अबाकस भिजुअलाइजेसनको जादु!',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      mediaType: 'video',
      stats: {
        labelEn: 'TikTok Views',
        labelNe: 'टिकटक भ्यूज',
        value: '18.4k Views • 2.2k Likes'
      },
      actionUrl: socialLinks.tiktok || 'https://www.tiktok.com/@mindsparqeducation',
      actionTextEn: 'Watch on TikTok',
      actionTextNe: 'TikTok मा भिडियो हेर्नुहोस्',
      timestampEn: 'Viral Video',
      timestampNe: 'भाइरल भिडियो'
    },
    {
      id: 'yt-stem-masterclass',
      platform: 'youtube',
      platformLabel: 'YouTube Masterclass',
      platformColor: '#FF0000',
      badgeBg: 'rgba(255, 0, 0, 0.12)',
      badgeTextColor: '#dc2626',
      titleEn: 'Why Coding & Robotics Matter for Nepal Schools',
      titleNe: 'नेपालका विद्यालयहरूमा कोडिङ र रोबोटिक्स किन आवश्यक छ?',
      descEn: 'Comprehensive documentary on how modern hands-on STEM education unlocks computational reasoning and future job readiness for students in Nepal.',
      descNe: 'प्रयोगात्मक STEM शिक्षाले कसरी विद्यार्थीहरूको तार्किक सोच र भविष्यका सीपहरू विकास गर्छ भन्नेबारे MindSparQ को विशेष भिडियो प्रस्तुति।',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      mediaType: 'video',
      stats: {
        labelEn: 'Masterclass',
        labelNe: 'शैक्षिक भिडियो',
        value: '5.2k Views • 4K UHD'
      },
      actionUrl: socialLinks.youtube || 'https://youtube.com/@mindsparqeducation',
      actionTextEn: 'Watch on YouTube',
      actionTextNe: 'YouTube मा हेर्नुहोस्',
      timestampEn: 'HD Video',
      timestampNe: 'पूर्ण भिडियो'
    }
  ];

  // Dynamically include any custom platforms added by admin
  const customCards = (socialLinks.customLinks || []).map((custom) => ({
    id: `custom-${custom.id}`,
    platform: custom.id as any,
    platformLabel: custom.name,
    platformColor: custom.color || '#2563EB',
    badgeBg: `${custom.color || '#2563EB'}22`,
    badgeTextColor: custom.color || '#2563EB',
    titleEn: `Official Updates & Highlights on ${custom.name}`,
    titleNe: `${custom.name} मा MindSparQ का आधिकारिक अपडेटहरू`,
    descEn: `Connect with MindSparQ Education & Technology on our official ${custom.name} portal for interactive announcements and classroom highlights.`,
    descNe: `MindSparQ को आधिकारिक ${custom.name} च्यानलसँग जोडिएर ताजा सूचना, कार्यशाला र कक्षाहरूका अपडेट प्राप्त गर्नुहोस्।`,
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    mediaType: 'image' as const,
    stats: {
      labelEn: custom.name,
      labelNe: custom.name,
      value: 'Official Channel'
    },
    actionUrl: custom.url,
    actionTextEn: `Visit ${custom.name}`,
    actionTextNe: `${custom.name} मा जानुहोस्`,
    timestampEn: 'Active Desk',
    timestampNe: 'सक्रिय'
  }));

  const allCards = [...cards, ...customCards];

  const filteredCards = activeFilter === 'all'
    ? allCards
    : allCards.filter(c => c.platform === activeFilter);

  const filterTabs: Array<{ id: string; labelEn: string; labelNe: string }> = [
    { id: 'all', labelEn: 'All Channels', labelNe: 'सबै माध्यमहरू' },
    { id: 'facebook', labelEn: 'Facebook', labelNe: 'Facebook' },
    { id: 'instagram', labelEn: 'Instagram', labelNe: 'Instagram' },
    { id: 'tiktok', labelEn: 'TikTok', labelNe: 'TikTok' },
    { id: 'whatsapp', labelEn: 'WhatsApp', labelNe: 'WhatsApp' },
    { id: 'youtube', labelEn: 'YouTube', labelNe: 'YouTube' },
    ...(socialLinks.customLinks || []).map(c => ({
      id: c.id,
      labelEn: c.name,
      labelNe: c.name
    }))
  ];

  return (
    <section
      id="community-social-hub"
      data-style-id="social_community_hub"
      aria-label={isNe ? 'सामाजिक सञ्जाल तथा ताजा गतिविधि' : 'Community & Social Highlights'}
      style={{
        paddingTop: 'var(--ms-p-top, var(--space-16))',
        paddingBottom: 'var(--ms-p-bottom, var(--space-16))',
        paddingLeft: 'var(--ms-p-left, var(--space-4))',
        paddingRight: 'var(--ms-p-right, var(--space-4))',
        backgroundColor: 'var(--ms-bg, var(--color-surface))',
        borderTop: 'var(--ms-border, 1px solid var(--color-border))',
        borderBottom: 'var(--ms-border, 1px solid var(--color-border))',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background ambient blur glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div data-style-id="social.container" className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div data-style-id="social.header" style={{ maxWidth: '780px', margin: '0 auto var(--space-10) auto', textAlign: 'center' }}>
          <div
            data-style-id="social.badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'var(--ms-badge-bg, rgba(99, 102, 241, 0.1))',
              color: 'var(--ms-badge-color, var(--color-primary-600))',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-3)'
            }}
          >
            <Sparkles size={14} />
            {isNe ? 'सामाजिक सञ्जाल तथा ताजा गतिविधि' : 'Live Community & Social Highlights'}
          </div>

          <h2
            data-style-id="social.title"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.375rem)',
              fontWeight: 800,
              color: 'var(--ms-heading, var(--color-text))',
              marginBottom: 'var(--space-3)',
              lineHeight: 1.25
            }}
          >
            {isNe ? (
              <>
                सामाजिक सञ्जालमा <span data-style-id="social.title_accent" style={{ color: 'var(--ms-accent, var(--color-primary-600))' }}>MindSparQ</span> सँग जोडिनुहोस्
              </>
            ) : (
              <>
                Connect With <span data-style-id="social.title_accent" style={{ color: 'var(--ms-accent, var(--color-primary-600))' }}>MindSparQ</span> Across Social Media
              </>
            )}
          </h2>

          <p
            data-style-id="social.subtitle"
            style={{
              fontSize: 'var(--font-base)',
              color: 'var(--ms-text, var(--color-text-secondary))',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            {isNe
              ? 'हाम्रा दैनिक कक्षा गतिविधिहरू, रोबोटिक्स प्रयोगात्मक कार्य, अबाकस मानसिक गणितका उपलब्धिहरू र विद्यार्थी सफलताका ताजा झलकहरू हेर्नुहोस्।'
              : 'Follow our daily classroom journeys, robotics experiments, mental math milestones, student spotlights, and instant admissions support across our official channels.'}
          </p>

          {/* Platform Filter Tabs */}
          <div
            data-style-id="social.filter_tabs"
            role="tablist"
            aria-label="Filter social channels"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginTop: 'var(--space-6)'
            }}
          >
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: isSelected
                      ? '1px solid var(--color-primary-600)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-600)'
                      : 'var(--color-surface)',
                    color: isSelected
                      ? '#ffffff'
                      : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                  }}
                >
                  {isNe ? tab.labelNe : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid - Balanced and Centered */}
        <div
          data-style-id="social.cards_grid"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 'var(--space-8)',
            maxWidth: '1240px',
            margin: 'var(--space-8) auto 0'
          }}
        >
          {filteredCards.map((card) => {
            const isWhatsApp = card.platform === 'whatsapp';
            return (
              <article
                key={card.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-surface)',
                  flex: '0 1 380px',
                  width: '100%',
                  maxWidth: '380px',
                  minWidth: 'min(100%, 280px)',
                  border: isWhatsApp
                    ? '1.5px solid rgba(37, 211, 102, 0.4)'
                    : '1px solid var(--color-border)',
                  boxShadow: isWhatsApp
                    ? '0 10px 30px rgba(37, 211, 102, 0.1)'
                    : '0 4px 20px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = isWhatsApp
                    ? '0 16px 36px rgba(37, 211, 102, 0.2)'
                    : '0 16px 32px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isWhatsApp
                    ? '0 10px 30px rgba(37, 211, 102, 0.1)'
                    : '0 4px 20px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Visual Media Header */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '210px',
                    overflow: 'hidden',
                    backgroundColor: '#111827'
                  }}
                >
                  <img
                    src={card.imageUrl}
                    alt={isNe ? card.titleNe : card.titleEn}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />

                  {/* Dark subtle gradient overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Platform Badge Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      color: card.badgeTextColor,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: card.platformColor
                      }}
                    />
                    {card.platformLabel}
                  </div>

                  {/* Status / Activity Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 600
                    }}
                  >
                    {isWhatsApp ? (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#25D366',
                          boxShadow: '0 0 6px #25D366',
                          animation: 'pulse 1.8s infinite'
                        }}
                      />
                    ) : null}
                    {isNe ? card.timestampNe : card.timestampEn}
                  </div>

                  {/* Video Play Icon overlay if mediaType is video */}
                  {card.mediaType === 'video' && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.platformColor,
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />
                      </div>
                    </div>
                  )}

                  {/* Live Stats Overlay at bottom of media */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}
                  >
                    <span>{card.stats.value}</span>
                    {card.platform === 'facebook' && <Heart size={14} fill="#ff4d4f" stroke="#ff4d4f" />}
                    {card.platform === 'instagram' && <Heart size={14} fill="#e4405f" stroke="#e4405f" />}
                    {card.platform === 'tiktok' && <Eye size={14} />}
                    {card.platform === 'whatsapp' && <CheckCircle2 size={14} color="#25D366" />}
                  </div>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: 'var(--space-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 'var(--font-lg)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginBottom: 'var(--space-2)',
                        lineHeight: 1.35
                      }}
                    >
                      {isNe ? card.titleNe : card.titleEn}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-4)'
                      }}
                    >
                      {isNe ? card.descNe : card.descEn}
                    </p>
                  </div>

                  {/* Card Action Link */}
                  <div>
                    <a
                      href={card.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        width: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        backgroundColor: isWhatsApp ? '#25D366' : 'transparent',
                        color: isWhatsApp ? '#ffffff' : card.platformColor,
                        border: isWhatsApp ? 'none' : `1.5px solid ${card.platformColor}`,
                        boxShadow: isWhatsApp ? '0 4px 14px rgba(37, 211, 102, 0.3)' : 'none',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isWhatsApp) {
                          e.currentTarget.style.backgroundColor = card.platformColor;
                          e.currentTarget.style.color = '#ffffff';
                        } else {
                          e.currentTarget.style.backgroundColor = '#1eb857';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isWhatsApp) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = card.platformColor;
                        } else {
                          e.currentTarget.style.backgroundColor = '#25D366';
                        }
                      }}
                    >
                      {isWhatsApp ? (
                        <MessageCircle size={16} fill="currentColor" />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                      <span>{isNe ? card.actionTextNe : card.actionTextEn}</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Quick Contact Bar - Enterprise Elevated Container */}
        <div
          style={{
            marginTop: 'clamp(56px, 7vw, 84px)',
            padding: 'clamp(32px, 5vw, 44px) clamp(20px, 4vw, 36px)',
            borderRadius: 'var(--radius-2xl, 24px)',
            backgroundColor: 'var(--color-surface)',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(37, 99, 235, 0.04) 50%, rgba(16, 185, 129, 0.04) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.22)',
            boxShadow: '0 20px 48px -12px rgba(37, 99, 235, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '960px',
            margin: 'clamp(56px, 7vw, 84px) auto 0 auto',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Decorative Gradient Accent Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb 0%, #10b981 50%, #6366f1 100%)'
            }}
          />

          {/* Eyebrow with Pulsing Live Status Dot */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              marginBottom: '14px'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)'
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#059669'
              }}
            >
              {isNe ? 'प्रत्यक्ष शैक्षिक सहायता डेस्क • बुटवल' : 'Live Academic Guidance Desk • Butwal Center'}
            </span>
          </div>

          {/* Heading */}
          <h4
            style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: '0 0 10px 0',
              lineHeight: 1.3
            }}
          >
            {isNe
              ? 'सिधै MindSparQ शैक्षिक डेस्कसँग कुरा गर्न चाहनुहुन्छ?'
              : 'Need immediate academic guidance from MindSparQ?'}
          </h4>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.65,
              maxWidth: '720px',
              margin: '0 0 20px 0'
            }}
          >
            {isNe
              ? 'पाठ्यक्रम, ब्याच तालिका वा भर्ना सम्बन्धी कुनै पनि जिज्ञासा भएमा हाम्रा शैक्षिक सल्लाहकारहरूसँग सिधै सम्पर्क गर्नुहोस्।'
              : 'Direct, zero-pressure academic guidance for parents, students, and school partners seeking course information, batch timings, or demo classes.'}
          </p>

          {/* Structured Contact Info Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '24px'
            }}
          >
            <a
              href="tel:+9779857058666"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                color: 'var(--color-text)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <PhoneCall size={14} style={{ color: '#2563eb' }} />
              <span>+977 9857058666</span>
            </a>

            <a
              href="mailto:info@mindsparqeducation.com.np"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                color: 'var(--color-text)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              <Mail size={14} style={{ color: '#0891b2' }} />
              <span>info@mindsparqeducation.com.np</span>
            </a>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500
              }}
            >
              <MapPin size={14} style={{ color: '#d97706' }} />
              <span>Gyanbhoomi Path, Butwal-11, Nepal</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <a
              href="https://wa.me/9779857058666?text=Namaste%20MindSparQ%2C%20I%20would%20like%20to%20inquire%20about%20courses%20and%20admissions."
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '999px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.35)';
              }}
            >
              <MessageCircle size={18} fill="currentColor" />
              <span>WhatsApp: +977 9857058666</span>
            </a>

            <a
              href="tel:+9779857058666"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <PhoneCall size={16} />
              <span>{isNe ? 'सिधै फोन गर्नुहोस्' : 'Call Admissions Desk'}</span>
            </a>
          </div>

          {/* Trust Guarantees Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
              width: '100%',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              <span>Zero-Pressure Academic Consultation</span>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              <span>VAK Certified Faculty Guidance</span>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-primary-600)' }} />
              <span>Free In-Person Center Visit</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
