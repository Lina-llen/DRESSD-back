# Suivi du Projet — DRESSD API Backend

> Ce fichier consigne l'architecture technique, l'état d'avancement, les choix de conception et le journal des modifications de l'API DRESSD.  
> **Règle pour les développeurs et agents IA :** Toute modification structurelle, ajout d'endpoint ou installation de dépendance doit être documentée dans ce fichier dans la section [Journal des Modifications](#-journal-des-modifications).

---

## 📌 1. Vue d'ensemble du Projet

- **Projet :** DRESSD (Garde-robe numérique interactive)
- **Composant :** Backend / API REST
- **Stack technique :** Node.js (ES Modules `import/export`), Express, MySQL (`mysql2/promise`)
- **Authentification :** JWT (`jsonwebtoken`) avec hachage des mots de passe (`bcrypt`)
- **Modèle de référence :** Architecture MVC modulaire inspirée du repo de cours `TheoGeneste/events_aout_2026`.
- **Règle d'or de sécurité & étanchéité :** **Isolation stricte par `user_id`** sur toutes les tables de données utilisateur (`clothes`, `locations`, `tags`, `clothing_tags`, `outfits`, `outfit_items`). Un utilisateur ne peut en aucun cas lire, modifier ou supprimer les données d'un autre utilisateur.

---

## 🗄️ 2. Modèle de Données (Base MySQL : `dressdBDD.sql`)

| Table | Description | Champs clés |
| :--- | :--- | :--- |
| `users` | Comptes utilisateurs | `id`, `email`, `password` |
| `categories` | Catégories & sous-catégories arborescentes | `id`, `name`, `parent_id` (auto-référence) |
| `locations` | Emplacements physiques personnalisés | `id`, `user_id`, `name` |
| `clothes` | Vêtements catalogués | `id`, `user_id`, `category_id`, `location_id`, `name`, `image_path`, `is_favorite` |
| `tags` | Tags personnalisés par utilisateur | `id`, `user_id`, `name` |
| `clothing_tags` | Table de liaison vêtement <-> tag | `clothing_id`, `tag_id` |
| `outfits` | Tenues composées | `id`, `user_id`, `name`, `is_favorite` |
| `outfit_items` | Table de liaison outfit <-> vêtements | `outfit_id`, `clothing_id` |

---

## 🏛️ 3. Architecture Technique (Pattern MVC / Modulaire)

Conformément à la structure du repo de référence, le code est organisé par responsabilités :

```text
Dressd-back/
├── Config/
│   └── db.js                 # Connexion MySQL pool / promise via variables d'environnement
├── Controllers/
│   ├── auth.controller.js        # Inscription, connexion, validation
│   ├── categories.controller.js  # Consultation des catégories et sous-catégories
│   ├── clothes.controller.js     # CRUD vêtements, filtres, favoris
│   ├── locations.controller.js   # CRUD emplacements (Armoire, Valise, etc.)
│   ├── outfits.controller.js     # CRUD tenues et composition de vêtements
│   └── tags.controller.js        # CRUD tags utilisateur
├── Middlewares/
│   ├── auth.middleware.js        # Vérification du token JWT et extraction de req.user
│   └── upload.middleware.js      # Gestion de l'upload des images (si multer validé)
├── Models/
│   ├── users.model.js            # Requêtes SQL table users
│   ├── categories.model.js       # Requêtes SQL table categories (arborescence)
│   ├── clothes.model.js          # Requêtes SQL table clothes (+ jointures tags/cat/loc)
│   ├── locations.model.js        # Requêtes SQL table locations
│   ├── outfits.model.js          # Requêtes SQL table outfits (+ outfit_items)
│   └── tags.model.js             # Requêtes SQL table tags
├── Routes/
│   ├── auth.route.js             # Routes /auth (register, login, me)
│   ├── categories.route.js       # Routes /categories
│   ├── clothes.route.js          # Routes /clothes
│   ├── locations.route.js        # Routes /locations
│   ├── outfits.route.js          # Routes /outfits
│   └── tags.route.js             # Routes /tags
├── uploads/                      # Stockage des fichiers images uploadés
├── .env.exemple                  # Gabarit des variables d'environnement
├── .gitignore                    # Exclusion de node_modules, .env, uploads/
├── dressdBDD.sql                 # Script SQL de création de la BDD
├── index.js                      # Point d'entrée de l'application Express
├── package.json                  # Dépendances et scripts de lancement
└── PROJECT_TRACKING.md           # Ce fichier de suivi
```

