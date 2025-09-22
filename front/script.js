const loginForm = document.getElementById("loginForm"); 
const mensagem = document.getElementById("mensagem");

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

            sessionStorage.setItem("usuarioLogado", JSON.stringify(data));

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

// Carrega usuários
async function carregarUsuarios(query = "") {
    if (!tabelaUsuarios) return;
    tabelaUsuarios.innerHTML = "";

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "{}");
    const headers = usuario.email && usuario.password 
        ? { "Authorization": "Basic " + btoa(`${usuario.email}:${usuario.password}`) } 
        : {};

    try {
        const res = await fetch("/usuarios", { headers });
        if (!res.ok) throw new Error("Falha ao carregar usuários");

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
                <td>${u.age ?? "-"}</td>
                <td>
                    <button onclick="deletarUsuario(${u.id})">Deletar</button>
                </td>
            `;
            tabelaUsuarios.appendChild(tr);
        });

    } catch (err) {
        tabelaUsuarios.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Erro ao carregar os usuários</td></tr>`;
        console.error(err);
    }
}

// Deletar usuário
async function deletarUsuario(id) {
    if (!confirm("Deseja deletar esse usuário?")) return;

    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "{}");
    const headers = usuario.email && usuario.password 
        ? { "Authorization": "Basic " + btoa(`${usuario.email}:${usuario.password}`) } 
        : {};

    await fetch(`/usuarios/${id}`, { method: "DELETE", headers });
    carregarUsuarios(filtro.value);
}

// Pesquisar
btnPesquisar?.addEventListener("click", () => {
    carregarUsuarios(filtro.value);
});

// Mostrar formulário criar usuário
btnCriar?.addEventListener("click", () => {
    formCriar.style.display = "block";
});

// Salvar novo usuário
btnSalvar?.addEventListener("click", async () => {
    const nome = document.getElementById("novoNome").value;
    const email = document.getElementById("novoEmail").value;
    const senha = document.getElementById("novaSenha").value;
    const idade = parseInt(document.getElementById("novaIdade").value) || null;

    if (!nome || !email || !senha) {
        alert("Nome, email e senha são obrigatórios");
        return;
    }

    await fetch("/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email, password: senha, age: idade })
    });

    formCriar.style.display = "none";
    document.getElementById("novoNome").value = "";
    document.getElementById("novoEmail").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("novaIdade").value = "";

    carregarUsuarios();
});

// Carregar tabela ao abrir a página (admin)
window.onload = () => carregarUsuarios();

// Logout (admin e usuário normal)
const btnLogout = document.getElementById("btnLogout");
btnLogout?.addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});