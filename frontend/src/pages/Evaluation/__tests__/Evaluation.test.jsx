import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import EvaluationPage from '../Evaluation.jsx';

vi.mock('@/services/evaluationService', () => ({
  evaluationService: {
    getByCourse: vi.fn(),
    getEvaluation: vi.fn(),
    submit: vi.fn(),
  }
}));

import { evaluationService } from '@/services/evaluationService';

describe('EvaluationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje cuando no hay evaluación asignada', async () => {
    evaluationService.getByCourse.mockRejectedValueOnce({ response: { status: 404 }, message: 'No hay evaluación asignada' });

    render(
      <MemoryRouter initialEntries={["/evaluation/1"]}>
        <Routes>
          <Route path="/evaluation/:courseId" element={<EvaluationPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay evaluación asignada/i)).toBeInTheDocument();
    });
  });

  it('renderiza preguntas cuando existe evaluación', async () => {
    evaluationService.getByCourse.mockResolvedValueOnce({ evaluation: { id: 10, title: 'Eval 1', passing_score: 60 } });
    evaluationService.getEvaluation.mockResolvedValueOnce({ questions: [
      { id: 1, prompt: 'Pregunta 1', option_a: 'A1', option_b: 'B1', option_c: 'C1' }
    ]});

    render(
      <MemoryRouter initialEntries={["/evaluation/1"]}>
        <Routes>
          <Route path="/evaluation/:courseId" element={<EvaluationPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Cargando evaluación/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Evaluación: Eval 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Pregunta 1/i)).toBeInTheDocument();
    });
  });
});