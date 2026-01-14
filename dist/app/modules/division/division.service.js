"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const division_model_1 = require("./division.model");
const createDivision = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("A division with this name already exists.");
    }
    // const baseSlug = payload.name.toLowerCase().split(" ").join("-");
    // let slug = `${baseSlug}-division`;
    // let counter = 0;
    // while (await Division.exists({ slug })) {
    //   slug = `${slug}-${counter++}`; // dhaka-division-2
    // }
    // payload.slug = slug;
    const division = yield division_model_1.Division.create(payload);
    return division;
});
const getAllDivisions = () => __awaiter(void 0, void 0, void 0, function* () {
    const divisions = yield division_model_1.Division.find({});
    const totalDivisions = yield division_model_1.Division.countDocuments();
    return {
        data: divisions,
        meta: {
            total: totalDivisions,
        },
    };
});
const getSingleDivision = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const division = yield division_model_1.Division.findOne({ slug });
    return {
        data: division,
    };
});
/**
 * // i found the mistake ::: patch is not working
//Patch correct code below
*/
const updateDivision = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingDivision = yield division_model_1.Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    }
    /**
   * // ERROR ::: name not id     name: payload.name,
   //   _id: { $ne: id },
  
   /// Patch correct code below
  */
    const duplicateDivision = yield division_model_1.Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new Error("A division with this name already exists.");
    }
    // if (payload.name) {
    //   const baseSlug = payload.name.toLowerCase().split(" ").join("-");
    //   let slug = `${baseSlug}-division`;
    //   let counter = 0;
    //   while (await Division.exists({ slug })) {
    //     slug = `${slug}-${counter++}`; // dhaka-division-2
    //   }
    //   payload.slug = slug;
    // }
    const updatedDivision = yield division_model_1.Division.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (payload.thumbnail && existingDivision.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(existingDivision.thumbnail);
    }
    return updatedDivision;
});
const deleteDivision = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield division_model_1.Division.findByIdAndDelete(id);
    return null;
});
exports.DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};
/**
 * Patch correct code below
 */
/**
 * import slugify from "slugify";

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new Error("Division not found.");
  }

  // ✅ Only check duplicate if name is being updated
  if (payload.name) {
    const duplicateDivision = await Division.findOne({
      name: payload.name,
      _id: { $ne: id },
    });

    if (duplicateDivision) {
      throw new Error("A division with this name already exists.");
    }

    // ✅ Generate slug correctly
    const baseSlug = slugify(payload.name, { lower: true });
    let slug = `${baseSlug}-division`;
    let counter = 1;

    while (
      await Division.exists({
        slug,
        _id: { $ne: id }, // important for PATCH
      })
    ) {
      slug = `${baseSlug}-division-${counter++}`;
    }

    payload.slug = slug;
  }

  const updatedDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedDivision;
};
*/
