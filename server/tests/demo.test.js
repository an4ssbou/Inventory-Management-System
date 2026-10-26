const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '../demo/config.js');
test('public demo boundary exists', () => assert.ok(fs.existsSync(source), 'Public demo boundary missing'));
test('reject foreign database, disabled mode and weak signing key', () => {
  assert.ok(fs.existsSync(source), 'Public demo boundary missing');
  const { validateDemoConfig } = require(source);
  const valid = { DEMO_MODE:'true', MONGO:'mongodb://127.0.0.1:27191/inventory_portfolio_demo', JWT_SECRET:'a'.repeat(64) };
  assert.doesNotThrow(() => validateDemoConfig(valid));
  for (const change of [{DEMO_MODE:'false'}, {MONGO:'mongodb://localhost/production'}, {MONGO:'mongodb://localhost/'}, {JWT_SECRET:'short'}]) assert.throws(() => validateDemoConfig({...valid,...change}));
});
test('public administrator cannot change accounts or upload files', () => {
  assert.ok(fs.existsSync(source), 'Public demo boundary missing');
  const { mutationAllowed } = require(source);
  assert.equal(mutationAllowed('POST','/api/login'),true);
  assert.equal(mutationAllowed('POST','/api/request'),true);
  assert.equal(mutationAllowed('PUT','/api/request/'+'a'.repeat(24)),true);
  for (const route of ['/api/signup','/api/bootstrap-admin','/api/user','/api/material','/api/requests','/api/request/aaa/extra']) for(const method of ['POST','PUT','DELETE']) assert.equal(mutationAllowed(method,route),false);
});
