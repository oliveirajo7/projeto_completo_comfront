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

// Apenas o admin pode ver todos
roteador.get("/", verifyUser, listarTodosUsuarios);

// Outras rotas podem ficar sem middleware por enquanto
roteador.get("/:id", buscarUsuarioPorId);
roteador.post("/", criarUsuario);
roteador.patch("/:id", atualizarUsuario);
roteador.delete("/:id", deletarUsuario);

export default roteador;