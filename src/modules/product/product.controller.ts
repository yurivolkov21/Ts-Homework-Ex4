import { ok } from "../../utils/http.js";
import type { ActionController } from "../../types/express.js";
import type { ProductService } from "./product.service.js";

export class ProductController {
    constructor(private readonly productService: ProductService) {}

    private toProductDto(product: any) {
        return {
            id: product._id.toString(),
            sku: product.sku,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            category: product.category,
            tags: product.tags,
            status: product.status,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }

    // GET /products?q=&category=&tags=&minPrice=&maxPrice=&sort=&page=&limit=
    list: ActionController = async (req, res) => {
        const query = req.query as Record<string, string>;
        const page = Number(query.page ?? "1");
        const limit = Number(query.limit ?? "20");

        const products = await this.productService.list({
            page,
            limit,
            ...(query.q && { q: query.q }),
            ...(query.category && { category: query.category }),
            ...(query.tags && { tags: query.tags.split(",") }),
            ...(query.minPrice && { minPrice: Number(query.minPrice) }),
            ...(query.maxPrice && { maxPrice: Number(query.maxPrice) }),
            ...(query.sort && {
                sort: query.sort as "newest" | "price_asc" | "price_desc",
            }),
        });

        res.json(ok(products.map(this.toProductDto)));
    };

    // GET /products/:id
    getById: ActionController = async (req, res) => {
        const id = req.params.id as string;
        const product = await this.productService.getById(id);
        res.json(ok(this.toProductDto(product)));
    };

    // POST /products
    create: ActionController = async (req, res) => {
        const { sku, title, description, price, currency, category, tags, status } =
            req.body;

        const product = await this.productService.create({
            sku,
            title,
            description,
            price,
            currency,
            category,
            tags,
            status,
        });

        res.status(201).json(ok(this.toProductDto(product)));
    };

    // PUT /products/:id  (full update)
    // PATCH /products/:id (partial update)
    updateById: ActionController = async (req, res) => {
        const id = req.params.id as string;
        const { title, description, price, currency, category, tags, status } =
            req.body;

        const product = await this.productService.updateById(id, {
            title,
            description,
            price,
            currency,
            category,
            tags,
            status,
        });

        res.json(ok(this.toProductDto(product)));
    };

    // DELETE /products/:id
    delete: ActionController = async (req, res) => {
        const id = req.params.id as string;
        await this.productService.deleteById(id);
        res.status(204).send();
    };
}
