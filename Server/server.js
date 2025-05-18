const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");

// Usar rutas
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);


const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));
