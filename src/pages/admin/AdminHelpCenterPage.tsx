import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuideItem {
  id: string;
  title: string;
  titleNepali: string;
  category: 'editing' | 'design' | 'publishing' | 'mobile';
  summary: string;
  summaryNepali: string;
  steps: string[];
  stepsNepali: string[];
  targetUrl: string;
  targetLabel: string;
}

const ADMIN_GUIDES: GuideItem[] = [
  {
    id: 'guide-edit-paragraph',
    title: 'How to Edit Any Paragraph or Headline on the Website',
    titleNepali: 'वेबसाइटको कुनै पनि Paragraph वा Headline कसरी परिवर्तन गर्ने',
    category: 'editing',
    summary: 'Change text across any page without opening code or touching server files.',
    summaryNepali: 'कोड नछोई र फाइल नखोली वेबसाइटको कुनै पनि भागको टेक्स्ट आफैँ बदल्नुहोस्।',
    steps: [
      'Click "Website Builder" in the left sidebar menu (or press Ctrl+K and search "Builder").',
      'Select the page you wish to modify from the top Page dropdown (e.g., Home, About, Contact).',
      'In the interactive canvas preview, click directly on any Paragraph or Headline.',
      'The Property Inspector opens on the right side. Edit the text in the "Content" tab.',
      'Click "Save Draft" to preserve your edits without affecting the live website.',
      'Preview on Desktop, Tablet, and Mobile to confirm line wraps look clean.',
      'Click "Publish Changes" to push your update live to visitors instantly.'
    ],
    stepsNepali: [
      'बायाँ मेनुमा रहेको "Website Builder" मा क्लिक गर्नुहोस् (वा Ctrl+K थिचेर "Builder" खोज्नुहोस्)।',
      'माथिल्लो Page ड्रपडाउनबाट आफूले परिवर्तन गर्न चाहेको पृष्ठ छान्नुहोस् (जस्तै: Home, About, Contact)।',
      'स्क्रिनमा देखिएको कुनै पनि Paragraph वा Headline मा सिधै क्लिक गर्नुहोस्।',
      'दायाँपट्टि Property Inspector खुल्नेछ। "Content" ट्याबमा गएर नयाँ टेक्स्ट लेख्नुहोस्।',
      '"Save Draft" बटन थिचेर सुरक्षित गर्नुहोस् (यसले चालू लाइभ वेबसाइट बिगार्दैन)।',
      'Desktop, Tablet र Mobile आइकन थिचेर सबै स्क्रिनमा राम्रो देखिएको निश्चित गर्नुहोस्।',
      'अन्त्यमा "Publish Changes" थिचेर वास्तविक वेबसाइटमा तुरुन्तै लागू गर्नुहोस्।'
    ],
    targetUrl: '/admin/builder',
    targetLabel: 'Open Website Builder'
  },
  {
    id: 'guide-change-colors-fonts',
    title: 'How to Customize Global Colors, Fonts & Spacing',
    titleNepali: 'सम्पूर्ण वेबसाइटको Color, Font र Spacing कसरी मिलाउने',
    category: 'design',
    summary: 'Manage your primary branding palette, typography scales, container width, and border radii.',
    summaryNepali: 'Primary कलर, Heading तथा Body फन्ट, कन्टेनर चौडाइ र बोर्डर स्टाइल परिवर्तन गर्नुहोस्।',
    steps: [
      'Navigate to "Theme & Layout Studio" from the admin sidebar.',
      'Under "Primary Brand Palette", select from curated harmonies (Ocean Blue, Cyber Cyan, Emerald STEM, etc.) or enter a custom Hex code.',
      'Select your Heading and Body font pairings (Inter, Outfit, Plus Jakarta Sans, etc.).',
      'Adjust border radius presets (Sharp, Modern, Rounded, Squircle).',
      'Click "Save Design System" to broadcast the updated design tokens to the entire site.'
    ],
    stepsNepali: [
      'बायाँ मेनूबाट "Theme & Layout Studio" मा जानुहोस्।',
      '"Brand Palette" मा गएर आफूलाई मनपर्ने कलर छान्नुहोस् वा आफ्नै Hex कोड राख्नुहोस्।',
      'Heading र Body का लागि उपयुक्त फन्ट (Inter, Outfit, Plus Jakarta Sans आदि) छान्नुहोस्।',
      'बोर्डरको गोलाकार (Border Radius) आफू अनुकूल मिलाउनुहोस्।',
      '"Save Design System" थिचेर सम्पूर्ण वेबसाइटभरि नयाँ डिजाइन लागू गर्नुहोस्।'
    ],
    targetUrl: '/admin/design',
    targetLabel: 'Open Theme Studio'
  },
  {
    id: 'guide-header-footer',
    title: 'How to Edit Header, Navigation Menus, and Footer Contact Info',
    titleNepali: 'Header, मेनू र Footer को ठेगाना/फोन नम्बर कसरी सम्पादन गर्ने',
    category: 'design',
    summary: 'Update announcement banners, top navigation links, logo size, and footer copyright notices.',
    summaryNepali: 'शीर्ष Announcement ब्यानर, मेनू लिङ्कहरू, लोगोको साइज र Footer का विवरण बदल्नुहोस्।',
    steps: [
      'Go to "Header & Navigation" in the left menu.',
      'Toggle the top announcement bar on/off, type your message, and set the CTA link.',
      'Adjust the header height and sticky scroll behavior.',
      'To change the registered address, phone numbers, or social media links, scroll to the Footer settings section.',
      'Click "Save & Publish" to reflect changes across all public pages immediately.'
    ],
    stepsNepali: [
      'बायाँ मेनूबाट "Header & Navigation" मा जानुहोस्।',
      'माथिल्लो Announcement Bar अन गर्नुहोस् र नयाँ सूचना तथा लिङ्क लेख्नुहोस्।',
      'Header को उचाइ तथा Sticky स्क्रोल व्यवहार मिलाउनुहोस्।',
      'ठेगाना, फोन नम्बर, ईमेल वा सामाजिक सञ्जाल बदल्न Footer Settings मा जानुहोस्।',
      '"Save & Publish" थिचेर सबै पृष्ठहरूमा नयाँ विवरण लागू गर्नुहोस्।'
    ],
    targetUrl: '/admin/header',
    targetLabel: 'Open Header & Footer Manager'
  },
  {
    id: 'guide-restore-revision',
    title: 'How to View History and Restore a Previous Version',
    titleNepali: 'पुरानो भर्सन (Revision History) कसरी हेर्ने र Restore गर्ने',
    category: 'publishing',
    summary: 'Never lose work: inspect tamper-evident revision snapshots and rollback with a single click.',
    summaryNepali: 'गल्ती भएमा नडराउनुहोस्: पुराना भर्सनहरू हेर्नुहोस् र एकै क्लिकमा पुरानै अवस्थामा फर्काउनुहोस्।',
    steps: [
      'Open "Revision History" from the sidebar menu.',
      'Filter by content type (Page, Blog Post, Curriculum Course, Header, or Section).',
      'Click on any version row to inspect the full snapshot diff and change summary.',
      'Click "Restore This Version" to set the snapshot as your current active draft.',
      'Review the restored content in the Website Builder and click Publish.'
    ],
    stepsNepali: [
      'मेनूबाट "Revision History" मा जानुहोस्।',
      'तपाईंले हेर्न चाहेको प्रकार (Page, Blog, Course वा Header) छान्नुहोस्।',
      'सूचीमा रहेको कुनै पनि भर्सनमा क्लिक गरेर त्यसको विवरण र पुरानो अवस्था हेर्नुहोस्।',
      '"Restore This Version" मा क्लिक गर्नुहोस्।',
      'Website Builder मा गएर हेर्नुहोस् र ठीक भएपछि Publish गर्नुहोस्।'
    ],
    targetUrl: '/admin/revisions',
    targetLabel: 'Open Revision History'
  },
  {
    id: 'guide-mobile-preview',
    title: 'How to Test Mobile Responsiveness and Screen Layouts',
    titleNepali: 'मोबाइल र ट्याब्लेटमा वेबसाइट कस्तो देखिन्छ भनेर कसरी जाँच्ने',
    category: 'mobile',
    summary: 'Use the integrated multi-device frame simulator to guarantee zero horizontal scroll and fluid layout.',
    summaryNepali: '३६०px देखि १४४०px सम्मका विभिन्न स्क्रिनहरूमा लेआउटको जाँच गर्नुहोस्।',
    steps: [
      'Open the "Website Builder" (/admin/builder).',
      'In the top action bar, click the Mobile phone icon (375px) or Tablet icon (768px).',
      'The live canvas smoothly transitions to the exact viewport constraints of that device.',
      'Inspect headings, spacing, and image alignment.',
      'You can also visit the full simulation suite at /preview for multi-device comparisons.'
    ],
    stepsNepali: [
      'Website Builder खोल्नुहोस्।',
      'माथि रहेको Mobile आइकन (375px) वा Tablet आइकन (768px) मा क्लिक गर्नुहोस्।',
      'लाइभ क्यानभास ठ्याक्कै मोबाइलको आकारमा खुम्चिन्छ।',
      'कुनै अक्षर वा बटन काटिएको छ कि छैन जाँच्नुहोस्।',
      'थप विस्तृत परीक्षणका लागि /preview पृष्ठ पनि खोल्न सक्नुहुन्छ।'
    ],
    targetUrl: '/preview',
    targetLabel: 'Open Device Simulator'
  }
];

