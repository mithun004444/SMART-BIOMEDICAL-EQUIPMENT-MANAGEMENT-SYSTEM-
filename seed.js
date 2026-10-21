/**
 * SBEMS PRO - MongoDB Atlas Database Seeder
 * Populates sample biomedical equipment and work orders in MongoDB Atlas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Equipment = require('./models/Equipment');
const WorkOrder = require('./models/WorkOrder');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mithunraghav004_db_user:y2aVNUFjByFXelMr@cluster0.luvxo31.mongodb.net/sbems_clinical?retryWrites=true&w=majority';

const sampleEquipment = [
  {
    assetTag: 'BM-DEF-001',
    name: 'Biphasic Defibrillator / Pacemaker',
    category: 'Cardiology / Resuscitation',
    manufacturer: 'Zoll Medical',
    model: 'R Series ALS',
    serialNumber: 'ZL-90234-X',
    departmentId: 'ICU-CARDIAC',
    room: 'Crash Cart Bay 2',
    status: 'operational',
    criticality: 'life-support',
    riskClass: 'Class III',
    purchaseDate: '2023-03-15',
    warrantyExpiry: '2027-03-15',
    purchaseCost: 18500,
    pmFrequencyDays: 90,
    lastPMDate: '2026-08-10',
    nextPMDate: '2026-11-10',
    lastCalibDate: '2026-08-10',
    nextCalibDate: '2026-11-10',
    assignedEngineerId: 'ENG-ALEX-M',
    downtimeHours: 0,
    notes: 'Joule output verified within 2% margin. Pads & internal battery inspected.'
  },
  {
    assetTag: 'BM-VENT-102',
    name: 'Intensive Care Mechanical Ventilator',
    category: 'Respiratory Care',
    manufacturer: 'Getinge / Maquet',
    model: 'Servo-u Neonatal/Adult',
    serialNumber: 'MQ-44821-B',
    departmentId: 'ICU-GENERAL',
    room: 'Bed 12 (Isolation)',
    status: 'operational',
    criticality: 'life-support',
    riskClass: 'Class III',
    purchaseDate: '2022-11-01',
    warrantyExpiry: '2026-11-01',
    purchaseCost: 34000,
    pmFrequencyDays: 60,
    lastPMDate: '2026-09-01',
    nextPMDate: '2026-11-01',
    lastCalibDate: '2026-09-01',
    nextCalibDate: '2026-11-01',
    assignedEngineerId: 'ENG-ALEX-M',
    downtimeHours: 2,
    notes: 'O2 sensor calibrated and flow cassette integrity certified.'
  },
  {
    assetTag: 'BM-PMP-305',
    name: 'Volumetric Infusion Smart Pump',
    category: 'Infusion Technology',
    manufacturer: 'B. Braun',
    model: 'Infusomat Space',
    serialNumber: 'BB-67891-C',
    departmentId: 'ONCOLOGY',
    room: 'Infusion Suite 4',
    status: 'operational',
    criticality: 'high',
    riskClass: 'Class IIb',
    purchaseDate: '2024-01-20',
    warrantyExpiry: '2028-01-20',
    purchaseCost: 3200,
    pmFrequencyDays: 180,
    lastPMDate: '2026-06-15',
    nextPMDate: '2026-12-15',
    lastCalibDate: '2026-06-15',
    nextCalibDate: '2026-12-15',
    assignedEngineerId: 'ENG-ALEX-M',
    downtimeHours: 0,
    notes: 'Dose Error Reduction System (DERS) drug library v8.2 updated.'
  },
  {
    assetTag: 'BM-MON-410',
    name: 'Multi-Parameter Patient Monitor',
    category: 'Physiological Monitoring',
    manufacturer: 'Philips Healthcare',
    model: 'IntelliVue MX750',
    serialNumber: 'PH-11029-K',
    departmentId: 'EMERGENCY-ED',
    room: 'Trauma Bay 1',
    status: 'under_maintenance',
    criticality: 'critical',
    riskClass: 'Class IIb',
    purchaseDate: '2023-08-10',
    warrantyExpiry: '2027-08-10',
    purchaseCost: 14500,
    pmFrequencyDays: 90,
    lastPMDate: '2026-07-20',
    nextPMDate: '2026-10-20',
    lastCalibDate: '2026-07-20',
    nextCalibDate: '2026-10-20',
    assignedEngineerId: 'ENG-ALEX-M',
    downtimeHours: 4,
    notes: 'NIBP cuff module transducer undergoing zero-point recalibration.'
  },
  {
    assetTag: 'BM-IMG-502',
    name: 'Mobile Surgical C-Arm Fluoroscopy System',
    category: 'Medical Imaging',
    manufacturer: 'Siemens Healthineers',
    model: 'Cios Alpha',
    serialNumber: 'SM-88190-Z',
    departmentId: 'SURGERY-OT',
    room: 'Operating Theatre 3',
    status: 'operational',
    criticality: 'critical',
    riskClass: 'Class IIb',
    purchaseDate: '2021-05-18',
    warrantyExpiry: '2026-05-18',
    purchaseCost: 120000,
    pmFrequencyDays: 90,
    lastPMDate: '2026-08-01',
    nextPMDate: '2026-11-01',
    lastCalibDate: '2026-08-01',
    nextCalibDate: '2026-11-01',
    assignedEngineerId: 'ENG-ALEX-M',
    downtimeHours: 1,
    notes: 'Radiation output dosimetry within AERB & FDA compliance tolerances.'
  }
];

const sampleWorkOrders = [
  {
    id: 'WO-2026-0891',
    equipmentId: 'BM-DEF-001',
    title: 'Quarterly Metrology Energy Discharge Calibration',
    type: 'calibration',
    priority: 'high',
    status: 'completed',
    reportedDate: '2026-08-10',
    reportedBy: 'Alex Mercer, CBET',
    assignedEngineerId: 'ENG-ALEX-M',
    estimatedHours: 2,
    actualHours: 1.8,
    partsCost: 0,
    laborCost: 180,
    issueDescription: 'Routine 90-day IEC 60601 calibration & internal defibrillator analyzer test.',
    actionTaken: 'Certified 50J, 100J, 200J and 360J energy levels using Fluke Impulse 7000DP. Passed.'
  },
  {
    id: 'WO-2026-0944',
    equipmentId: 'BM-MON-410',
    title: 'NIBP Module Intermittent Measurement Error (Code Err-24)',
    type: 'corrective',
    priority: 'critical',
    status: 'in_progress',
    reportedDate: '2026-10-18',
    reportedBy: 'Nurse Elena Rostova (ICU)',
    assignedEngineerId: 'ENG-ALEX-M',
    estimatedHours: 3,
    actualHours: 1.5,
    partsCost: 120,
    laborCost: 220,
    issueDescription: 'NIBP pump fails to reach 180 mmHg target on trauma patient monitor.',
    actionTaken: 'Pneumatic leak traced to quick-connect Luer valve. Replacement valve installed. Recalibrating.'
  }
];

async function seedDatabase() {
  try {
    console.log('====================================================');
    console.log('🍃 Connecting to MongoDB Atlas Cluster...');
    console.log(`📡 URI: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
    console.log('====================================================');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully to MongoDB Atlas!\n');

    console.log('🌱 Upserting sample biomedical equipment...');
    for (const eq of sampleEquipment) {
      await Equipment.findOneAndUpdate({ assetTag: eq.assetTag }, eq, { upsert: true, new: true });
      console.log(`   + Equipment: [${eq.assetTag}] ${eq.name}`);
    }

    console.log('\n🌱 Upserting clinical work orders...');
    for (const wo of sampleWorkOrders) {
      await WorkOrder.findOneAndUpdate({ id: wo.id }, wo, { upsert: true, new: true });
      console.log(`   + Work Order: [${wo.id}] ${wo.title}`);
    }

    console.log('\n====================================================');
    console.log('🎉 MongoDB Atlas Seeding Complete!');
    console.log(`🍃 Database: sbems_clinical`);
    console.log(`📦 Equipment count: ${sampleEquipment.length}`);
    console.log(`📋 Work orders count: ${sampleWorkOrders.length}`);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Failed to seed MongoDB Atlas:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connection closed.');
  }
}

seedDatabase();
