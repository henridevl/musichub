import React from 'react';
import { Button } from './button';
import { X, StopCircle, Mic } from 'lucide-react';
import { AudioRecorder } from '../AudioRecorder';

interface RecordingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (title: string, blob: Blob, duration: string) => void;
}

export const RecordingDialog: React.FC<RecordingDialogProps> = ({
  isOpen,
  onClose,
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [duration, setDuration] = React.useState('0:00');
  const recorderRef = React.useRef<any>(null);

  const handleStartRecording = () => {
    if (!title.trim()) {
      alert('Veuillez entrer un titre pour l\'enregistrement');
      return false;
    }
    setIsRecording(true);
    recorderRef.current?.startRecording();
    return true;
  };

  const handleStopRecording = () => {
    recorderRef.current?.stopRecording();
    setIsRecording(false);
  };

  const handleRecordingComplete = (blob: Blob) => {
    onRecordingComplete(title, blob, duration);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Nouvel Enregistrement</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
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

          <div className="flex items-center justify-center">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-4 h-4" />
                  Arrêter
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </Button>
            {isRecording && (
              <div className="ml-4 text-red-500 flex items-center">
                <span className="animate-pulse mr-2">●</span>
                <span></span>
              </div>
            )}
          </div>

          <AudioRecorder
            ref={recorderRef}
            onRecordingComplete={handleRecordingComplete}
            onDurationUpdate={setDuration}
          />
        </div>
      </div>
    </div>
  );
};