export const AdminHelpCenterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('guide-edit-paragraph');
  const [languageMode, setLanguageMode] = useState<'ne' | 'en'>('ne');

  const filteredGuides = ADMIN_GUIDES.filter((guide) => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      guide.title.toLowerCase().includes(term) ||
      guide.titleNepali.includes(term) ||
      guide.summary.toLowerCase().includes(term) ||
      guide.summaryNepali.includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-600)', letterSpacing: '0.05em' }}>
            <HelpCircle size={14} />
            <span>Admin Documentation & Operating Manual</span>
          </div>
          <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: 'var(--space-2) 0' }}>
            {languageMode === 'ne' ? 'कन्सोल सञ्चालन निर्देशिका (Help Center)' : 'Admin Control Panel Operating Guide'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: 0, maxWidth: '640px' }}>
            {languageMode === 'ne' 
              ? 'वेबसाइटको कुनै पनि भाग कोड नछोई आफैँ परिवर्तन गर्न तलका चरणबद्ध गाइडहरू पढ्नुहोस्।'
              : 'Step-by-step instructions for editing website copy, designing sections, managing media, and publishing updates.'}
          </p>
        </div>

        {/* Language Toggle for Guide */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setLanguageMode('ne')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: languageMode === 'ne' ? 'var(--color-primary-600)' : 'transparent',
              color: languageMode === 'ne' ? '#ffffff' : 'var(--color-text)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            नेपाली गाइड
          </button>
          <button
            type="button"
            onClick={() => setLanguageMode('en')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: languageMode === 'en' ? 'var(--color-primary-600)' : 'transparent',
              color: languageMode === 'en' ? '#ffffff' : 'var(--color-text)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            English Manual
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={languageMode === 'ne' ? 'निर्देशिका खोज्नुहोस् (जस्तै: Paragraph, Color, Logo, Restore)...' : 'Search operating guides (e.g. Paragraph, Fonts, Menu, Mobile)...'}
          style={{
            width: '100%',
            padding: '12px 16px 12px 46px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-sm)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
        {[
          { key: 'all', label: languageMode === 'ne' ? 'सबै विषयहरू' : 'All Topics' },
          { key: 'editing', label: languageMode === 'ne' ? 'टेक्स्ट सम्पादन (Editing)' : 'Content Editing' },
          { key: 'design', label: languageMode === 'ne' ? 'कलर र डिजाइन (Design)' : 'Theme & Layout' },
          { key: 'publishing', label: languageMode === 'ne' ? 'प्रकाशन र ब्याकअप (Publish)' : 'Publishing & Revisions' },
          { key: 'mobile', label: languageMode === 'ne' ? 'मोबाइल रेस्पोन्सिभ (Mobile)' : 'Mobile Testing' }
        ].map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              backgroundColor: selectedCategory === cat.key ? 'var(--color-primary-50)' : 'var(--color-surface)',
              color: selectedCategory === cat.key ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Guide Cards Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {filteredGuides.map((guide) => {
          const isExpanded = expandedGuideId === guide.id;
          const title = languageMode === 'ne' ? guide.titleNepali : guide.title;
          const summary = languageMode === 'ne' ? guide.summaryNepali : guide.summary;
          const steps = languageMode === 'ne' ? guide.stepsNepali : guide.steps;

          return (
            <div
              key={guide.id}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                overflow: 'hidden',
                boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {/* Card Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                style={{
                  width: '100%',
                  padding: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-primary-50)',
                      color: 'var(--color-primary-600)',
                      marginTop: '2px'
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text)' }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {summary}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  style={{
                    color: 'var(--color-text-muted)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0
                  }}
                />
              </button>

              {/* Expanded Guide Steps */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 var(--space-5) var(--space-5) calc(var(--space-5) + 38px)',
                    borderTop: '1px dashed var(--color-border)',
                    paddingTop: 'var(--space-4)'
                  }}
                >
                  <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-600)', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>
                    {languageMode === 'ne' ? 'चरणबद्ध निर्देशन (Step-by-Step Instructions):' : 'Step-by-Step Walkthrough:'}
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {steps.map((step, idx) => (
                      <li key={idx} style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)', lineHeight: 1.6 }}>
                        {step}
                      </li>
                    ))}
                  </ol>

                  {/* Direct Action Shortcut Button */}
                  <div style={{ marginTop: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Link
                      to={guide.targetUrl}
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <span>{guide.targetLabel}</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
