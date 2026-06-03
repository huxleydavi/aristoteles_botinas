    //////////////////////////////////////////////////////
    // 📄 PDF + WHATSAPP
    //////////////////////////////////////////////////////

    async function finalizarPedidoReal(nome, cnpj, tel, end) {

        if(carrinho.length === 0){
            mostrarAlerta({
                tipo:"erro",
                titulo:"Carrinho vazio",
                msg:"Adicione pelo menos um produto antes de finalizar."
            });
            return;
        }

        let totalGeral = 0;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        let y = 10;
        const logo = "img/logo.png";

        //////////////////////////////////////////////////////
        // 🖼️ LOGO DO CABEÇALHO
        //////////////////////////////////////////////////////

        try {
            let logoBase64 = await converterImagemBase64(logo);
            pdf.addImage(logoBase64, "PNG", 55, y, 100, 25);
        } catch { }

        y += 25;

        //////////////////////////////////////////////////////
        // 🧾 CABEÇALHO DO DOCUMENTO
        //////////////////////////////////////////////////////

        pdf.setFontSize(14);
        pdf.text("PEDIDO DE VENDA", 105, y, { align: "center" });
        y += 8;

        pdf.setFontSize(10);
        pdf.text(`Cliente: ${nome}`, 10, y);
        pdf.text(`CNPJ: ${cnpj}`, 10, y + 5);
        pdf.text(`Tel: ${tel}`, 10, y + 10);
        pdf.text(`End: ${end}`, 10, y + 15);

        y += 15;

        pdf.text(`Pedido Nº: ${numeroPedido}`, 140, y);
        y += 6;

        const data = new Date().toLocaleDateString();
        pdf.text(`Data: ${data}`, 10, y);
        y += 6;

        //////////////////////////////////////////////////////
        // 📦 TABELA DE PRODUTOS
        //////////////////////////////////////////////////////

        pdf.line(10, y, 200, y);
        y += 6;

        pdf.setFontSize(9);
        pdf.text("Produto", 10, y);
        pdf.text("Qtd", 120, y);
        pdf.text("Unit", 140, y);
        pdf.text("Total", 170, y);

        y += 4;
        pdf.line(10, y, 200, y);
        y += 6;

        //////////////////////////////////////////////////////
        // 🛒 ITENS DO CARRINHO
        //////////////////////////////////////////////////////

        for (const c of carrinho) {
            totalGeral += c.total;

            let imgBase64 = await converterImagemBase64(c.img);

            pdf.addImage(imgBase64, "JPEG", 10, y, 15, 15);
            pdf.text(c.nome, 28, y + 5);
            pdf.text(String(c.qtdTotal), 120, y + 5);
            pdf.text(`R$ ${c.precoUnit.toFixed(2)}`, 140, y + 5);
            pdf.text(`R$ ${c.total.toFixed(2)}`, 170, y + 5);

            //////////////////////////////////////////////////////
            // 📏 LISTA DE TAMANHOS
            //////////////////////////////////////////////////////

            let linhaY = y + 10;
            let linhas = c.tamanhos.split("\n");

            linhas.forEach(l => {
                if (l) {
                    pdf.setFontSize(8);
                    pdf.text(l, 28, linhaY);
                    linhaY += 3;
                }
            });

            y = linhaY + 6;

            if (y > 260) {
                pdf.addPage();
                y = 10;
            }

            pdf.line(10, y, 200, y);
            y += 6;
        }

        //////////////////////////////////////////////////////
        // 💰 TOTAL FINAL
        //////////////////////////////////////////////////////

        y += 5;

        pdf.setFillColor(47, 79, 63);
        pdf.rect(10, y, 190, 10, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, 105, y + 7, {
            align: "center"
        });

        pdf.setTextColor(0, 0, 0);

        //////////////////////////////////////////////////////
        // 💾 SALVAR PDF
        //////////////////////////////////////////////////////

        pdf.save(`pedido_${numeroPedido}.pdf`);

        //////////////////////////////////////////////////////
        // ✅ ALERTA DE SUCESSO
        //////////////////////////////////////////////////////

        mostrarAlerta({
            tipo: "sucesso",
            titulo: "Pedido pronto",
            msg: "PDF gerado! Agora envie no WhatsApp."
        });

        //////////////////////////////////////////////////////
        // 📲 MENSAGEM WHATSAPP
        //////////////////////////////////////////////////////

        // Mantido o uso das variáveis globais para preservar o fluxo atual.
        clienteNome = nome;
        clienteCNPJ = cnpj;
        clienteEndereco = end;
        clienteTelefone = tel;

        let msg = `📦 *Pedido Nº ${numeroPedido}*\nCliente: ${clienteNome}\n\n`;

        carrinho.forEach(c => {
            msg += `• ${c.nome} (${c.cor})\n${c.tamanhos}\n`;
        });

        msg += `\n💰 Total: R$ ${totalGeral.toFixed(2)}`;

        window.linkWhatsAppFinal =
            `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

        //////////////////////////////////////////////////////
        // 📢 POPUP FINAL
        //////////////////////////////////////////////////////

        mostrarPopup();

        //////////////////////////////////////////////////////
        // 🔄 RESET DO SISTEMA
        //////////////////////////////////////////////////////

        numeroPedido++;
        localStorage.setItem("pedidoNumero", numeroPedido);

        carrinho = [];
        salvarCarrinho();

        get("qtd").innerText = 0;
        fecharCarrinho();
    }


    //////////////////////////////////////////////////////
    // 📢 POPUP FINAL (WHATSAPP)
    //////////////////////////////////////////////////////

    function mostrarPopup() {
        get("popupFinal").style.display = "flex";
    }

    function fecharPopup() {
        get("popupFinal").style.display = "none";
    }

    function abrirWhatsAppFinal() {
        window.open(window.linkWhatsAppFinal);
    }