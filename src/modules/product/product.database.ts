import { ObjectId, type Filter, type Sort } from "mongodb";
import { getDb } from "../../database/mongo.js";
import type { ProductDoc } from "./product.model.js";

export type ProductEntity = ProductDoc & { _id: ObjectId };

export type ProductListQuery = {
    q?: string;
    category?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: "newest" | "price_asc" | "price_desc";
    page: number;
    limit: number;
};

export class ProductDatabase {
    private col() {
        return getDb().collection<ProductDoc>("products");
    }

    // List all products with optional filtering, sorting and pagination
    async list(query: ProductListQuery): Promise<ProductEntity[]> {
        const { q, category, tags, minPrice, maxPrice, sort, page, limit } = query;

        const filter: Filter<ProductDoc> = {};
        if (q) filter.title = { $regex: q, $options: "i" };
        if (category) filter.category = category;
        if (tags?.length) filter.tags = { $in: tags };
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {
                ...(minPrice !== undefined && { $gte: minPrice }),
                ...(maxPrice !== undefined && { $lte: maxPrice }),
            };
        }

        let sortOption: Sort = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };

        const skip = (page - 1) * limit;

        return this.col()
            .find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .toArray() as Promise<ProductEntity[]>;
    }

    // Create a new product document
    async create(doc: ProductDoc): Promise<ProductEntity> {
        const res = await this.col().insertOne(doc);
        return { ...doc, _id: res.insertedId };
    }

    // Find a single product by its ID
    async findById(id: string): Promise<ProductEntity | null> {
        return this.col().findOne({
            _id: new ObjectId(id),
        }) as Promise<ProductEntity | null>;
    }

    // Update a product by ID and return the updated document
    async updateById(id: string, set: Partial<ProductDoc>): Promise<ProductEntity | null> {
        return this.col().findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: set },
            { returnDocument: "after" }
        ) as Promise<ProductEntity | null>;
    }

    // Delete a product by ID, returns true if a document was deleted
    async deleteById(id: string): Promise<boolean> {
        const res = await this.col().deleteOne({ _id: new ObjectId(id) });
        return res.deletedCount === 1;
    }
}