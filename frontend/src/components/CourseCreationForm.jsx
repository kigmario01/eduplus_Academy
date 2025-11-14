import React, { useState, useEffect } from 'react';
import { courseCreationAPI } from '../services/courseCreationAPI';
import { youtubeValidator } from '../utils/youtubeValidator';
import { textValidator } from '../utils/textValidator';
import './CourseCreationForm.css';

const CourseCreationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    level: 'beginner',
    youtube_url: '',
    supplementary_material: '',
    thumbnail_url: '',
    duration_hours: 1,
    language: 'es',
    requirements: [''],
    what_you_learn: [''],
    target_audience: [''],
    tags: ['']
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar categorías al montar el componente
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await courseCreationAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    handleInputChange(field, newArray);
  };

  const addArrayItem = (field) => {
    const newArray = [...formData[field], ''];
    handleInputChange(field, newArray);
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    handleInputChange(field, newArray);
  };

  const validateYouTubeUrl = (url) => {
    const validation = youtubeValidator.validate(url);
    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        youtube_url: validation.error
      }));
    }
    return validation.isValid;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar título
    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }
    if (formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
    }

    // Validar descripción
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }
    if (formData.description.length > 5000) {
      newErrors.description = 'La descripción no puede exceder 5000 caracteres';
    }

    // Validar categoría
    if (!formData.category_id) {
      newErrors.category_id = 'Debe seleccionar una categoría';
    }

    // Validar duración
    if (!formData.duration_hours || formData.duration_hours < 1) {
      newErrors.duration_hours = 'La duración debe ser al menos 1 hora';
    }
    if (formData.duration_hours > 200) {
      newErrors.duration_hours = 'La duración no puede exceder 200 horas';
    }

    // Validar URL de YouTube
    if (!formData.youtube_url) {
      newErrors.youtube_url = 'El enlace de YouTube es requerido';
    } else {
      const validation = youtubeValidator.validate(formData.youtube_url);
      if (!validation.isValid) {
        newErrors.youtube_url = validation.error;
      }
    }

    // Validar material complementario
    if (formData.supplementary_material) {
      const textValidation = textValidator.validate(formData.supplementary_material);
      if (!textValidation.isValid) {
        newErrors.supplementary_material = textValidation.error;
      }
    }

    // Validar URL de miniatura si se proporciona
    if (formData.thumbnail_url) {
      try {
        new URL(formData.thumbnail_url);
      } catch {
        newErrors.thumbnail_url = 'La URL de la miniatura debe ser válida';
      }
    }

    // Validar arrays
    const validateArray = (field, minLength = 1, maxLength = 500) => {
      if (formData[field].some(item => item && item.length > maxLength)) {
        newErrors[field] = `Cada elemento no puede exceder ${maxLength} caracteres`;
      }
    };

    validateArray('requirements', 1, 500);
    validateArray('what_you_learn', 1, 500);
    validateArray('target_audience', 1, 500);
    validateArray('tags', 1, 50);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      // Filtrar arrays para eliminar elementos vacíos
      const filteredData = {
        ...formData,
        requirements: formData.requirements.filter(item => item.trim() !== ''),
        what_you_learn: formData.what_you_learn.filter(item => item.trim() !== ''),
        target_audience: formData.target_audience.filter(item => item.trim() !== ''),
        tags: formData.tags.filter(item => item.trim() !== '')
      };

      const response = await courseCreationAPI.createCourse(filteredData);
      
      setSuccessMessage('¡Curso creado exitosamente!');
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          short_description: '',
          category_id: '',
          level: 'beginner',
          youtube_url: '',
          supplementary_material: '',
          thumbnail_url: '',
          duration_hours: 1,
          language: 'es',
          requirements: [''],
          what_you_learn: [''],
          target_audience: [''],
          tags: ['']
        });
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('Error al crear curso:', error);
      
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          apiErrors[err.field] = err.message;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Error al crear el curso' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="course-creation-form">
      <h2>Crear Nuevo Curso</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-group">
            <label htmlFor="title">Título del Curso *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ingrese el título del curso"
              maxLength="200"
            />
            {errors.title && <span className="error">{errors.title}</span>}
            <small>{formData.title.length}/200 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describa detalladamente el contenido del curso"
              rows="6"
              maxLength="5000"
            />
            {errors.description && <span className="error">{errors.description}</span>}
            <small>{formData.description.length}/5000 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="short_description">Descripción Corta</label>
            <textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Una breve descripción del curso"
              rows="2"
              maxLength="500"
            />
            {errors.short_description && <span className="error">{errors.short_description}</span>}
            <small>{formData.short_description.length}/500 caracteres</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Categoría *</label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="error">{errors.category_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="level">Nivel *</label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration_hours">Duración (horas) *</label>
              <input
                type="number"
                id="duration_hours"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange('duration_hours', parseInt(e.target.value))}
                min="1"
                max="200"
              />
              {errors.duration_hours && <span className="error">{errors.duration_hours}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="language">Idioma</label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contenido del Curso</h3>
          
          <div className="form-group">
            <label htmlFor="youtube_url">Enlace de YouTube Principal *</label>
            <input
              type="url"
              id="youtube_url"
              value={formData.youtube_url}
              onChange={(e) => handleInputChange('youtube_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {errors.youtube_url && <span className="error">{errors.youtube_url}</span>}
            <small>El video principal del curso debe estar en YouTube</small>
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail_url">URL de Miniatura (opcional)</label>
            <input
              type="url"
              id="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {errors.thumbnail_url && <span className="error">{errors.thumbnail_url}</span>}
            <small>Si no proporciona una URL, se usará la miniatura de YouTube</small>
          </div>

          <div className="form-group">
            <label htmlFor="supplementary_material">Material Complementario</label>
            <textarea
              id="supplementary_material"
              value={formData.supplementary_material}
              onChange={(e) => handleInputChange('supplementary_material', e.target.value)}
              placeholder="Material adicional en formato de texto (Markdown/HTML permitido)"
              rows="8"
              maxLength="10000"
            />
            {errors.supplementary_material && <span className="error">{errors.supplementary_material}</span>}
            <small>{formData.supplementary_material.length}/10000 caracteres</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Requisitos y Objetivos</h3>
          
          <div className="form-group">
            <label>Requisitos del Curso</label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  placeholder={`Requisito ${index + 1}`}
                  maxLength="500"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="add-btn"
            >
              + Agregar Requisito
            </button>
            {errors.requirements && <span className="error">{errors.requirements}</span>}
          </div>

          <div className="form-group">
            <label>¿Qué aprenderán los estudiantes?</label>
            {formData.what_you_learn.map((item, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('what_you_learn', index, e.target.value)}
                  placeholder={`Aprendizaje ${index + 1}`}
                  maxLength="500"
                />
                {formData.what_you_learn.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('what_you_learn', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('what_you_learn')}
              className="add-btn"
            >
              + Agregar Aprendizaje
            </button>
            {errors.what_you_learn && <span className="error">{errors.what_you_learn}</span>}
          </div>

          <div className="form-group">
            <label>Público Objetivo</label>
            {formData.target_audience.map((audience, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => handleArrayChange('target_audience', index, e.target.value)}
                  placeholder={`Público ${index + 1}`}
                  maxLength="500"
                />
                {formData.target_audience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('target_audience', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('target_audience')}
              className="add-btn"
            >
              + Agregar Público
            </button>
            {errors.target_audience && <span className="error">{errors.target_audience}</span>}
          </div>

          <div className="form-group">
            <label>Etiquetas</label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="array-input">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder={`Etiqueta ${index + 1}`}
                  maxLength="50"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              className="add-btn"
            >
              + Agregar Etiqueta
            </button>
            {errors.tags && <span className="error">{errors.tags}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? 'Creando Curso...' : 'Crear Curso'}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreationForm;