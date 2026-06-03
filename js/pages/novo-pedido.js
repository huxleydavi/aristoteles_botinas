const KEY = 'aristoteles_vendedor_pro_db';

    const PRODUCTS = [
      {id:'25', nome:'Bico Quadrado (25)', preco:59.90, precoAntigo:66.90, tipo:'Botina', imagem:'img/25/palha.jpg', base:'img/25', codigo:'25'},
      {id:'48', nome:'Bico Quadrado Coberto (48)', preco:69.90, precoAntigo:76.90, tipo:'Botina', imagem:'img/48/palha.jpg', base:'img/48', codigo:'48'},
      {id:'174', nome:'Segurança (174)', preco:69.90, precoAntigo:76.90, tipo:'Botina', imagem:'img/174/palha.jpg', base:'img/174', codigo:'174'},
      {id:'115', nome:'Adventure (115)', preco:73.90, precoAntigo:80.90, tipo:'Botina', imagem:'img/115/palha.jpg', base:'img/115', codigo:'115'}
    ];

    let atual = null;
    let imagemSelecionada = '';
    let acaoConfirmar = null;
    let editandoIndex = null;

    function safe(v){
      return String(v ?? '').replace(/[&<>"]/g, m => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;'
      }[m]));
    }

    function fmtMoney(v){
      return Number(v || 0).toLocaleString('pt-BR', {
        style:'currency',
        currency:'BRL'
      });
    }

    function uid(p){
      return p + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    function loadDB(){
      try{
        const db = JSON.parse(localStorage.getItem(KEY)) || {};
        db.clients = Array.isArray(db.clients) ? db.clients : [];
        db.orders = Array.isArray(db.orders) ? db.orders : [];
        db.route = db.route && typeof db.route === 'object' ? db.route : {clients:[]};
        db.route.clients = Array.isArray(db.route.clients) ? db.route.clients : [];
        db.currentOrder = db.currentOrder && typeof db.currentOrder === 'object' ? db.currentOrder : null;
        return db;
      }catch(e){
        return {
          clients: [],
          orders: [],
          route: {clients: []},
          currentOrder: null
        };
      }
    }

    function saveDB(db){
      localStorage.setItem(KEY, JSON.stringify(db));
    }

    function getSelectedClientId(){
      return localStorage.getItem('clienteAtualId') || localStorage.getItem('clienteAtual') || '';
    }

    function setSelectedClientId(id){
      localStorage.setItem('clienteAtualId', id);
      localStorage.setItem('clienteAtual', id);
    }

    function gerarNumeroPedido(){
      const db = loadDB();

      const maior = db.orders.reduce((max, p) => {
        const num = Number(p.id);
        return num > max ? num : max;
      }, 0);

      const novo = maior + 1;

      localStorage.setItem("pedidoSequencial", novo);

      return String(novo).padStart(3, '0');
    }

    function ensureCurrentOrder(clientId){
      const db = loadDB();

      if(!db.currentOrder || db.currentOrder.status === 'finalizado'){
        db.currentOrder = {
          id: gerarNumeroPedido(),
          clientId: clientId || '',
          items: [],
          notes: '',
          createdAt: new Date().toISOString(),
          status: 'rascunho'
        };
      }

      if(clientId){
        db.currentOrder.clientId = clientId;
      }

      saveDB(db);
      return db.currentOrder;
    }

    function orderTotals(order){
      const itens = order?.items || [];
      return {
        itens: itens.length,
        pares: itens.reduce((a, i) => a + Number(i.qtd || 0), 0),
        total: itens.reduce((a, i) => a + Number(i.subtotal || 0), 0)
      };
    }

    function renderProducts(){
      const db = loadDB();
      const clientId = getSelectedClientId() || db.currentOrder?.clientId || db.clients[0]?.id || '';

      if(clientId){
        setSelectedClientId(clientId);
      }

      ensureCurrentOrder(clientId);

      const client = db.clients.find(c => c.id === clientId);

      document.getElementById('pedidoClienteInfo').innerHTML = client
        ? `<h1>Novo Pedido</h1><p>Cliente: ${safe(client.nome)}<br>${safe(client.bairro || 'Sem bairro')} • ${safe(client.cidade || '-')}</p>`
        : `<h1>Novo Pedido</h1><p>Cadastre ou selecione um cliente antes de montar o pedido.</p>`;

      const term = (document.getElementById('buscaProduto').value || '').toLowerCase();

      const list = PRODUCTS.filter(p =>
        (p.nome + ' ' + p.codigo).toLowerCase().includes(term)
      );

      document.getElementById('totalModelos').textContent = list.length + ' modelos';

      document.getElementById('produtosLista').innerHTML = list.map(p => `
        <article class="product-card">
          <div class="product-image">
            <span class="badge">-10%</span>
            <img src="${p.imagem}" alt="${safe(p.nome)}">
          </div>
          <div class="product-info">
            <div class="product-type">${safe(p.tipo)}</div>
            <h3>${safe(p.nome)}</h3>
            <div class="price-box">
              <span class="price-new">${fmtMoney(p.preco)}</span>
              <span class="price-old">${fmtMoney(p.precoAntigo)}</span>
            </div>
            <button class="card-btn" onclick="abrirProduto('${p.id}')">Adicionar</button>
          </div>
        </article>
      `).join('');

      const t = orderTotals(loadDB().currentOrder);
      document.getElementById('resumoPedidoBar').textContent = `${t.itens} item(ns) • ${fmtMoney(t.total)}`;
    }

    function montarGridTamanhos(){
      let html = '';
      for(let t = 33; t <= 44; t++){
        html += `<div>${t}<input type="number" min="0" value="0" onchange="calcModal()"></div>`;
      }
      document.getElementById('tamanhos').innerHTML = html;
    }

    function abrirProduto(id){
      const db = loadDB();
      const clientId = getSelectedClientId() || db.currentOrder?.clientId;

      if(!clientId){
        mostrarAlerta({
          tipo:'erro',
          titulo:'Selecione um cliente',
          msg:'Escolha o cliente do pedido antes de adicionar produtos.'
        });
        abrirTrocarCliente();
        return;
      }

      atual = PRODUCTS.find(p => p.id === id);
      if(!atual) return;

      document.getElementById('nomeProduto').innerText = atual.nome;
      imagemSelecionada = atual.base + '/palha.jpg';
      document.getElementById('imgProduto').src = imagemSelecionada;
      document.getElementById('cor').value = 'Palha';

      document.getElementById('cor').onchange = function(){
        const cor = this.value.toLowerCase();
        imagemSelecionada = `${atual.base}/${cor}.jpg`;
        document.getElementById('imgProduto').src = imagemSelecionada;
      };

      montarGridTamanhos();
      editandoIndex = null;
      document.getElementById('btnAdicionarModal').innerText = 'Adicionar';
      document.getElementById('modalProduto').style.display = 'flex';
      calcModal();
    }

    function preencherModalEdicao(item){
      if(!item) return;

      document.getElementById('cor').value = item.cor || 'Palha';

      const corAtual = (item.cor || 'Palha').toLowerCase();
      imagemSelecionada = `${atual.base}/${corAtual}.jpg`;
      document.getElementById('imgProduto').src = imagemSelecionada;

      const inputs = document.querySelectorAll('#tamanhos input');

      for(let i = 0; i < inputs.length; i++){
        const tamanho = 33 + i;
        const qtd = item.numeros && item.numeros[tamanho] ? Number(item.numeros[tamanho]) : 0;
        inputs[i].value = qtd;
      }

      document.getElementById('btnAdicionarModal').innerText = 'Salvar alteração';
      calcModal();
    }

    function abrirEdicaoSeExistir(){
      const rawIndex = localStorage.getItem('editarItemIndex');
      if(rawIndex === null) return;

      const idx = Number(rawIndex);
      const db = loadDB();
      const item = db.currentOrder?.items?.[idx];

      if(!item){
        localStorage.removeItem('editarItemIndex');
        return;
      }

      const produto = PRODUCTS.find(p => p.id === item.productId || p.codigo === item.codigo || p.nome === item.nome);
      if(!produto){
        localStorage.removeItem('editarItemIndex');
        return;
      }

      atual = produto;
      editandoIndex = idx;

      document.getElementById('nomeProduto').innerText = atual.nome;
      document.getElementById('imgProduto').src = item.imagem || atual.imagem;

      document.getElementById('cor').onchange = function(){
        const cor = this.value.toLowerCase();
        imagemSelecionada = `${atual.base}/${cor}.jpg`;
        document.getElementById('imgProduto').src = imagemSelecionada;
      };

      montarGridTamanhos();
      preencherModalEdicao(item);
      document.getElementById('modalProduto').style.display = 'flex';
    }

    function fecharProduto(){
      document.getElementById('modalProduto').style.display = 'none';
      editandoIndex = null;
      localStorage.removeItem('editarItemIndex');
    }

    function calcModal(){
      const inputs = document.querySelectorAll('#tamanhos input');
      let total = 0;
      let pares = 0;

      inputs.forEach(i => {
        const v = Number(i.value || 0);
        pares += v;
        total += v * atual.preco;
      });

      document.getElementById('pares').innerText = pares;
      document.getElementById('total').innerText = total.toFixed(2).replace('.', ',');
    }

    function addCarrinhoModal(){
      const db = loadDB();
      const clientId = getSelectedClientId() || db.currentOrder?.clientId;

      if(!clientId){
        mostrarAlerta({
          tipo:'erro',
          titulo:'Cliente obrigatório',
          msg:'Selecione um cliente antes de adicionar produtos.'
        });

        abrirTrocarCliente();
        return;
      }
      ensureCurrentOrder(getSelectedClientId());

      const inputs = document.querySelectorAll('#tamanhos input');
      let qtdTotal = 0;
      let tamanhos = [];
      let numeros = {};

      inputs.forEach((i, idx) => {
        const qtd = Number(i.value || 0);
        if(qtd > 0){
          const tam = 33 + idx;
          qtdTotal += qtd;
          tamanhos.push(`Tam ${tam}: ${qtd} pares`);
          numeros[tam] = qtd;
        }
      });

      if(qtdTotal <= 0){
        mostrarAlerta({
          tipo:'erro',
          titulo:'Nenhum par informado',
          msg:'Informe pelo menos 1 par para adicionar ao carrinho.'
        });
        return;
      }

      const item = {
        productId: atual.id,
        nome: atual.nome,
        preco: atual.preco,
        qtd: qtdTotal,
        subtotal: Number((qtdTotal * atual.preco).toFixed(2)),
        imagem: imagemSelecionada,
        codigo: atual.codigo,
        cor: document.getElementById('cor').value,
        tamanhos: tamanhos.join('\n'),
        numeros: numeros
      };

      if(editandoIndex !== null){
        db.currentOrder.items[editandoIndex] = item;
        saveDB(db);
        fecharProduto();
        renderProducts();

        mostrarAlerta({
          tipo:'sucesso',
          titulo:'Produto atualizado',
          msg:'O item do carrinho foi alterado com sucesso.'
        });
      }else{
        db.currentOrder.items.push(item);
        saveDB(db);
        fecharProduto();
        renderProducts();

        mostrarAlerta({
          tipo:'sucesso',
          titulo:'Produto adicionado',
          msg:'O item foi enviado para o carrinho com sucesso.'
        });
      }

      editandoIndex = null;
      localStorage.removeItem('editarItemIndex');
    }

    function mostrarAlerta({tipo='info', titulo='', msg='', confirmar=null}){
      document.getElementById('alertTitle').innerText = titulo;
      document.getElementById('alertMsg').innerText = msg;

      const icon = document.getElementById('alertIcon');
      icon.innerText = tipo === 'erro' ? '❌' : tipo === 'sucesso' ? '✅' : '⚠️';

      const btn = document.getElementById('alertConfirm');

      if(confirmar){
        btn.style.display = 'block';
        acaoConfirmar = confirmar;
      }else{
        btn.style.display = 'none';
        acaoConfirmar = null;
      }

      document.getElementById('alertBox').style.display = 'flex';
    }

    function fecharAlerta(){
      document.getElementById('alertBox').style.display = 'none';
    }

    function confirmarAlerta(){
      if(acaoConfirmar) acaoConfirmar();
      fecharAlerta();
    }

    function irCarrinho(){
      const db = loadDB();

      if(!db.currentOrder || !db.currentOrder.clientId){
        mostrarAlerta({
          tipo:'erro',
          titulo:'Cliente obrigatório',
          msg:'Selecione um cliente antes de continuar.'
        });
        return;
      }

      location.href = 'carrinho-vendedores.html';
    }

    function abrirTrocarCliente(){
      const db = loadDB();
      const select = document.getElementById('clientePedidoSelect');

      select.innerHTML = db.clients.length
        ? db.clients.map(c => `
            <option value="${c.id}" ${(c.id === (getSelectedClientId() || db.currentOrder?.clientId)) ? 'selected' : ''}>
              ${safe(c.nome)} - ${safe(c.cidade || '')}
            </option>
          `).join('')
        : '<option value="">Nenhum cliente cadastrado</option>';

      document.getElementById('modalCliente').style.display = 'flex';
    }

    function fecharTrocarCliente(){
      document.getElementById('modalCliente').style.display = 'none';
    }

    function salvarClientePedido(){
      const val = document.getElementById('clientePedidoSelect').value;

      if(!val){
        location.href = 'clientes.html';
        return;
      }

      setSelectedClientId(val);

      const db = loadDB();
      ensureCurrentOrder(val);
      db.currentOrder.clientId = val;ensureCurrentOrder
      saveDB(db);

      fecharTrocarCliente();
      renderProducts();
    }

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('buscaProduto').addEventListener('input', renderProducts);
      renderProducts();
      abrirEdicaoSeExistir();
    });
