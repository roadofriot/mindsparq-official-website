import React from 'react';
import { Hero } from '../components/home/Hero';
import { FocusStrip } from '../components/home/FocusStrip';
import { ProgramsOverview } from '../components/home/ProgramsOverview';
import { LearningApproach } from '../components/home/LearningApproach';
import { WhoWeSupport } from '../components/home/WhoWeSupport';
import { AiRoboticsFeature } from '../components/home/AiRoboticsFeature';
import { AboutSnippet } from '../components/home/AboutSnippet';
import { InquiryCta } from '../components/home/InquiryCta';

export const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <FocusStrip />
      <ProgramsOverview />
      <LearningApproach />
      <WhoWeSupport />
      <AiRoboticsFeature />
      <AboutSnippet />
      <InquiryCta />
    </div>
  );
};
