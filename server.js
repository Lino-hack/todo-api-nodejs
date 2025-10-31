//importation des modules necessaires
const express=require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const{v4:uuidv4}= require('uuid');

//creation de l'application Express
const app= express();

//Middleware pour que l'API comprenne le JSON dans les requetes
app.use(express.json());

//Tableu en memoire pour stocker les taches
let tasks= [];
const users= [];

//ROUTES AUTH

app.post('/api/auth/register', async(req, res)=>{
  const{username, email, password}= req.body;

//verifier que tous les champs sont fournis
if(!username || !email || !password){
  return res.status(400).json({message: 'Tous les champs sont requis.'});
}

//verifier que l'utilisateur n'existe pas deja
const existingUser= users.find(u => u.email === email);
if(existingUser){
  return res.status(400).json({message: 'Utilisateur deja existant.'});
}

//Hacher le mot de passe
const hashedPassword= await bcrypt.hash(password, 10); //10= nombre de rounds

//creerl'utilisateur et l'ajouter a la collection
const newUser={
  id: uuidv4(),
  username, 
  email,
  password: hashedPassword,
  createdAt: new Date().toISOString()
};

users.push(newUser);

//reponse
res.status(201).json({message: 'Utilisateur créé avec succes !'});
});


//route register
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier que tous les champs sont remplis
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  // Chercher l’utilisateur dans le tableau
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Utilisateur non trouvé.' });
  }

  // Vérifier le mot de passe
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Mot de passe incorrect.' });
  }

  // Générer un token JWT
  const token = jwt.sign(
    { id: user.id, username: user.username },
    'SECRET_KEY', 

    { expiresIn: '1h' } // le token expire après 1 heure
  );

  // Répondre avec le token
  res.json({
    message: 'Connexion réussie',
    token
  });
});

//middleware pour verifier le token
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']; // récupérer l'en-tête "Authorization"

  // L’en-tête doit être au format : "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY'); // vérifie la validité du token
    req.user = decoded; // on stocke les infos du token dans req.user
    next(); // on passe à la suite
  } catch (error) {
    res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
}

//route protegee
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable.' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  });
});


//ROUTES TASKS

//Recuperer toutes les taches
app.get('/api/tasks', authMiddleware, (req, res)=>{
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.json(tasks);
});
//recuperer une tache par ID
app.get('/api/tasks/:id', authMiddleware,(req, res)=>{
  const task=tasks.find(t => t.id ===req.params.id && t.userId === req.user.id);
  if(!task){
    return res.status(404).json({message:'Tache non trouvée'});
  }
  res.json(task);
});


//créer une nouvelle tache
app.post('/api/tasks', authMiddleware, (req, res)=>{
  try{ 
  const{title, description, priority, dueDate}=req.body;

  //verifier que le titre existe
  if(!title || title.trim()===""){
    return res.status(400).json({error: "Le titre est obligatoire."});
  }

  //verifier la priorite
  const validPriorities= ["low", "medium", "high"];
  if(priority && !validPriorities.includes(priority)){
    return res.status(400).json({
      error: "La priorite doit etre 'low', 'medium', ou 'high'.",
    });
  }

  //verifier la date
  if(dueDate && isNaN(Date.parse(dueDate))){
    return res.status(400).json({error: "La date n'est pas valide"});
  }

  //creation de la tache
  const newTask={
    id: uuidv4(),
    userId: req.user.id, 
    title,
    description,
    completed:false,
    priority: priority || 'medium',
    dueDate,
    createdAt: new Date().toISOString()
  };

  //ajout au tableau
  tasks.push(newTask);
  res.status(201).json(newTask);
}catch(err){
  next(err);
}
});

//Mettre a jour une tache
app.put('/api/tasks/:id', (req, res)=>{
  try{ 
  const{id}= req.params.id;
  const{title, description, completed, priority, dueDate}= req.body;

  const task= tasks.find((t)=>t.id===req.params.id && t.userId === req.user.id);
  if(!task){
    return res.status(404).json({error: 'Tache non trouvée'});
  }

  //validation des champs
  if(title !==undefined && title.trim() === ""){
    return res.status(400).json({error: "Le titre ne peut pas etre vide."});
  }
  const validPriorities= ["low", "medium", "high"];
  if(priority && !validPriorities.includes(priority)){
    return res
          .status(400)
          .json({error: "la priorite doit etre 'low', 'medium', ou 'high' ."});
  }

  if (dueDate && isNaN(Date.parse(dueDate))){
    return res.status(400).json({error: "la date n'est pas valide."});
  }


  //Met a jour seulementles champs envoyes
  if(title !== undefined)task.title= title;
  if(description !== undefined)task.description= description;
  if(completed !== undefined)task.completed= completed;
  if(priority !== undefined)task.priority= priority;
  if(dueDate !== undefined)task.dueDate= dueDate;

  res.json(task);
}catch(err){
   console.error("Erreur PUT /api/tasks/:id :", err);
  res.status(500).json({error: "Erreur interne du serveur"});
}
});

//supprimer une tache
app.delete('/api/tasks/:id', authMiddleware,(req, res)=>{
  const index= tasks.findIndex(t =>t.id===req.params.id && t.userId === req.user.id);
  if(index === -1){
    return res.status(404).json({message: 'Tache non trouvée'});
  }

  tasks.splice(index, 1);
  res.json({message: 'tache supprimée avec succés'});
});

//middleware global
function errorHandler(err, req, res, next){
  console.error(err.stack);
  res.status(500).json({error: "Une erreur serveur est survenue."});
}

//Demarrer le serveur
const PORT=3000;
app.listen(PORT, ()=>{
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});