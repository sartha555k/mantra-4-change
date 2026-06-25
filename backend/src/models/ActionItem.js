const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    owner: String,
    priority: { type: String, enum: ['High', 'Medium', 'Low'] },
    dueDate: Date,
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
    linkedMetric: String,
    linkedValue: Number,
    geography: {
      type: { type: String, enum: ['district', 'block', 'grade', 'subject', 'grant'] },
      label: String,
    },
    reportingMonth: String,
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActionItem', actionItemSchema);
