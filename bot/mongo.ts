import mongoose from "mongoose"

module.exports = async () => {
    await mongoose.connect(process.env['mongoPath'])
    return mongoose;
}