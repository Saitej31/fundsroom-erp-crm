import { Request, Response } from "express";
import prisma from "../config/db";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || "");

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { businessName: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { challans: true },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    if (!name || !mobile || !customerType || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, customer type and address are required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status: status || "ACTIVE",
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }
};