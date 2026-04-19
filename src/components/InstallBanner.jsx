import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './InstallBanner.css';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      console.log('beforeinstallprompt event fired! PWA is ready to install.');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the banner
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-banner animate-slide-up">
      <div className="banner-content">
        <div className="banner-info">
          <Download className="banner-icon" size={20} />
          <div>
            <p className="banner-title">Install Velvet</p>
            <p className="banner-subtitle">Add to your home screen for a better experience</p>
          </div>
        </div>
        <div className="banner-actions">
          <button onClick={handleInstallClick} className="btn btn-primary btn-sm">
            Download App
          </button>
          <button onClick={handleClose} className="banner-close">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
