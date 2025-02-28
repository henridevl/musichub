// Types pour les notes
export interface XanoNote {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  date: string;
}

// Types pour les enregistrements
export interface XanoRecording {
  id: number;
  title: string;
  audio_url: string;
  duration: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecordingInput {
  title: string;
  audio_file: Blob;
  duration: string;
  date: string;
}

// Configuration de l'API
const XANO_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:Va9Bxm_n";

// Service pour les notes
export const noteService = {
  // Récupérer toutes les notes
  async getAllNotes(): Promise<XanoNote[]> {
    const response = await fetch(`${XANO_BASE_URL}/notes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des notes');
    }
    
    return response.json();
  },

  // Créer une nouvelle note
  async createNote(note: CreateNoteInput): Promise<XanoNote> {
    const response = await fetch(`${XANO_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la note');
    }
    
    return response.json();
  },

  // Supprimer une note
  async deleteNote(id: number): Promise<void> {
    const response = await fetch(`${XANO_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la note');
    }
  },

  // Mettre à jour une note
  async updateNote(id: number, note: Partial<CreateNoteInput>): Promise<XanoNote> {
    const response = await fetch(`${XANO_BASE_URL}/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la note');
    }
    
    return response.json();
  },
};

// Service pour les enregistrements
export const recordingService = {
  // Récupérer tous les enregistrements
  async getAllRecordings(): Promise<XanoRecording[]> {
    const response = await fetch(`${XANO_BASE_URL}/recordings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des enregistrements');
    }
    
    return response.json();
  },

  // Créer un nouvel enregistrement
  async createRecording(recording: CreateRecordingInput): Promise<XanoRecording> {
    const formData = new FormData();
    formData.append('title', recording.title);
    formData.append('audio_file', recording.audio_file);
    formData.append('duration', recording.duration);
    formData.append('date', recording.date);

    const response = await fetch(`${XANO_BASE_URL}/recordings`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création de l\'enregistrement');
    }
    
    return response.json();
  },

  // Supprimer un enregistrement
  async deleteRecording(id: number): Promise<void> {
    const response = await fetch(`${XANO_BASE_URL}/recordings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'enregistrement');
    }
  },
};
