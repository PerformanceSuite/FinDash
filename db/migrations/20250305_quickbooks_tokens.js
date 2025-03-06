/**
 * Migration for QuickBooks tokens table
 */

exports.up = function (knex) {
  return knex.schema
    .createTable('quickbooks_tokens', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.string('realm_id').notNullable();
      table.text('access_token').notNullable();
      table.text('refresh_token').notNullable();
      table.timestamp('access_token_expires_at').notNullable();
      table.timestamp('refresh_token_expires_at').notNullable();
      table.uuid('created_by').references('id').inTable('users');
      table.uuid('updated_by').references('id').inTable('users');
      table.timestamps(true, true);
      table.unique(['company_id']);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('quickbooks_tokens');
};