---

## 📦 4. Gestion des Dépendances

### Dépendances validées par l'utilisateur
- `express` : Framework web HTTP.
- `nodemon` *(dev)* : Rechargement automatique en développement.
- `mysql2` : Client MySQL avec support des Promesses async/await.
- `bcrypt` : Hachage sécurisé des mots de passe utilisateurs.
- `jsonwebtoken` : Génération et vérification des JWT.

### Dépendances proposées à valider
1. `dotenv` :
   - *Pourquoi :* Permet de charger les variables de configuration (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `SERVER_PORT`, `JWT_SECRET`) depuis un fichier local `.env` sans exposer d'informations sensibles dans le code source (identique au repo de référence).
2. `cors` :
   - *Pourquoi :* L'application frontend React (hébergée sur Vercel ou localhost:5173) doit communiquer avec l'API Node/Express. Sans ce middleware, les navigateurs bloquent les requêtes cross-origin.
3. `multer` :
   - *Pourquoi :* Le cahier des charges stipule que les photos de vêtements sont uploadées physiquement sur le serveur et le chemin stocké en base. `multer` est la bibliothèque de référence pour gérer les formulaires `multipart/form-data` dans Express.

---

## 📋 5. Tableau de Bord d'Avancement des Fonctionnalités (V1 MVP)

- [x] Analyse des deux cahiers des charges (V1 et V1.1) et du dump MySQL `dressdBDD.sql`.
- [x] Analyse de l'architecture et des conventions du repo de référence `TheoGeneste/events_aout_2026`.
- [x] Création du fichier de suivi `PROJECT_TRACKING.md`.
- [x] Validation des dépendances complémentaires (`dotenv`, `cors`, `multer`) par l'utilisateur.
- [x] Initialisation de `package.json` et configuration de base (`.gitignore`, `.env.exemple`, `.env`).
- [x] Installation des paquets npm (`express`, `mysql2`, `bcrypt`, `jsonwebtoken`, `dotenv`, `cors`, `multer`, `nodemon`).
- [x] Création du module de base de données `Config/db.js` (pool de connexions MySQL2 / Promise).
- [x] Création du middleware d'authentification `Middlewares/auth.middleware.js` (JWT & isolation `req.user`).
- [x] Création du middleware d'upload `Middlewares/upload.middleware.js` (Multer vers `uploads/`).
- [x] Module Authentification (`users.model.js`, `auth.controller.js`, `auth.route.js`).
- [x] Module Catégories (`categories.model.js`, `categories.controller.js`, `categories.route.js`).
- [x] Module Localisations (`locations.model.js`, `locations.controller.js`, `locations.route.js`).
- [x] Module Tags (`tags.model.js`, `tags.controller.js`, `tags.route.js`).
- [x] Module Vêtements (`clothes.model.js`, `clothes.controller.js`, `clothes.route.js`, upload & filtres).
- [x] Module Outfits (`outfits.model.js`, `outfits.controller.js`, `outfits.route.js`).
- [x] Configuration de `index.js` reliant tous les routeurs et gestionnaire d'erreurs global.
- [x] Validation syntaxique de tous les modules JavaScript.

---

## 🌐 6. Inventaire des Endpoints de l'API

| Méthode | Route | Auth requise | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Non | Healthcheck & statut de l'API |
| **POST** | `/auth/register` | Non | Inscription d'un nouvel utilisateur (`email`, `password`) |
| **POST** | `/auth/login` | Non | Connexion & obtention du token JWT |
| **GET** | `/auth/me` | Oui | Profil de l'utilisateur connecté |
| **GET** | `/categories` | Non | Liste des catégories (`?tree=true` pour arbre hiérarchique) |
| **GET** | `/categories/main` | Non | Catégories principales (Niveau 1) |
| **GET** | `/categories/sub/:parentId` | Non | Sous-catégories d'une catégorie mère |
| **GET** | `/categories/:id` | Non | Détail d'une catégorie |
| **GET** | `/locations` | Oui | Liste des emplacements de l'utilisateur |
| **POST** | `/locations` | Oui | Création d'un emplacement (`name`) |
| **PUT** | `/locations/:id` | Oui | Modification d'un emplacement |
| **DELETE** | `/locations/:id` | Oui | Suppression d'un emplacement |
| **GET** | `/tags` | Oui | Liste des tags de l'utilisateur |
| **POST** | `/tags` | Oui | Création d'un tag (`name`) |
| **DELETE** | `/tags/:id` | Oui | Suppression d'un tag |
| **GET** | `/clothes` | Oui | Liste des vêtements (Filtres : `category_id`, `location_id`, `is_favorite`, `tag_id`, `search`) |
| **GET** | `/clothes/:id` | Oui | Détail d'un vêtement avec ses tags, catégorie et emplacement |
| **POST** | `/clothes` | Oui | Ajout d'un vêtement (avec upload image `photo` + `tag_ids`) |
| **PUT** | `/clothes/:id` | Oui | Mise à jour d'un vêtement (champs, tags, remplacement photo) |
| **PATCH** | `/clothes/:id/favorite` | Oui | Basculer le statut favori d'un vêtement |
| **DELETE** | `/clothes/:id` | Oui | Suppression d'un vêtement et de sa photo physique |
| **GET** | `/outfits` | Oui | Liste des tenues créées avec leurs vêtements associés |
| **GET** | `/outfits/:id` | Oui | Détail d'un outfit avec liste des vêtements |
| **POST** | `/outfits` | Oui | Création d'un outfit (`name`, `clothing_ids`, `is_favorite`) |
| **PUT** | `/outfits/:id` | Oui | Modification d'un outfit et de ses pièces composantes |
| **PATCH** | `/outfits/:id/favorite` | Oui | Basculer le statut favori d'un outfit |
| **DELETE** | `/outfits/:id` | Oui | Suppression d'un outfit |

---

## 📝 7. Journal des Modifications

| Date | Auteur | Description des modifications |
| :--- | :--- | :--- |
| **2026-10-15** | Agent IA | Initialisation du projet DRESSD :<br>- Création de `PROJECT_TRACKING.md`, `.gitignore`, `.env.exemple`, `.env`.<br>- Validation utilisateur pour `dotenv`, `cors`, `multer`.<br>- Installation des dépendances dans `package.json`.<br>- Mise en place du module `Config/db.js` (pool MySQL2/promise).<br>- Implémentation des Middlewares (`auth.middleware.js`, `upload.middleware.js`).<br>- Création de tous les Modèles, Contrôleurs et Routes (`auth`, `categories`, `locations`, `tags`, `clothes`, `outfits`).<br>- Configuration de `index.js` avec distribution statique `/uploads` et gestionnaire d'erreurs.<br>- Validation syntaxique de tous les modules JS. |
| **2026-10-15** | Agent IA & Utilisateur | Remplacement de tous les alias SQL courts (`c.`, `cat.`, `loc.`, `t.`, `ct.`, `o.`, `oi.`) par les noms de tables explicites complets (`clothes.`, `categories.`, `locations.`, `tags.`, `clothing_tags.`, `outfits.`, `outfit_items.`) dans les modèles pour maximiser la lisibilité et la pédagogie lors des explications et présentations du code. |
| **2026-10-15** | Agent IA & Utilisateur | Initialisation du dépôt Git dédié pour le backend et premier commit / push réussi sur le repo distant : `https://github.com/Lina-llen/DRESSD-back.git` (branche `main`). |

---
