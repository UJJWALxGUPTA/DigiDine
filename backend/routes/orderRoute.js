import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { 
    listOrders, 
    placeOrder, 
    updateStatus, 
    userOrders, 
    verifyOrder, 
    placeOrderCod 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// ✅ Log when the routes are initialized
console.log("✅ Order Routes Initialized");

// Get all orders (Admin)
orderRouter.get("/list", async (req, res) => {
    try {
        console.log("📌 Fetching Order List...");
        await listOrders(req, res);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Get user orders
orderRouter.post("/userorders", authMiddleware, async (req, res) => {
    try {
        console.log("📌 Fetching User Orders for:", req.user?.id);
        await userOrders(req, res);
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// ✅ Place an order
orderRouter.post("/place", authMiddleware, async (req, res) => {
    try {
        console.log("✅ Incoming Order Data:", req.body); // Log order request data
        
        if (!req.body.deliveryTime) {
            return res.status(400).json({ success: false, message: "Delivery time is required!" });
        }

        await placeOrder(req, res);
    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Update order status
orderRouter.post("/status", authMiddleware, async (req, res) => {
    try {
        console.log("📌 Updating Order Status:", req.body);
        await updateStatus(req, res);
    } catch (error) {
        console.error("❌ Error updating status:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Verify order payment
orderRouter.post("/verify", async (req, res) => {
    try {
        console.log("📌 Verifying Order Payment:", req.body);
        await verifyOrder(req, res);
    } catch (error) {
        console.error("❌ Error verifying order:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Place Cash on Delivery Order (COD)
orderRouter.post("/placecod", authMiddleware, async (req, res) => {
    try {
        console.log("✅ Incoming COD Order Data:", req.body);
        await placeOrderCod(req, res);
    } catch (error) {
        console.error("❌ Error placing COD order:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Test route
orderRouter.get("/test", (req, res) => {
    res.json({ success: true, message: "Order route is working!" });
});

export default orderRouter;
