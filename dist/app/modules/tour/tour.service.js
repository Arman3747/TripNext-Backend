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
exports.TourService = void 0;
const tour_model_1 = require("./tour.model");
const tour_constant_1 = require("./tour.constant");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }
    // comment from
    // const baseSlug = payload.title.toLowerCase().split(" ").join("-");
    // let slug = `${baseSlug}`;
    // let counter = 0;
    // while (await Tour.exists({ slug })) {
    //   slug = `${slug}-${counter++}`; // dhaka-division-2
    // }
    // payload.slug = slug;
    // comment letter till here
    const tour = yield tour_model_1.Tour.create(payload);
    return tour;
});
// const getAllToursOld = async (query: Record<string, string>) => {
//     console.log(query);
//     const filter = query
//     const searchTerm = query.searchTerm || "";
//     const sort = query.sort || "-createdAt";
//     const page = Number(query.page) || 1
//     const limit = Number(query.limit) || 10
//     const skip = (page - 1) * limit
//     //field fitlering
//     const fields = query.fields?.split(",").join(" ") || ""
//     //old field => title,location
//     //new fields => title location
//     // delete filter["searchTerm"]
//     // delete filter["sort"]
//     for (const field of excludeField) {
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field]
//     }
//     console.log(filter);
//     const searchQuery = {
//         $or: tourSearchableFields.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } }))
//     }
//     // [remove][remove][remove](SKip)[][][][][][]
//     // [][][][][](limit)[remove][remove][remove][remove]
//     // 1 page => [1][1][1][1][1][1][1][1][1][1] skip = 0 limit =10
//     // 2 page => [1][1][1][1][1][1][1][1][1][1]=>skip=>[2][2][2][2][2][2][2][2][2][2]<=limit skip = 10 limit =10
//     // 3 page => [1][1][1][1][1][1][1][1][1][1]=>skip=>[2][2][2][2][2][2][2][2][2][2]<=limit skip = 20 limit = 10
//     // skip = (page -1) * 10 = 30
//     // ?page=3&limit=10
//     // const tours = await Tour.find(searchQuery).find(filter).sort(sort).select(fields).skip(skip).limit(limit);
//     const filterQuery = Tour.find(filter)
//     const tours = filterQuery.find(searchQuery)
//     const allTours = await tours.sort(sort).select(fields).skip(skip).limit(limit)
//     // location = Dhaka
//     // search = Golf
//     const totalTours = await Tour.countDocuments();
//     // const totalPage = 21/10 = 2.1 => ciel(2.1) => 3
//     const totalPage = Math.ceil(totalTours / limit)
//     const meta = {
//         page: page,
//         limit: limit,
//         total: totalTours,
//         totalPage: totalPage,
//     }
//     return {
//         data: allTours,
//         meta: meta
//     }
// };
// CHANGE LETTER ---> ok code
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find(), query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    // const meta = await queryBuilder.getMeta()
    const [data, meta] = yield Promise.all([
        tours.build(),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new Error("Tour not found.");
    }
    // if (payload.title) {
    //     const baseSlug = payload.title.toLowerCase().split(" ").join("-")
    //     let slug = `${baseSlug}`
    //     let counter = 0;
    //     while (await Tour.exists({ slug })) {
    //         slug = `${slug}-${counter++}` // dhaka-division-2
    //     }
    //     payload.slug = slug
    // }
    /**
     * added the bellow logic
     */
    if (payload.deleteImages) {
        payload.deleteImages = Array.isArray(payload.deleteImages)
            ? payload.deleteImages
            : [payload.deleteImages];
    }
    /**
     * ✔ Error is not Cloudinary
  ✔ Not MongoDB
  ✔ Not .map() logic
  
  👉 Root cause: deleteImages is a string, not an array
    */
    if (payload.images &&
        payload.images.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        const restDBImages = existingTour.images.filter((imageUrl) => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedPayloadImages = (payload.images || [])
            .filter((imageUrl) => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); })
            .filter((imageUrl) => !restDBImages.includes(imageUrl));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    if (payload.deleteImages &&
        payload.deleteImages.length > 0 &&
        existingTour.images &&
        existingTour.images.length > 0) {
        yield Promise.all(payload.deleteImages.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    return updatedTour;
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.Tour.findByIdAndDelete(id);
});
const createTourType = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findOne({ name: payload.name });
    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }
    return yield tour_model_1.TourType.create({ name: payload.name });
});
const getAllTourTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield tour_model_1.TourType.find();
});
const updateTourType = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    const updatedTourType = yield tour_model_1.TourType.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return updatedTourType;
});
const deleteTourType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTourType = yield tour_model_1.TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }
    return yield tour_model_1.TourType.findByIdAndDelete(id);
});
exports.TourService = {
    createTour,
    createTourType,
    deleteTourType,
    updateTourType,
    getAllTourTypes,
    getAllTours,
    updateTour,
    deleteTour,
};
