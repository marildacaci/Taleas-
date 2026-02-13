const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
    {
        clubId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club",
            required: true
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },
        planName: {
            type: String, 
            required: true, 
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled"],
            default: "active"
        },
        reminderSentAt: {
            type: Date, 
            default: null 
        }

    },
    {timestamps: true}
);

MembershipSchema.index({ clubId: 1, memberId: 1 });
module.exports = mongoose.model("Membership", MembershipSchema);
