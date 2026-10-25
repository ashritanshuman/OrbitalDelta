import React from 'react';
import TopBar from './components/layout/TopBar';
import Hero from './components/sections/Hero';
import StatsStrip from './components/sections/StatsStrip';
import HowItWorks from './components/sections/HowItWorks';
import Analyzer from './components/analyzer/Analyzer';
import UseCases from './components/sections/UseCases';
import ClosingCta from './components/sections/ClosingCta';
import Footer from './components/layout/Footer';
import { useAnalysis } from './hooks/useAnalysis';

export function App() {
  const analysisHook = useAnalysis();

  const handleLoadSampleAndScroll = (presetId = 'deforestation') => {
    analysisHook.loadPreset(presetId);
    const el = document.getElementById('analyzer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-accent selection:text-bg">
      <TopBar />
      <main className="flex-1 flex flex-col w-full">
        <Hero onLoadSampleAndScroll={handleLoadSampleAndScroll} />
        <StatsStrip />
        <HowItWorks />
        <Analyzer analysisHook={analysisHook} />
        <UseCases />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}

export default App;
