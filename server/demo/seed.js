const bcrypt=require('bcrypt');
const {DATABASE}=require('./config');
const User=require('../Models/User');
const Material=require('../Models/Material');
const Request=require('../Models/Request');
const MARKER='inventory-portfolio-demo-v1';
const PUBLIC_USERS=[['admin@inventory-demo.test','Administration','0000000001','Admin'],['equipe@inventory-demo.test','Équipe','0000000002','Equipe Système']];
const PUBLIC_MATERIALS=[['Portable de démonstration','Non Consommable'],['Écran de démonstration','Non Consommable'],['Clavier de démonstration','Non Consommable'],['Câble réseau de démonstration','Consommable']];
async function seedDemo(connection) {
 if(connection.name!==DATABASE) throw new Error('Demo database refused');
 const db=connection.db, meta=db.collection('_portfolio_demo');
 const marker=await meta.findOne({_id:MARKER});
 if(!marker) {
  const collections=await db.listCollections({}, {nameOnly:true}).toArray();
  for(const {name} of collections) if(!name.startsWith('system.') && await db.collection(name).countDocuments({}, {limit:1})) throw new Error('Unmarked nonempty database refused');
  await meta.insertOne({_id:MARKER,state:'initializing',requestCount:0,createdAt:new Date()});
 } else if(!['initializing','ready'].includes(marker.state)) throw new Error('Invalid demo dataset');
 // Validate the complete owned namespace BEFORE resetting anything. A marker
 // never authorizes adopting an unrelated collection or a real account.
 const collections=await db.listCollections({}, {nameOnly:true}).toArray();
 for(const {name} of collections) if(!['users','materials','requests','_portfolio_demo'].includes(name) && !name.startsWith('system.') && await db.collection(name).countDocuments({}, {limit:1})) throw new Error('Unrelated demo database content refused');
 const users=await User.find().lean(),materials=await Material.find().lean(),requests=await Request.find().lean();
 if(users.some(u=>!PUBLIC_USERS.some(x=>x[0]===u.email && x[3]===u.Role)) || materials.some(m=>!PUBLIC_MATERIALS.some(x=>x[0]===m.designation && x[1]===m.type))) throw new Error('Unrelated demo records refused');
 const userIds=new Set(users.map(u=>String(u._id))),materialIds=new Set(materials.map(m=>String(m._id)));
 if(requests.some(r=>!userIds.has(String(r.utilisateur)) || !materialIds.has(String(r.matériel)))) throw new Error('Unrelated request refused');
 if(requests.length) await Request.deleteMany({_id:{$in:requests.map(r=>r._id)}});
 if(materials.length) await Material.updateMany({_id:{$in:materials.map(m=>m._id)}},{$set:{status:'Disponible'}});
 await meta.updateOne({_id:MARKER},{$set:{requestCount:0,resetAt:new Date()}});
 const password=await bcrypt.hash('InventoryDemo2026!',12);
 for(const [email,prénom,Phone,Role] of PUBLIC_USERS) {
  await User.updateOne({email},{$setOnInsert:{email,nom:'Démo',prénom,Phone,Role,password}},{upsert:true,runValidators:true});
 }
 for(const [designation,type] of PUBLIC_MATERIALS) {
  await Material.updateOne({designation},{$setOnInsert:{designation,type,status:'Disponible'}},{upsert:true,runValidators:true});
 }
 await meta.updateOne({_id:MARKER},{$set:{state:'ready'}});
}
module.exports={seedDemo,MARKER};
