import { Request, Response } from 'express';
import Joi from 'joi';
import authService from '../services/AuthService';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      // Attempt login
      const result = await authService.login(value.email, value.password);
      if (!result) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      // Attempt registration
      const result = await authService.register(value);
      if (!result) {
        res.status(409).json({ error: 'Email already in use' });
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      // Get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Get user from token
      const user = await authService.getUserFromToken(token);
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Return user data (without password hash)
      const { password_hash, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      console.error('Auth me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AuthController();
