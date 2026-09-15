import React from 'react';
import {
  LandingNavbar,
  HeroSection,
  SessionJoinSection,
  ToolboxUseCasesSection,
  ClassroomMomentsSection,
  ClassroomScenarioSection,
  HowItWorksSection,
  StudentExperienceSection,
  FinalCtaSection,
  LandingFooter,
} from '../components/landing';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]"> 
      <LandingNavbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none flex-1">
        <HeroSection />
        <SessionJoinSection />
        <ToolboxUseCasesSection />
        <ClassroomMomentsSection />
        <ClassroomScenarioSection />
        <HowItWorksSection />
        <StudentExperienceSection /> 
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
