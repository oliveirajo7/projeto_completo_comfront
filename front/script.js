let usuarioLogado = null;

// Login
const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

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

            usuarioLogado = data;
            sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

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

// Admin
const tabelaUsuarios = document.getElementById("tabelaUsuarios")?.querySelector("tbody");
const btnPesquisar = document.getElementById("btnPesquisar");
const filtro = document.getElementById("filtro");
const btnCriar = document.getElementById("btnCriar");
const formCriar = document.getElementById("formCriar");
const btnSalvar = document.getElementById("btnSalvar");

if (!usuarioLogado) {
    const armazenado = sessionStorage.getItem("usuarioLogado");
    if (armazenado) usuarioLogado = JSON.parse(armazenado);
    else if (tabelaUsuarios) window.location.href = "index.html";
}

async function carregarUsuarios(query = "") {
    if (!tabelaUsuarios || !usuarioLogado) return;
    tabelaUsuarios.innerHTML = "";

    const authToken = btoa(`${usuarioLogado.email}:${usuarioLogado.password}`);
    let url = "/usuarios?";
    if (query) {
        if (!isNaN(parseInt(query))) url += "id=" + encodeURIComponent(query);
        else url += "name=" + encodeURIComponent(query.trim());
    }

    try {
        const res = await fetch(url, { headers: { "Authorization": `Basic ${authToken}` } });
        if (!res.ok) { console.error("Erro ao buscar usuários", await res.text()); return; }

        const usuarios = await res.json();
        usuarios.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>
                    <button onclick="deletarUsuario(${u.id})">Deletar</button>
                </td>
            `;
            tabelaUsuarios.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro ao carregar usuários:", err);
    }
}

async function deletarUsuario(id) {
    if (!confirm("Deseja deletar esse usuário?")) return;

    const authToken = btoa(`${usuarioLogado.email}:${usuarioLogado.password}`);
    try {
        const res = await fetch(`/usuarios/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Basic ${authToken}` }
        });
        if (!res.ok) { console.error("Erro ao deletar usuário", await res.text()); return; }

        carregarUsuarios(filtro.value);
    } catch (err) { console.error("Erro ao deletar usuário:", err); }
}

btnPesquisar?.addEventListener("click", () => carregarUsuarios(filtro.value));
btnCriar?.addEventListener("click", () => formCriar.style.display = "block");

btnSalvar?.addEventListener("click", async () => {
    const nome = document.getElementById("novoNome").value;
    const email = document.getElementById("novoEmail").value;
    const senha = document.getElementById("novaSenha").value;

    if (!nome || !email || !senha) { alert("Preencha todos os campos!"); return; }

    const authToken = btoa(`${usuarioLogado.email}:${usuarioLogado.password}`);
    try {
        const res = await fetch("/usuarios", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${authToken}`
            },
            body: JSON.stringify({ name: nome, email, password: senha })
        });
        if (!res.ok) { console.error("Erro ao criar usuário", await res.text()); return; }

        formCriar.style.display = "none";
        carregarUsuarios();
    } catch (err) { console.error("Erro ao criar usuário:", err); }
});

window.onload = () => carregarUsuarios();