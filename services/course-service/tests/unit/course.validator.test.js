// Importamos la función que valida los datos de un curso
import { validateCourseData } from "../../src/utils/validator.js";

describe("Course Validator - Unit Tests", () => {

  test("Debe validar un curso correctamente", () => {
    // Datos correctos para un curso
    const data = {
      name: "Programación",
      description: "Curso básico",
      teacherId: "abc123"
    };

    // Validación
    const result = validateCourseData(data);

    // Debe ser válido
    expect(result.valid).toBe(true);
  });

  test("Debe fallar si falta el nombre", () => {
    // Falta el campo 'name'
    const data = {
      description: "Curso básico",
      teacherId: "abc123"
    };

    const result = validateCourseData(data);

    // Validación incorrecta
    expect(result.valid).toBe(false);

    // El mensaje de error esperado
    expect(result.errors).toContain("El nombre es obligatorio");
  });

  test("Debe fallar si teacherId no existe", () => {
    // teacherId vacío = inválido
    const data = {
      name: "Bases de Datos",
      description: "Curso básico",
      teacherId: ""
    };

    const result = validateCourseData(data);

    expect(result.valid).toBe(false);
  });
});