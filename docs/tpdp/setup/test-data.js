/**
 * Datos de Prueba para Integración
 * 
 * Este archivo contiene conjuntos de datos predefinidos para usar en pruebas
 * de integración. Incluye usuarios, cursos, evaluaciones y escenarios completos.
 * 
 * @module test-data
 */

/**
 * Conjunto de usuarios estándar para pruebas
 * Cada usuario está diseñado para probar diferentes escenarios
 */
const STANDARD_USERS = {
  admin: {
    email: 'admin.test@eduplus.com',
    password: 'AdminTest123!',
    name: 'Test Administrator',
    role: 'admin',
    permissions: ['all']
  },
  
  instructor: {
    email: 'instructor.test@eduplus.com',
    password: 'InstructorTest123!',
    name: 'Test Instructor',
    role: 'instructor',
    bio: 'Instructor de prueba con experiencia en desarrollo web',
    expertise: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/test-instructor',
      github: 'https://github.com/test-instructor'
    }
  },
  
  student: {
    email: 'student.test@eduplus.com',
    password: 'StudentTest123!',
    name: 'Test Student',
    role: 'student',
    learningGoals: ['Aprender desarrollo web', 'Dominar JavaScript', 'Crear aplicaciones completas'],
    interests: ['programming', 'web-development', 'databases']
  },
  
  premiumStudent: {
    email: 'premium.student@eduplus.com',
    password: 'PremiumTest123!',
    name: 'Premium Test Student',
    role: 'student',
    subscription: 'premium',
    learningGoals: ['Convertirse en full-stack developer', 'Aprender arquitectura de software'],
    interests: ['programming', 'architecture', 'cloud-computing']
  }
};

/**
 * Conjunto de cursos estándar para pruebas
 * Cada curso representa un escenario de aprendizaje diferente
 */
const STANDARD_COURSES = {
  beginnerProgramming: {
    title: 'Programación para Principiantes',
    description: 'Aprende a programar desde cero con JavaScript',
    category: 'programming',
    level: 'beginner',
    duration: 240, // 4 horas en minutos
    price: 29.99,
    language: 'es',
    tags: ['javascript', 'beginner', 'fundamentals'],
    sections: [
      {
        title: 'Introducción a la Programación',
        content: 'Conceptos básicos de programación y lógica',
        order: 1,
        type: 'video',
        duration: 30,
        resources: [
          { type: 'video', url: 'intro-programming.mp4', duration: 25 },
          { type: 'pdf', url: 'intro-slides.pdf', pages: 15 }
        ]
      },
      {
        title: 'Variables y Tipos de Datos',
        content: 'Trabajando con datos en JavaScript',
        order: 2,
        type: 'interactive',
        duration: 45,
        exercises: [
          { type: 'coding', title: 'Declarar variables', difficulty: 'easy' },
          { type: 'quiz', title: 'Tipos de datos', questions: 5 }
        ]
      }
    ]
  },
  
  advancedReact: {
    title: 'React Avanzado: Hooks, Context y Performance',
    description: 'Domina React con técnicas avanzadas de desarrollo',
    category: 'programming',
    level: 'advanced',
    duration: 480, // 8 horas
    price: 149.99,
    language: 'es',
    tags: ['react', 'javascript', 'frontend', 'performance'],
    prerequisites: ['Conocimientos básicos de JavaScript', 'Experiencia con React'],
    sections: [
      {
        title: 'Hooks Avanzados',
        content: 'useEffect, useCallback, useMemo y custom hooks',
        order: 1,
        type: 'video',
        duration: 90,
        resources: [
          { type: 'video', url: 'advanced-hooks.mp4', duration: 80 },
          { type: 'code', url: 'hooks-examples.js', lines: 150 }
        ]
      },
      {
        title: 'Context API y State Management',
        content: 'Gestión avanzada del estado de aplicaciones',
        order: 2,
        type: 'project',
        duration: 120,
        project: {
          title: 'Sistema de notificaciones global',
          description: 'Implementar un sistema de notificaciones usando Context',
          requirements: ['Context API', 'Custom hooks', 'LocalStorage']
        }
      }
    ]
  },
  
  designThinking: {
    title: 'Design Thinking para Desarrolladores',
    description: 'Aprende a aplicar design thinking en proyectos de software',
    category: 'design',
    level: 'intermediate',
    duration: 180, // 3 horas
    price: 79.99,
    language: 'es',
    tags: ['design', 'ux', 'innovation', 'problem-solving'],
    sections: [
      {
        title: 'Fundamentos del Design Thinking',
        content: 'Introducción al proceso y metodología',
        order: 1,
        type: 'video',
        duration: 45
      },
      {
        title: 'Workshop Práctico',
        content: 'Aplicar design thinking a un problema real',
        order: 2,
        type: 'workshop',
        duration: 90,
        activities: [
          { type: 'empathy', title: 'Mapa de empatía' },
          { type: 'define', title: 'Definición del problema' },
          { type: 'ideate', title: 'Sesión de ideación' }
        ]
      }
    ]
  }
};

