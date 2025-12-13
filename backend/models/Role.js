import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    enum: [
      'citizen',
      'call_center_agent',
      'field_worker',
      'department_officer',
      'department_head',
      'ward_admin',
      'city_admin',
      'system_admin',
      'super_admin'
    ]
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 9
  },
  permissions: {
    complaints: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      assign: { type: Boolean, default: false },
      bulkActions: { type: Boolean, default: false }
    },
    users: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      manageRoles: { type: Boolean, default: false }
    },
    departments: {
      manage: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false }
    },
    landRegistry: {
      create: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      verify: { type: Boolean, default: false },
      viewAll: { type: Boolean, default: false }
    },
    system: {
      viewLogs: { type: Boolean, default: false },
      manageSettings: { type: Boolean, default: false },
      accessBlockchain: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ level: 1 });

const Role = mongoose.model('Role', roleSchema);

export default Role;
