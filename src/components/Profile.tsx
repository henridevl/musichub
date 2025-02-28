import React from 'react';
import { Music, FileText, Plus, Trash2, Mic, Play, Pause, StopCircle, Square, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ConfirmationDialog } from './ui/confirmation-dialog';
import { NoteDialog } from './ui/note-dialog';
import { RecordingPreviewDialog } from './ui/recording-preview-dialog';
import { noteService, Note, recordingService, Recording } from '../services/supabase';
import { toast } from 'react-hot-toast';
import { AudioRecorder } from './AudioRecorder';
import { colors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [recordings, setRecordings] = React.useState<Recording[]>([]);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingDuration, setRecordingDuration] = React.useState(0);
  const [currentAudioBlob, setCurrentAudioBlob] = React.useState<Blob | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const recorderRef = React.useRef<any>(null);
  const timeRef = React.useRef<number>(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    timeRef.current = 0;
    setRecordingDuration(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
      setRecordingDuration(timeRef.current);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeRef.current = 0;
    setRecordingDuration(0);
  };

  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    type: 'recording' | 'note';
    id: number;
    title: string;
  }>({
    isOpen: false,
    type: 'recording',
    id: 0,
    title: ''
  });

  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    loadNotes();
    loadRecordings();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await noteService.getAllNotes();
      console.log('Notes chargées:', fetchedNotes);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      toast.error('Impossible de charger les notes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const fetchedRecordings = await recordingService.getAllRecordings();
      console.log('Enregistrements chargés:', fetchedRecordings);
      setRecordings(fetchedRecordings);
    } catch (error) {
      console.error('Erreur lors du chargement des enregistrements:', error);
      toast.error('Impossible de charger les enregistrements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (type: 'recording' | 'note', id: number, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      title
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirmation.type === 'recording') {
        await recordingService.deleteRecording(deleteConfirmation.id);
        setRecordings(recordings.filter(rec => rec.id !== deleteConfirmation.id));
        toast.success('Enregistrement supprimé avec succès');
      } else {
        await noteService.deleteNote(deleteConfirmation.id);
        setNotes(notes.filter(note => note.id !== deleteConfirmation.id));
        toast.success('Note supprimée avec succès');
      }
      setDeleteConfirmation(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(`Erreur lors de la suppression de ${deleteConfirmation.type === 'recording' ? "l'enregistrement" : "la note"}`);
    }
  };

  const handleAddNote = async ({ title, content }: { title: string; content: string }) => {
    try {
      const newNote = await noteService.createNote({
        title,
        content,
        date: new Date().toISOString().split('T')[0]
      });
      setNotes([newNote, ...notes]);
      setIsNoteDialogOpen(false);
      toast.success('Note créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      toast.error('Erreur lors de la création de la note');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    startTimer();
    recorderRef.current?.startRecording();
  };

  const stopRecording = () => {
    recorderRef.current?.stopRecording();
    stopTimer();
    setIsRecording(false);
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setCurrentAudioBlob(blob);
    setIsPreviewDialogOpen(true);
    setRecordingDuration(duration);
  };

  const handleSaveRecording = async (title: string) => {
    if (!currentAudioBlob) return;

    try {
      const file = new File([currentAudioBlob], `${Date.now()}-${title}.webm`, {
        type: currentAudioBlob.type,
      });

      const newRecording = await recordingService.createRecording({
        title,
        audio_file: file,
        duration: formatTime(recordingDuration),
        date: new Date().toISOString().split('T')[0]
      });
      
      setRecordings([newRecording, ...recordings]);
      setIsPreviewDialogOpen(false);
      setCurrentAudioBlob(null);
      setRecordingDuration(0);
      toast.success('Enregistrement sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'enregistrement:', error);
      toast.error('Erreur lors de la sauvegarde de l\'enregistrement');
    }
  };

  const togglePlayRecording = (recordingId: number, audioUrl: string) => {
    if (currentlyPlaying === recordingId) {
      audioRef.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setCurrentlyPlaying(recordingId);
      audioRef.current.onended = () => {
        setCurrentlyPlaying(null);
      };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      {/* Section Enregistrements */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Music className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-semibold">Mes Enregistrements</h2>
          </div>
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-2" style={{ color: colors.koral }}>
                <span className="animate-pulse">●</span>
                <span>{formatTime(recordingDuration)}</span>
              </div>
            )}
            <Button
              variant={isRecording ? "outline" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 ${
                isRecording ? 'border-2' : ''
              }`}
              style={
                isRecording 
                  ? { borderColor: colors.koral, color: colors.koral }
                  : { backgroundColor: colors.koral, color: 'white' }
              }
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4" />
                  Arrêter
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Composant AudioRecorder */}
        <AudioRecorder
          ref={recorderRef}
          onRecordingComplete={handleRecordingComplete}
        />

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold truncate">{recording.title}</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('recording', recording.id, recording.title)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{recording.date}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">{recording.duration}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlayRecording(recording.id, recording.audio_url)}
                  >
                    {currentlyPlaying === recording.id ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {currentlyPlaying === recording.id ? 'Pause' : 'Lire'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            <h2 className="text-2xl font-semibold">Mes Notes</h2>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setIsNoteDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Chargement des notes...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete('note', note.id, note.title)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                <p className="text-sm text-gray-500 mt-2">{note.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Informations personnelles</h2>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Prénom</label>
            <p className="mt-1 text-gray-900">{user?.firstName}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Nom</label>
            <p className="mt-1 text-gray-900">{user?.lastName}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
        </div>

        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteConfirmation.type === 'recording' ? "l'enregistrement" : "la note"} "${deleteConfirmation.title}" ?`}
      />

      <NoteDialog
        isOpen={isNoteDialogOpen}
        onClose={() => setIsNoteDialogOpen(false)}
        onSave={handleAddNote}
      />

      <RecordingPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        audioBlob={currentAudioBlob}
        duration={recordingDuration}
        onSave={handleSaveRecording}
      />
    </div>
  );
};

export default Profile;