/**
 * Conjunto de evaluaciones estándar para pruebas
 */
const STANDARD_EVALUATIONS = {
  basicQuiz: {
    title: 'Quiz Básico de Programación',
    description: 'Evaluación de conocimientos fundamentales',
    type: 'multiple-choice',
    timeLimit: 20,
    passingScore: 70,
    totalQuestions: 10,
    questions: [
      {
        question: '¿Qué es una variable en programación?',
        options: [
          'Una función que no retorna valor',
          'Un contenedor para almacenar datos',
          'Un tipo de bucle',
          'Una condición booleana'
        ],
        correctAnswer: 1,
        points: 10,
        explanation: 'Las variables son contenedores que almacenan valores de datos'
      },
      {
        question: '¿Cuál es la diferencia entre == y === en JavaScript?',
        options: [
          'No hay diferencia',
          '== compara valor, === compara valor y tipo',
          '=== es más rápido que ==',
          '== solo funciona con strings'
        ],
        correctAnswer: 1,
        points: 15,
        explanation: '=== compara tanto el valor como el tipo de dato'
      }
    ]
  },
  
  comprehensiveExam: {
    title: 'Examen Integrador de React',
    description: 'Evaluación completa de conocimientos de React',
    type: 'multiple-choice',
    timeLimit: 60,
    passingScore: 80,
    totalQuestions: 25,
    questions: Array.from({ length: 25 }, (_, i) => ({
      question: `Pregunta ${i + 1} sobre React avanzado`,
      options: [
        'Opción A que podría ser correcta',
        'Opción B que parece razonable',
        'Opción C que es la respuesta correcta',
        'Opción D que es una distracción'
      ],
      correctAnswer: 2,
      points: 4,
      difficulty: i < 10 ? 'easy' : i < 20 ? 'medium' : 'hard'
    }))
  },
  
  practicalProject: {
    title: 'Proyecto Práctico: Aplicación Todo',
    description: 'Crea una aplicación de lista de tareas usando React',
    type: 'practical',
    timeLimit: 120,
    passingScore: 75,
    instructions: 'Crea una aplicación de lista de tareas (Todo App) con las siguientes características:',
    requirements: [
      'Agregar nuevas tareas',
      'Marcar tareas como completadas',
      'Eliminar tareas',
      'Filtrar tareas por estado',
      'Persistencia en localStorage'
    ],
    testCases: [
      {
        input: 'Add task: "Buy groceries"',
        expectedOutput: 'Task added successfully',
        expectedState: { tasks: [{ id: 1, text: "Buy groceries", completed: false }] }
      },
      {
        input: 'Toggle task completion',
        expectedOutput: 'Task marked as completed',
        expectedState: { tasks: [{ id: 1, text: "Buy groceries", completed: true }] }
      }
    ],
    evaluationCriteria: [
      { criterion: 'Funcionalidad', weight: 40 },
      { criterion: 'Código limpio', weight: 25 },
      { criterion: 'UI/UX', weight: 20 },
      { criterion: 'Testing', weight: 15 }
    ]
  }
};

/**
 * Escenarios completos de prueba
 * Combina usuarios, cursos y evaluaciones en flujos específicos
 */
