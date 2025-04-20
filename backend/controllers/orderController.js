import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = "http://localhost:5173";

// 🛒 Place Order using Stripe (Online Payment)
const placeOrder = async (req, res) => {
    try {
        console.log("🔥 Incoming Order:", req.body);

        const { userId, items, amount, address, deliveryTime } = req.body;

        // Validate required fields
        if (!userId || !items || items.length === 0 || !amount || !deliveryTime) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        // Create order in database
        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            time: deliveryTime, // Saving delivery time
            status: "Pending", // Default status
            payment: false, // Initially unpaid
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Stripe Checkout Session
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: { name: item.name },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: { name: "Delivery Charge" },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
            line_items: line_items,
            mode: "payment",
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("❌ Error placing order:", error);
        res.status(500).json({ success: false, message: "Error processing order" });
    }
};

// 🚀 Place Order using Cash on Delivery (COD)
const placeOrderCod = async (req, res) => {
    try {
        console.log("🔥 Incoming COD Order:", req.body);

        const { userId, items, amount, address, deliveryTime } = req.body;

        if (!userId || !items || items.length === 0 || !amount || !deliveryTime) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            time: deliveryTime, // Saving delivery time
            status: "Pending",
            payment: true, // COD is considered paid
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order placed successfully." });

    } catch (error) {
        console.error("❌ Error placing COD order:", error);
        res.status(500).json({ success: false, message: "Error processing COD order" });
    }
};

// 📦 List All Orders for Admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("❌ Error listing orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// 📦 List User Orders
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        const orders = await orderModel.find({ userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
    }
};

// 🔄 Update Order Status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "Order ID and status are required." });
        }

        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Order status updated." });
    } catch (error) {
        console.error("❌ Error updating status:", error);
        res.status(500).json({ success: false, message: "Error updating order status" });
    }
};

// ✅ Verify Payment and Confirm Order
const verifyOrder = async (req, res) => {
    try {
        const { orderId, success } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required." });
        }

        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Order payment verified." });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Order payment failed, order deleted." });
        }
    } catch (error) {
        console.error("❌ Error verifying order:", error);
        res.status(500).json({ success: false, message: "Error verifying order" });
    }
};

export { placeOrder, placeOrderCod, listOrders, userOrders, updateStatus, verifyOrder };
