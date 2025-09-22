const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        try {
            const auth = btoa(`${email}:${senha}`);
            const res = await fetch("/usuarios/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha }) // ⚠️ chaves do JSON devem bater com backend
            });

            const data = await res.json();

            if (!res.ok) {
                mensagem.textContent = data.message || "Erro no login";
                return;
            }

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

async function carregarUsuarios(query = "") {
    if (!tabelaUsuarios) return;
    tabelaUsuarios.innerHTML = "";

    const res = await fetch("/usuarios");
    const usuarios = await res.json();

    // Corrigido: usar u.name em vez de u.nome
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
            <td>
                <button onclick="deletarUsuario(${u.id})">Deletar</button>
            </td>
        `;
        tabelaUsuarios.appendChild(tr);
    });
}

async function deletarUsuario(id) {
    if (!confirm("Deseja deletar esse usuário?")) return;
    await fetch(`/usuarios/${id}`, { method: "DELETE" });
    carregarUsuarios(filtro.value);
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

    await fetch("/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome, email, password: senha })
    });

    formCriar.style.display = "none";
    carregarUsuarios();
});

window.onload = () => carregarUsuarios();