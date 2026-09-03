import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { Role } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { logAudit } from './auditService';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
  businessName?: string;
  village?: string;
  district?: string;
  description?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterDTO) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists.', 400);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      passwordHash,
      role: data.role,
    },
  });

  if (data.role === 'ENTREPRENEUR') {
    await prisma.entrepreneurProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName || `${data.name}'s Rural Enterprise`,
        village: data.village || 'Mahabaleshwar',
        district: data.district || 'Satara',
        description: data.description || 'Authentic rural product producer.',
        contactPhone: data.phone || null,
      },
    });
  }

  await logAudit(user.id, 'USER_REGISTERED', 'User', user.id, { role: user.role, email: user.email });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as Role,
    },
    token,
  };
};

export const loginUser = async (data: LoginDTO) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { entrepreneurProfile: true },
  });

  if (!user) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password credentials.', 401);
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError('Account is suspended. Please contact platform administration.', 403);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role as Role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await logAudit(user.id, 'USER_LOGIN', 'User', user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as Role,
      entrepreneurProfile: user.entrepreneurProfile,
    },
    token,
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      entrepreneurProfile: true,
    },
  });

  if (!user) {
    throw new AppError('User account not found.', 404);
  }

  return user;
};
