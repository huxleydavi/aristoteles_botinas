    //////////////////////////////////////////////////////
    // 👤 MODAL CLIENTE
    //////////////////////////////////////////////////////

    function abrirModalCliente() {
        const modal = get("modalCliente");
        if (!modal) return;

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function fecharModalCliente() {
        const modal = get("modalCliente");
        if (!modal) return;

        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    function voltarCarrinho() {
        fecharModalCliente();
        abrirCarrinho();
    }


    //////////////////////////////////////////////////////
    // 🧾 FINALIZAÇÃO / FORMULÁRIO
    //////////////////////////////////////////////////////

    function finalizar() {

        // 🔴 VALIDAÇÃO: carrinho vazio
        if(carrinho.length === 0){
            mostrarAlerta({
                tipo:"erro",
                titulo:"Carrinho vazio",
                msg:"Adicione pelo menos um produto antes de finalizar."
            });
            return;
        }

        mostrarAlerta({
            titulo: "Finalizar pedido?",
            msg: "Vamos gerar o PDF e abrir o WhatsApp.",
            confirmar: abrirModalCliente
        });
    }

    // Mantido por compatibilidade: hoje não é chamado diretamente,
    // mas continua disponível caso você use em outro ponto do fluxo.
    function erroCampo(input, msg) {
        input.classList.add("input-erro");

        mostrarAlerta({
            tipo: "erro",
            titulo: "Campo obrigatório",
            msg: msg
        });

        input.focus();
    }

    function validarFormularioCliente() {
        const nome = get("nomeCliente");
        const cnpj = get("cnpjCliente");
        const tel = get("telCliente");
        const end = get("endCliente");
        const btn = get("btnCliente");

        if (!nome || !cnpj || !tel || !end || !btn) return;

        let valido =
            nome.value.length >= 3 &&
            cnpj.value.length >= 18 &&
            tel.value.length >= 14 &&
            end.value.length >= 5;

        btn.disabled = !valido;
    }

    function validarCliente() {
        const campos = {
            cep: get("cepCliente"),
            nome: get("nomeCliente"),
            cnpj: get("cnpjCliente"),
            tel: get("telCliente"),
            end: get("endCliente")
        };

        let erros = [];

        Object.values(campos).forEach(c => c && c.classList.remove("input-erro"));

        if (!campos.cep || campos.cep.value.length < 9) {
            erros.push("• CEP obrigatório");
            campos.cep?.classList.add("input-erro");
        }

        if (!campos.nome || campos.nome.value.length < 3) {
            erros.push("• Nome inválido");
            campos.nome?.classList.add("input-erro");
        }

        if (!campos.cnpj || campos.cnpj.value.length < 18) {
            erros.push("• CNPJ inválido");
            campos.cnpj?.classList.add("input-erro");
        }

        if (!campos.tel || campos.tel.value.length < 14) {
            erros.push("• Telefone inválido");
            campos.tel?.classList.add("input-erro");
        }

        if (!campos.end || !campos.end.value) {
            erros.push("• Preencha o CEP para gerar o endereço");
            campos.cep?.classList.add("input-erro");
        }

        if (erros.length > 0) {
            mostrarAlerta({
                tipo: "erro",
                titulo: "Corrija os dados",
                msg: erros.join("\n")
            });
            return null;
        }

        return {
            nome: campos.nome.value,
            cnpj: campos.cnpj.value,
            tel: campos.tel.value,
            end: campos.end.value
        };
    }

    function confirmarCliente() {
        const dados = validarCliente();
        if (!dados) return;

        fecharModalCliente();

        finalizarPedidoReal(
            dados.nome,
            dados.cnpj,
            dados.tel,
            dados.end
        );
    }