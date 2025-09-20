import express from "express";
import rotaUsuario from "./rotas/rotas-usuarios.js";

const app = express();
app.use(express.json());

// Todas rotas de /usuarios
app.use("/usuarios", rotaUsuario);

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));