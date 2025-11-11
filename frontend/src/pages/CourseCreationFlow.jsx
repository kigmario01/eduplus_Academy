import React, { useState } from 'react';
import CourseCreationForm from '../components/CourseCreationForm';
import ExamCreationForm from '../components/ExamCreationForm';
import './CourseCreationFlow.css';

const CourseCreationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState(null);
  const [examCreated, setExamCreated] = useState(false);

  const steps = [
    { id: 1, title: 'Crear Curso', description: 'Información básica del curso' },
    { id: 2, title: 'Crear Examen', description: 'Evaluación del curso' },
    { id: 3, title: 'Configurar Certificación', description: 'Requisitos de certificación' }
  ];

  const handleCourseCreated = (data) => {
    setCourseData(data);
    setCurrentStep(2);
  };

  const handleExamCreated = () => {
    setExamCreated(true);
    setCurrentStep(3);
  };

  const handleCertificationCreated = () => {
    // Redirigir al dashboard del instructor
    window.location.href = '/instructor/dashboard';
  };

  return (
    <div className="course-creation-flow">
      <div className="progress-header">
        <h1>Crear Nuevo Curso</h1>
        <div className="progress-bar">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="creation-content">
        {currentStep === 1 && (
          <div className="step-content">
            <h2>Paso 1: Crear Curso</h2>
            <p className="step-description">
              Complete la información básica del curso. Use enlaces de YouTube para el contenido principal
              y texto para el material complementario.
            </p>
            <CourseCreationForm onCourseCreated={handleCourseCreated} />
          </div>
        )}

        {currentStep === 2 && courseData && (
          <div className="step-content">
            <h2>Paso 2: Crear Examen</h2>
            <p className="step-description">
              Cree un examen para evaluar el conocimiento de los estudiantes. Asegúrese de que todas
              las preguntas tengan respuestas correctas definidas.
            </p>
            <ExamCreationForm
              courseId={courseData.id}
              onExamCreated={handleExamCreated}
            />
          </div>
        )}

        {currentStep === 3 && courseData && examCreated && (
          <div className="step-content">
            <h2>Paso 3: Configurar Certificación</h2>
            <p className="step-description">
              Configure los requisitos mínimos para que los estudiantes obtengan la certificación.
            </p>
            <div className="certification-summary">
              <div className="summary-card">
                <h3>Resumen del Curso</h3>
                <p><strong>Título:</strong> {courseData.title}</p>
                <p><strong>ID:</strong> {courseData.id}</p>
                <p><strong>Estado:</strong> Borrador</p>
              </div>
              
              <div className="certification-options">
                <h3>Opciones de Certificación</h3>
                <div className="option-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Requerir aprobación del examen (70% mínimo)
                  </label>
                </div>
                <div className="option-group">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Requerir 80% de completitud del curso
                  </label>
                </div>
                <div className="option-group">
                  <label>
                    <input type="checkbox" />
                    Establecer límite de tiempo para el examen
                  </label>
                </div>
              </div>

              <div className="actions">
                <button
                  onClick={handleCertificationCreated}
                  className="primary-btn"
                >
                  Finalizar y Publicar Curso
                </button>
                <button
                  onClick={() => window.location.href = '/instructor/dashboard'}
                  className="secondary-btn"
                >
                  Guardar como Borrador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCreationFlow;