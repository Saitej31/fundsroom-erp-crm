import { Request, Response } from "express";
import prisma from "../config/db";

export const getChallans = async (req: Request, res: Response) => {
  try {
    const challans = await prisma.challan.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: challans,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch challans",
    });
  }
};

export const getChallan = async (req: Request, res: Response) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    res.json({
      success: true,
      data: challan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch challan",
    });
  }
};

export const createChallan = async (req: Request, res: Response) => {
  try {
    const { customerId, createdById, items } = req.body;

    if (
      !customerId ||
      !createdById ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer, createdById and items are required",
      });
    }

    const challanNumber = `CH-${Date.now()}`;

    const challanItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      challanItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: Number(item.quantity),
        unitPrice: product.unitPrice,
      });
    }

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customer: {
          connect: { id: customerId },
        },
        user: {
          connect: { id: createdById },
        },
        items: {
          create: challanItems,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: challan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create challan",
    });
  }
};

export const confirmChallan = async (req: Request, res: Response) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
      },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be confirmed",
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.currentStock}`
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            movementType: "OUT",
            reason: `Sales Challan ${challan.challanNumber}`,
            user: {
             connect: { id: "f8f1a8a9-74ef-480f-a544-9172fceb78a4" },
            },
          },
        });
      }

      await tx.challan.update({
        where: { id: challan.id },
        data: {
          status: "CONFIRMED",
        },
      });
    });

    const updatedChallan = await prisma.challan.findUnique({
      where: { id: challan.id },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      message: "Challan confirmed successfully",
      data: updatedChallan,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to confirm challan",
    });
  }
};

export const cancelChallan = async (req: Request, res: Response) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
    });

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (challan.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be cancelled",
      });
    }

    const updated = await prisma.challan.update({
      where: { id: challan.id },
      data: {
        status: "CANCELLED",
      },
    });

    res.json({
      success: true,
      message: "Challan cancelled successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel challan",
    });
  }
};