import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryController {
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });
      res.json(categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Failed to fetch category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const category = await prisma.category.create({
        data: {
          name,
          description,
        },
      });
      res.status(201).json(category);
    } catch (error) {
      console.error('Failed to create category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          description,
        },
      });

      res.json(category);
    } catch (error) {
      console.error('Failed to update category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.category.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}