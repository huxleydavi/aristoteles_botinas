//////////////////////////////////////////////////////
// 🚀 INICIALIZAÇÃO
//////////////////////////////////////////////////////

carregar();
carregarCarrinho();

//////////////////////////////////////////////////////
// 📲 SERVICE WORKER (PWA)
//////////////////////////////////////////////////////

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("js/service-worker.js")
        .then(reg => {
            reg.onupdatefound = () => {
                const newWorker = reg.installing;

                newWorker.onstatechange = () => {
                    if (newWorker.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            console.log("🔥 NOVA VERSÃO DISPONÍVEL");
                            window.location.reload();
                        }
                    }
                };
            };
        });
}
