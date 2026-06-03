    //////////////////////////////////////////////////////
    // 🧠 MODAL DE PRODUTO
    //////////////////////////////////////////////////////

    function abrir(i) {
        atual = produtos[i];

        const nome = get("nomeProduto");
        const imgProduto = get("imgProduto");
        const corSelect = get("cor");
        const tamanhosDiv = get("tamanhos");

        nome.innerText = atual.nome;

        // Sempre inicia na cor palha.
        imagemSelecionada = `${atual.img}/palha.jpg`;
        imgProduto.src = imagemSelecionada;

        corSelect.value = "Palha";

        corSelect.onchange = function () {
            if (!atual) return;

            const cor = this.value.toLowerCase();
            imagemSelecionada = `${atual.img}/${cor}.jpg`;
            imgProduto.src = imagemSelecionada;
        };

        let html = "";

        for (let t = 33; t <= 44; t++) {
            html += `
            <div>
                ${t}
                <input type="number" min="0" value="0" onchange="calc()">
            </div>`;
        }

        tamanhosDiv.innerHTML = html;
        get("modalProduto").style.display = "flex";

        calc();
    }

    function fecharProduto() {
        get("modalProduto").style.display = "none";
    }


    //////////////////////////////////////////////////////
    // 🧮 CÁLCULO DO PRODUTO (PARES + TOTAL)
    //////////////////////////////////////////////////////

    function calc() {
        let inputs = document.querySelectorAll("#tamanhos input");

        let total = 0;
        let pares = 0;

        inputs.forEach(i => {
            let v = Number(i.value);
            pares += v;
            total += v * atual.preco;
        });

        get("pares").innerText = pares;
        get("total").innerText = total.toFixed(2);
    }


    //////////////////////////////////////////////////////
    // 🛒 CARRINHO
    //////////////////////////////////////////////////////

    function addCarrinho() {
        let inputs = document.querySelectorAll("#tamanhos input");

        let tamanhos = "";
        let qtdTotal = 0;

        inputs.forEach((i, idx) => {
            let qtd = Number(i.value);

            if (qtd > 0) {
                tamanhos += `Tam ${33 + idx}: ${qtd} pares\n`;
                qtdTotal += qtd;
            }
        });

        if (qtdTotal < 10) {
            mostrarAlerta({
                tipo: "erro",
                titulo: "Pedido mínimo",
                msg: "O pedido mínimo é de 10 pares."
            });
            return;
        }

        carrinho.push({
            nome: atual.nome,
            cor: get("cor").value,
            img: imagemSelecionada,
            precoUnit: atual.preco,
            qtdTotal,
            total: qtdTotal * atual.preco,
            tamanhos
        });

        salvarCarrinho();
        get("qtd").innerText = carrinho.length;
        fecharProduto();
    }

    function salvarCarrinho() {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }

    function carregarCarrinho() {
        let data = localStorage.getItem("carrinho");

        if (data) {
            try {
                carrinho = JSON.parse(data) || [];
            } catch {
                carrinho = [];
            }

            get("qtd").innerText = carrinho.length;
        }
    }

    function abrirCarrinho() {
        let el = get("listaCarrinho");
        el.innerHTML = "";

        let totalGeral = 0;

        carrinho.forEach((c, i) => {
            totalGeral += c.total;

            el.innerHTML += `
            <div class="item-carrinho">
                <img src="${c.img}">

                <div class="item-info">
                    <b>${c.nome}</b><br>
                    Cor: ${c.cor}<br>
                    <pre>${c.tamanhos}</pre>
                    Unit: R$ ${c.precoUnit.toFixed(2)}<br>
                    Total: <div class="preco">R$ ${c.total.toFixed(2)}</div>
                </div>

                <div class="item-acoes">
                    <button class="acao-btn editar" onclick="editarItem(${i})" title="Editar">✏️</button>
                    <button class="acao-btn duplicar" onclick="duplicarItem(${i})" title="Duplicar">⧉</button>
                    <button class="acao-btn excluir" onclick="remover(${i})" title="Excluir">✕</button>
                </div>
            </div>`;
        });

        el.innerHTML += `
        <div class="total-carrinho">
            <h3>Total: R$ ${totalGeral.toFixed(2)}</h3>
        </div>`;

        get("modalCarrinho").style.display = "flex";
    }

    function fecharCarrinho() {
        get("modalCarrinho").style.display = "none";
    }

    function remover(i) {
        carrinho.splice(i, 1);
        salvarCarrinho();
        get("qtd").innerText = carrinho.length;
        abrirCarrinho();
    }


    //////////////////////////////////////////////////////
    // ✍️ EDITAR / DUPLICAR ITEM
    //////////////////////////////////////////////////////

    function duplicarItem(i) {
        const item = carrinho[i];
        if (!item) return;

        carrinho.push({ ...item });

        salvarCarrinho();
        get("qtd").innerText = carrinho.length;
        abrirCarrinho();
    }

    function editarItem(i) {
        const item = carrinho[i];
        if (!item) return;

        const indexProduto = produtos.findIndex(p => p.nome === item.nome);
        if (indexProduto === -1) return;

        // Remove temporariamente do carrinho e reabre o produto para edição.
        carrinho.splice(i, 1);
        salvarCarrinho();
        get("qtd").innerText = carrinho.length;

        abrir(indexProduto);

        const corSelect = get("cor");
        corSelect.value = item.cor;

        imagemSelecionada = `${atual.img}/${item.cor.toLowerCase()}.jpg`;
        get("imgProduto").src = imagemSelecionada;

        const inputs = document.querySelectorAll("#tamanhos input");
        inputs.forEach(input => input.value = 0);

        const linhas = item.tamanhos.split("\n");
        linhas.forEach(linha => {
            const match = linha.match(/Tam\s(\d+):\s(\d+)/);
            if (match) {
                const tamanho = Number(match[1]);
                const qtd = Number(match[2]);
                const idx = tamanho - 33;

                if (inputs[idx]) {
                    inputs[idx].value = qtd;
                }
            }
        });

        calc();
        fecharCarrinho();
    }


    //////////////////////////////////////////////////////
    // 🧼 LIMPAR ERROS VISUAIS
    //////////////////////////////////////////////////////

    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("input-erro")) {
            e.target.classList.remove("input-erro");
        }
    });

    document.addEventListener("focus", (e) => {
        if (e.target.classList.contains("input-erro")) {
            e.target.classList.remove("input-erro");
        }
    }, true);