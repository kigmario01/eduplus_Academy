// Funciones puras: NO dependen de bases de datos ni APIs
import { calculateScore, validateAnswers } from "../../src/utils/evaluation.utils.mjs";

describe("Evaluation Utils - Unit Tests", () => {

  test("calculateScore debe calcular correctamente el puntaje", () => {
    // Respuestas correctas
    const correct = ["A", "B", "C"];

    // Respuestas del estudiante
    const student = ["A", "X", "C"];

    // calculateScore no necesita mocks porque es una función matemática pura
    const score = calculateScore(correct, student);

    // Debe dar 2/3 correctas
    expect(score).toBe(2);
  });

  test("validateAnswers debe validar respuestas válidas", () => {
    const questions = ["A", "B", "C"];
    const answers = ["A", "B", "C"];

    const result = validateAnswers(questions, answers);

    // Todo correcto
    expect(result.valid).toBe(true);
  });

  test("validateAnswers debe detectar cantidad incorrecta", () => {
    const questions = ["A", "B", "C"];
    const answers = ["A", "B"]; // faltan respuestas

    const result = validateAnswers(questions, answers);

    // Debe marcar inválido
    expect(result.valid).toBe(false);

    // Mensaje esperado
    expect(result.error).toBe("Número de respuestas incorrecto");
  });

});