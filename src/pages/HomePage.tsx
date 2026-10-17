import React, { useEffect, useState } from 'react';
import { getSiteSections, SiteSection } from '../services/siteCustomizerService';
import { Hero } from '../components/home/Hero';
import { FocusStrip } from '../components/home/FocusStrip';
import { ProgramsOverview } from '../components/home/ProgramsOverview';
import { LearningApproach } from '../components/home/LearningApproach';
import { WhoWeSupport } from '../components/home/WhoWeSupport';
import { AiRoboticsFeature } from '../components/home/AiRoboticsFeature';
import { AboutSnippet } from '../components/home/AboutSnippet';
import { MeetOurTeamSection } from '../components/home/MeetOurTeamSection';
import { InquiryCta } from '../components/home/InquiryCta';
import { updatePageSeo, generateOrganizationSchema, injectJsonLd, removeJsonLd } from '../utils/seo';

import { DynamicSectionWrapper } from '../components/home/DynamicSectionWrapper';
import { CustomBlockRenderer } from '../components/home/CustomBlockRenderer';

export const HomePage: React.FC = () => {
  const [sections, setSections] = useState<SiteSection[]>([]);

  useEffect(() => {
    updatePageSeo({
      title: 'Empowering Young Minds | STEM & Robotics in Nepal',
      description: 'Pioneering mental arithmetic (abacus), robotics, and computational thinking for schoolchildren in Butwal, Nepal.',
      canonicalPath: '/',
      ogType: 'website'
    });
    injectJsonLd(generateOrganizationSchema(), 'homepage-org-jsonld');

    getSiteSections().then((data) => {
      const visible = data
        .filter((s) => s.is_visible !== false)
        .sort((a, b) => a.sort_order - b.sort_order);
      setSections(visible);
    });

    return () => {
      removeJsonLd('homepage-org-jsonld');
    };
  }, []);

  const renderSection = (section: SiteSection) => {
    // If it's a dedicated custom block type
    if (section.block_type && section.block_type !== 'default') {
      return (
        <DynamicSectionWrapper key={section.id} section={section}>
          <CustomBlockRenderer section={section} />
        </DynamicSectionWrapper>
      );
    }

    // Default core sections
    let innerComponent: React.ReactNode = null;
    switch (section.key) {
      case 'hero':
        innerComponent = <Hero key="hero" />;
        break;
      case 'focus_strip':
        innerComponent = <FocusStrip key="focus_strip" />;
        break;
      case 'programs_overview':
        innerComponent = <ProgramsOverview key="programs_overview" />;
        break;
      case 'learning_approach':
        innerComponent = <LearningApproach key="learning_approach" />;
        break;
      case 'who_we_support':
        innerComponent = <WhoWeSupport key="who_we_support" />;
        break;
      case 'ai_robotics_feature':
        innerComponent = <AiRoboticsFeature key="ai_robotics_feature" />;
        break;
      case 'about_snippet':
        innerComponent = <AboutSnippet key="about_snippet" />;
        break;
      case 'meet_our_team':
        innerComponent = <MeetOurTeamSection key="meet_our_team" />;
        break;
      case 'inquiry_cta':
        innerComponent = <InquiryCta key="inquiry_cta" />;
        break;
      default:
        innerComponent = <CustomBlockRenderer section={section} />;
        break;
    }

    if (section.layout_style) {
      return (
        <DynamicSectionWrapper key={section.id} section={section}>
          {innerComponent}
        </DynamicSectionWrapper>
      );
    }

    return <React.Fragment key={section.id}>{innerComponent}</React.Fragment>;
  };

  if (sections.length === 0) {
    return (
      <div>
        <Hero />
        <FocusStrip />
        <ProgramsOverview />
        <LearningApproach />
        <WhoWeSupport />
        <AiRoboticsFeature />
        <AboutSnippet />
        <MeetOurTeamSection />
        <InquiryCta />
      </div>
    );
  }

  return <div>{sections.map((section) => renderSection(section))}</div>;
};
