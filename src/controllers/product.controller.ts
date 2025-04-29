import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { search, categoryId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = String(categoryId);
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        products,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: { categoryId },
          include: {
            category: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.product.count({
          where: { categoryId },
        }),
      ]);

      res.json({
        products,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        total,
      });
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      res.status(500).json({ error: 'Failed to fetch products by category' });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stockQuantity, categoryId, imageUrl } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          categoryId,
          imageUrl,
        },
        include: {
          category: true,
        },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, price, stockQuantity, categoryId, imageUrl } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price: Number(price),
          stockQuantity: Number(stockQuantity),
          categoryId,
          imageUrl,
        },
        include: {
          category: true,
        },
      });

      res.json(product);
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stockQuantity } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          stockQuantity: Number(stockQuantity),
        },
      });

      res.json(product);
    } catch (error) {
      console.error('Failed to update stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  }
}