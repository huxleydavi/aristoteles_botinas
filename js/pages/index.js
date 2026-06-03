// ================= IMAGENS DO FUNDO =================
    const fundos = [
        "img/bg/1.jpg",
        "img/bg/2.jpg",
        "img/bg/3.jpg",
        "img/bg/4.jpg",
        "img/bg/5.jpg",
    ];
    
    let indexFundo = 0;
    const bg = document.getElementById("bg");
    
    // ================= TROCA SUAVE =================
    function trocarFundo(){
    
        // fade out
        bg.style.opacity = "0";
    
        setTimeout(()=>{
    
            indexFundo = (indexFundo + 1) % fundos.length;
    
            bg.style.backgroundImage = `url('${fundos[indexFundo]}')`;
    
            // zoom reset
            bg.style.transform = "scale(1.2)";
    
            setTimeout(()=>{
                // fade in + zoom suave
                bg.style.opacity = "0.08";
                bg.style.transform = "scale(1)";
            },100);
    
        },600);
    }
    
    // ================= INICIAR ROTACAO =================
    function iniciarFundo(){
        bg.style.backgroundImage = `url('${fundos[0]}')`;
        bg.style.opacity = "0.08";
        bg.style.transform = "scale(1)";
    
        setInterval(trocarFundo, 2000); // troca a cada 4s
    }
    iniciarFundo();

if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("js/service-worker.js")
        .then(reg => {
    
          // 🔥 força atualização automática
          reg.onupdatefound = () => {
            const newWorker = reg.installing;
    
            newWorker.onstatechange = () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("🔥 NOVA VERSÃO DISPONÍVEL");
                  window.location.reload(); // recarrega automático
                }
              }
            };
          };
    
        });
    }
