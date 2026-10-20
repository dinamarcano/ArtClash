import { Request, Response } from "express";
import { usersService } from "./users.service";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await usersService.getAll();
  res.status(200).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const user = await usersService.getById(id);

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  res.status(200).json(user);
};