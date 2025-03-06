import { Knex } from 'knex';

export interface QuickBooksToken {
  id: string;
  company_id: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: Date;
  refresh_token_expires_at: Date;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuickBooksTokenCreateInput {
  company_id: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: Date;
  refresh_token_expires_at: Date;
  created_by: string;
  updated_by: string;
}

export interface QuickBooksTokenUpdateInput {
  realm_id?: string;
  access_token?: string;
  refresh_token?: string;
  access_token_expires_at?: Date;
  refresh_token_expires_at?: Date;
  updated_by?: string;
}

export class QuickBooksTokenModel {
  private db: Knex;
  private tableName = 'quickbooks_tokens';

  constructor(db: Knex) {
    this.db = db;
  }

  async findById(id: string): Promise<QuickBooksToken | null> {
    const token = await this.db(this.tableName).where({ id }).first();
    return token || null;
  }

  async findByCompanyId(companyId: string): Promise<QuickBooksToken | null> {
    const token = await this.db(this.tableName).where({ company_id: companyId }).first();
    return token || null;
  }

  async create(data: QuickBooksTokenCreateInput): Promise<QuickBooksToken> {
    const [token] = await this.db(this.tableName)
      .insert({
        company_id: data.company_id,
        realm_id: data.realm_id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        access_token_expires_at: data.access_token_expires_at,
        refresh_token_expires_at: data.refresh_token_expires_at,
        created_by: data.created_by,
        updated_by: data.updated_by,
      })
      .returning('*');
    
    return token;
  }

  async update(id: string, data: QuickBooksTokenUpdateInput): Promise<QuickBooksToken> {
    const [token] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');
    
    return token;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(this.tableName).where({ id }).delete();
    return count > 0;
  }
}
