const DATABASE = 'inventory_portfolio_demo';
function validateDemoConfig(env = process.env) {
  if (env.DEMO_MODE !== 'true') throw new Error('Explicit demo mode required');
  let uri;
  try { uri = new URL(env.MONGO); } catch { throw new Error('Invalid demo database configuration'); }
  if (!['mongodb:', 'mongodb+srv:'].includes(uri.protocol) || decodeURIComponent(uri.pathname) !== `/${DATABASE}`) throw new Error('Dedicated demo database required');
  if (typeof env.JWT_SECRET !== 'string' || env.JWT_SECRET.length < 32) throw new Error('Strong signing key required');
  return { database: DATABASE };
}
function mutationAllowed(method,path) {
 return (method==='POST' && ['/api/login','/api/request'].includes(path)) || (method==='PUT' && /^\/api\/request\/[a-f\d]{24}$/i.test(path));
}
module.exports={DATABASE,validateDemoConfig,mutationAllowed};
