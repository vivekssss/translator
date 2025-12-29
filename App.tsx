
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomeView } from './components/HomeView';
import { LiveCameraView } from './components/LiveCameraView';
import { VideoUploadView } from './components/VideoUploadView';
import { VideoResultView } from './components/VideoResultView';
import { VoiceTranslateView } from './components/VoiceTranslateView';
import { TranslationMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TranslationMode>(TranslationMode.HOME);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');

  const renderContent = () => {
    switch (mode) {
      case TranslationMode.HOME:
        return (
          <HomeView 
            onSelectMode={setMode} 
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
          />
        );
      case TranslationMode.LIVE_CAMERA:
        return (
          <LiveCameraView 
            sourceLang={sourceLang} 
            targetLang={targetLang} 
            onClose={() => setMode(TranslationMode.HOME)} 
          />
        );
      case TranslationMode.VOICE_TRANSLATE:
        return (
          <VoiceTranslateView 
            targetLang={targetLang} 
            onClose={() => setMode(TranslationMode.HOME)} 
          />
        );
      case TranslationMode.VIDEO_UPLOAD:
        return (
          <VideoUploadView 
            onSuccess={() => setMode(TranslationMode.VIDEO_RESULT)}
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
          />
        );
      case TranslationMode.VIDEO_RESULT:
        return <VideoResultView sourceLang={sourceLang} targetLang={targetLang} />;
      default:
        return null;
    }
  };

  return (
    <Layout onNavigateHome={() => setMode(TranslationMode.HOME)}>
      {renderContent()}
    </Layout>
  );
};

export default App;
