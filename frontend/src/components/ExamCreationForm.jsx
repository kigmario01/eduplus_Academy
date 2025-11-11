import React, { useState } from 'react';
import { courseCreationAPI } from '../services/courseCreationAPI';
import './ExamCreationForm.css';

function ExamCreationForm({ courseId, onExamCreated }) {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    passingScore: 70,
    questions: [
      { text: '', options: { A: '', B: '', C: '' }, correctOption: '' },
    ],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setExamData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: { A: '', B: '', C: '' }, correctOption: '' }],
    }));
  };

  const removeQuestion = (index) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestionText = (index, value) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, text: value } : q)),
    }));
  };

  const updateOption = (index, key, value) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, options: { ...q.options, [key]: value } } : q
      ),
    }));
  };

  const setCorrectOption = (index, value) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? { ...q, correctOption: value } : q)),
    }));
  };

  const validate = () => {
    if (!examData.title || examData.title.trim().length < 3) return 'El título es obligatorio.';
    if (!courseId) return 'Falta el ID del curso.';
    if (!Number.isFinite(examData.passingScore) || examData.passingScore < 1 || examData.passingScore > 100)
      return 'La puntuación mínima debe estar entre 1 y 100.';
    if (!examData.questions || examData.questions.length < 5)
      return 'El examen debe tener al menos 5 preguntas.';
    for (const q of examData.questions) {
      if (!q.text || q.text.trim().length < 5) return 'Cada pregunta debe tener un enunciado válido.';
      if (!q.options?.A || !q.options?.B || !q.options?.C) return 'Cada pregunta requiere opciones A, B y C.';
      if (!q.correctOption || !['A', 'B', 'C'].includes(q.correctOption))
        return 'Cada pregunta debe tener una respuesta correcta (A, B o C).';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: examData.title.trim(),
        description: examData.description.trim(),
        passing_score: examData.passingScore,
        questions: examData.questions.map((q, idx) => ({
          order: idx + 1,
          text: q.text.trim(),
          options: [
            { key: 'A', text: q.options.A.trim() },
            { key: 'B', text: q.options.B.trim() },
            { key: 'C', text: q.options.C.trim() },
          ],
          correct_option: q.correctOption,
        })),
      };
      await courseCreationAPI.createExam(courseId, payload);
      setSuccess('Examen creado correctamente.');
      if (typeof onExamCreated === 'function') onExamCreated();
    } catch (err) {
      setError('Error al crear el examen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="exam-creation-form" onSubmit={handleSubmit}>
      <h3>Configuración del Examen</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="exam-title">Título *</label>
          <input
            id="exam-title"
            type="text"
            value={examData.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={200}
            placeholder="Título del examen"
          />
        </div>

        <div className="form-group">
          <label htmlFor="exam-description">Descripción</label>
          <textarea
            id="exam-description"
            value={examData.description}
            onChange={(e) => updateField('description', e.target.value)}
            maxLength={2000}
            placeholder="Descripción del examen"
          />
        </div>

        <div className="form-group">
          <label htmlFor="passing-score">Puntuación mínima (%) *</label>
          <input
            id="passing-score"
            type="number"
            min={1}
            max={100}
            value={examData.passingScore}
            onChange={(e) => updateField('passingScore', Number(e.target.value))}
          />
          <small>Los estudiantes deben alcanzar esta puntuación para aprobar.</small>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h4>Preguntas</h4>
          <button type="button" className="add-btn" onClick={addQuestion}>+ Añadir Pregunta</button>
        </div>

        {examData.questions.map((q, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <h5>Pregunta {index + 1}</h5>
              {examData.questions.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeQuestion(index)}>×</button>
              )}
            </div>

            <div className="form-group">
              <label>Enunciado *</label>
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestionText(index, e.target.value)}
                maxLength={500}
                placeholder="Ingrese el enunciado de la pregunta"
              />
            </div>

            <div className="options-grid">
              <div className="form-group">
                <label>Opción A *</label>
                <input
                  type="text"
                  value={q.options.A}
                  onChange={(e) => updateOption(index, 'A', e.target.value)}
                  maxLength={300}
                />
              </div>
              <div className="form-group">
                <label>Opción B *</label>
                <input
                  type="text"
                  value={q.options.B}
                  onChange={(e) => updateOption(index, 'B', e.target.value)}
                  maxLength={300}
                />
              </div>
              <div className="form-group">
                <label>Opción C *</label>
                <input
                  type="text"
                  value={q.options.C}
                  onChange={(e) => updateOption(index, 'C', e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Respuesta Correcta *</label>
              <select
                value={q.correctOption}
                onChange={(e) => setCorrectOption(index, e.target.value)}
              >
                <option value="">Seleccione</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Creando Examen...' : 'Crear Examen'}
        </button>
        <button type="button" className="cancel-btn" disabled={submitting} onClick={() => window.history.back()}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ExamCreationForm;