# API REST - Liste de tâches (TODO List)

Ce projet est une API REST construite avec **Node.js** et **Express**.  
Elle permet de gérer une liste de tâches : ajouter, modifier, afficher et supprimer.

## Fonctionnalites

- **GET /api/tasks**: Recuperer toutes  les taches
- **GET /api/tasks/:id** : Recupérer une tache par ID  
- **POST /api/tasks** : Créer une nouvelle tache  
- **PUT /api/tasks/:id** : Mettre à jour une tache  
- **DELETE /api/tasks/:id** : Supprimer une tache

## Technologies utilisées

- Node.js  
- Express.js  
- UUID (pour générer des identifiants uniques)  
- Stockage en mémoire (tableau JavaScript)

## Installation

1. Clone le projet :

   git clone https://lino-hack.github.io/todo-api-nodejs/
   cd api-todo-nodejs

2. Installe les dependances

 npm install

3. Demarrer le serveur

node server.js

L'API sera disponible sur: **http://localhost:3000**


## Endpoints disponibles

### 1️⃣ Récupérer toutes les tâches
**GET** `/api/tasks`

### 2️⃣ Récupérer une tâche par ID
**GET** `/api/tasks/:id`

### 3️⃣ Créer une nouvelle tâche
**POST** `/api/tasks`
```json
{
  "title": "Faire les courses",
  "description": "Acheter du pain",
  "priority": "high",
  "dueDate": "2025-11-01"
}
```

### 4️⃣ Mettre à jour une tâche
**PUT** `/api/tasks/:id`

### 5️⃣ Supprimer une tâche
**DELETE** `/api/tasks/:id`


## Validation des données
- `title` est obligatoire  
- `priority` doit être : `low`, `medium` ou `high`  
- `dueDate` doit être une date valide  

## ⚠️ Gestion des erreurs

|Code | Description |
|------|--------------|
| 400 | Mauvaise requête ou donnée invalide |
| 404 | Tâche non trouvée |
| 500 | Erreur serveur interne |

## Outils recommandés
- **Postman** : pour tester les routes de l’API  
- **GitHub** : pour le partage du code  

## Auteur

Projet réalisé par **Alioune Ndiaye**  
Dans le cadre de l’exercice **API REST - Node.js + Express (CRUD)**.


---

## Exercice 2.2 : Authentification JWT

Cette version ajoute un système d’authentification avec JWT.  
Chaque utilisateur doit s’inscrire et se connecter pour gérer ses propres tâches.

### Nouvelles routes

| Méthode | Endpoint | Description |
|----------|-----------|--------------|
| POST | /api/auth/register | Inscription d’un utilisateur |
| POST | /api/auth/login | Connexion et génération du JWT |
| GET | /api/auth/me | Récupération du profil utilisateur connecté |

Toutes les routes `/api/tasks` sont maintenant **protégées** par un token JWT.

### Nouveaux packages installés
- `bcryptjs` → pour le hachage des mots de passe  
- `jsonwebtoken` → pour la création et la vérification des tokens JWT  

### Étapes de test
1. Crée un utilisateur via `POST /api/auth/register`
2. Connecte-toi via `POST /api/auth/login`
3. Copie le token JWT de la réponse
4. Ajoute ce token dans Postman :


