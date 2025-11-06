import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { evaluationService } from '@/services/evaluationService';

export default function EvaluationPage() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const { evaluation } = await evaluationService.getByCourse(courseId);
        const evalId = evaluation.id;
        const { questions } = await evaluationService.getEvaluation(evalId);
        if (mounted) {
          setEvaluation(evaluation);
          setQuestions(questions);
        }
      } catch (e) {
        setError(e.message || 'No se pudo cargar la evaluación');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseId]);

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async () => {
    if (!evaluation) return;
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
      const r = await evaluationService.submit(evaluation.id, payload);
      setResult(r);
    } catch (e) {
      setError(e.message || 'Error al enviar respuestas');
    }
  };

  if (loading) return <div className="p-6">Cargando evaluación...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!evaluation) return <div className="p-6">No hay evaluación asignada.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Evaluación: {evaluation.title}</h1>
      <p className="text-gray-600 mb-6">Puntaje mínimo aprobatorio: {evaluation.passing_score}</p>

      {questions.map((q) => (
        <div key={q.id} className="mb-6 border rounded p-4">
          <p className="font-medium mb-3">{q.prompt}</p>
          <div className="space-y-2">
            {['A','B','C'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
                <span>
                  {opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : q.option_c}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Enviar respuestas
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <p>Puntaje: <strong>{result.score}</strong></p>
          <p>Estado: <strong>{result.passed ? 'Aprobado' : 'No aprobado'}</strong></p>
          {result.certificate && (
            <div className="mt-2">
              <p className="font-medium">Certificado generado</p>
              <p>Código: <code>{result.certificate.code}</code></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}