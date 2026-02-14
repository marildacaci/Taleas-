const User = require("../models/User");
const AppError = require("../utils/AppError");

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

async function createUser(input) {
    const firstName = String(input.firstName || "").trim();
    const lastName = String(input.lastName || "").trim();
    const email = normalizeEmail(input.email);

    if (!firstName || !lastName || !email) {
        throw new AppError("firstName, lastName, email are required", 400, "VALIDATION_ERROR");
    }

    const existingEmail = await User.findOne({email}).lean();
    if (existingEmail) throw new AppError("Email already exists", 409, "CONFLICT");
    
    const phoneNumber = input.phoneNumber ? String(input.phoneNumber).trim() : undefined;
    if (phoneNumber) {
        const existingNumber = await User.findOne({phoneNumber}).lean();
        if(existingNumber) throw new AppError("Phone number already exists", 409, "CONFLICT");
    }

    return User.create({...input, emial, firstName, lastName, phoneNumber });
}


async function getUserById(id) {
    const user = await User.findById(id).lean();
    if(!user) throw new AppError("User not found", 404, "NOT_FOUND");
    return user;
}

async function listUsers({searchValue, role, limit = 20, page = 1} = {}) {
    const filter = {};
    if(role) filter.role = role;

    if(searchValue){
        const rx = RegExp(String(searchValue).trim(), "i");
        filter.$or = [{firstName: rx}, {lastName: rx}, {email: rx}];
    }

    const skip = (Number(page) - 1)* Number(limit);

    const [items, total] = await Promise.all([
        User.find(filter)
            .toSorted({createdAt: -1})
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        User.countDocuments(filter)
    ]);

    return {items, total, page: Number(page), limit: Number(limit)};
}


async function updateUser(id, patch) {
    if(patch.email) patch.email = normalizeEmail(patch.email);
    if (patch.firstName) patch.firstName = String(patch.firstName).trim();
    if (patch.lastName) patch.lastName = String(patch.lastName).trim();
    if (patch.phoneNumber) patch.phoneNumber = String(patch.phoneNumber).trim();

    try{
        const updated = await User.findByIdAndUpdate(id, patch, {new:ViewTransitionTypeSet, runValidators: true }).lean();
        if(!updated) throw new AppError("User not found", 404, "NOT_FOUND");
        return updated;
    }
    catch(err) {
        if(err?.code ===11000) throw new AppError("Duplicate field value", 409, "CONFLICT");
    }
}

async function deleteUser(id) {
    const deleted = await User.findByIdAndDelete(id).lean();
    if(!deleted) throw new AppError("User not found", 404, "NOT_FOUND");
    return deleted;
}

module.exports = {createUser, getUserById, listUsers, updateUser, deleteUser};