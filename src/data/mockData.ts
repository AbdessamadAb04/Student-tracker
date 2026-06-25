import type {
  Module,
  UserProfile,
  Subject,
  Grade,
  Absence,
  Task,
  TeacherFeedback,
} from '../types'

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profile: UserProfile = {
  name: 'Abdessamad Abounouh',
  initials: 'AA',
  track: 'Ingénierie Informatique – Développement Web Full-Stack',
  startDate: '2024-09-01',
  studentId: 'EMSI-2024-0142',
  year: '4ème Année',
  institution: 'EMSI Casablanca',
  email: 'a.abounouh@emsi-edu.ma',
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export const subjects: Subject[] = [
  {
    id: 's1', name: 'Algorithmes Avancés', color: '#7F77DD', coefficient: 4, teacher: 'Pr. Khaled', type: 'academic',
    chapters: [
      { id: 's1-ch1', title: 'Introduction aux algorithmes', content: 'Notions fondamentales : définition d\'un algorithme, propriétés (entrée, sortie, finitude, efficacité), représentation (pseudo-code, organigramme), complexité algorithmique et notation Big O.', resources: [] },
      { id: 's1-ch2', title: 'Structures de données', content: 'Les structures de données essentielles : tableaux, listes chaînées, piles, files, arbres binaires, tables de hachage. Complexités opérationnelles et cas d\'usage.', resources: [] },
      { id: 's1-ch3', title: 'Algorithmes de tri et recherche', content: 'Étude détaillée des algorithmes de tri (bubble, selection, insertion, merge, quick) et de recherche (linéaire, dichotomique). Analyse comparative des complexités.', resources: [] },
      { id: 's1-ch4', title: 'Graphes et optimisation', content: 'Représentation des graphes (matrice d\'adjacence, listes), parcours (BFS, DFS), plus court chemin (Dijkstra, Bellman-Ford), algorithmes gloutons et programmation dynamique.', resources: [] },
    ],
  },
  {
    id: 's2', name: 'Développement Web', color: '#1D9E75', coefficient: 3, teacher: 'Pr. Karimi', type: 'academic',
    chapters: [
      { id: 's2-ch1', title: 'HTML & CSS Avancé', content: 'Approfondissement HTML5 : balises sémantiques, accessibilité, formulaires. CSS avancé : Flexbox, Grid, animations, responsive design avec media queries.', resources: [] },
      { id: 's2-ch2', title: 'JavaScript Fondamentaux', content: 'Les bases du langage : variables (let/const/var), types, fonctions, closures, prototypes, programmation asynchrone (callbacks, Promises, async/await).', resources: [] },
      { id: 's2-ch3', title: 'Framework React', content: 'Introduction à React : composants, JSX, props, state, hooks (useState, useEffect, useContext), cycles de vie, routage avec React Router.', resources: [] },
      { id: 's2-ch4', title: 'API REST & Backend', content: 'Conception d\'API RESTful : méthodes HTTP, CRUD, authentification JWT, documentation avec Swagger. Introduction à Node.js et Express.', resources: [] },
    ],
  },
  {
    id: 's3', name: 'Base de Données', color: '#BA7517', coefficient: 3, teacher: 'Pr. Ouarrari', type: 'academic',
    chapters: [
      { id: 's3-ch1', title: 'Modélisation conceptuelle', content: 'Modèle Entité-Association (EA) : entités, attributs, associations, cardinalités. Passage au modèle relationnel. Dépendances fonctionnelles et formes normales (1NF à 3NF).', resources: [] },
      { id: 's3-ch2', title: 'SQL et requêtes avancées', content: 'Langage SQL : DDL (CREATE, ALTER), DML (SELECT, INSERT, UPDATE, DELETE), jointures (INNER, LEFT, RIGHT, FULL), sous-requêtes, fonctions d\'agrégation, index.', resources: [] },
      { id: 's3-ch3', title: 'Normalisation et optimisation', content: 'Théorie de la normalisation, décomposition sans perte, dépendances fonctionnelles. Optimisation des requêtes, plans d\'exécution, indexation avancée.', resources: [] },
      { id: 's3-ch4', title: 'NoSQL et Big Data', content: 'Introduction aux bases NoSQL : document (MongoDB), colonne (Cassandra), clé-valeur (Redis), graphe (Neo4j). Comparaison avec le relationnel, cas d\'usage.', resources: [] },
    ],
  },
  {
    id: 's4', name: 'Systèmes Distribués', color: '#D4537E', coefficient: 4, teacher: 'Pr. Nasri', type: 'academic',
    chapters: [
      { id: 's4-ch1', title: 'Introduction aux systèmes distribués', content: 'Définition, caractéristiques (concurrence, absence d\'horloge globale, indépendance des pannes). Modèles d\'architecture, théorème CAP, scalabilité.', resources: [] },
      { id: 's4-ch2', title: 'Communication et synchronisation', content: 'Modèles de communication : RPC, RMI, sockets. Synchronisation : horloges logiques (Lamport), exclusion mutuelle, élection (Bully, anneau).', resources: [] },
      { id: 's4-ch3', title: 'Docker et conteneurisation', content: 'Concepts de conteneurisation, Docker : images, conteneurs, Dockerfile, Docker Compose. Orchestration avec Kubernetes : pods, services, déploiements.', resources: [] },
      { id: 's4-ch4', title: 'Architectures microservices', content: 'Principes des microservices, communication (synchrone/asynchrone), API Gateway, service discovery, tolérance aux pannes (circuit breaker), monitoring.', resources: [] },
    ],
  },
  {
    id: 's5', name: 'Gestion de Projet', color: '#0E7490', coefficient: 2, teacher: 'Pr. Benali', type: 'academic',
    chapters: [
      { id: 's5-ch1', title: 'Méthodologies agiles', content: 'Manifeste agile, principes et valeurs. Comparaison des méthodes traditionnelles (cycle en V) vs agiles. Scrum, Kanban, Extreme Programming (XP).', resources: [] },
      { id: 's5-ch2', title: 'SCRUM en pratique', content: 'Rôles (Product Owner, Scrum Master, Dev Team), artefacts (Product Backlog, Sprint Backlog, Incrément), événements (Sprint Planning, Daily, Review, Retrospective).', resources: [] },
      { id: 's5-ch3', title: 'Planification et estimation', content: 'Techniques d\'estimation : story points, planning poker, velocity. Diagramme de Gantt, chemin critique (PERT/CPM). Outils : Jira, Trello, MS Project.', resources: [] },
      { id: 's5-ch4', title: 'Gestion des risques', content: 'Identification, analyse (qualitative/quantitative) et mitigation des risques. Matrice des risques, plan de contingence. Suivi et contrôle des risques.', resources: [] },
    ],
  },
  {
    id: 's6', name: 'Sécurité Informatique', color: '#9333EA', coefficient: 3, teacher: 'Pr. Tahiri', type: 'academic',
    chapters: [
      { id: 's6-ch1', title: 'Concepts fondamentaux', content: 'Triade CIA (Confidentialité, Intégrité, Disponibilité), authentification, autorisation, non-répudiation. Types d\'attaques : passive, active, interne, externe.', resources: [] },
      { id: 's6-ch2', title: 'Cryptographie', content: 'Cryptographie symétrique (AES, DES) et asymétrique (RSA, ECC). Fonctions de hachage (SHA-256), signatures numériques, certificats SSL/TLS, PKI.', resources: [] },
      { id: 's6-ch3', title: 'Sécurité réseau', content: 'Pare-feu, IDS/IPS, VPN, segmentation réseau. Protocoles sécurisés : HTTPS, SSH, SFTP. Attaques réseau : MITM, DDoS, spoofing.', resources: [] },
      { id: 's6-ch4', title: 'Tests de pénétration', content: 'Méthodologie des tests d\'intrusion : reconnaissance, scanning, exploitation, post-exploitation. Outils : Nmap, Metasploit, Burp Suite. Rapport et remédiation.', resources: [] },
    ],
  },
]

// ─── Modules (lesson tracker) ────────────────────────────────────────────────

export const modules: Module[] = [
  {
    id: 'm1',
    title: 'HTML & CSS',
    description: 'Les fondations du web : structure et mise en forme.',
    color: '#1D9E75',
    chapters: [
      {
        id: 'm1-c1', title: 'Bases HTML',
        lessons: [
          { id: 'm1-c1-l1', title: "Structure d'une page HTML", duration: '15 min', content: "Une page HTML est composée d'un DOCTYPE, d'une balise <html>, d'un <head> et d'un <body>. Le <head> contient les métadonnées, le <body> contient le contenu visible." },
          { id: 'm1-c1-l2', title: 'Les balises sémantiques', duration: '20 min', content: 'Les balises sémantiques comme <header>, <main>, <footer>, <article> ou <section> donnent du sens à votre contenu pour les navigateurs et le SEO.' },
          { id: 'm1-c1-l3', title: 'Formulaires HTML', duration: '25 min', content: "Les formulaires permettent de collecter des données utilisateur. Les éléments clés sont <form>, <input>, <label>, <select> et <button>." },
        ],
      },
      {
        id: 'm1-c2', title: 'CSS Fondamentaux',
        lessons: [
          { id: 'm1-c2-l1', title: 'Sélecteurs et propriétés', duration: '20 min', content: 'CSS sélectionne les éléments HTML via des sélecteurs (classe, id, tag) et applique des propriétés comme color, font-size, margin, padding.' },
          { id: 'm1-c2-l2', title: 'Le modèle de boîte', duration: '15 min', content: 'Chaque élément est une boîte composée de : content, padding, border, margin. Comprendre ce modèle est essentiel pour maîtriser les espacements.' },
          { id: 'm1-c2-l3', title: 'Flexbox', duration: '30 min', content: 'Flexbox est un système de mise en page 1D. Avec display: flex sur le parent, on contrôle l\'alignement des enfants via justify-content, align-items et flex-wrap.' },
        ],
      },
    ],
  },
  {
    id: 'm2',
    title: 'JavaScript',
    description: 'Le langage de programmation du web.',
    color: '#7F77DD',
    chapters: [
      {
        id: 'm2-c1', title: 'Les bases JS',
        lessons: [
          { id: 'm2-c1-l1', title: 'Variables et types', duration: '20 min', content: 'JavaScript utilise let, const et var pour déclarer des variables. Les types primitifs sont : string, number, boolean, null, undefined.' },
          { id: 'm2-c1-l2', title: 'Fonctions', duration: '25 min', content: "Les fonctions sont des blocs réutilisables. On peut les déclarer avec function ou en flèche : const add = (a, b) => a + b." },
          { id: 'm2-c1-l3', title: 'Tableaux et objets', duration: '30 min', content: 'Les tableaux stockent des listes ordonnées, les objets stockent des paires clé-valeur. Les méthodes map, filter et reduce sont essentielles.' },
        ],
      },
      {
        id: 'm2-c2', title: 'JS Avancé',
        lessons: [
          { id: 'm2-c2-l1', title: 'Promesses & async/await', duration: '35 min', content: "Les promesses gèrent l'asynchrone. async/await est du sucre syntaxique qui rend le code asynchrone lisible comme du code synchrone." },
          { id: 'm2-c2-l2', title: 'DOM Manipulation', duration: '30 min', content: "Le DOM est la représentation objet d'une page HTML. JavaScript peut lire et modifier le DOM via document.querySelector, addEventListener, innerHTML." },
        ],
      },
    ],
  },
  {
    id: 'm3',
    title: 'React',
    description: "La bibliothèque UI de Meta pour créer des interfaces.",
    color: '#BA7517',
    chapters: [
      {
        id: 'm3-c1', title: 'Fondamentaux React',
        lessons: [
          { id: 'm3-c1-l1', title: 'Composants et JSX', duration: '25 min', content: "React découpe l'UI en composants réutilisables. JSX est une syntaxe qui ressemble à du HTML dans JavaScript et se compile en React.createElement." },
          { id: 'm3-c1-l2', title: 'Props et State', duration: '30 min', content: "Les props passent des données parent → enfant. Le state (useState) gère l'état local d'un composant et déclenche un re-render à chaque changement." },
          { id: 'm3-c1-l3', title: 'useEffect', duration: '30 min', content: "useEffect exécute des effets de bord (fetch, abonnements) après le rendu. Le tableau de dépendances contrôle quand l'effet se relance." },
        ],
      },
    ],
  },
  {
    id: 'm4',
    title: 'Algorithmes',
    description: 'Résolution de problèmes et structures de données.',
    color: '#D4537E',
    chapters: [
      {
        id: 'm4-c1', title: 'Complexité & Tri',
        lessons: [
          { id: 'm4-c1-l1', title: 'Notation Big O', duration: '20 min', content: "La notation Big O mesure la complexité temporelle et spatiale d'un algorithme. O(1) est constant, O(n) linéaire, O(n²) quadratique." },
          { id: 'm4-c1-l2', title: 'Algorithmes de tri', duration: '40 min', content: 'Bubble sort, selection sort, merge sort et quicksort. Merge sort et quicksort ont une complexité O(n log n) et sont préférés en pratique.' },
        ],
      },
    ],
  },
]

// ─── Grades ──────────────────────────────────────────────────────────────────

export const grades: Grade[] = [
  // Algorithmes Avancés
  { id: 'g1',  studentId: 'EMSI-2024-0142', subjectId: 's1', title: 'Contrôle Continu 1', value: 15.5, weight: 1, date: '2024-10-10', teacher: 'Pr. Khaled',   type: 'cc' },
  { id: 'g2',  studentId: 'EMSI-2024-0142', subjectId: 's1', title: 'TP Graphes',          value: 17,   weight: 1, date: '2024-11-05', teacher: 'Pr. Khaled',   type: 'tp' },
  { id: 'g3',  studentId: 'EMSI-2024-0142', subjectId: 's1', title: 'Examen Final S1',     value: 14,   weight: 2, date: '2025-01-20', teacher: 'Pr. Khaled',   type: 'exam' },
  { id: 'g4',  studentId: 'EMSI-2024-0142', subjectId: 's1', title: 'Contrôle Continu 2', value: 16,   weight: 1, date: '2025-03-12', teacher: 'Pr. Khaled',   type: 'cc' },
  { id: 'g5',  studentId: 'EMSI-2024-0142', subjectId: 's1', title: 'Projet Algorithmique', value: 18, weight: 2, date: '2025-05-08', teacher: 'Pr. Khaled',   type: 'project' },

  // Développement Web
  { id: 'g6',  studentId: 'EMSI-2024-0142', subjectId: 's2', title: 'Quiz HTML/CSS',       value: 19,   weight: 1, date: '2024-10-15', teacher: 'Pr. Karimi',  type: 'quiz' },
  { id: 'g7',  studentId: 'EMSI-2024-0142', subjectId: 's2', title: 'TP React',             value: 18.5, weight: 1, date: '2024-11-20', teacher: 'Pr. Karimi',  type: 'tp' },
  { id: 'g8',  studentId: 'EMSI-2024-0142', subjectId: 's2', title: 'Examen Final S1',     value: 16,   weight: 2, date: '2025-01-22', teacher: 'Pr. Karimi',  type: 'exam' },
  { id: 'g9',  studentId: 'EMSI-2024-0142', subjectId: 's2', title: 'Projet Web Full-Stack', value: 20, weight: 2, date: '2025-05-15', teacher: 'Pr. Karimi',  type: 'project' },

  // Base de Données
  { id: 'g10', studentId: 'EMSI-2024-0142', subjectId: 's3', title: 'Contrôle Continu 1', value: 13,   weight: 1, date: '2024-10-18', teacher: 'Pr. Ouarrari', type: 'cc' },
  { id: 'g11', studentId: 'EMSI-2024-0142', subjectId: 's3', title: 'TP SQL',              value: 15,   weight: 1, date: '2024-11-28', teacher: 'Pr. Ouarrari', type: 'tp' },
  { id: 'g12', studentId: 'EMSI-2024-0142', subjectId: 's3', title: 'Examen Final S1',     value: 12.5, weight: 2, date: '2025-01-25', teacher: 'Pr. Ouarrari', type: 'exam' },
  { id: 'g13', studentId: 'EMSI-2024-0142', subjectId: 's3', title: 'Contrôle Continu 2', value: 14,   weight: 1, date: '2025-03-20', teacher: 'Pr. Ouarrari', type: 'cc' },

  // Systèmes Distribués
  { id: 'g14', studentId: 'EMSI-2024-0142', subjectId: 's4', title: 'Contrôle Continu 1', value: 14.5, weight: 1, date: '2024-10-22', teacher: 'Pr. Nasri',   type: 'cc' },
  { id: 'g15', studentId: 'EMSI-2024-0142', subjectId: 's4', title: 'TP Docker/K8s',       value: 16,   weight: 1, date: '2024-12-05', teacher: 'Pr. Nasri',   type: 'tp' },
  { id: 'g16', studentId: 'EMSI-2024-0142', subjectId: 's4', title: 'Examen Final S1',     value: 13,   weight: 2, date: '2025-01-28', teacher: 'Pr. Nasri',   type: 'exam' },

  // Gestion de Projet
  { id: 'g17', studentId: 'EMSI-2024-0142', subjectId: 's5', title: 'Présentation SCRUM',  value: 17.5, weight: 1, date: '2024-11-10', teacher: 'Pr. Benali',  type: 'project' },
  { id: 'g18', studentId: 'EMSI-2024-0142', subjectId: 's5', title: 'Contrôle Continu 1', value: 16,   weight: 1, date: '2025-02-05', teacher: 'Pr. Benali',  type: 'cc' },

  // Sécurité Informatique
  { id: 'g19', studentId: 'EMSI-2024-0142', subjectId: 's6', title: 'Contrôle Continu 1', value: 15,   weight: 1, date: '2024-11-15', teacher: 'Pr. Tahiri',  type: 'cc' },
  { id: 'g20', studentId: 'EMSI-2024-0142', subjectId: 's6', title: 'TP Pentest',          value: 18,   weight: 1, date: '2025-01-10', teacher: 'Pr. Tahiri',  type: 'tp' },
  { id: 'g21', studentId: 'EMSI-2024-0142', subjectId: 's6', title: 'Examen Final S1',     value: 14.5, weight: 2, date: '2025-02-01', teacher: 'Pr. Tahiri',  type: 'exam' },
]

// ─── Absences ────────────────────────────────────────────────────────────────

export const absences: Absence[] = [
  { id: 'a1',  studentId: 'EMSI-2024-0142', date: '2024-10-03', duration: 'full', reason: 'Maladie',           excused: true,  certificateProvided: true,  subjectId: 's1' },
  { id: 'a2',  studentId: 'EMSI-2024-0142', date: '2024-10-15', duration: 'half', reason: 'Rendez-vous médical', excused: true, certificateProvided: true,  subjectId: 's2' },
  { id: 'a3',  studentId: 'EMSI-2024-0142', date: '2024-11-07', duration: 'full', reason: 'Personnel',          excused: false, certificateProvided: false, subjectId: 's3' },
  { id: 'a4',  studentId: 'EMSI-2024-0142', date: '2024-11-22', duration: 'half', reason: undefined,            excused: false, certificateProvided: false, subjectId: 's4' },
  { id: 'a5',  studentId: 'EMSI-2024-0142', date: '2024-12-10', duration: 'full', reason: 'Maladie',            excused: true,  certificateProvided: true,  subjectId: 's1' },
  { id: 'a6',  studentId: 'EMSI-2024-0142', date: '2024-12-11', duration: 'full', reason: 'Maladie',            excused: true,  certificateProvided: true,  subjectId: 's5' },
  { id: 'a7',  studentId: 'EMSI-2024-0142', date: '2025-01-08', duration: 'half', reason: 'Transport',          excused: false, certificateProvided: false, subjectId: 's6' },
  { id: 'a8',  studentId: 'EMSI-2024-0142', date: '2025-02-14', duration: 'full', reason: 'Famille',            excused: true,  certificateProvided: false, subjectId: 's2' },
  { id: 'a9',  studentId: 'EMSI-2024-0142', date: '2025-03-05', duration: 'half', reason: undefined,            excused: false, certificateProvided: false, subjectId: 's3' },
  { id: 'a10', studentId: 'EMSI-2024-0142', date: '2025-04-20', duration: 'full', reason: 'Maladie',            excused: true,  certificateProvided: true,  subjectId: 's4' },
]

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  { id: 't1',  studentId: 'EMSI-2024-0142', title: 'TP Tri Fusion',            description: 'Implémenter merge sort en Python avec analyse de complexité.', dueDate: '2024-10-25', subjectId: 's1', status: 'graded',    grade: 17,   submittedDate: '2024-10-24' },
  { id: 't2',  studentId: 'EMSI-2024-0142', title: 'Rapport SQL Avancé',       description: 'Rédiger un rapport sur les jointures et sous-requêtes.',        dueDate: '2024-11-01', subjectId: 's3', status: 'graded',    grade: 15,   submittedDate: '2024-10-31' },
  { id: 't3',  studentId: 'EMSI-2024-0142', title: 'Maquette UI React',        description: 'Créer une maquette Figma et l\'implémenter en React.',         dueDate: '2024-11-15', subjectId: 's2', status: 'graded',    grade: 19,   submittedDate: '2024-11-13' },
  { id: 't4',  studentId: 'EMSI-2024-0142', title: 'Étude de cas SCRUM',      description: 'Analyser un projet réel avec la méthodologie SCRUM.',           dueDate: '2024-11-20', subjectId: 's5', status: 'graded',    grade: 16,   submittedDate: '2024-11-19' },
  { id: 't5',  studentId: 'EMSI-2024-0142', title: 'Lab Pentest',             description: 'Réaliser un test de pénétration sur un environnement sandbox.', dueDate: '2025-01-15', subjectId: 's6', status: 'graded',    grade: 18,   submittedDate: '2025-01-14' },
  { id: 't6',  studentId: 'EMSI-2024-0142', title: 'Projet Microservices',    description: 'Concevoir une architecture microservices avec Docker.',          dueDate: '2025-02-28', subjectId: 's4', status: 'submitted', grade: undefined, submittedDate: '2025-02-26' },
  { id: 't7',  studentId: 'EMSI-2024-0142', title: 'Devoir Graphes NP-hard',  description: 'Démontrer la réduction du problème du sac à dos.',              dueDate: '2025-03-10', subjectId: 's1', status: 'overdue',   grade: undefined },
  { id: 't8',  studentId: 'EMSI-2024-0142', title: 'Mini-Projet API REST',    description: 'Développer une API REST complète avec authentification JWT.',  dueDate: '2025-04-05', subjectId: 's2', status: 'in_progress' },
  { id: 't9',  studentId: 'EMSI-2024-0142', title: 'Rapport Sécurité Réseau', description: 'Analyser les vulnérabilités d\'un réseau d\'entreprise simulé.', dueDate: '2025-04-20', subjectId: 's6', status: 'pending' },
  { id: 't10', studentId: 'EMSI-2024-0142', title: 'Optimisation BDD',        description: 'Optimiser les requêtes d\'une base de données existante.',      dueDate: '2025-04-30', subjectId: 's3', status: 'pending' },
  { id: 't11', studentId: 'EMSI-2024-0142', title: 'Plan de Projet PFE',      description: 'Rédiger le plan complet du projet de fin d\'études.',           dueDate: '2025-05-20', subjectId: 's5', status: 'in_progress' },
]

