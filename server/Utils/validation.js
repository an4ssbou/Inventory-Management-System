const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const email = z.string().trim().email().max(100).toLowerCase();
const phone = z.string().trim().regex(/^\d{10}$/, 'Phone must contain exactly 10 digits');
const role = z.enum(['Admin', 'Equipe Système', 'Equipe Maintenance', 'Equipe Réseaux']);
const materialType = z.enum(['Consommable', 'Non Consommable']);
const materialStatus = z.enum(['Disponible', 'Emprunté', 'Consommé']);
const requestStatus = z.enum(['En Attente', 'Validée', 'Refusée']);

const userCreateSchema = z.object({
  nom: z.string().trim().min(1).max(30),
  prénom: z.string().trim().min(1).max(50),
  email,
  password: z.string().min(8).max(128),
  Phone: phone,
  Role: role,
});

const userUpdateSchema = z.object({
  nom: z.string().trim().min(1).max(30).optional(),
  prénom: z.string().trim().min(1).max(50).optional(),
  email: email.optional(),
  password: z.string().min(8).max(128).optional(),
  Phone: phone.optional(),
  Role: role.optional(),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

const signupSchema = userCreateSchema.omit({ Role: true }).extend({
  Role: role.optional(),
});

const materialCreateSchema = z.object({
  designation: z.string().trim().min(1).max(50),
  type: materialType,
  status: materialStatus.default('Disponible'),
});

const materialUpdateSchema = materialCreateSchema.partial();

const requestCreateSchema = z.object({
  matériel: objectId,
  prise: z.coerce.date(),
  retour: z.coerce.date().nullable().optional(),
});

const requestUpdateSchema = z.object({
  utilisateur: objectId.optional(),
  matériel: objectId.optional(),
  prise: z.coerce.date().optional(),
  retour: z.coerce.date().nullable().optional(),
  status: requestStatus.optional(),
}).refine((data) => Object.keys(data).length > 0, 'No update fields provided');

const searchSchema = z.string().trim().max(50).optional();

const validate = (schema, data) => schema.parse(data);

module.exports = {
  objectId,
  searchSchema,
  validate,
  userCreateSchema,
  userUpdateSchema,
  loginSchema,
  signupSchema,
  materialCreateSchema,
  materialUpdateSchema,
  requestCreateSchema,
  requestUpdateSchema,
};
