const loginForm = document.getElementById("loginForm"); 
const mensagem = document.getElementById("mensagem");

// Função para recuperar usuário logado do sessionStorage
function recuperarUsuarioLogado() {
    if (!window.usuarioLogado) {
        const usuario = sessionStorage.getItem("usuarioLogado");
        if (usuario) {
            window.usuarioLogado = JSON.parse(usuario);
        }
    }
}

// Login
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        try {
            const res = await fetch("/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const data = await res.json();
            if (!res.ok) {
                mensagem.textContent = data.message || "Erro no login";
                return;
            }

            // Salvar no sessionStorage
            window.usuarioLogado = { email, password: senha, role: data.role };
            sessionStorage.setItem("usuarioLogado", JSON.stringify(window.usuarioLogado));

            if (data.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "usuario.html";
            }
        } catch (err) {
            console.error(err);
            mensagem.textContent = "Erro de conexão";
        }
    });
}

// Código para admin
const tabelaUsuarios = document.getElementById("tabelaUsuarios")?.querySelector("tbody");
const btnPesquisar = document.getElementById("btnPesquisar");
const filtro = document.getElementById("filtro");
const btnCriar = document.getElementById("btnCriar");
const formCriar = document.getElementById("formCriar");
const btnSalvar = document.getElementById("btnSalvar");

function getAuthHeader() {
    if (!window.usuarioLogado) return {};
    const token = btoa(`${window.usuarioLogado.email}:${window.usuarioLogado.password}`);
    return { "Authorization": `Basic ${token}` };
}

async function carregarUsuarios(query = "") {
    if (!tabelaUsuarios) return;

    recuperarUsuarioLogado();

    if (!window.usuarioLogado) {
        tabelaUsuarios.innerHTML = `<tr><td colspan="5">Faça login para ver os usuários</td></tr>`;
        return;
    }

    tabelaUsuarios.innerHTML = "";

    try {
        const res = await fetch("/usuarios", { headers: getAuthHeader() });
        if (!res.ok) throw new Error("Erro ao buscar usuários");
        const usuarios = await res.json();

        const filtrados = usuarios.filter(u =>
            u.name.toLowerCase().includes(query.toLowerCase()) || 
            u.id.toString() === query
        );

        filtrados.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.age ?? ""}</td>
                <td>
                    <button onclick="deletarUsuario(${u.id})">Deletar</button>
                </td>
            `;
            tabelaUsuarios.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        tabelaUsuarios.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários</td></tr>`;
    }
}

async function deletarUsuario(id) {
    if (!confirm("Deseja deletar esse usuário?")) return;

    try {
        await fetch(`/usuarios/${id}`, { method: "DELETE", headers: getAuthHeader() });
        carregarUsuarios(filtro.value);
    } catch (err) {
        console.error("Erro ao deletar usuário:", err);
    }
}

btnPesquisar?.addEventListener("click", () => {
    carregarUsuarios(filtro.value);
});

btnCriar?.addEventListener("click", () => {
    formCriar.style.display = "block";
});

btnSalvar?.addEventListener("click", async () => {
    const nome = document.getElementById("novoNome").value;
    const email = document.getElementById("novoEmail").value;
    const senha = document.getElementById("novaSenha").value;
    const idade = document.getElementById("novaIdade").value;

    if (!nome || !email || !senha) { alert("Preencha todos os campos!"); return; }

    try {
        const res = await fetch("/usuarios", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                ...getAuthHeader()
            },
            body: JSON.stringify({ 
                name: nome, 
                email, 
                password: senha, 
                age: idade ? parseInt(idade) : null 
            })
        });
        if (!res.ok) { console.error("Erro ao criar usuário", await res.text()); return; }

        formCriar.style.display = "none";
        carregarUsuarios();
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
    }
});

// Carregar usuários ao abrir a página
window.onload = () => carregarUsuarios();