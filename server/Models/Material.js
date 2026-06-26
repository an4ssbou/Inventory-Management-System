const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MaterialSchema = new Schema(
  {
    designation: {
      type: String,
      required: [true, "La designation est Obligatoire"],
      maxLength: 50,
    },
    type: {
      type: String,
      enum: ["Consommable", "Non Consommable"],
      required: [true, "Le Type est Obligatoire"],
    },
    status: {
      type: String,
      enum: ["Disponible", "Emprunté", "Consommé"],
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", MaterialSchema);
