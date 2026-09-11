import { Request, Response } from "express";
import prisma from "../config/db";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "");

    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStock,
      warehouseLocation,
    } = req.body;

    if (!name || !sku || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU and unit price are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock || 0),
        minimumStock: Number(minimumStock || 0),
        warehouseLocation,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        stockMovements: true,
        challanItems: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
};