// ─── Teacher Feedback ────────────────────────────────────────────────────────

export const feedbacks: TeacherFeedback[] = [
  { id: 'f1',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Karimi',  subjectId: 's2', rating: 5, isPositive: true,  date: '2024-11-20', comment: 'Excellent travail sur le TP React. La composantisation est très propre et le code TypeScript est bien typé. Continuez ainsi !' },
  { id: 'f2',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Khaled',  subjectId: 's1', rating: 4, isPositive: true,  date: '2024-11-06', comment: 'Bonne compréhension des algorithmes de graphe. L\'analyse de complexité est correcte, mais pourrait être plus détaillée dans le rapport.' },
  { id: 'f3',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Ouarrari', subjectId: 's3', rating: 3, isPositive: false, date: '2024-12-01', comment: 'Les notions de base SQL sont acquises, mais les requêtes imbriquées manquent de précision. Revoir les sous-requêtes corrélées.' },
  { id: 'f4',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Benali',  subjectId: 's5', rating: 5, isPositive: true,  date: '2025-01-15', comment: 'Présentation SCRUM remarquable. Excellente maîtrise des cérémonies Agile et du Product Backlog. Très bonne participation en classe.' },
  { id: 'f5',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Nasri',   subjectId: 's4', rating: 3, isPositive: false, date: '2025-02-10', comment: 'Le rendu Docker est correct mais la configuration Kubernetes présente quelques erreurs. Des efforts supplémentaires sont nécessaires.' },
  { id: 'f6',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Tahiri',  subjectId: 's6', rating: 4, isPositive: true,  date: '2025-02-20', comment: 'Très bon lab de pentest. La méthodologie est rigoureuse et le rapport est bien structuré. Bon sens de l\'analyse des vulnérabilités.' },
  { id: 'f7',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Karimi',  subjectId: 's2', rating: 5, isPositive: true,  date: '2025-03-15', comment: 'Le projet full-stack est impressionnant. Architecture propre, bonnes pratiques respectées, et une belle UI. Excellent candidat pour le marché du travail.' },
  { id: 'f8',  studentId: 'EMSI-2024-0142', teacherName: 'Pr. Khaled',  subjectId: 's1', rating: 4, isPositive: true,  date: '2025-04-01', comment: 'Le projet algorithmique montre une vraie maturité. Les optimisations proposées sont pertinentes et bien argumentées.' },
]

export const mockGroups = [
  { id: 'g1',  name: 'G1',  description: 'Groupe 1' },
  { id: 'g2',  name: 'G2',  description: 'Groupe 2' },
  { id: 'g3',  name: 'G3',  description: 'Groupe 3' },
  { id: 'g4',  name: 'G4',  description: 'Groupe 4' },
  { id: 'g5',  name: 'G5',  description: 'Groupe 5' },
  { id: 'g6',  name: 'G6',  description: 'Groupe 6' },
  { id: 'g7',  name: 'G7',  description: 'Groupe 7' },
  { id: 'g8',  name: 'G8',  description: 'Groupe 8' },
  { id: 'g9',  name: 'G9',  description: 'Groupe 9' },
  { id: 'g10', name: 'G10', description: 'Groupe 10' },
]

export const mockGroupStudents = [
  { groupId: 'g1', studentId: 'EMSI-2024-0142', name: 'Abdessamad Abounouh' },
  { groupId: 'g1', studentId: 'demo-student-2', name: 'Yassine El Amrani' },
  { groupId: 'g1', studentId: 'demo-student-3', name: 'Sofia Benjelloun' },
  { groupId: 'g2', studentId: 'demo-student-4', name: 'Karim Alaoui' },
]

