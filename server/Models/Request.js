const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RequestSchema = new Schema(
    {
        utilisateur:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        matériel:{
            type: Schema.Types.ObjectId,
            ref: 'Material'
        },
        prise:{
            type: Date,
            required: [true,"La Date de prise est obligatoire"]
        },
        retour:{
            type: Date,
        },
        status:{
            type: String,
            enum: ['En Attente','Validée','Refusée'],
            default: 'En Attente'
        },
        expireAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)



module.exports = mongoose.model('Request', RequestSchema);