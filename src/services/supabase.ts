import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types pour les notes
export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  date: string;
}

// Types pour les enregistrements
export interface Recording {
  id: number;
  title: string;
  audio_url: string;
  duration: string;
  date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateRecordingInput {
  title: string;
  audio_file: File;
  duration: string;
  date: string;
}

// Types pour l'authentification
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

// Service pour les notes
export const noteService = {
  // Récupérer toutes les notes
  async getAllNotes(): Promise<Note[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        console.warn('Aucun utilisateur connecté');
        return [];
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      console.log('Notes récupérées:', data);
      return data || [];
    } catch (error) {
      console.error('Erreur getAllNotes:', error);
      return [];
    }
  },

  // Créer une nouvelle note
  async createNote(note: CreateNoteInput): Promise<Note> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          ...note,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur createNote:', error);
      throw error;
    }
  },

  // Supprimer une note
  async deleteNote(id: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur deleteNote:', error);
      throw error;
    }
  },
};

// Service pour les enregistrements
export const recordingService = {
  // Récupérer tous les enregistrements
  async getAllRecordings(): Promise<Recording[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        console.warn('Aucun utilisateur connecté');
        return [];
      }

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      console.log('Enregistrements récupérés:', data);
      return data || [];
    } catch (error) {
      console.error('Erreur getAllRecordings:', error);
      return [];
    }
  },

  // Créer un nouvel enregistrement
  async createRecording(recording: CreateRecordingInput): Promise<Recording> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        throw new Error('Aucun utilisateur connecté');
      }

      // 1. Upload le fichier audio
      const fileName = `${Date.now()}-${recording.title}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, recording.audio_file);

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        throw uploadError;
      }

      // 2. Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(fileName);

      // 3. Créer l'enregistrement dans la base de données
      const { data, error } = await supabase
        .from('recordings')
        .insert([{
          title: recording.title,
          audio_url: publicUrl,
          duration: recording.duration,
          date: recording.date,
          user_id: user.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur createRecording:', error);
      throw error;
    }
  },

  // Supprimer un enregistrement
  async deleteRecording(id: number): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (!user.user) {
        throw new Error('Aucun utilisateur connecté');
      }

      // 1. Récupérer l'enregistrement pour avoir l'URL du fichier
      const { data: recording, error: fetchError } = await supabase
        .from('recordings')
        .select('audio_url')
        .eq('id', id)
        .eq('user_id', user.user.id)
        .single();

      if (fetchError) {
        console.error('Erreur fetch:', fetchError);
        throw fetchError;
      }

      // 2. Extraire le nom du fichier de l'URL
      const fileName = recording.audio_url.split('/').pop();

      // 3. Supprimer le fichier du storage
      const { error: deleteFileError } = await supabase.storage
        .from('recordings')
        .remove([fileName]);

      if (deleteFileError) {
        console.error('Erreur suppression fichier:', deleteFileError);
        throw deleteFileError;
      }

      // 4. Supprimer l'enregistrement de la base de données
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur deleteRecording:', error);
      throw error;
    }
  },
};

// Service d'authentification
export const authService = {
  // Inscription
  async signUp({ email, password, firstName, lastName }: SignUpInput): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          },
        },
      });

      if (error) {
        console.error('Erreur inscription:', error);
        throw error;
      }

      if (user) {
        // Créer le profil utilisateur dans la table profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
            },
          ]);

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          throw profileError;
        }

        return {
          id: user.id,
          email: user.email!,
          firstName,
          lastName,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur signUp:', error);
      return null;
    }
  },

  // Connexion
  async signIn({ email, password }: SignInInput): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur connexion:', error);
        throw error;
      }

      if (user) {
        // Récupérer les informations du profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        return {
          id: user.id,
          email: user.email!,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur signIn:', error);
      return null;
    }
  },

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur déconnexion:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur signOut:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        return {
          id: user.id,
          email: user.email!,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return null;
    }
  },
};
