import { Router } from "express";
import {
    listarTodosUsuarios,
    buscarUsuarioPorId,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    loginUsuario
} from "../controller/usuarios-controller.js";
import { verifyUser } from "../middlewares/auth.js";

const roteador = Router();

roteador.post("/login", loginUsuario);

// Apenas usuários autenticados podem listar todos
roteador.get("/", verifyUser, listarTodosUsuarios);

// Outras rotas
roteador.get("/:id", buscarUsuarioPorId);
roteador.post("/", verifyUser, criarUsuario); // criar também exige autenticação
roteador.patch("/:id", verifyUser, atualizarUsuario);
roteador.delete("/:id", verifyUser, deletarUsuario);

export default roteador;