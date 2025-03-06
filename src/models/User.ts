import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  password?: string; // This will be transformed to password_hash
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
}

export class UserModel {
  private db: Knex;
  private tableName = 'users';

  constructor(db: Knex) {
    this.db = db;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db(this.tableName).where({ id }).first();
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db(this.tableName).where({ email }).first();
    return user || null;
  }

  async create(data: UserCreateInput): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const [user] = await this.db(this.tableName)
      .insert({
        email: data.email,
        password_hash: passwordHash,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role || 'user',
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .returning('*');
    
    return user;
  }

  async update(id: string, data: UserUpdateInput): Promise<User | null> {
    const updateData: Partial<User> = { ...data } as Partial<User>;
    
    // If password is provided, hash it
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
      delete (updateData as any).password;
    }
    
    const [user] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...updateData,
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    
    return user || null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(this.tableName).where({ id }).delete();
    return count > 0;
  }

  async list(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [users, countResult] = await Promise.all([
      this.db(this.tableName)
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      this.db(this.tableName).count('id as count').first(),
    ]);
    
    const total = countResult ? Number(countResult.count) : 0;
    
    return { users, total };
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getCompanies(userId: string): Promise<any[]> {
    return this.db('user_companies')
      .join('companies', 'user_companies.company_id', 'companies.id')
      .where('user_companies.user_id', userId)
      .select(
        'companies.*',
        'user_companies.role as user_role'
      );
  }
}