const TEST_SCENARIOS = {
  beginnerLearningPath: {
    name: 'Ruta de Aprendizaje para Principiantes',
    description: 'Un estudiante principiante completa un curso básico',
    users: [STANDARD_USERS.student],
    courses: [STANDARD_COURSES.beginnerProgramming],
    evaluations: [STANDARD_EVALUATIONS.basicQuiz],
    expectedFlow: [
      'Registro de estudiante',
      'Inscripción en curso básico',
      'Progreso a través de secciones',
      'Presentación de evaluación',
      'Generación de certificado'
    ]
  },
  
  instructorCreatesCourse: {
    name: 'Instructor Crea Curso Completo',
    description: 'Un instructor crea y publica un curso con evaluaciones',
    users: [STANDARD_USERS.instructor],
    courses: [STANDARD_COURSES.advancedReact],
    evaluations: [STANDARD_EVALUATIONS.comprehensiveExam],
    expectedFlow: [
      'Registro de instructor',
      'Creación de curso con secciones',
      'Publicación de curso',
      'Creación de evaluación',
      'Publicación de evaluación',
      'Monitoreo de estudiantes inscritos'
    ]
  },
  
  premiumStudentExperience: {
    name: 'Experiencia Premium',
    description: 'Un estudiante premium accede a contenido avanzado',
    users: [STANDARD_USERS.premiumStudent],
    courses: [STANDARD_COURSES.advancedReact, STANDARD_COURSES.designThinking],
    evaluations: [STANDARD_EVALUATIONS.comprehensiveExam, STANDARD_EVALUATIONS.practicalProject],
    expectedFlow: [
      'Registro de estudiante premium',
      'Acceso a cursos avanzados',
      'Progreso en múltiples cursos',
      'Evaluaciones complejas',
      'Certificados premium',
      'Acceso a recursos exclusivos'
    ]
  }
};

/**
 * Datos de prueba para casos edge y límites
 */
const EDGE_CASE_DATA = {
  // Usuarios con datos extremos
  longNameUser: {
    email: 'very.long.email.address.for.testing.purposes@eduplus.com',
    password: 'ThisIsAVeryLongPassword123!@#$%^&*()_+{}[]|\\:;\"<>?,./',
    name: 'Este es un nombre extremadamente largo que probablemente exceda los límites normales de caracteres en la base de datos y debería ser manejado apropiadamente',
    role: 'student'
  },
  
  specialCharactersUser: {
    email: 'test.user+tag@subdomain.eduplus.com',
    password: 'P@$$w0rd!#$%&/()=?¡¿',
    name: 'José María García-López',
    role: 'instructor',
    bio: 'Experto en "JavaScript" y \'React\' con conocimientos de <HTML> & CSS'
  },
  
  // Cursos con datos límite
  minimalCourse: {
    title: 'A',
    description: 'B',
    category: 'test',
    level: 'beginner',
    duration: 1,
    price: 0.01,
    language: 'es'
  },
  
  maximumCourse: {
    title: 'A'.repeat(500), // 500 caracteres
    description: 'B'.repeat(2000), // 2000 caracteres
    category: 'programming',
    level: 'advanced',
    duration: 9999, // Casi 7 días
    price: 999999.99,
    language: 'es',
    sections: Array.from({ length: 100 }, (_, i) => ({
      title: `Sección ${i + 1}`,
      content: 'Contenido de la sección',
      order: i + 1,
      type: 'video',
      duration: 999
    }))
  },
  
  // Evaluaciones extremas
  zeroQuestionEvaluation: {
    title: 'Evaluación sin preguntas',
    description: 'Esta evaluación no tiene preguntas',
    type: 'multiple-choice',
    timeLimit: 1,
    passingScore: 0,
    totalQuestions: 0,
    questions: []
  },
  
  manyQuestionsEvaluation: {
    title: 'Evaluación con muchas preguntas',
    description: 'Evaluación con 100 preguntas',
    type: 'multiple-choice',
    timeLimit: 300,
    passingScore: 50,
    totalQuestions: 100,
    questions: Array.from({ length: 100 }, (_, i) => ({
      question: `Pregunta ${i + 1}: ¿Cuál es la respuesta correcta?`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: Math.floor(Math.random() * 4),
      points: 1
    }))
  }
};

/**
 * Datos para pruebas de rendimiento
 */
const PERFORMANCE_TEST_DATA = {
  bulkUsers: Array.from({ length: 100 }, (_, i) => ({
    email: `performance.user${i}@eduplus.com`,
    password: 'Performance123!',
    name: `Performance User ${i}`,
    role: 'student'
  })),
  
  bulkCourses: Array.from({ length: 50 }, (_, i) => ({
    title: `Curso de Rendimiento ${i + 1}`,
    description: `Descripción del curso ${i + 1} para pruebas de rendimiento`,
    category: ['programming', 'design', 'business'][i % 3],
    level: ['beginner', 'intermediate', 'advanced'][i % 3],
    duration: (i + 1) * 10,
    price: (i + 1) * 10.99,
    language: 'es'
  }))
};

/**
 * Exportar todos los conjuntos de datos
 */
module.exports = {
  STANDARD_USERS,
  STANDARD_COURSES,
  STANDARD_EVALUATIONS,
  TEST_SCENARIOS,
  EDGE_CASE_DATA,
  PERFORMANCE_TEST_DATA
};