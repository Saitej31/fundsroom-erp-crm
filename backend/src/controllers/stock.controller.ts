import { Request, Response } from "express";
import prisma from "../config/db";

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};

export const createStockMovement = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, type, reason, createdById } = req.body;

    if (!productId || !quantity || !type || !createdById) {
      return res.status(400).json({
        success: false,
        message: "Product, quantity, type and createdById are required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (type === "OUT" && product.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    const newStock =
      type === "IN"
        ? product.currentStock + qty
        : product.currentStock - qty;

    const result = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          currentStock: newStock,
        },
      }),

      prisma.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          type,
          reason,
          createdById,
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Stock movement created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create stock movement",
    });
  }
};