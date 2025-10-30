//importation des modules necessaires
const express=require('express');
const{v4:uuidv4}= require('uuid');

//creation de l'application Express
const app= express();

//Middleware pour que l'API comprenne le JSON dans les requetes
app.use(express.json());

//Tableu en memoire pour stocker les taches
let tasks= [];


//ROUTES

//Recuperer toutes les taches
app.get('/api/tasks', (req, res)=>{
  res.json(tasks);
});
//recuperer une tache par ID
app.get('/api/tasks/:id', (req, res)=>{
  const task=tasks.find(t => t.id ===req.params.id);
  if(!task){
    return res.status(404).json({message:'Tache non trouvée'});
  }
  res.json(task);
});
//créer une nouvelle tache
app.post('/api/tasks', (req, res)=>{
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
  const{id}= parseInt(req.params.id);
  const{title, description, completed, priority, dueDate}= req.body;

  const task= tasks.find((t)=>t.id===id);
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
app.delete('/api/tasks/:id', (req, res)=>{
  const index= tasks.findIndex(t =>t.id===req.params.id);
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