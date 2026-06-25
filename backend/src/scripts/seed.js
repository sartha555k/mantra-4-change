require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const SchoolResponse = require('../models/SchoolResponse');
const GrantFinance = require('../models/GrantFinance');
const GrantPerformance = require('../models/GrantPerformance');
const EvidenceMedia = require('../models/EvidenceMedia');
const ActionItem = require('../models/ActionItem');
const {
  loadPblRecords,
  loadGrantFinance,
  loadGrantPerformance,
  loadEvidenceMedia,
} = require('../services/csvIngest');

const ROOT = path.resolve(__dirname, '../../..');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mantra4change';
  await connectDB(uri);

  console.log('Clearing existing collections...');
  await Promise.all([
    SchoolResponse.deleteMany({}),
    GrantFinance.deleteMany({}),
    GrantPerformance.deleteMany({}),
    EvidenceMedia.deleteMany({}),
    ActionItem.deleteMany({}),
  ]);

  console.log('Loading CSV data...');
  const pblRecords = loadPblRecords(ROOT);
  const finance = loadGrantFinance(ROOT);
  const performance = loadGrantPerformance(ROOT);
  const evidence = loadEvidenceMedia(ROOT);

  console.log(`Inserting ${pblRecords.length} school responses...`);
  await SchoolResponse.insertMany(pblRecords, { ordered: false });

  console.log(`Inserting ${finance.length} finance rows...`);
  await GrantFinance.insertMany(finance);

  console.log(`Inserting ${performance.length} performance rows...`);
  await GrantPerformance.insertMany(performance);

  console.log(`Inserting ${evidence.length} evidence/media rows...`);
  await EvidenceMedia.insertMany(evidence);

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
