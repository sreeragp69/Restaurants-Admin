const mongoose = require("mongoose");
const permissionSchema = new mongoose.Schema({
    component: { type: String },
    subComponent: [
        {
            subComponentName: { type: String, default: " " },
            permissions: [
                {
                    name: { type: String },
                    method: {
                      type: String,
                      uppercase: true,
                      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    },
                    route: { type: String },
                    isPermission: { type: Boolean, default: false }
                }
            ],
        }
    ],
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    date: {
        type: Date,
        default: new Date(),
    }
},
    { timestamps: true }
);


// Define the schema for roles  
const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        uppercase: true,
        index: true, unique: true, required: true, uniqueCaseInsensitive: true
    },
    rolePermissions: [permissionSchema],
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    date: {
        type: Date,
        default: new Date(),
    }
},{ timestamps: true });


// Define the Role model
const Role = mongoose.model('Role', roleSchema);

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Role;