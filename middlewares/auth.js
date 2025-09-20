import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function verifyUser(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Authorization não enviado" });
    if (!auth.startsWith("Basic")) return res.status(400).json({ message: "Token precisa ser Basic" });

    const tokenDescriptografado = Buffer.from(auth.split(" ")[1], "base64").toString();
    const [email, password] = tokenDescriptografado.split(":");

    try {
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
        if (user.password !== password) return res.status(401).json({ message: "Senha incorreta" });

        req.user = user; // guarda o usuário logado
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
}