import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });
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

  const division = await Division.create(payload);

  return division;
};

const getAllDivisions = async () => {
  const divisions = await Division.find({});
  const totalDivisions = await Division.countDocuments();
  return {
    data: divisions,
    meta: {
      total: totalDivisions,
    },
  };
};

const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });
  return {
    data: division,
  };
};

/**
 * // i found the mistake ::: patch is not working
//Patch correct code below
*/

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new Error("Division not found.");
  }

  /**
 * // ERROR ::: name not id     name: payload.name,
 //   _id: { $ne: id },

 /// Patch correct code below
*/
  const duplicateDivision = await Division.findOne({
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

  const updatedDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedDivision;
};

const deleteDivision = async (id: string) => {
  await Division.findByIdAndDelete(id);
  return null;
};

export const DivisionService = {
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
