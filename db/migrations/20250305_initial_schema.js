/**
 * Initial database schema for accounting software
 */

exports.up = function (knex) {
  return knex.schema
    // Users table
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('role').notNullable().defaultTo('user');
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamps(true, true);
    })

    // Companies table
    .createTable('companies', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('tax_id').nullable();
      table.string('address_line1').nullable();
      table.string('address_line2').nullable();
      table.string('city').nullable();
      table.string('state').nullable();
      table.string('postal_code').nullable();
      table.string('country').nullable();
      table.string('phone').nullable();
      table.string('email').nullable();
      table.string('website').nullable();
      table.string('fiscal_year_end').nullable();
      table.string('currency').notNullable().defaultTo('USD');
      table.timestamps(true, true);
    })

    // User-Company relationship (many-to-many)
    .createTable('user_companies', (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.string('role').notNullable().defaultTo('member');
      table.primary(['user_id', 'company_id']);
      table.timestamps(true, true);
    })

    // Chart of Accounts
    .createTable('accounts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.string('account_number').notNullable();
      table.string('name').notNullable();
      table.string('type').notNullable();
      table.string('subtype').nullable();
      table.text('description').nullable();
      table.boolean('is_active').notNullable().defaultTo(true);
      table.decimal('balance', 15, 2).notNullable().defaultTo(0);
      table.boolean('is_bank_account').notNullable().defaultTo(false);
      table.string('bank_account_number').nullable();
      table.string('bank_routing_number').nullable();
      table.string('bank_name').nullable();
      table.timestamps(true, true);
      table.unique(['company_id', 'account_number']);
    })

    // Fiscal Years
    .createTable('fiscal_years', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.date('start_date').notNullable();
      table.date('end_date').notNullable();
      table.boolean('is_closed').notNullable().defaultTo(false);
      table.timestamps(true, true);
      table.unique(['company_id', 'start_date', 'end_date']);
    })

    // Transactions
    .createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.date('transaction_date').notNullable();
      table.string('reference_number').nullable();
      table.text('description').nullable();
      table.string('type').notNullable();
      table.string('status').notNullable().defaultTo('draft');
      table.uuid('created_by').references('id').inTable('users');
      table.timestamps(true, true);
    })

    // Transaction Lines
    .createTable('transaction_lines', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
      table.uuid('account_id').references('id').inTable('accounts');
      table.decimal('debit', 15, 2).notNullable().defaultTo(0);
      table.decimal('credit', 15, 2).notNullable().defaultTo(0);
      table.text('description').nullable();
      table.timestamps(true, true);
    })

    // Customers
    .createTable('customers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('email').nullable();
      table.string('phone').nullable();
      table.string('address_line1').nullable();
      table.string('address_line2').nullable();
      table.string('city').nullable();
      table.string('state').nullable();
      table.string('postal_code').nullable();
      table.string('country').nullable();
      table.string('tax_id').nullable();
      table.timestamps(true, true);
    })

    // Vendors
    .createTable('vendors', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('email').nullable();
      table.string('phone').nullable();
      table.string('address_line1').nullable();
      table.string('address_line2').nullable();
      table.string('city').nullable();
      table.string('state').nullable();
      table.string('postal_code').nullable();
      table.string('country').nullable();
      table.string('tax_id').nullable();
      table.timestamps(true, true);
    })

    // Invoices
    .createTable('invoices', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.uuid('customer_id').references('id').inTable('customers');
      table.uuid('transaction_id').references('id').inTable('transactions');
      table.string('invoice_number').notNullable();
      table.date('invoice_date').notNullable();
      table.date('due_date').notNullable();
      table.decimal('subtotal', 15, 2).notNullable();
      table.decimal('tax_amount', 15, 2).notNullable().defaultTo(0);
      table.decimal('total', 15, 2).notNullable();
      table.string('status').notNullable().defaultTo('draft');
      table.text('notes').nullable();
      table.timestamps(true, true);
      table.unique(['company_id', 'invoice_number']);
    })

    // Bills
    .createTable('bills', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.uuid('vendor_id').references('id').inTable('vendors');
      table.uuid('transaction_id').references('id').inTable('transactions');
      table.string('bill_number').notNullable();
      table.date('bill_date').notNullable();
      table.date('due_date').notNullable();
      table.decimal('subtotal', 15, 2).notNullable();
      table.decimal('tax_amount', 15, 2).notNullable().defaultTo(0);
      table.decimal('total', 15, 2).notNullable();
      table.string('status').notNullable().defaultTo('draft');
      table.text('notes').nullable();
      table.timestamps(true, true);
      table.unique(['company_id', 'bill_number']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('bills')
    .dropTableIfExists('invoices')
    .dropTableIfExists('vendors')
    .dropTableIfExists('customers')
    .dropTableIfExists('transaction_lines')
    .dropTableIfExists('transactions')
    .dropTableIfExists('fiscal_years')
    .dropTableIfExists('accounts')
    .dropTableIfExists('user_companies')
    .dropTableIfExists('companies')
    .dropTableIfExists('users');
};
