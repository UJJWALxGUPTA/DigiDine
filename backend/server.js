import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)


app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
      console.log(`✅ Registered Route: ${r.route.path} [${Object.keys(r.route.methods)}]`);
  } else if (r.name === 'router') {
      r.handle.stack.forEach((s) => {
          if (s.route) {
              console.log(`✅ Nested Route: ${s.route.path} [${Object.keys(s.route.methods)}]`);
          }
      });
  }
});


app.get("/", (req, res) => {
    res.send("API Working")
  });

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))