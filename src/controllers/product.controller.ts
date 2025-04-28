import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class ProductController {
  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, price, stock, images, categoryId } = req.body;
      
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          stock,
          images: JSON.stringify(images),
          categoryId,
        },
      });

      res.status(201).json({
        ...product,
        images: JSON.parse(product.images),
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json({
        ...product,
        images: JSON.parse(product.images),
      });
    } catch (error) {
      console.error('Failed to get product:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, price, stock, images, categoryId } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          stock,
          images: images ? JSON.stringify(images) : undefined,
          categoryId,
        },
      });

      res.status(200).json({
        ...product,
        images: JSON.parse(product.images),
      });
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
}