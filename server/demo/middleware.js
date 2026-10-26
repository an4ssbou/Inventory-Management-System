const rateLimit=require('express-rate-limit');
const mongoose=require('mongoose');
const {mutationAllowed}=require('./config');
const {MARKER}=require('./seed');
const demoLimiter=rateLimit({windowMs:60000,limit:120,standardHeaders:true,legacyHeaders:false,message:{message:'Limite de démonstration atteinte. Réessayez dans une minute.'}});
const mutationLimiter=rateLimit({windowMs:60000,limit:30,standardHeaders:true,legacyHeaders:false,message:{message:'Trop de modifications de démonstration.'}});
let writing=false;
function demoGuard(req,res,next) {
 if(req.path.startsWith('/uploads')) return res.sendStatus(404);
 if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
 if(!mutationAllowed(req.method,req.path)) return res.status(403).json({message:'Cette modification est désactivée dans la démonstration.'});
 if(req.method==='PUT') {
  const keys=Object.keys(req.body||{});
  if(keys.length!==1 || keys[0]!=='status' || !['Validée','Refusée'].includes(req.body.status)) return res.status(400).json({message:'Seules la validation et le refus sont disponibles.'});
 }
 return mutationLimiter(req,res,next);
}
// Render Free runs a single Node process. Serialize demo writes, including the
// request/material decision, rather than allowing visitors to race updates.
function serializeMutation(req,res,next) {
 if(writing) return res.status(409).json({message:'Une modification est en cours. Réessayez.'});
 writing=true;
 let released=false;
 const release=()=>{if(!released){released=true;writing=false;}}; res.once('finish',release);res.once('close',release);
 return next();
}
async function reserveDemoRequest(req,res,next) {
 try {
  const result=await mongoose.connection.db.collection('_portfolio_demo').updateOne({_id:MARKER,state:'ready',requestCount:{$lt:100}},{$inc:{requestCount:1}});
  if(result.modifiedCount!==1) return res.status(429).json({message:'La démonstration est complète. Son propriétaire doit la réinitialiser.'});
  return next();
 } catch {return res.status(503).json({message:'Démonstration indisponible.'});}
}
module.exports={demoLimiter,demoGuard,reserveDemoRequest,serializeMutation};
