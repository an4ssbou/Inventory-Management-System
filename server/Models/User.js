const mongoose = require("mongoose");
const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        nom:{
            type: String,
            required: [true,"Le Nom est obligatoire"],
            maxLength: 30
        },
        prénom:{
            type: String,
            required: [true,"Le Prénom est obligatoire"],
            maxLength: 50
        },
        email:{
            type: String,
            unique: true,
            required: [true,"L'email est obligatoire"],
            maxLength: 50
        },
        password:{
            type: String,
            required: [true,"Le mot de passe est obligatoire"],
            minLength: 8,
        },
        Phone:{
            type:String,
            unique: true,
            required:[true,"Le numéro de téléphone est obligatoire"],
            maxLength:10,
            minLength:10
        },
        Role:{
            type: String,
            enum: ["Admin","Equipe Système","Equipe Maintenance","Equipe Réseaux"]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);