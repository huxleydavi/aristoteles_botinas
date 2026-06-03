    //////////////////////////////////////////////////////
    // 🎨 CONFIGURAÇÕES DE IMAGEM / CORES
    //////////////////////////////////////////////////////

    // Mantido por compatibilidade futura com seu fluxo atual.
    const imagensPorCor = {
        "Palha": "-palha",
        "Preta": "-preta",
        "Relva": "-relva",
        "Pinhão": "-pinhão",
        "Tabaco": "-tabaco"
    };

    const cores = ["palha", "preta", "relva", "pinhão", "tabaco"];


    //////////////////////////////////////////////////////
    // 🔧 UTILITÁRIOS GERAIS
    //////////////////////////////////////////////////////

    function get(id) {
        return document.getElementById(id);
    }

    async function converterImagemBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }