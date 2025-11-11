import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseApi as api, initCsrf } from '@/lib/api';

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [draftId, setDraftId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const autosaveTimer = useRef(null);
  const [notice, setNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category_id: '',
    level: 'beginner',
    language: 'es',
    thumbnail_url: '',
    preview_video_url: '',
    requirements: [''],
    what_you_learn: [''],
    target_audience: [''],
    duration_hours: 1,
    tags: []
  });

  useEffect(() => {
    initCsrf();
    fetchCategories();
    if (isEditing) {
      fetchCourse();
    } else {
      const saved = localStorage.getItem('courseDraft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
          setDraftId(parsed?.id || null);
        } catch {}
      }
    }
    autosaveTimer.current = setInterval(() => {
      handleAutosave();
    }, 12000);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      
      // La API devuelve {success: true, data: [...]}
      const categoriesData = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : response?.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback a categorías básicas si la API falla
      setCategories([
        { id: 1, name: 'Programación', color: '#3B82F6' },
        { id: 2, name: 'Diseño', color: '#8B5CF6' },
        { id: 3, name: 'Negocios', color: '#10B981' }
      ]);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      
      if (response.data) {
        const course = response.data;
        setFormData({
          title: course.title || '',
          short_description: course.short_description || '',
          description: course.description || '',
          category_id: course.category_id || '',
          level: course.level || 'beginner',
          language: course.language || 'es',
          thumbnail_url: course.thumbnail_url || '',
          preview_video_url: course.preview_video_url || '',
          requirements: course.requirements || [''],
          what_you_learn: course.what_you_learn || [''],
          target_audience: course.target_audience || ['']
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Error al cargar los datos del curso');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    validateField(name, type === 'number' ? parseFloat(value) || 0 : value);
  };

  const validateField = (name, value) => {
    let message = '';
    switch (name) {
      case 'title':
        if (!value || value.length < 5) message = 'El título debe tener al menos 5 caracteres.';
        break;
      case 'description':
        if (!value || value.length < 50) message = 'La descripción debe tener al menos 50 caracteres.';
        break;
      case 'category_id':
        if (!value) message = 'Selecciona una categoría.';
        break;
      case 'duration_hours':
        if (!value || value < 1) message = 'La duración debe ser al menos 1 hora.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: message }));
    return !message;
  };

  const validateAll = () => {
    const fields = ['title', 'description', 'category_id', 'duration_hours'];
    const res = fields.map(f => validateField(f, formData[f]));
    return res.every(Boolean);
  };

  // Subida local de imagen para thumbnail
  const handleThumbnailFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, thumbnail_url: 'Formato inválido. Usa JPG, PNG o WebP.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, thumbnail_url: 'Imagen demasiado grande (máx 2MB).' }));
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const response = await api.post('/courses/upload/thumbnail', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = response?.data?.url;
      if (url) {
        setFormData(prev => ({ ...prev, thumbnail_url: url }));
        setErrors(prev => ({ ...prev, thumbnail_url: '' }));
      } else {
        alert('No se recibió URL de imagen subida');
      }
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag) => {
    if (!tag) return;
    setFormData(prev => ({ ...prev, tags: Array.from(new Set([...(prev.tags || []), tag.trim()])) }));
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
  };

  const handleAutosave = async () => {
    try {
      localStorage.setItem('courseDraft', JSON.stringify({ ...formData, id: draftId }));
      if (!validateAll()) return;
      const payload = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
        what_you_learn: formData.what_you_learn.filter(r => r.trim()),
        target_audience: formData.target_audience.filter(r => r.trim())
      };
      if (draftId) {
        await api.put(`/courses/${draftId}`, payload);
        setNotice('Borrador guardado automáticamente');
      } else {
        const resp = await api.post('/courses', payload);
        const newId = resp?.data?.data?.id || resp?.data?.id || null;
        if (newId) setDraftId(newId);
        setNotice('Borrador creado y guardado');
      }
    } catch (e) {
      console.warn('Autosave error:', e?.message || e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateAll()) {
        setLoading(false);
        setNotice('Corrige los errores antes de guardar.');
        return;
      }
      // Filtrar arrays vacíos
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        what_you_learn: formData.what_you_learn.filter(learn => learn.trim()),
        target_audience: formData.target_audience.filter(audience => audience.trim())
      };

      let response;
      if (isEditing) {
        // Actualizar curso existente
        response = await api.put(`/courses/${id}`, cleanedData);
      } else {
        // Crear nuevo curso
        response = await api.post('/courses', cleanedData);
      }

      if (response.data) {
        console.log('Course saved successfully:', response.data);
        setNotice('Curso guardado correctamente');
        const savedId = response?.data?.data?.id || response?.data?.id || draftId || id;
        if (savedId) setDraftId(savedId);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      // TODO: Mostrar mensaje de error al usuario
      alert(isEditing ? 'Error al actualizar el curso' : 'Error al crear el curso');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const targetId = isEditing ? id : draftId;
      if (!targetId) {
        alert('Primero guarda el curso para obtener un ID.');
        return;
      }
      if (!validateAll()) {
        alert('Corrige los errores antes de publicar.');
        return;
      }
      const ok = confirm('¿Deseas publicar este curso?');
      if (!ok) return;
      const resp = await api.patch(`/courses/${targetId}/status`, { status: 'published' });
      if (resp?.data?.success) {
        setNotice('Curso publicado exitosamente');
        const courseId = resp?.data?.data?.id || targetId;
        navigate(`/courses/${courseId}`);
      } else {
        alert('No se pudo publicar el curso');
      }
    } catch (e) {
      alert(`Error al publicar: ${e?.message || e}`);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing ? 'Actualiza la información de tu curso' : 'Completa la información para crear tu curso'}
        </p>
        <div aria-live="polite" className="sr-only">{notice || ''}</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Curso *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Ej: Introducción a React para Principiantes"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Corta
              </label>
              <input
                type="text"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Descripción breve que aparecerá en las tarjetas de curso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            {/* Campo de precio/moneda eliminado */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="fr">Francés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Completa *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Describe detalladamente el contenido del curso, objetivos, metodología..."
            />
          </div>
        </div>

        {/* Multimedia */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Multimedia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de Portada (subir desde tu equipo)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFile}
                  className="w-full"
                />
                {formData.thumbnail_url && (
                  <img
                    src={formData.thumbnail_url}
                    alt="Portada del curso"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Video de Vista Previa
              </label>
              <input
                type="url"
                name="preview_video_url"
                value={formData.preview_video_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Requisitos</h2>
          
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={requirement}
                onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Ej: Conocimientos básicos de HTML"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('requirements', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addArrayItem('requirements')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Agregar Requisito
          </button>
        </div>

        {/* Lo que aprenderás */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Lo que aprenderás</h2>
          
          {formData.what_you_learn.map((item, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('what_you_learn', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Ej: Crear aplicaciones web con React"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('what_you_learn', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addArrayItem('what_you_learn')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Agregar Objetivo de Aprendizaje
          </button>
        </div>

        {/* Audiencia objetivo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Audiencia Objetivo</h2>
          
          {formData.target_audience.map((audience, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={audience}
                onChange={(e) => handleArrayChange('target_audience', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Ej: Desarrolladores que quieren aprender React"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('target_audience', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addArrayItem('target_audience')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Agregar Audiencia
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/instructor')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Curso' : 'Crear Curso')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;