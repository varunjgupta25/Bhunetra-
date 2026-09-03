import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, role, businessName, village, district, description } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: email, password, name, and role are required.',
      });
    }

    const result = await registerUser({
      email,
      password,
      name,
      phone,
      role,
      businessName,
      village,
      district,
      description,
    });

    return res.status(201).json({
      success: true,
      message: 'User account registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required for authentication.',
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await getUserById(req.user.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
