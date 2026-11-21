import { Request, Response } from "express";
import { authService } from "./auth.service";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const ROLES = ["artist", "user"];

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const register = async (req: Request, res: Response) => {
  const username = asText(req.body?.username);
  const email = asText(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const role = asText(req.body?.role);

  // Las mismas reglas se validan en el formulario del cliente;
  // aquí se repiten porque al servidor le pueden llegar peticiones sin pasar por él
  if (!USERNAME_REGEX.test(username)) {
    res.status(400).json({
      message: "El usuario debe tener de 3 a 20 letras, números o guiones bajos",
    });
    return;
  }
  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ message: "El email no es válido" });
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    });
    return;
  }
  if (!ROLES.includes(role)) {
    res.status(400).json({ message: "El rol debe ser artist o user" });
    return;
  }

  const session = await authService.register({
    username,
    email,
    password,
    role: role as "artist" | "user",
  });
  res.status(201).json(session);
};

export const login = async (req: Request, res: Response) => {
  const email = asText(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ message: "Email y contraseña son obligatorios" });
    return;
  }

  const session = await authService.login({ email, password });
  res.status(200).json(session);
};
