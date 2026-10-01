# BakhYayeCouture – Frontend (React + Vite + Tailwind CSS)

## Installation
```bash
npm install
cp .env.example .env     # renseigner VITE_API_URL et VITE_WHATSAPP_NUMBER
npm run dev              # http://localhost:5173
npm run build            # production → dist/
```

## Configuration (`.env`)
- `VITE_API_URL` : URL de l'API Django (ex. `https://api.exemple.com/api`)
- `VITE_WHATSAPP_NUMBER` : numéro du tailleur, chiffres seulement avec indicatif (actuellement `221781944541`)

## Pages
- Site : `/` accueil · `/catalogue` (filtre taille/catégorie, pagination) · clic sur une tenue = aperçu (image à gauche, détails à droite) · `/tenue/:id` (page complète) · `/panier`
- Commande WhatsApp : directe (1 tenue) ou via le panier (plusieurs tenues). Le message contient pour chaque tenue : nom, taille, couleur, quantité, **lien de la photo** et lien de la fiche, puis le total.
- Back-office : `/admin` (tenues) et `/admin/categories` (catégories). Connexion avec le compte créé par `createsuperuser`.

## Remplacer le logo
1. Remplacez `public/logo.svg` par le logo du tailleur (ou déposez `public/logo.png` et changez `LOGO_SRC` dans `src/config.js`).
2. Remplacez aussi les icônes de l'application (carrées) : `public/pwa-192.png` (192×192), `public/pwa-512.png` (512×512),
   `public/pwa-maskable-512.png` (512×512, logo centré avec ~20 % de marge) et `public/apple-touch-icon.png` (180×180).

## Application mobile (PWA)
Sur téléphone : ouvrir le site puis « Ajouter à l'écran d'accueil » (ou bouton « Installer l'app »).
Elle s'ouvre en plein écran avec une barre d'onglets en bas. Le thème clair/sombre suit celui de l'appareil.

## Déploiement (Vercel)
Le fichier `vercel.json` fourni redirige toutes les routes vers `index.html`. Définir les variables `VITE_*` dans Vercel.
