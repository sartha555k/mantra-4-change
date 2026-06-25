const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let connected = false;

module.exports = async (req, res) => {
    if (!connected) {
        await connectDB(process.env.MONGODB_URI);
        connected = true;
    }

    return app(req, res);
};