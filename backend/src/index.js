const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

start();