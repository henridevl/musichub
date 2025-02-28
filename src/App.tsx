import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Profile from './components/Profile';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { Home, Music2, Users, BookOpen, Settings, Bell, Search, LogOut, Menu, X, Play, Pause, SkipForward, Clock, Award, Target, Mic, ChevronRight, Grid, Plus, PenSquare } from 'lucide-react';
import { AudioRecorder } from './components/AudioRecorder';
import { Toaster } from 'react-hot-toast';
import { AuthPage } from './components/auth/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Composant de protection des routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

interface SidebarProps {
  className?: string;
}

const SidebarComponent: React.FC<SidebarProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <nav className="flex-1">
        <Link 
          to="/" 
          className={cn(
            "flex items-center py-2 px-4 text-sm",
            isActive('/') && "bg-gray-100"
          )}
        >
          Profil
        </Link>
      </nav>
    </div>
  );
};

function ActionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nouvelle action</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Link to="/training" onClick={onClose}>
            <Button className="w-full justify-start text-left" variant="outline">
              <Music2 className="w-5 h-5 mr-3" />
              Démarrer une session
            </Button>
          </Link>
          <Button className="w-full justify-start text-left" variant="outline" onClick={() => {
            onClose();
            // Add audio recording logic here
          }}>
            <Mic className="w-5 h-5 mr-3" />
            Enregistrer un audio
          </Button>
          <Button className="w-full justify-start text-left" variant="outline" onClick={() => {
            onClose();
            // Add note creation logic here
          }}>
            <PenSquare className="w-5 h-5 mr-3" />
            Écrire une note
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileNavigation() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <nav className="flex justify-around items-center h-16">
          <Link to="/" className="flex flex-col items-center space-y-1">
            <Home className={`w-6 h-6 ${isCurrentPath('/') ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`text-xs ${isCurrentPath('/') ? 'text-purple-600' : 'text-gray-600'}`}>Accueil</span>
          </Link>
          <Link to="/training" className="flex flex-col items-center space-y-1">
            <Music2 className={`w-6 h-6 ${isCurrentPath('/training') ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`text-xs ${isCurrentPath('/training') ? 'text-purple-600' : 'text-gray-600'}`}>Exercices</span>
          </Link>
          <div className="relative -top-5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          </div>
          <Link to="/coaches" className="flex flex-col items-center space-y-1">
            <Users className={`w-6 h-6 ${isCurrentPath('/coaches') ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`text-xs ${isCurrentPath('/coaches') ? 'text-purple-600' : 'text-gray-600'}`}>Coachs</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center space-y-1">
            <Users className={`w-6 h-6 ${isCurrentPath('/profile') ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`text-xs ${isCurrentPath('/profile') ? 'text-purple-600' : 'text-gray-600'}`}>Profil</span>
          </Link>
        </nav>
      </div>
      <ActionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path ? "bg-purple-50 text-purple-600" : "text-gray-700 hover:bg-purple-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 hidden lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Music2 className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold">MusicHub</span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/')}`}>
              <Home className="w-5 h-5" />
              <span>Tableau de bord</span>
            </Link>
            <Link to="/training" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/training')}`}>
              <Music2 className="w-5 h-5" />
              <span>Entraînement</span>
            </Link>
            <Link to="/coaches" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/coaches')}`}>
              <Users className="w-5 h-5" />
              <span>Mes coachs</span>
            </Link>
            <Link to="/profile" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/profile')}`}>
              <Users className="w-5 h-5" />
              <span>Mon Profil</span>
            </Link>
            <Link to="/resources" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/resources')}`}>
              <BookOpen className="w-5 h-5" />
              <span>Ressources</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <Link to="/settings" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isCurrentPath('/settings')}`}>
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-4"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Rechercher</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Rechercher..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <span className="sr-only">Voir les notifications</span>
                <Bell className="h-6 w-6" />
              </button>
              <Button 
                variant="outline" 
                className="hidden sm:flex items-center space-x-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto pb-20">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="grid grid-cols-5 gap-1">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium",
              isCurrentPath('/') ? "text-purple-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Home className="h-6 w-6" />
            <span>Accueil</span>
          </Link>

          <Link
            to="/training"
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium",
              isCurrentPath('/training') ? "text-purple-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Music2 className="h-6 w-6" />
            <span>Exercices</span>
          </Link>

          <Link
            to="/record"
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium",
              isCurrentPath('/record') ? "text-purple-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <div className="bg-purple-600 rounded-full p-4 -mt-8 border-4 border-white">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </Link>

          <Link
            to="/coaches"
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium",
              isCurrentPath('/coaches') ? "text-purple-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Users className="h-6 w-6" />
            <span>Coachs</span>
          </Link>

          <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs font-medium",
              isCurrentPath('/profile') ? "text-purple-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <LogOut className="h-6 w-6" />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section with Stats */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenue, {user?.firstName || 'Artiste'} !
              </h2>
              <p className="mt-1 text-gray-600">Voici un aperçu de votre progression</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Cette semaine</p>
                    <p className="font-semibold text-gray-900">12h30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Exercices</p>
                    <p className="font-semibold text-gray-900">24/30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Niveau</p>
                    <p className="font-semibold text-gray-900">Inter.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Session CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1920')] opacity-20 bg-cover bg-center"></div>
        <div className="relative px-6 py-8 md:px-8 text-center md:text-left">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">
                Prêt à commencer votre session ?
              </h3>
              <p className="text-purple-100 text-lg max-w-2xl">
                Lancez une nouvelle session d'entraînement maintenant et continuez votre progression musicale
              </p>
            </div>
            <div className="flex justify-center md:justify-start">
              <Link to="/training">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg group">
                  <Mic className="w-5 h-5 mr-2" />
                  <span>Nouvelle Session</span>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activités récentes</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {[
              {
                title: "Session de chant terminée",
                description: "45 minutes avec Coach Marie",
                date: "Il y a 2 heures"
              },
              {
                title: "Nouveau feedback reçu",
                description: "Sur votre enregistrement 'Ma nouvelle composition'",
                date: "Il y a 5 heures"
              },
              {
                title: "Exercice complété",
                description: "Échauffement vocal - Niveau intermédiaire",
                date: "Il y a 1 jour"
              }
            ].map((activity, index) => (
              <li key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Sessions à venir</h3>
          <div className="mt-4 space-y-4">
            {[
              {
                title: "Cours de chant",
                coach: "Marie Dubois",
                time: "Demain, 14:00",
                duration: "1h"
              },
              {
                title: "Technique vocale",
                coach: "Pierre Martin",
                time: "Jeudi, 10:00",
                duration: "45min"
              }
            ].map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-500">avec {session.coach}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.time}</p>
                  <p className="text-sm text-gray-500">{session.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Training() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  const exercises = [
    {
      title: "Échauffement vocal",
      duration: "10 min",
      description: "Série d'exercices pour préparer votre voix",
      level: "Débutant",
      type: "Technique vocale"
    },
    {
      title: "Exercices de respiration",
      duration: "15 min",
      description: "Maîtrisez votre souffle pour un meilleur contrôle vocal",
      level: "Intermédiaire",
      type: "Respiration"
    },
    {
      title: "Vocalises avancées",
      duration: "20 min",
      description: "Développez votre registre et votre agilité vocale",
      level: "Avancé",
      type: "Technique vocale"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Exercise Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold">Session d'entraînement</h2>
          <p className="mt-2">Continuez votre progression avec ces exercices personnalisés</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {exercises[currentExercise].title}
              </h3>
              <p className="mt-1 text-gray-500">
                {exercises[currentExercise].description}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Démarrer'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentExercise((prev) => (prev + 1) % exercises.length)}
                className="flex items-center space-x-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Suivant</span>
              </Button>
            </div>
          </div>
          
          {/* Exercise Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>4:30 / {exercises[currentExercise].duration}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Audio Recorder */}
      <AudioRecorder />

      {/* Exercise List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Programme d'aujourd'hui</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  currentExercise === index ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{exercise.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {exercise.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Temps total</p>
              <p className="text-2xl font-semibold text-gray-900">24h</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Objectif hebdo</p>
              <p className="text-2xl font-semibold text-gray-900">80%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Music2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Exercices</p>
              <p className="text-2xl font-semibold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="text-2xl font-semibold text-gray-900">Inter.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/training" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Training />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;