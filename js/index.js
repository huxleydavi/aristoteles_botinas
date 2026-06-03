    // ================= DETECTA VOLTA (CACHE / BACK) =================
    window.addEventListener("pageshow", function (event) {
    
        // 🔥 Só executa se veio do cache (voltar)
        if (event.persisted) {
            document.getElementById("transition").style.transform = "translateY(100%)";
            document.getElementById("loading").style.display = "none";
            document.body.style.overflow = "auto";
            iniciar();
        }
    });
    
    // ================= LOADING INTELIGENTE =================
    const jaEntrou = sessionStorage.getItem("entrou");
    
    if(!jaEntrou){
        // 🔥 PRIMEIRA VEZ → MOSTRA LOADING
        setTimeout(()=>{
            document.getElementById("loading").style.opacity = "0";
    
            setTimeout(()=>{
                document.getElementById("loading").style.display = "none";
                sessionStorage.setItem("entrou","true");
                iniciar();
            },700);
    
        },2000);
    
    }else{
        // 🔥 JÁ ENTROU → PULA LOADING
        document.getElementById("loading").style.display = "none";
        iniciar();
    }
    
    // ================= INICIAR HERO =================
    function iniciar(){
        const hero = document.getElementById("hero");
        const bg = document.getElementById("bg");
    
        hero.classList.add("show");
        bg.style.transform = "scale(1)";
        bg.style.opacity = "0.08";
    }
    
    // ================= TRANSIÇÃO =================
    function entrar(){
        const t = document.getElementById("transition");
    
        t.style.transform = "translateY(0)";
    
        setTimeout(()=>{
            window.location.href = "home.html";
        },600);
    }
    
    // ================= BOTÃO SEGURO =================
    const botao = document.querySelector(".btn");
    
    if(botao){
        botao.addEventListener("touchstart", ()=>{
            if(navigator.vibrate){
                navigator.vibrate(10);
            }
        });
    
        botao.addEventListener("mousemove",(e)=>{
            const rect = botao.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
    
            botao.style.transform = `translate(${x*0.12}px, ${y*0.12}px)`;
        });
    
        botao.addEventListener("mouseleave",()=>{
            botao.style.transform = "translate(0,0)";
        });
    }

    function entrarVendedores(){
        window.location.href = "vendedores.html";
    }