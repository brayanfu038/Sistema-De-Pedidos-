import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import axios from 'axios';
import { Eureka } from 'eureka-js-client';

// ====== Config ======
const PORT = process.env.PORT || 8082;
const MONGO_URI = process.env.MONGO_URI;
const APP_NAME = process.env.APP_NAME || 'orders';
const EUREKA_HOST = process.env.EUREKA_HOST || 'localhost';
const EUREKA_PORT = process.env.EUREKA_PORT || 8761;
const GATEWAY_BASE = process.env.GATEWAY_BASE || 'http://localhost:8080';

// ====== Mongoose model ======
const orderSchema = new mongoose.Schema(
  {
    customerid: { type: String, required: true }, // = document de Customer
    orderID:    { type: String, required: true, unique: true },
    status:     { type: String, enum: ['Received','In progress','Sended'], default: 'Received' }
  },
  { collection: 'Order', timestamps: true }
);
const Order = mongoose.model('Order', orderSchema);

// ====== App ======
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ====== Health ======
app.get('/actuator/health', (_, res) => res.json({ status: 'UP' }));

// ====== Helpers ======
async function customerExists(customerid) {
  try {
    const url = `${GATEWAY_BASE}/customer/findcustomerbyid/${encodeURIComponent(customerid)}`;
    const { data } = await axios.get(url, { timeout: 4000 });
    return !!data?.document;
  } catch {
    return false;
  }
}

// ====== Endpoints ======
// POST /order/createorder  y  /createorder  -> { orderCreated: boolean }
app.post(['/order/createorder', '/createorder'], async (req, res) => {
  try {
    const { customerid, orderID, status } = req.body || {};
    if (!customerid || !orderID) {
      return res.status(400).json({ error: 'customerid y orderID son obligatorios', orderCreated: false });
    }

    const okCustomer = await customerExists(customerid);
    if (!okCustomer) {
      return res.status(404).json({ error: 'Customer no existe', orderCreated: false });
    }

    await Order.create({ customerid, orderID, status: status || 'Received' });
    return res.status(201).json({ orderCreated: true });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'orderID duplicado', orderCreated: false });
    }
    return res.status(500).json({ error: 'Error creando orden', orderCreated: false });
  }
});

// PUT /order/updateorderstatus  y  /updateorderstatus  -> { orderStatusUpdated: boolean }
app.put(['/order/updateorderstatus', '/updateorderstatus'], async (req, res) => {
  try {
    const { orderID, status } = req.body || {};
    if (!orderID || !status) {
      return res.status(400).json({ error: 'orderID y status son obligatorios', orderStatusUpdated: false });
    }
    const allowed = ['Received','In progress','Sended'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'status inválido', orderStatusUpdated: false });
    }
    const upd = await Order.findOneAndUpdate({ orderID }, { status }, { new: true });
    if (!upd) return res.status(404).json({ error: 'orderID no existe', orderStatusUpdated: false });
    return res.json({ orderStatusUpdated: true });
  } catch {
    return res.status(500).json({ error: 'Error actualizando estado', orderStatusUpdated: false });
  }
});

// GET /order/findorderbycustomerid/{customerid}  y  /findorderbycustomerid/{customerid}
app.get(['/order/findorderbycustomerid/:customerid', '/findorderbycustomerid/:customerid'], async (req, res) => {
  try {
    const { customerid } = req.params;
    const list = await Order.find({ customerid }).select('-_id customerid orderID status').lean();
    return res.json(list);
  } catch {
    return res.status(500).json([]);
  }
});

// ====== Start ======
(async () => {
  await mongoose.connect(MONGO_URI);
  console.log('[orders-ms] Mongo conectado');

  // registra en Eureka
  const client = new Eureka({
    instance: {
      app: APP_NAME.toUpperCase(), // ORDERS
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      statusPageUrl: `http://localhost:${PORT}/actuator/health`,
      healthCheckUrl: `http://localhost:${PORT}/actuator/health`,
      port: { '$': PORT, '@enabled': true },
      vipAddress: APP_NAME,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn'
      }
    },
    eureka: {
      host: EUREKA_HOST,
      port: EUREKA_PORT,
      servicePath: '/eureka/apps/'
    }
  });

  client.start(() => {
    console.log('[orders-ms] Registrado en Eureka como', APP_NAME.toUpperCase());
  });

  app.listen(PORT, () => {
    console.log(`[orders-ms] escuchando en :${PORT}`);
  });
})();
