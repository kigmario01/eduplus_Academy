// Importamos bcrypt y JWT para poder hacerles mock (simular su comportamiento)
import { jest } from "@jest/globals";

// Jest reemplaza estas librerías por versiones "falsas"
// Esto evita llamadas reales a hashing/bcrypt/JWT
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn()
  }
}));

let bcrypt;
let jwt;
let hashPassword;
let comparePassword;
let generateToken;

beforeAll(async () => {
  const b = await import("bcryptjs");
  const j = await import("jsonwebtoken");
  const utils = await import("../../src/utils/auth.utils.js");
  bcrypt = b.default;
  jwt = j.default;
  hashPassword = utils.hashPassword;
  comparePassword = utils.comparePassword;
  generateToken = utils.generateToken;
});

describe("Auth Utils - Unit Tests", () => {

  test("hashPassword debe hashear correctamente", async () => {
    // Simulamos la respuesta de bcrypt.hash
    bcrypt.hash.mockResolvedValue("hashed123");

    // Ejecutamos nuestra función
    const result = await hashPassword("password123");

    // Verificamos que se llamó con los parámetros correctos
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

    // Comprobamos que devuelve el hash simulado
    expect(result).toBe("hashed123");
  });

  test("comparePassword debe retornar true si coinciden", async () => {
    // bcrypt.compare retorna true (simulado)
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword("pass", "hashedPass");

    expect(result).toBe(true);
  });

  test("comparePassword debe retornar false si NO coinciden", async () => {
    // bcrypt.compare retorna false (simulado)
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword("pass", "wrong");

    expect(result).toBe(false);
  });

  test("generateToken debe generar un JWT válido", () => {
    // Mock: simulamos la generación de un token
    jwt.sign.mockReturnValue("fake.jwt.token");

    const result = generateToken({ id: "123" });

    // Verifica que jwt.sign fue llamado
    expect(jwt.sign).toHaveBeenCalled();

    // Verifica que el token sea el simulado
    expect(result).toBe("fake.jwt.token");
  });
});