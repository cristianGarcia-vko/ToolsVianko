import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { AnimatePresence } from 'framer-motion';
import { HubModule } from './SharedTool/modules/HubModule';
import { ViankoSplashReveal } from './SharedTool/atoms/ViankoSplashRevealAtom';

export default function App() {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Vianko Reveal Sequence - Premium Splash */}
        <ViankoSplashReveal 
          word="VIANKO STUDIO" 
          onComplete={() => setIsBooted(true)} 
        />

        <AnimatePresence mode="wait">
          {isBooted && (
            <HubModule key="hub" />
          )}
        </AnimatePresence>
      </PersistGate>
    </Provider>
  );
}
