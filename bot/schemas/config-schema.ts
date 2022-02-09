import mongoose, { Schema } from "mongoose";

const reqString = {
    type: String,
    required: true
}

const schema = new Schema(
    {
        serverId: reqString,
        roleId: reqString,
        newId: reqString,
        archiveId: reqString,
        suggestionId: reqString,
    },
)

const name = "config"

export default mongoose.models[name] || mongoose.model(name, schema)