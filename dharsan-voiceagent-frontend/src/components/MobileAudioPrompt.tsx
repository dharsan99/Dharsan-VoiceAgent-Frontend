import React, { useState, useEffect } from 'react';
import { isMobileDevice, mobileAudioFix } from '../utils/mobileAudioFix';

interface MobileAudioPromptProps {
  onAudioEnabled: () => void;
  isVisible: boolean;
}

export const MobileAudioPrompt: React.FC<MobileAudioPromptProps> = ({ 
  onAudioEnabled, 
  isVisible 
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && isMobileDevice()) {
      // Check if audio context is suspended
      const checkAudioContext = async () => {
        try {
          const context = await mobileAudioFix.ensureAudioContext();
          if (context.state === 'suspended') {
            setShowPrompt(true);
          } else {
            onAudioEnabled();
          }
        } catch (error) {
          console.log('🔧 Mobile: Audio context needs user interaction');
          setShowPrompt(true);
        }
      };
      
      checkAudioContext();
    }
  }, [isVisible, onAudioEnabled]);

  const handleEnableAudio = async () => {
    setIsLoading(true);
    try {
      await mobileAudioFix.forceUserInteraction();
      setShowPrompt(false);
      onAudioEnabled();
    } catch (error) {
      console.error('🔧 Mobile: Failed to enable audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPrompt || !isMobileDevice()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="mx-auto h-12 w-12 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Enable Audio Playback
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Mobile browsers require user interaction to play audio. 
            Tap the button below to enable audio playback for the voice agent.
          </p>
          
          <button
            onClick={handleEnableAudio}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enabling Audio...
              </>
            ) : (
              'Enable Audio'
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            This is a one-time setup required by your mobile browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileAudioPrompt; 