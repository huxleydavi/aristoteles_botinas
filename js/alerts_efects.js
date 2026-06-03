    //////////////////////////////////////////////////////
    // 🚨 SISTEMA DE ALERTAS GLOBAL
    //////////////////////////////////////////////////////

    function mostrarAlerta({ tipo = "info", titulo = "", msg = "", confirmar = null }) {
        get("alertTitle").innerText = titulo;
        get("alertMsg").innerText = msg;

        const icon = get("alertIcon");

        if (tipo === "erro") {
            icon.innerText = "❌";
        } else if (tipo === "sucesso") {
            icon.innerText = "✅";
        } else {
            icon.innerText = "⚠️";
        }

        const btnConfirm = get("alertConfirm");

        if (confirmar) {
            btnConfirm.style.display = "block";
            acaoConfirmar = confirmar;
        } else {
            btnConfirm.style.display = "none";
            acaoConfirmar = null;
        }

        get("alertBox").style.display = "flex";
    }

    function fecharAlerta() {
        get("alertBox").style.display = "none";
    }

    function confirmarAlerta() {
        if (acaoConfirmar) acaoConfirmar();
        fecharAlerta();
    }

    //////////////////////////////////////////////////////
    // 🎛️ EFEITOS VISUAIS / NAVEGAÇÃO
    //////////////////////////////////////////////////////

    function voltar() {
        document.body.style.opacity = "0";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 300);
    }

    window.addEventListener("scroll", () => {
        const header = get("headerPremium");
        if (!header) return;

        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });