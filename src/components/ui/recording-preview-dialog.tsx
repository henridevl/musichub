import React, { useRef, useEffect, useState } from 'react';
import { Button } from './button';
import { X, Play, Pause, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { colors } from '../../styles/colors';
import '../../styles/slider.css';

interface RecordingPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  audioBlob: Blob | null;
  duration: number;
  onSave: (title: string) => void;
}

export const RecordingPreviewDialog: React.FC<RecordingPreviewDialogProps> = ({
  isOpen,
  onClose,
  audioBlob,
  duration,
  onSave,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [title, setTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Créer l'URL du blob audio quand il change
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Configurer l'audio quand l'URL change
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Erreur de lecture:', error);
          toast.error('Erreur lors de la lecture');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Veuillez entrer un titre pour l\'enregistrement');
      return;
    }
    onSave(title);
  };

  // Arrêter la lecture quand la modal se ferme
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Prévisualisation de l'enregistrement</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'enregistrement
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez un titre"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Lecteur audio */}
          <div className="space-y-4">
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              preload="metadata"
              onEnded={() => setIsPlaying(false)}
            />

            {/* Contrôles de lecture */}
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  borderColor: colors.koral,
                  color: colors.koral,
                }}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
            </div>

            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500 w-12">{formatTime(currentTime)}</span>
                <div className="relative flex-grow">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSliderChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${colors.koral} 0%, ${colors.koral} ${(currentTime / duration) * 100}%, ${colors.equinoxe} ${(currentTime / duration) * 100}%, ${colors.equinoxe} 100%)`,
                      WebkitAppearance: 'none',
                      '&::-webkit-slider-thumb': {
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        width: '0',
                        height: '0'
                      },
                      '&::-moz-range-thumb': {
                        width: '0',
                        height: '0',
                        border: 'none'
                      }
                    }}
                  />
                  <div 
                    className="absolute w-3 h-3 rounded-full -translate-y-1/2 pointer-events-none"
                    style={{
                      backgroundColor: colors.koral,
                      left: `${(currentTime / duration) * 100}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      transition: 'left 0.1s ease-out'
                    }}
                  />
                </div>
                <span className="text-gray-500 w-12">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Bouton Enregistrer */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              style={{
                backgroundColor: colors.koral,
                color: 'white',
              }}
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
