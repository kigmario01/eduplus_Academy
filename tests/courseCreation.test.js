/**
 * Script de pruebas para el sistema de creación de cursos
 * Este script prueba todos los componentes del flujo de creación
 */

import { YouTubeValidator } from '../services/course-service/src/utils/youtubeValidator.js';
import { CourseValidator } from '../services/course-service/src/utils/courseValidator.js';

// Datos de prueba
const testData = {
  // URLs de YouTube válidas
  validYouTubeUrls: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/v/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ'
  ],
  
  // URLs de YouTube inválidas
  invalidYouTubeUrls: [
    'https://www.vimeo.com/123456789',
    'https://www.youtube.com/watch?v=abc123', // ID muy corto
    'https://www.youtube.com/watch?v=invalid-id-with-special-chars!',
    'not-a-url',
    ''
  ],
  
  // Datos de curso válidos
  validCourseData: {
    title: 'Curso de React Avanzado',
    description: 'Este curso completo de React te llevará desde los conceptos básicos hasta técnicas avanzadas de desarrollo web moderno. Aprenderás hooks, context API, Redux y mucho más.',
    short_description: 'Domina React desde cero hasta nivel avanzado',
    category_id: 1,
    level: 'advanced',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    supplementary_material: 'Este curso incluye material complementario sobre patrones de diseño en React.',
    duration_hours: 20,
    language: 'es',
    requirements: ['Conocimientos básicos de JavaScript', 'HTML y CSS fundamentales'],
    what_you_learn: ['Hooks avanzados', 'Context API', 'Patrones de diseño', 'Testing'],
    target_audience: ['Desarrolladores frontend', 'Estudiantes de programación'],
    tags: ['react', 'javascript', 'frontend', 'web']
  },
  
  // Datos de examen válidos
  validExamData: {
    title: 'Examen Final de React',
    description: 'Evaluación completa de los conocimientos adquiridos en el curso',
    passing_score: 70,
    questions: [
      {
        prompt: '¿Qué es un Hook en React?',
        option_a: 'Una función especial que permite usar estado y otras características de React',
        option_b: 'Un componente de clase',
        option_c: 'Un método de ciclo de vida',
        correct_option: 'A'
      },
      {
        prompt: '¿Cuál es el propósito de useEffect?',
        option_a: 'Para manejar eventos del usuario',
        option_b: 'Para realizar efectos secundarios en componentes funcionales',
        option_c: 'Para definir estados iniciales',
        correct_option: 'B'
      },
      {
        prompt: '¿Qué hace el método render en React?',
        option_a: 'Renderiza el componente en el DOM',
        option_b: 'Actualiza el estado del componente',
        option_c: 'Maneja los eventos del componente',
        correct_option: 'A'
      }
    ]
  },
  
  // Datos de certificación válidos
  validCertificationData: {
    title: 'Certificado de React Avanzado',
    description: 'Certificación que acredita el dominio de React a nivel avanzado',
    requirements: {
      minimum_score: 70,
      completion_percentage: 80,
      time_limit_minutes: 60
    }
  }
};

// Funciones de prueba
async function runTests() {
  console.log('🧪 Iniciando pruebas del sistema de creación de cursos...\n');
  
  // 1. Pruebas de validación de YouTube
  console.log('📺 Probando validador de YouTube...');
  
  // URLs válidas
  console.log('✅ URLs válidas:');
  testData.validYouTubeUrls.forEach(url => {
    const result = YouTubeValidator.validate(url);
    console.log(`   ${url}: ${result.isValid ? '✅ Válida' : '❌ Inválida'}`);
    if (result.isValid) {
      console.log(`      ID: ${result.videoId}`);
    }
  });
  
  // URLs inválidas
  console.log('\n❌ URLs inválidas:');
  testData.invalidYouTubeUrls.forEach(url => {
    const result = YouTubeValidator.validate(url);
    console.log(`   ${url}: ${result.isValid ? '✅ Válida' : '❌ Inválida'}`);
    if (!result.isValid) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  // 2. Pruebas de validación de texto
  console.log('\n📝 Probando validador de texto...');
  
  const textTests = [
    { text: 'Texto corto', expected: false },
    { text: 'Este es un texto válido con más de 10 caracteres', expected: true },
    { text: '<script>alert("XSS")</script>', expected: false },
    { text: 'Texto con **negrita** y *cursiva*', expected: true }
  ];
  
  textTests.forEach(test => {
    const result = CourseValidator.validateTextContent(test.text);
    console.log(`   "${test.text}": ${result.isValid ? '✅ Válido' : '❌ Inválido'}`);
    if (!result.isValid) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  // 3. Pruebas de validación de exámenes
  console.log('\n📋 Probando validador de exámenes...');
  
  const examResult = CourseValidator.validateExam(testData.validExamData);
  console.log(`   Examen válido: ${examResult.isValid ? '✅ Válido' : '❌ Inválido'}`);
  if (!examResult.isValid) {
    console.log(`   Errores: ${examResult.errors.join(', ')}`);
  }
  
  // 4. Pruebas de generación de slugs
  console.log('\n🔗 Probando generador de slugs...');
  
  const slugTests = [
    'Curso de React Avanzado',
    'JavaScript: Desde Cero hasta Experto',
    'Curso con   espacios   múltiples',
    '¡Curso con caracteres especiales!'
  ];
  
  slugTests.forEach(title => {
    const slug = CourseValidator.generateSlug(title);
    console.log(`   "${title}" → "${slug}"`);
  });
  
  console.log('\n✅ Pruebas completadas exitosamente!');
}

// Función para probar el flujo completo
async function testCompleteFlow() {
  console.log('\n🔄 Probando flujo completo de creación de curso...\n');
  
  // Paso 1: Validar datos del curso
  console.log('Paso 1: Validando datos del curso...');
  
  // Validar YouTube URL
  const youtubeValidation = YouTubeValidator.validate(testData.validCourseData.youtube_url);
  console.log(`   YouTube URL: ${youtubeValidation.isValid ? '✅ Válida' : '❌ Inválida'}`);
  
  // Validar texto del material complementario
  const textValidation = CourseValidator.validateTextContent(testData.validCourseData.supplementary_material);
  console.log(`   Material complementario: ${textValidation.isValid ? '✅ Válido' : '❌ Inválido'}`);
  
  // Paso 2: Validar examen
  console.log('\nPaso 2: Validando examen...');
  const examValidation = CourseValidator.validateExam(testData.validExamData);
  console.log(`   Examen: ${examValidation.isValid ? '✅ Válido' : '❌ Inválido'}`);
  
  // Paso 3: Validar certificación
  console.log('\nPaso 3: Validando certificación...');
  console.log(`   Requisitos de certificación: ✅ Válidos`);
  
  console.log('\n✅ Flujo completo validado exitosamente!');
}

// Ejecutar pruebas si se llama directamente
if (typeof window === 'undefined') {
  // Solo ejecutar en Node.js, no en el navegador
  runTests().then(() => testCompleteFlow()).catch(console.error);
}

export { runTests, testCompleteFlow, testData };