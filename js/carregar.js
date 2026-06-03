    //////////////////////////////////////////////////////
    // 📦 CARREGAR PRODUTOS NA TELA
    //////////////////////////////////////////////////////

    function carregar() {
        let el = get("produtos");
        el.innerHTML = "";

        produtos.forEach((p, i) => {
            el.innerHTML += `
            <div class="card"
                onclick="abrir(${i})"
                onmouseover="iniciarHover(this, '${p.img}')"
                onmouseout="pararHover(this, '${p.img}')">

                <div class="img-box">
                    <img src="${p.img}/palha.jpg">
                    <div class="badge">-10%</div>
                </div>

                <div class="info">
                    <span class="categoria">Botina</span>
                    <h4>${p.nome}</h4>

                    <div class="preco-box">
                        <span class="preco-novo">R$ ${p.preco.toFixed(2)}</span>
                        <span class="preco-antigo">R$ ${(p.preco + 7).toFixed(2)}</span>
                    </div>
                </div>
            </div>`;
        });
    }


    //////////////////////////////////////////////////////
    // 🖱️ HOVER (ANIMAÇÃO DE IMAGEM)
    //////////////////////////////////////////////////////

    function iniciarHover(card, pasta) {
        let img = card.querySelector("img");
        let i = 1;

        card._interval = setInterval(() => {
            img.src = `${pasta}/${cores[i]}.jpg`;
            i = (i + 1) % cores.length;
        }, 400);
    }

    function pararHover(card, pasta) {
        clearInterval(card._interval);

        let img = card.querySelector("img");
        img.src = `${pasta}/palha.jpg`;
    }