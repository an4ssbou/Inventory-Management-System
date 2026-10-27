const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');
const mongoose=require('mongoose');
mongoose.set('autoCreate',false);mongoose.set('autoIndex',false);
const {seedDemo}=require('../demo/seed');
const User=require('../Models/User');
const Material=require('../Models/Material');
const Request=require('../Models/Request');

test('owned demo restarts free borrowed material; foreign marked content remains untouched',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-reset-test-'));
 const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;await new Promise(r=>server.close(r));
 const mongo=spawn('mongod',['--bind_ip','127.0.0.1','--port',String(port),'--dbpath',dir,'--quiet'],{stdio:'ignore'});
 try {
  await mongoose.connect(`mongodb://127.0.0.1:${port}/inventory_portfolio_demo`,{serverSelectionTimeoutMS:10000});
  await seedDemo(mongoose.connection);
  const user=await User.findOne({email:'equipe@inventory-demo.test'}),material=await Material.findOne();
  await Request.create({utilisateur:user._id,matériel:material._id,prise:new Date(),status:'Validée'});
  await Material.updateOne({_id:material._id},{$set:{status:'Emprunté'}});
  await seedDemo(mongoose.connection);
  assert.equal(await Request.countDocuments(),0,'A fresh demo should not remain exhausted after restart');
  assert.equal((await Material.findById(material._id)).status,'Disponible');
  const sentinel=mongoose.connection.db.collection('foreign_sentinel');await sentinel.insertOne({_id:'do-not-touch',value:'synthetic foreign record'});
  const before=await sentinel.findOne({_id:'do-not-touch'});
  await assert.rejects(()=>seedDemo(mongoose.connection),'Marked database with unrelated content must be refused');
  assert.deepEqual(await sentinel.findOne({_id:'do-not-touch'}),before);
 } finally {
  await mongoose.disconnect();mongo.kill('SIGTERM');await new Promise(r=>mongo.once('exit',r));fs.rmSync(dir,{recursive:true,force:true});
 }
});
