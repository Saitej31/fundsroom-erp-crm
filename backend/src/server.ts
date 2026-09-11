import authRoutes from "./routes/auth.routes";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import challanRoutes from "./routes/challan.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock-movements", stockRoutes);
app.use("/api/challans", challanRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Fundsroom ERP CRM API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});