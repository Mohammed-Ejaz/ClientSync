import mongoose from 'mongoose';

const freelancerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            // Never returned by default — callers must explicitly
            // .select('+passwordHash') for login/change-password/delete flows.
            select: false,
        },
        role: {
            type: String,
            enum: ['freelancer', 'admin'],
            default: 'freelancer',
        },
        avatarInitials: {
            type: String,
            default: '',
        },
        isOnboarded: {
            type: Boolean,
            default: false,
        },
        profileType: {
            type: String,
            enum: ['designer', 'developer', 'marketer', 'agency', 'consultant', 'other'],
            default: 'other',
        },
        workStyle: {
            type: String,
            enum: ['solo', 'small_team', 'growing_agency', 'established_studio'],
        },
        primaryNeeds: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Freelancer', freelancerSchema);