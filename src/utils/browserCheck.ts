export const checkBrowserCapabilities = () => {
  const capabilities = {
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    mediaRecorder: 'MediaRecorder' in window,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window,
    secure: window.location.protocol === 'https:',
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor
  };

  console.log('Capacités du navigateur:', capabilities);
  
  if (!capabilities.secure) {
    console.warn('L\'application n\'est pas en HTTPS - l\'accès au microphone pourrait être bloqué');
  }

  if (!capabilities.mediaDevices || !capabilities.getUserMedia) {
    console.error('L\'API MediaDevices n\'est pas supportée');
  }

  if (!capabilities.mediaRecorder) {
    console.error('L\'API MediaRecorder n\'est pas supportée');
  }

  return capabilities;
};

export const getSupportedMimeTypes = () => {
  const types = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav'
  ];

  const supported = types.filter(type => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch (e) {
      return false;
    }
  });

  console.log('Types MIME supportés:', supported);
  return supported;
};
