import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const user = await authService.registerUser(email, password);
    res.status(201).json({ user: { id: user._id, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const { user, token } = await authService.loginUser(email, password);
    res.json({ user: { id: user._id, email: user.email }, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT implementation, the client removes the token.
  // If we had a session/token blacklist, we'd invalidate it here.
  res.json({ message: 'Logged out successfully' });
};
