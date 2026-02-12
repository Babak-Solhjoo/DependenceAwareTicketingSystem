import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getPrisma } from "../db/prisma";
import { env } from "../config/env";
import { HttpError } from "../utils/errors";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const createToken = (user: { id: string; email: string }) =>
  jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { email, password } = authSchema.parse(req.body);
    const normalized = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: normalized, passwordHash }
    });

    res.status(201).json({
      token: createToken(user),
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = getPrisma();
    const { email, password } = authSchema.parse(req.body);
    const normalized = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new HttpError(401, "Invalid credentials");
    }

    res.json({
      token: createToken(user),
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    next(error);
  }
};
