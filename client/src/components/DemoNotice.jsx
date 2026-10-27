export default function DemoNotice() {
 if(import.meta.env.VITE_DEMO_MODE!=='true') return null;
 return <aside aria-label="Informations de démonstration" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" style={{overflowWrap:'anywhere'}}>
 <strong>Démonstration publique — données fictives et partagées.</strong>
 <p>N’entrez aucune information personnelle. Jeu remis à zéro au redémarrage ou après mise en veille ; comptes, fichiers et courriels désactivés.</p>
 <p>Équipe : equipe@inventory-demo.test · Administration : admin@inventory-demo.test</p>
 <p>Mot de passe public : <code>InventoryDemo2026!</code></p>
 <p>Essayez : connexion Équipe → Matériel → demande → connexion Administration → validation. Capacité partagée : 100 tentatives de demande.</p>
 </aside>;
}
