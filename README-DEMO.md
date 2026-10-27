# Inventory — démonstration publique

[Préparer le service Render gratuit](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fan4ssbou%2FInventory-Management-System%2Ftree%2Fportfolio-demo)

Cette branche sert React et l'API Express à la même adresse. Les données sont fictives et partagées; aucune base existante n'est importée. La messagerie, l'inscription, la gestion des comptes, les téléversements et suppressions sont désactivés côté serveur. La démo ne donne aucun accès à un système hospitalier réel.

## Essayer

Mot de passe public commun : `InventoryDemo2026!`.

- Équipe : `equipe@inventory-demo.test` → Matériel → Demander → dates → Mes demandes.
- Administration : `admin@inventory-demo.test` → demandes → validation/refus → export CSV.

Un seul traitement est autorisé à la fois dans ce service à instance unique; une demande traitée ne peut pas être traitée à nouveau. Les limites sont partagées : 100 tentatives de création dans la base, 30 mutations/minute et 120 requêtes/minute. Les mauvaises tentatives consomment aussi la capacité. Ne saisir aucune donnée personnelle et ne réutiliser ces mots de passe nulle part ailleurs.

## Atlas gratuit et séparé

1. Utiliser un cluster **Free** existant ou en créer un. Ne pas choisir Flex ni une offre payante.
2. Créer un utilisateur de base avec `readWrite` limité à **inventory_portfolio_demo**. Il est distinct de votre compte Atlas et des comptes publics d'essai.
3. Dans **Connect → Drivers**, obtenir l'URI, remplacer le nom de base par `inventory_portfolio_demo` et la saisir directement dans la variable privée **MONGO** de Render. Ne pas l'envoyer dans un message ni la déposer sur GitHub. Encoder les caractères spéciaux du mot de passe dans l'URI.
4. Dans Render, service Inventory → **Connect → Outbound**, copier les plages CIDR et les ajouter dans **Atlas → Network Access**. Pas d'achat de Dedicated IP et pas d'ouverture globale par défaut.

Le démarrage refuse une autre base, une clé de signature trop courte ou une base contenant des données étrangères. Après vérification du marqueur et des comptes, matériels, demandes et collections autorisés, chaque redémarrage efface uniquement les demandes fictives identifiées, remet les matériels à disposition et réinitialise le compteur. Les comptes restent identiques. Les essais sont donc partagés puis remis à zéro au redémarrage, au redéploiement ou après veille; aucun bouton HTTP public de reset n'existe. Si la capacité de 100 tentatives est atteinte avant la veille, le propriétaire peut redémarrer le service depuis Render.

## Render

1. Utiliser le bouton en tête ou **New → Blueprint**, dépôt `an4ssbou/Inventory-Management-System`, branche `portfolio-demo`.
2. Vérifier **inventory-portfolio-demo**, **Node**, **Free**, et aucun service payant. L'instance Vercel actuelle reste séparée.
3. Renseigner uniquement **MONGO** dans le formulaire privé. **JWT_SECRET** est générée par Render; aucun secret ne va dans le build React. Les autres paramètres viennent de `render.yaml`.
4. Attendre **Live**, ouvrir `/api/health` puis essayer le parcours complet. Si la DB est injoignable, vérifier l'URI et les CIDR Atlas puis relancer le déploiement.

Render Free dort après 15 minutes et partage ses heures et quotas entre services. Atlas Free limite données et index à 0,5 Go. Consulter l'usage dans les comptes; aucun achat n'est requis par ces fichiers. Sources : [Render](https://render.com/docs/free), [Atlas](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/), [réseau sortant](https://render.com/docs/outbound-ip-addresses), vérifiées le 26 octobre 2026.

## Vérification locale

Dans cette copie : `npm ci --prefix server`, `npm ci --prefix client`, `VITE_DEMO_MODE=true npm run build --prefix client`, puis `node --test server/tests/demo.test.js`.

Pour lancer, utiliser une **nouvelle** instance Mongo locale dans un dossier temporaire et sur un port distinct. Fournir `DEMO_MODE=true`, `NODE_ENV=production`, `MONGO` pointant vers la base de démo, `JWT_SECRET` aléatoire de 32 caractères minimum, puis `node server/start-demo.js`. Ne pas charger un `.env` d'origine. Arrêter uniquement les processus de cette copie après vérification.

Les preuves de parcours sont dans le projet portfolio, sous `project/proofs/demo-security-*`. Aucune validation locale ne prouve à elle seule le déploiement public. Pour revenir en arrière, sélectionner un ancien déploiement Render ou suspendre le service et retirer son lien du portfolio; l'auto-déploiement est désactivé.
