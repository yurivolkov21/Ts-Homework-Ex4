import { ApiError } from "../../utils/http.js";
import type { ProductDatabase, ProductEntity, ProductListQuery } from "./product.database.js";
import type { ProductDoc, ProductStatus } from "./product.model.js";

export class ProductService {
    constructor(private readonly productDb: ProductDatabase) {}

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private async requireProductById(id: string): Promise<ProductEntity> {
        const product = await this.productDb.findById(id);
        if (!product) throw new ApiError(404, { message: "Product not found." });
        return product;
    }

    private assertPriceValid(price: number): void {
        if (typeof price !== "number" || price < 0)
            throw new ApiError(400, { message: "Price must be a non-negative number." });
    }

    // ─── Public Methods ──────────────────────────────────────────────────────────

    async list(query: ProductListQuery): Promise<ProductEntity[]> {
        return this.productDb.list(query);
    }

    async create(input: {
        sku: string;
        title: string;
        description: string;
        price: number;
        currency: "USE0" | "VND";
        category: string;
        tags?: string[];
        status?: ProductStatus;
    }): Promise<ProductEntity> {
        if (!input.sku?.trim())
            throw new ApiError(400, { message: "SKU is required." });
        if (!input.title?.trim())
            throw new ApiError(400, { message: "Title is required." });
        this.assertPriceValid(input.price);

        const now = new Date();
        const doc: ProductDoc = {
            sku: input.sku.trim(),
            title: input.title.trim(),
            description: input.description?.trim() ?? "",
            price: input.price,
            currency: input.currency,
            category: input.category?.trim() ?? "",
            tags: input.tags ?? [],
            status: input.status ?? "active",
            createdAt: now,
            updatedAt: now,
        };

        return this.productDb.create(doc);
    }

    async getById(id: string): Promise<ProductEntity> {
        return this.requireProductById(id);
    }

    async updateById(
        id: string,
        input: Partial<{
            title: string;
            description: string;
            price: number;
            currency: "USE0" | "VND";
            category: string;
            tags: string[];
            status: ProductStatus;
        }>
    ): Promise<ProductEntity> {
        await this.requireProductById(id);

        if (input.price !== undefined) this.assertPriceValid(input.price);

        const set: Partial<ProductDoc> = { ...input, updatedAt: new Date() };

        const updated = await this.productDb.updateById(id, set);
        if (!updated) throw new ApiError(404, { message: "Product not found." });
        return updated;
    }

    async deleteById(id: string): Promise<void> {
        await this.requireProductById(id);
        await this.productDb.deleteById(id);
    }
}
