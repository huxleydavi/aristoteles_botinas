    //////////////////////////////////////////////////////
    // 🧾 MÁSCARAS DE INPUT
    //////////////////////////////////////////////////////

    function mascaraCNPJ(v) {
        v = v.replace(/\D/g, "").slice(0, 14);
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
        return v;
    }

    function mascaraTel(v) {
        v = v.replace(/\D/g, "").slice(0, 11);

        if (v.length <= 10) {
            v = v.replace(/^(\d{2})(\d)/, "($1) $2");
            v = v.replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            v = v.replace(/^(\d{2})(\d)/, "($1) $2");
            v = v.replace(/(\d{5})(\d)/, "$1-$2");
        }

        return v;
    }

    function mascaraCEP(v) {
        v = v.replace(/\D/g, "").slice(0, 8);
        v = v.replace(/^(\d{5})(\d)/, "$1-$2");
        return v;
    }


    //////////////////////////////////////////////////////
    // 👂 LISTENERS DE INPUT
    //////////////////////////////////////////////////////

    document.addEventListener("input", (e) => {
        const t = e.target;
        if (!t) return;

        // Máscaras.
        if (t.id === "cnpjCliente") {
            t.value = mascaraCNPJ(t.value);
        }

        if (t.id === "telCliente") {
            t.value = mascaraTel(t.value);
        }

        if (t.id === "cepCliente") {
            t.value = mascaraCEP(t.value);

            if (t.value.length === 9) {
                buscarCEP(t.value);
            }
        }

        // Limpeza visual de erro.
        if (
            t.id === "nomeCliente" ||
            t.id === "cnpjCliente" ||
            t.id === "telCliente" ||
            t.id === "endCliente"
        ) {
            validarFormularioCliente();
        }
    });


    //////////////////////////////////////////////////////
    // 📮 BUSCA DE ENDEREÇO VIA CEP
    //////////////////////////////////////////////////////

    async function buscarCEP(cep) {
        cep = cep.replace(/\D/g, "");
        if (cep.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();

            if (data.erro) throw "erro";

            const endInput = get("endCliente");
            if (endInput) {
                endInput.value = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
            }
        } catch {
            mostrarAlerta({
                tipo: "erro",
                titulo: "CEP inválido",
                msg: "Não encontramos esse CEP"
            });
        }
    }

    // Mantido por compatibilidade; hoje não interfere no fluxo principal.
    function validarCEPManual() {
        const cep = get("cepCliente");
        const end = get("endCliente");

        if (!cep || !end) return;

        let erros = [];

        if (!cep.value || cep.value.length < 9) {
            erros.push("• CEP obrigatório");
            cep.classList.add("input-erro");
        }

        if (!end.value) {
            erros.push("• Clique no CEP para preencher o endereço");
            end.classList.add("input-erro");
        }

        return erros;
    }