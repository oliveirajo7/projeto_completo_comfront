import express from "express";
import path from "path";

import rotaUsuario from "./rotas/rotas-usuarios.js";

const app = express();
app.use(express.json());

// Servir a pasta "front" como estática
app.use(express.static(path.join('.', 'front')));

// Rotas da API
app.use('/usuarios', rotaUsuario);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});