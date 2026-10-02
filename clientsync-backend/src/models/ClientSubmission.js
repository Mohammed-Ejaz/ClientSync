import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OnboardingRequest',
        required: true,
        unique: true, // one submission per request — also prevents double-submit races
    },
    companyInfo: { type: Object, default: {} },
    projectAssets: { type: Object, default: {} },
    technicalDetails: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('ClientSubmission', submissionSchema);