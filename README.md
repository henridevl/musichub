# Application d'Entraînement Vocal

Une application web moderne pour l'entraînement vocal, permettant aux utilisateurs d'enregistrer leur voix, de prendre des notes et de suivre leur progression.

## Fonctionnalités

- 🎤 Enregistrement vocal avec visualisation en temps réel
- 📝 Prise de notes associée aux enregistrements
- 👤 Authentification utilisateur avec Supabase
- 📊 Suivi de la progression
- 📱 Interface responsive (mobile-first)

## Technologies Utilisées

- React + Vite
- TypeScript
- Tailwind CSS
- Supabase (Base de données et Authentification)
- Lucide React (Icônes)
- React Hot Toast (Notifications)

## Configuration Requise

- Node.js 16+
- npm ou yarn

## Installation

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd project
```

2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

3. Créer un fichier .env avec les variables suivantes
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

4. Lancer l'application en développement
```bash
npm run dev
# ou
yarn dev
```

## Déploiement

L'application est configurée pour être déployée sur Vercel. Pour déployer :

1. Créer un compte sur Vercel
2. Installer Vercel CLI : `npm i -g vercel`
3. Se connecter : `vercel login`
4. Déployer : `vercel`

## Structure de la Base de Données

### Table `profiles`
- id (uuid, clé primaire)
- first_name (text)
- last_name (text)
- email (text)
- created_at (timestamp)
- updated_at (timestamp)

### Table `recordings`
- id (uuid, clé primaire)
- title (text)
- audio_url (text)
- duration (text)
- date (text)
- user_id (uuid, clé étrangère)
- created_at (timestamp)
- updated_at (timestamp)

### Table `notes`
- id (uuid, clé primaire)
- title (text)
- content (text)
- date (text)
- user_id (uuid, clé étrangère)
- created_at (timestamp)
- updated_at (timestamp)

## Licence

MIT
