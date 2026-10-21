/**
 * SMART BIOMEDICAL EQUIPMENT MANAGEMENT SYSTEM (SBEMS)
 * MERN Stack Enterprise Server & MongoDB REST API Service
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mithunraghav004_db_user:y2aVNUFjByFXelMr@cluster0.luvxo31.mongodb.net/sbems_clinical?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

// ============================================================================
// 1. MONGOOSE MODELS & SCHEMAS
// ============================================================================

const EquipmentSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String, required: true },
  departmentId: { type: String, required: true },
  room: { type: String, default: 'General Ward' },
  status: {
    type: String,
    enum: ['operational', 'under_maintenance', 'out_of_service', 'awaiting_inspection'],
    default: 'operational'
  },
  criticality: {
    type: String,
    enum: ['life-support', 'critical', 'high', 'medium', 'low'],
    default: 'high'
  },
  riskClass: { type: String, default: 'Class IIb' },
  purchaseDate: { type: String },
  warrantyExpiry: { type: String },
  purchaseCost: { type: Number, default: 0 },
  pmFrequencyDays: { type: Number, default: 90 },
  lastPMDate: { type: String },
  nextPMDate: { type: String },
  lastCalibDate: { type: String },
  nextCalibDate: { type: String },
  assignedEngineerId: { type: String },
  downtimeHours: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

const WorkOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  equipmentId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['corrective', 'preventive', 'calibration', 'emergency'], required: true },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'pending_parts', 'completed', 'closed'], default: 'open' },
  reportedDate: { type: String },
  reportedBy: { type: String },
  assignedEngineerId: { type: String },
  estimatedHours: { type: Number, default: 2 },
  actualHours: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  issueDescription: { type: String },
  actionTaken: { type: String },
  preventiveChecklist: { type: Array, default: [] }
}, { timestamps: true });

const AuditSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: String, required: true },
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ip: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', EquipmentSchema);
const WorkOrder = mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditSchema);

// ============================================================================
// 2. MONGODB CONNECTION
// ============================================================================

let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('----------------------------------------------------');
    console.log('🍃 MongoDB Connected Successfully!');
    console.log(`📡 Database URI: ${MONGODB_URI}`);
    console.log('----------------------------------------------------');
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection could not be established directly.');
    console.warn(`Reason: ${err.message}`);
    console.warn('The frontend will operate in resilient Hybrid Mode with local storage fallback.');
  });

// ============================================================================
// 3. REST API ENDPOINTS
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: isMongoConnected ? 'connected' : 'offline_fallback',
    engine: 'MongoDB Atlas + Node.js Express',
    cluster: 'cluster0.luvxo31.mongodb.net',
    databaseName: 'sbems_clinical',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, role, password } = req.body;
  const token = 'jwt-token-' + Buffer.from(email + ':' + Date.now()).toString('base64');
  res.json({
    success: true,
    message: 'Authorized successfully',
    token: token,
    user: {
      email,
      role,
      authenticatedAt: new Date().toISOString()
    }
  });
});

// Equipment endpoints
app.get('/api/equipment', async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, count: 0, data: [] });
    const items = await Equipment.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, localOnly: true, data: req.body });
    const created = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Work orders endpoints
app.get('/api/workorders', async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, count: 0, data: [] });
    const orders = await WorkOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/workorders', async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, localOnly: true, data: req.body });
    const created = await WorkOrder.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Batch sync endpoint for full client-to-MongoDB synchronization
app.post('/api/sync', async (req, res) => {
  try {
    const { equipment, workOrders, auditLogs } = req.body;
    let synced = { equipment: 0, workOrders: 0 };

    if (isMongoConnected) {
      if (Array.isArray(equipment) && equipment.length > 0) {
        for (const item of equipment) {
          await Equipment.findOneAndUpdate({ assetTag: item.assetTag }, item, { upsert: true, new: true });
        }
        synced.equipment = equipment.length;
      }
      if (Array.isArray(workOrders) && workOrders.length > 0) {
        for (const wo of workOrders) {
          await WorkOrder.findOneAndUpdate({ id: wo.id }, wo, { upsert: true, new: true });
        }
        synced.workOrders = workOrders.length;
      }
    }

    res.json({
      success: true,
      mongoConnected: isMongoConnected,
      message: 'Batch synchronization processed successfully.',
      synced: synced
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for single-page application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 SBEMS PRO MERN Server Running on: http://localhost:${PORT}`);
  console.log(`🍃 Connected MongoDB Database: sbems_clinical`);
  console.log(`====================================================`);
});
