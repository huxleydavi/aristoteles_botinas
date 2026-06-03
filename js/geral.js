
    //////////////////////////////////////////////////////
    // 🔵 DADOS GERAIS / ESTADO GLOBAL
    //////////////////////////////////////////////////////

    let clienteNome = "";
    let clienteCNPJ = "";
    let clienteEndereco = "";
    let clienteTelefone = "";

    let numeroPedido = Number(localStorage.getItem("pedidoNumero")) || 1;
    const WHATSAPP = "5533998023970";

    let carrinho = [];
    let atual = null;
    let imagemSelecionada = "";
    let acaoConfirmar = null;

    //////////////////////////////////////////////////////
    // 📦 LISTA DE PRODUTOS
    //////////////////////////////////////////////////////

    const produtos = [
        { nome: "Bico Quadrado (25)", preco: 59.90, img: "img/25" },
        { nome: "Segurança (174)", preco: 69.90, img: "img/174" },
        
        // { nome: "Bico Quadrado Coberto (48)", preco: 69.90, img: "img/48" },

        // { nome: "Solado PNEU (25)", preco: 69.90, img: "img/pneu" },
        // { nome: "Solado PVC (48)", preco: 69.90, img: "img/pvc" },
        // { nome: "PVC Costurado (43)", preco: 73.90, img: "img/43" },

        // { nome: "Segurança com Bico (175)", preco: 69.90, img: "img/175" },

        // { nome: "Adventure (115)", preco: 73.90, img: "img/115" }

        // { nome: "Chuteiro Fina (600)", preco: 69.90, img: "img/600" },
        // { nome: "Chuteira Larga (700)", preco: 69.90, img: "img/700" },
    ];
