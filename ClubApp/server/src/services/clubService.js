const Club = require("../models/Club");
const AppError = require("../utils/AppError");

async function createClub(input) {
    const name = String(input.name || "");
    const type = input.type;

    if (!name || !type) throw new AppError("Name and type are required", 400, VALIDATION_ERROR);

    try{
        return await Club.create({
            ...input,
            name,
            description: input.description ?? "",
            address: input.address ?? ""
        });
    }catch(err) {
        if(err?.code === 11000) throw new AppError("Club name must be unique", 409, "CONFLICT");
        throw err;
    }
}

async function listClubs({ type, isPublic } = {}) {
  const filter = {};
  if (type) filter.type = type;
  if (typeof isPublic === "boolean") filter.isPublic = isPublic;

  return Club.find(filter).sort({ createdAt: -1 }).lean();
}

async function getClubById(id) {
    const club = await Club.findById(id).lean();
    if(!club) throw new AppError("Club not found", 400, "NOT_FOUND");
    return club;
}

async function updateClub(id, patch) {
  if (patch.name) patch.name = String(patch.name).trim();

  try {
    const updated = await Club.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
    if (!updated) throw new AppError("Club not found", 404, "NOT_FOUND");
    return updated;
  } catch (err) {
    if (err?.code === 11000) throw new AppError("Club name must be unique", 409, "CONFLICT");
    throw err;
  }
}

async function deleteClub(id) {
    const deleted = await Club.findByIdAndDelete(id).lean();
    if(!deleted) throw new AppError("Club not found", 404, "NOT_FOUND");
    return deleted;
}

module.exports = {createClub, listClubs, getClubById, updateClub, deleteClub}