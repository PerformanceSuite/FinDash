import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';
import db from '../config/database';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResult {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export class AuthService {
  private userModel: UserModel;
  private jwtSecret: string;
  private tokenExpiry: string;

  constructor() {
    this.userModel = new UserModel(db);
    this.jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    this.tokenExpiry = process.env.JWT_EXPIRES_IN || '1d';
  }

  async login(email: string, password: string): Promise<LoginResult | null> {
    // Find user by email
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await this.userModel.verifyPassword(user, password);
    if (!isPasswordValid) {
      return null;
    }

    // Check if user is active
    if (!user.is_active) {
      return null;
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data (without password hash) and token
    const { password_hash, ...userData } = user;
    return {
      user: userData as Omit<User, 'password_hash'>,
      token,
    };
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<LoginResult | null> {
    // Check if user already exists
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      return null;
    }

    // Create new user
    const user = await this.userModel.create({
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: 'user',
    });

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data (without password hash) and token
    const { password_hash, ...newUserData } = user;
    return {
      user: newUserData as Omit<User, 'password_hash'>,
      token,
    };
  }

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    try {
      // @ts-ignore - Bypass TypeScript error for jwt.verify
      const decoded = jwt.verify(token, this.jwtSecret) as AuthTokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const payload = await this.verifyToken(token);
    if (!payload) {
      return null;
    }

    return this.userModel.findById(payload.userId);
  }

  private generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // @ts-ignore - Bypass TypeScript error for jwt.sign
    return jwt.sign(
      payload, 
      this.jwtSecret, 
      { expiresIn: this.tokenExpiry }
    );
  }
}

export default new AuthService();
