/**
 * Initial seed data for accounting software
 */

const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  // Clean existing data
  await knex('bills').del();
  await knex('invoices').del();
  await knex('vendors').del();
  await knex('customers').del();
  await knex('transaction_lines').del();
  await knex('transactions').del();
  await knex('fiscal_years').del();
  await knex('accounts').del();
  await knex('user_companies').del();
  await knex('companies').del();
  await knex('users').del();

  // Insert admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const [adminUser] = await knex('users').insert({
    email: 'admin@example.com',
    password_hash: adminPassword,
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
  }).returning('id');

  // Insert demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const [demoUser] = await knex('users').insert({
    email: 'demo@example.com',
    password_hash: demoPassword,
    first_name: 'Demo',
    last_name: 'User',
    role: 'user',
  }).returning('id');

  // Insert demo company
  const [demoCompany] = await knex('companies').insert({
    name: 'Demo Company Inc.',
    tax_id: '12-3456789',
    address_line1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'USA',
    phone: '(555) 123-4567',
    email: 'info@democompany.com',
    website: 'https://www.democompany.com',
    fiscal_year_end: '12-31',
    currency: 'USD',
  }).returning('id');

  // Link users to company
  await knex('user_companies').insert([
    {
      user_id: adminUser,
      company_id: demoCompany,
      role: 'owner',
    },
    {
      user_id: demoUser,
      company_id: demoCompany,
      role: 'member',
    },
  ]);

  // Insert fiscal year
  const currentYear = new Date().getFullYear();
  await knex('fiscal_years').insert({
    company_id: demoCompany,
    start_date: `${currentYear}-01-01`,
    end_date: `${currentYear}-12-31`,
    is_closed: false,
  });

  // Insert chart of accounts
  const accountTypes = [
    // Asset accounts
    { number: '1000', name: 'Cash', type: 'asset', subtype: 'current', is_bank_account: true },
    { number: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'current' },
    { number: '1200', name: 'Inventory', type: 'asset', subtype: 'current' },
    { number: '1500', name: 'Fixed Assets', type: 'asset', subtype: 'non-current' },
    { number: '1600', name: 'Accumulated Depreciation', type: 'asset', subtype: 'non-current' },
    
    // Liability accounts
    { number: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'current' },
    { number: '2100', name: 'Accrued Liabilities', type: 'liability', subtype: 'current' },
    { number: '2200', name: 'Payroll Liabilities', type: 'liability', subtype: 'current' },
    { number: '2300', name: 'Taxes Payable', type: 'liability', subtype: 'current' },
    { number: '2700', name: 'Long-term Debt', type: 'liability', subtype: 'non-current' },
    
    // Equity accounts
    { number: '3000', name: 'Common Stock', type: 'equity' },
    { number: '3100', name: 'Retained Earnings', type: 'equity' },
    { number: '3900', name: 'Owner\'s Equity', type: 'equity' },
    
    // Revenue accounts
    { number: '4000', name: 'Sales Revenue', type: 'revenue' },
    { number: '4100', name: 'Service Revenue', type: 'revenue' },
    { number: '4900', name: 'Other Revenue', type: 'revenue' },
    
    // Expense accounts
    { number: '5000', name: 'Cost of Goods Sold', type: 'expense' },
    { number: '6000', name: 'Salaries and Wages', type: 'expense' },
    { number: '6100', name: 'Rent Expense', type: 'expense' },
    { number: '6200', name: 'Utilities Expense', type: 'expense' },
    { number: '6300', name: 'Office Supplies', type: 'expense' },
    { number: '6400', name: 'Insurance Expense', type: 'expense' },
    { number: '6500', name: 'Depreciation Expense', type: 'expense' },
    { number: '6600', name: 'Interest Expense', type: 'expense' },
    { number: '6700', name: 'Marketing Expense', type: 'expense' },
    { number: '6800', name: 'Professional Fees', type: 'expense' },
    { number: '6900', name: 'Miscellaneous Expense', type: 'expense' },
  ];

  // Insert accounts
  for (const account of accountTypes) {
    await knex('accounts').insert({
      company_id: demoCompany,
      account_number: account.number,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      description: `${account.name} account`,
      is_active: true,
      is_bank_account: account.is_bank_account || false,
      bank_account_number: account.is_bank_account ? '9876543210' : null,
      bank_routing_number: account.is_bank_account ? '123456789' : null,
      bank_name: account.is_bank_account ? 'Demo Bank' : null,
    });
  }

  // Insert customers
  const customers = [
    {
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '(555) 111-2222',
      address_line1: '100 Acme Blvd',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94107',
      country: 'USA',
    },
    {
      name: 'Globex Inc.',
      email: 'accounts@globex.com',
      phone: '(555) 333-4444',
      address_line1: '200 Globex Way',
      city: 'Palo Alto',
      state: 'CA',
      postal_code: '94301',
      country: 'USA',
    },
  ];

  for (const customer of customers) {
    await knex('customers').insert({
      company_id: demoCompany,
      ...customer,
    });
  }

  // Insert vendors
  const vendors = [
    {
      name: 'Office Supplies Co.',
      email: 'orders@officesupplies.com',
      phone: '(555) 555-6666',
      address_line1: '300 Supply St',
      city: 'Oakland',
      state: 'CA',
      postal_code: '94612',
      country: 'USA',
    },
    {
      name: 'Tech Solutions LLC',
      email: 'billing@techsolutions.com',
      phone: '(555) 777-8888',
      address_line1: '400 Tech Ave',
      city: 'San Jose',
      state: 'CA',
      postal_code: '95113',
      country: 'USA',
    },
  ];

  for (const vendor of vendors) {
    await knex('vendors').insert({
      company_id: demoCompany,
      ...vendor,
    });
  }
};
