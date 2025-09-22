import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Listar todos usuários, com opção de filtro por nome ou id
async function listarTodosUsuarios(req, res) {
    try {
        const { nome, id } = req.query;
        let filtro = {};
        if (nome) filtro.name = { contains: nome, mode: "insensitive" };
        if (id && !isNaN(parseInt(id))) filtro.id = parseInt(id);

        const usuarios = Object.keys(filtro).length > 0
            ? await prisma.users.findMany({ where: filtro })
            : await prisma.users.findMany();

        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar usuários" });
    }
}

async function buscarUsuarioPorId(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    try {
        const usuario = await prisma.users.findUnique({ where: { id } });
        if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });
        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar usuário" });
    }
}

async function criarUsuario(req, res) {
    const { name, email, password, role, age } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Campos obrigatórios faltando" });

    try {
        const novo = await prisma.users.create({ data: { name, email, password, role, age } });
        res.status(201).json(novo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar usuário" });
    }
}

async function atualizarUsuario(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const { name, email, password, role, age } = req.body;

    try {
        const atualizado = await prisma.users.update({
            where: { id },
            data: { name, email, password, role, age }
        });
        res.status(200).json(atualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
}

async function deletarUsuario(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    try {
        await prisma.users.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao deletar usuário" });
    }
}

// Login (retorna dados do usuário para front)
async function loginUsuario(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email e senha obrigatórios" });

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
        if (user.password !== password) return res.status(401).json({ message: "Senha incorreta" });

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro no login" });
    }
}

export {
    listarTodosUsuarios,
    buscarUsuarioPorId,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    loginUsuario
};