import mongoose from 'mongoose';
import Role from '../models/Role.js';
import Department from '../models/Department.js';
import ComplaintCategory from '../models/ComplaintCategory.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Role.deleteMany({});
    await Department.deleteMany({});
    await ComplaintCategory.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Seed Roles
    const roles = [
      {
        name: 'citizen',
        displayName: 'Citizen',
        description: 'Regular citizen user',
        level: 1,
        permissions: {
          complaints: { create: true, read: true, update: false, delete: false, assign: false, bulkActions: false },
          users: { create: false, read: false, update: false, delete: false, manageRoles: false },
          departments: { manage: false, viewReports: false },
          landRegistry: { create: true, approve: false, verify: false, viewAll: false },
          system: { viewLogs: false, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'call_center_agent',
        displayName: 'Call Center Agent',
        description: 'Handles phone and IVR complaints',
        level: 2,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: false, assign: false, bulkActions: false },
          users: { create: false, read: true, update: false, delete: false, manageRoles: false },
          departments: { manage: false, viewReports: false },
          landRegistry: { create: false, approve: false, verify: false, viewAll: false },
          system: { viewLogs: false, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'field_worker',
        displayName: 'Field Worker',
        description: 'On-ground complaint resolution',
        level: 3,
        permissions: {
          complaints: { create: false, read: true, update: true, delete: false, assign: false, bulkActions: false },
          users: { create: false, read: false, update: false, delete: false, manageRoles: false },
          departments: { manage: false, viewReports: false },
          landRegistry: { create: false, approve: false, verify: true, viewAll: false },
          system: { viewLogs: false, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'department_officer',
        displayName: 'Department Officer',
        description: 'Department-level complaint management',
        level: 4,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: false, assign: true, bulkActions: false },
          users: { create: false, read: true, update: false, delete: false, manageRoles: false },
          departments: { manage: false, viewReports: true },
          landRegistry: { create: false, approve: false, verify: true, viewAll: false },
          system: { viewLogs: false, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'department_head',
        displayName: 'Department Head',
        description: 'Head of department',
        level: 5,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: true, assign: true, bulkActions: true },
          users: { create: true, read: true, update: true, delete: false, manageRoles: false },
          departments: { manage: true, viewReports: true },
          landRegistry: { create: false, approve: true, verify: true, viewAll: true },
          system: { viewLogs: true, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'ward_admin',
        displayName: 'Ward Administrator',
        description: 'Ward-level administration',
        level: 6,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: true, assign: true, bulkActions: true },
          users: { create: true, read: true, update: true, delete: true, manageRoles: false },
          departments: { manage: true, viewReports: true },
          landRegistry: { create: false, approve: true, verify: true, viewAll: true },
          system: { viewLogs: true, manageSettings: false, accessBlockchain: false }
        }
      },
      {
        name: 'city_admin',
        displayName: 'City Administrator',
        description: 'City-wide administration',
        level: 7,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: true, assign: true, bulkActions: true },
          users: { create: true, read: true, update: true, delete: true, manageRoles: true },
          departments: { manage: true, viewReports: true },
          landRegistry: { create: true, approve: true, verify: true, viewAll: true },
          system: { viewLogs: true, manageSettings: true, accessBlockchain: false }
        }
      },
      {
        name: 'system_admin',
        displayName: 'System Administrator',
        description: 'Technical system administration',
        level: 8,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: true, assign: true, bulkActions: true },
          users: { create: true, read: true, update: true, delete: true, manageRoles: true },
          departments: { manage: true, viewReports: true },
          landRegistry: { create: true, approve: true, verify: true, viewAll: true },
          system: { viewLogs: true, manageSettings: true, accessBlockchain: true }
        }
      },
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access',
        level: 9,
        permissions: {
          complaints: { create: true, read: true, update: true, delete: true, assign: true, bulkActions: true },
          users: { create: true, read: true, update: true, delete: true, manageRoles: true },
          departments: { manage: true, viewReports: true },
          landRegistry: { create: true, approve: true, verify: true, viewAll: true },
          system: { viewLogs: true, manageSettings: true, accessBlockchain: true }
        }
      }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('✅ Seeded 9 roles');

    // Seed Departments
    const departments = [
      { name: 'Water Supply', code: 'WATER', description: 'Water supply and distribution', smsKeywords: ['WATER', 'PANI'], ivrMenuOption: 1 },
      { name: 'Sanitation', code: 'SANIT', description: 'Waste management and cleanliness', smsKeywords: ['GARBAGE', 'WASTE', 'SAFAI'], ivrMenuOption: 2 },
      { name: 'Roads & Infrastructure', code: 'ROADS', description: 'Road maintenance and repairs', smsKeywords: ['ROAD', 'POTHOLE', 'SADAK'], ivrMenuOption: 3 },
      { name: 'Street Lighting', code: 'LIGHT', description: 'Street lights and illumination', smsKeywords: ['LIGHT', 'LAMP', 'BATTI'], ivrMenuOption: 4 },
      { name: 'Public Health', code: 'HEALTH', description: 'Public health and sanitation', smsKeywords: ['HEALTH', 'SWASTHYA'], ivrMenuOption: 5 },
      { name: 'Building & Planning', code: 'BUILD', description: 'Building permissions and planning', smsKeywords: ['BUILDING', 'CONSTRUCTION'], ivrMenuOption: 6 },
      { name: 'Property Tax', code: 'TAX', description: 'Property tax collection', smsKeywords: ['TAX', 'KAR'], ivrMenuOption: 7 },
      { name: 'Birth & Death Registration', code: 'VITAL', description: 'Vital statistics registration', smsKeywords: ['BIRTH', 'DEATH'], ivrMenuOption: 8 },
      { name: 'Public Grievance', code: 'GRIEV', description: 'General public grievances', smsKeywords: ['COMPLAINT', 'SHIKAYAT'], ivrMenuOption: 9 },
      { name: 'Land Registry', code: 'LAND', description: 'Land registration and mutations', smsKeywords: ['LAND', 'PROPERTY', 'JAMEEN'], ivrMenuOption: 10 },
      { name: 'Electricity', code: 'ELEC', description: 'Electricity supply issues', smsKeywords: ['ELECTRICITY', 'POWER', 'BIJLI'], ivrMenuOption: 11 },
      { name: 'Parks & Gardens', code: 'PARKS', description: 'Public parks maintenance', smsKeywords: ['PARK', 'GARDEN', 'UDYAN'], ivrMenuOption: 12 }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log('✅ Seeded 12 departments');

    // Seed Complaint Categories
    const categories = [
      { name: 'Water Leakage', department: createdDepartments[0]._id, description: 'Pipeline leaks', defaultPriority: 'P2', smsKeywords: ['LEAK'], slaHours: 24 },
      { name: 'No Water Supply', department: createdDepartments[0]._id, description: 'Complete water cutoff', defaultPriority: 'P1', smsKeywords: ['NOWATER'], slaHours: 4 },
      { name: 'Garbage Not Collected', department: createdDepartments[1]._id, description: 'Waste collection pending', defaultPriority: 'P2', smsKeywords: ['GARBAGE'], slaHours: 24 },
      { name: 'Pothole on Road', department: createdDepartments[2]._id, description: 'Road damage', defaultPriority: 'P3', smsKeywords: ['POTHOLE'], slaHours: 72 },
      { name: 'Street Light Not Working', department: createdDepartments[3]._id, description: 'Non-functional streetlight', defaultPriority: 'P3', smsKeywords: ['LIGHTOUT'], slaHours: 48 },
      { name: 'Drainage Blockage', department: createdDepartments[1]._id, description: 'Blocked drainage system', defaultPriority: 'P2', smsKeywords: ['DRAIN'], slaHours: 24 }
    ];

    await ComplaintCategory.insertMany(categories);
    console.log('✅ Seeded complaint categories');

    // Create default admin user
    const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
    const adminUser = await User.create({
      name: 'System Administrator',
      phone: process.env.ADMIN_PHONE || '9876543210',
      email: process.env.ADMIN_EMAIL || 'admin@citysamadhaan.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      authMethod: 'password',
      role: superAdminRole._id,
      isVerified: { phone: true, email: true, aadhaar: false },
      language: 'en'
    });
    console.log('✅ Created admin user');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\nAdmin Credentials:`);
    console.log(`Phone: ${adminUser.phone}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
