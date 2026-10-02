import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
    {
        freelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Freelancer',
            required: true,
            index: true, // every dashboard/list query filters on this
        },
        clientName: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true,
        },
        clientEmail: {
            type: String,
            default: '',
            trim: true,
            lowercase: true,
        },
        uniqueLinkUrl: {
            type: String,
            required: true,
            unique: true,
            match: [/^[A-Za-z0-9_-]{8,64}$/, 'Link token must be 8–64 URL-safe characters.'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending',
        },
        // Snapshot of the freelancer's profileType at the moment the link was
        // generated. Without this, changing your specialty in Settings later
        // silently reclassifies every existing client's submitted data.
        profileType: {
            type: String,
            enum: ['designer', 'developer', 'marketer', 'agency', 'consultant', 'other'],
            default: 'other',
        },
    },
    { timestamps: true }
);

export default mongoose.model('OnboardingRequest', requestSchema);