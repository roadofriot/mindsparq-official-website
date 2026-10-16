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

  const renderSection = (key: string) => {
    switch (key) {
      case 'hero':
        return <Hero key="hero" />;
      case 'focus_strip':
        return <FocusStrip key="focus_strip" />;
      case 'programs_overview':
        return <ProgramsOverview key="programs_overview" />;
      case 'learning_approach':
        return <LearningApproach key="learning_approach" />;
      case 'who_we_support':
        return <WhoWeSupport key="who_we_support" />;
      case 'ai_robotics_feature':
        return <AiRoboticsFeature key="ai_robotics_feature" />;
      case 'about_snippet':
        return <AboutSnippet key="about_snippet" />;
      case 'meet_our_team':
        return <MeetOurTeamSection key="meet_our_team" />;
      case 'inquiry_cta':
        return <InquiryCta key="inquiry_cta" />;
      default:
        return null;
    }
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

  return <div>{sections.map((section) => renderSection(section.key))}</div>;
};
