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

// Rota de login (não precisa de middleware)
roteador.post("/login", loginUsuario);

// Rotas de usuários (somente admin deve ver todos)
roteador.get("/", verifyUser, listarTodosUsuarios);
roteador.get("/:id", verifyUser, buscarUsuarioPorId);
roteador.post("/", verifyUser, criarUsuario);
roteador.patch("/:id", verifyUser, atualizarUsuario);
roteador.delete("/:id", verifyUser, deletarUsuario);

export default roteador;