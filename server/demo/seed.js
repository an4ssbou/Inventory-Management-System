const bcrypt=require('bcrypt');
const {DATABASE}=require('./config');
const User=require('../Models/User');
const Material=require('../Models/Material');
const MARKER='inventory-portfolio-demo-v1';
async function seedDemo(connection) {
 if(connection.name!==DATABASE) throw new Error('Demo database refused');
 const db=connection.db, meta=db.collection('_portfolio_demo');
 const marker=await meta.findOne({_id:MARKER});
 if(!marker) {
  const collections=await db.listCollections({}, {nameOnly:true}).toArray();
  for(const {name} of collections) if(!name.startsWith('system.') && await db.collection(name).countDocuments({}, {limit:1})) throw new Error('Unmarked nonempty database refused');
  await meta.insertOne({_id:MARKER,state:'initializing',requestCount:0,createdAt:new Date()});
 } else if(!['initializing','ready'].includes(marker.state)) throw new Error('Invalid demo dataset');
 const password=await bcrypt.hash('InventoryDemo2026!',12);
 for(const [email,prénom,Phone,Role] of [['admin@inventory-demo.test','Administration','0000000001','Admin'],['equipe@inventory-demo.test','Équipe','0000000002','Equipe Système']]) {
  await User.updateOne({email},{$setOnInsert:{email,nom:'Démo',prénom,Phone,Role,password}},{upsert:true,runValidators:true});
 }
 for(const [designation,type] of [['Portable de démonstration','Non Consommable'],['Écran de démonstration','Non Consommable'],['Clavier de démonstration','Non Consommable'],['Câble réseau de démonstration','Consommable']]) {
  await Material.updateOne({designation},{$setOnInsert:{designation,type,status:'Disponible'}},{upsert:true,runValidators:true});
 }
 await meta.updateOne({_id:MARKER},{$set:{state:'ready'}});
}
module.exports={seedDemo,MARKER};
