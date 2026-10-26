try {require('./demo/config').validateDemoConfig(process.env);}
catch {console.error('Invalid demo configuration; startup refused.');process.exit(1);}
require('./index');
