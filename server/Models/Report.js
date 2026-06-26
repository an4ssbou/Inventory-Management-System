const mongoose = require("mongoose");
const Schema = mongoose.Schema

const ReportSchema = new Schema({
    utilisateur:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    Material:{
        type: Schema.Types.ObjectId,
        ref: 'Material'
    },
    Raison:{
        type: String,
        maxLength: 255,
        required: [true,"La Raison du rapport est obligatoire"]
    }
})

module.exports = mongoose.model('Report', ReportSchema);