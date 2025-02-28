import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { checkBrowserCapabilities, getSupportedMimeTypes } from '../utils/browserCheck';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onDurationUpdate?: (duration: string) => void;
}

export const AudioRecorder = forwardRef<any, AudioRecorderProps>(({
  onRecordingComplete,
  onDurationUpdate
}, ref) => {
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Vérifier les capacités du navigateur au chargement
    const capabilities = checkBrowserCapabilities();
    getSupportedMimeTypes();
  }, []);

  const startRecording = async () => {
    try {
      console.log('Démarrage de l\'enregistrement...');
      chunks.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Flux audio obtenu:', stream);
      const recorder = new MediaRecorder(stream);
      console.log('MediaRecorder créé avec le type MIME:', recorder.mimeType);
      
      recorder.ondataavailable = (e) => {
        console.log('Données audio disponibles:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        console.log('Enregistrement terminé');
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        console.log('Blob audio créé:', blob.size, 'bytes');
        const duration = (Date.now() - startTimeRef.current) / 1000; // Convertir en secondes
        onRecordingComplete(blob, duration);
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onerror = (event) => {
        console.error('Erreur MediaRecorder:', event);
      };

      startTimeRef.current = Date.now();
      recorder.start(1000); // Récupérer les données toutes les secondes
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      toast.error('Erreur lors du démarrage de l\'enregistrement');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }));

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  return null;
});

export function AudioRecorderComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioRecorderRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<number>(0);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    // Réinitialiser le timer
    timeRef.current = 0;

    // Nettoyer l'intervalle existant si présent
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Mettre à jour l'affichage initial
    setDuration('0:00');

    // Démarrer le nouveau timer
    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
      const formattedTime = formatTime(timeRef.current);
      setDuration(formattedTime);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeRef.current = 0;
    setDuration('0:00');
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
    setIsRecording(false);
    stopTimer();
    setDuration(formatTime(duration));
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Enregistreur Audio</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <AudioRecorder
            ref={audioRecorderRef}
            onRecordingComplete={handleRecordingComplete}
          />
          {!isRecording ? (
            <Button
              onClick={() => {
                audioRecorderRef.current.startRecording();
                startTimer();
                setIsRecording(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          ) : (
            <Button
              onClick={() => {
                audioRecorderRef.current.stopRecording();
                stopTimer();
              }}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Square className="w-4 h-4 mr-2" />
              Arrêter
            </Button>
          )}
        </div>

        {audioURL && (
          <div className="mt-4">
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={togglePlayback}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isPlaying ? 'Pause' : 'Écouter'}
              </Button>
            </div>
            <p>Durée : {duration}</p>
          </div>
        )}
      </div>
    </div>
  );
}