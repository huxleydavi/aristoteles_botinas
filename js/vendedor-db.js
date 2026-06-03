(function(){
  const {
    loadDB, saveDB, safe, fmtMoney, fmtDate, uid,
    getSelectedClientId, setSelectedClientId, gerarNumeroPedido,
    calcularTotalPedido, orderTotals
  } = window.VendorShared;

  const PRODUCTS = [
    {id:'25', nome:'Bico Quadrado (25)', preco:59.90, precoAntigo:66.90, tipo:'Botina', imagem:'img/25/palha.jpg', codigo:'25'},
    {id:'48', nome:'Bico Quadrado Coberto (48)', preco:69.90, precoAntigo:76.90, tipo:'Botina', imagem:'img/48/palha.jpg', codigo:'48'},
    {id:'174', nome:'Segurança (174)', preco:69.90, precoAntigo:76.90, tipo:'Botina', imagem:'img/174/palha.jpg', codigo:'174'},
    {id:'115', nome:'Adventure (115)', preco:73.90, precoAntigo:80.90, tipo:'Botina', imagem:'img/115/palha.jpg', codigo:'115'}
  ];

  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const page = () => location.pathname.split('/').pop();

  function getClient(id){ return loadDB().clients.find(c => c.id === id); }
  function routeContains(id){ return loadDB().route.clients.includes(id); }

  function ensureCurrentOrder(clientId){
    const db = loadDB();
    if(!db.currentOrder || db.currentOrder.status === 'finalizado'){
      if(!clientId) return null;
      db.currentOrder = {
        id: gerarNumeroPedido(),
        clientId,
        items: [],
        notes: '',
        createdAt: new Date().toISOString(),
        status: 'rascunho'
      };
    } else if(clientId) {
      db.currentOrder.clientId = clientId;
    }
    saveDB(db);
    return db.currentOrder;
  }

  function exportJSON(){
    const db = loadDB();
    const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup-area-vendedor.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportCSV(){
    const db = loadDB();
    const clients = [['id','nome','apelido','cidade','bairro','telefone','cnpj','status','regiao']].concat(
      db.clients.map(c => [c.id,c.nome,c.apelido,c.cidade,c.bairro,c.telefone,c.cnpj,c.status,c.regiao])
    );
    const orders = [['id','cliente','data','itens','pares','total','observacoes']].concat(
      db.orders.map(o => {
        const t = orderTotals(o);
        const client = db.clients.find(c => c.id === o.clientId);
        return [o.id, client?.nome || '', fmtDate(o.finalizedAt || o.createdAt), t.itens, t.pares, t.total.toFixed(2), o.notes || ''];
      })
    );
    const toCSV = rows => rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(';')).join('\n');
    const blob = new Blob([toCSV(clients) + '\n\n' + toCSV(orders)], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'area-vendedor-clientes-pedidos.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importBackup(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const db = JSON.parse(e.target.result);
        saveDB(db);
        alert('Backup importado com sucesso.');
        location.reload();
      } catch(err){
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  }

  function createClientFromForm(){
    const fields = qsa('main input, main textarea, main select');
    const values = fields.map(f => f.value.trim());
    const client = {
      id: uid('cli'),
      nome: values[0] || '',
      apelido: values[1] || '',
      cnpj: values[2] || '',
      telefone: values[3] || '',
      responsavel: values[4] || '',
      cep: values[5] || '',
      cidade: values[6] || '',
      endereco: values[7] || '',
      numero: values[8] || '',
      bairro: values[9] || '',
      complemento: values[10] || '',
      obs: values[11] || '',
      status: values[12] || 'Ativo',
      regiao: values[13] || '',
      criadoEm: new Date().toISOString()
    };
    if(!client.nome || !client.telefone || !client.cidade){
      alert('Preencha pelo menos nome da loja, telefone e cidade.');
      return;
    }
    const db = loadDB();
    db.clients.push(client);
    saveDB(db);
    setSelectedClientId(client.id);
    alert('Cliente salvo com sucesso.');
    location.href = 'clientes.html';
  }

  function addRoute(clientId){
    const db = loadDB();
    if(!db.route.clients.includes(clientId)) db.route.clients.push(clientId);
    saveDB(db);
    renderPage();
  }

  function removeRoute(clientId){
    const db = loadDB();
    db.route.clients = db.route.clients.filter(id => id !== clientId);
    saveDB(db);
    renderPage();
  }

  function openMaps(clientId){
    const c = getClient(clientId);
    if(!c) return window.open('https://www.google.com/maps');
    const query = encodeURIComponent([c.endereco, c.numero, c.bairro, c.cidade].filter(Boolean).join(', '));
    window.open('https://www.google.com/maps/search/?api=1&query=' + query, '_blank');
  }

  function startOrder(clientId){
    if(!clientId) return;
    setSelectedClientId(clientId);
    const db = loadDB();
    db.currentOrder = {
      id: gerarNumeroPedido(),
      clientId,
      items: [],
      notes: '',
      createdAt: new Date().toISOString(),
      status: 'rascunho'
    };
    saveDB(db);
    location.href = 'novo-pedido.html';
  }

  function finalizeOrder(){
    const db = loadDB();
    const order = db.currentOrder;
    if(!order || !order.clientId){
      alert('Não é possível finalizar um pedido sem cliente.');
      return;
    }
    if(!order.items?.length){
      alert('Carrinho vazio.');
      return;
    }
    const notes = qs('#obsPedido');
    if(notes) order.notes = notes.value.trim();
    order.status = 'finalizado';
    order.finalizedAt = new Date().toISOString();
    order.total = calcularTotalPedido(order);
    db.orders.push(order);
    db.currentOrder = null;
    saveDB(db);
    alert('Pedido salvo com sucesso.');
    location.href = 'historico-pedidos.html';
  }
  

  function renderDashboard(){
    const db = loadDB();
    const hoje = new Date().toISOString().slice(0,10);
    const dayOrders = db.orders.filter(o => (o.finalizedAt || '').slice(0,10) === hoje);
    const faturamento = dayOrders.reduce((a,o)=> a + calcularTotalPedido(o), 0);

    qsa('[data-stat]').forEach(el => {
      const key = el.getAttribute('data-stat');
      if(key === 'vendas') el.textContent = fmtMoney(faturamento);
      if(key === 'pedidos') el.textContent = String(dayOrders.length);
      if(key === 'clientes') el.textContent = String(db.route.clients.length);
      if(key === 'comissao') el.textContent = fmtMoney(faturamento * 0.1);
    });

    const routeBox = qs('#rotaHojeLista');
    if(routeBox){
      const items = db.route.clients.map(id => db.clients.find(c => c.id === id)).filter(Boolean);
      routeBox.innerHTML = items.length ? items.slice(0,3).map((c,idx)=>`
        <div class="route-item">
          <div class="route-top">
            <div><h3>${safe(c.nome)}</h3><p>${safe(c.bairro || 'Sem bairro')} • ${safe(c.cidade || 'Sem cidade')}</p></div>
            <span class="chip">${idx+1}ª visita</span>
          </div>
          <div class="route-actions">
            <button class="btn-maps" onclick="VendorDB.openMaps('${c.id}')">Abrir no Maps</button>
            <button class="btn-outline" onclick="location.href='cliente-ficha.html?id=${c.id}'">Abrir cliente</button>
          </div>
        </div>`).join('') : '<div class="alert-box">Nenhum cliente adicionado na rota ainda.</div>';
    }

    const alertBox = qs('#avisoPainel');
    if(alertBox){
      const semPedido = db.clients.filter(c => !db.orders.some(o => o.clientId === c.id));
      alertBox.textContent = semPedido.length ? `Você tem ${semPedido.length} cliente(s) sem pedido registrado ainda. Vale retomar o contato.` : 'Tudo certo: todos os clientes cadastrados já tiveram pelo menos um pedido.';
    }
  }

  function renderClients(){
    const db = loadDB();
    const list = qs('#listaClientes');
    const search = qs('#buscaCliente');
    if(!list) return;
    const term = (search?.value || '').toLowerCase();
    const filtered = db.clients.filter(c => [c.nome,c.apelido,c.cidade,c.telefone,c.cnpj,c.bairro].join(' ').toLowerCase().includes(term));
    list.innerHTML = filtered.length ? filtered.map(c => {
      const orders = db.orders.filter(o => o.clientId === c.id);
      const total = orders.reduce((a,o)=>a + calcularTotalPedido(o),0);
      const last = orders.slice().sort((a,b)=>new Date(b.finalizedAt||0)-new Date(a.finalizedAt||0))[0];
      return `<article class="client-card">
        <div class="client-head"><div class="client-main"><h2>${safe(c.nome)}</h2><p>CNPJ: ${safe(c.cnpj || '-')}</p><p>${safe(c.bairro || 'Sem bairro')} • ${safe(c.cidade || '-')}</p></div><span class="tag">${safe(c.status || 'Ativo')}</span></div>
        <div class="client-meta"><div class="meta-box"><span>Último pedido</span><strong>${last ? fmtDate(last.finalizedAt || last.createdAt) : 'Sem pedido'}</strong></div><div class="meta-box"><span>Total comprado</span><strong>${fmtMoney(total)}</strong></div></div>
        <div class="client-actions"><button class="btn-outline" onclick="location.href='cliente-ficha.html?id=${c.id}'">Ver</button><button class="btn-outline" onclick="VendorDB.addRoute('${c.id}'); alert('Cliente adicionado na rota.');">Rota</button><button class="btn-solid" onclick="VendorDB.startOrder('${c.id}')">Novo pedido</button></div>
      </article>`;
    }).join('') : '<section class="empty-state">Nenhum cliente encontrado.</section>';
  }

  function renderClientProfile(){
    const db = loadDB();
    const client = db.clients.find(c => c.id === getSelectedClientId());
    const root = qs('#clienteFichaRoot');
    if(!root) return;
    if(!client){
      root.innerHTML = '<section class="empty-state">Cliente não encontrado.</section>';
      return;
    }
    setSelectedClientId(client.id);
    const orders = db.orders.filter(o => o.clientId === client.id).sort((a,b)=>new Date(b.finalizedAt||0)-new Date(a.finalizedAt||0));
    const total = orders.reduce((a,o)=>a + calcularTotalPedido(o),0);
    root.innerHTML = `
      <section class="hero"><div class="hero-top"><div><p class="eyebrow">Cliente selecionado</p><h1>${safe(client.nome)}</h1><p>${safe(client.bairro || 'Sem bairro')} • ${safe(client.cidade || '-')}</p></div><span class="status-badge">${safe(client.status || 'Ativo')}</span></div>
        <div class="hero-grid"><div class="hero-box"><span>Pedidos</span><strong>${orders.length}</strong></div><div class="hero-box"><span>Total comprado</span><strong>${fmtMoney(total)}</strong></div><div class="hero-box"><span>Telefone</span><strong>${safe(client.telefone || '-')}</strong></div><div class="hero-box"><span>Responsável</span><strong>${safe(client.responsavel || '-')}</strong></div></div>
      </section>
      <div class="actions-top"><button class="btn-main" onclick="VendorDB.startOrder('${client.id}')">+ Novo Pedido</button><button class="btn-outline" onclick="${routeContains(client.id) ? `VendorDB.removeRoute('${client.id}')` : `VendorDB.addRoute('${client.id}')`}; location.reload();">${routeContains(client.id) ? 'Remover da rota' : 'Adicionar na rota'}</button></div>
      <div class="layout"><section class="card"><h2>Dados do cliente</h2><div class="info-list">
        <div class="info-item"><span>Razão social</span><strong>${safe(client.nome)}</strong></div>
        <div class="info-item"><span>Apelido da loja</span><strong>${safe(client.apelido || '-')}</strong></div>
        <div class="info-item"><span>Telefone</span><strong>${safe(client.telefone || '-')}</strong></div>
        <div class="info-item"><span>CNPJ</span><strong>${safe(client.cnpj || '-')}</strong></div>
        <div class="info-item"><span>Endereço</span><strong>${safe([client.endereco, client.numero, client.bairro, client.cidade].filter(Boolean).join(' • ') || '-')}</strong></div>
        <div class="info-item"><span>Região</span><strong>${safe(client.regiao || '-')}</strong></div>
      </div></section>
      <section class="card"><h2>Observações</h2><div class="obs-box">${safe(client.obs || 'Sem observações cadastradas.')}</div><div class="danger-zone"><button class="btn-maps" onclick="VendorDB.openMaps('${client.id}')">Abrir no Maps</button></div></section>
      <section class="card"><h2>Histórico recente</h2><div class="history-list">${orders.length ? orders.slice(0,5).map(o => { const t = orderTotals(o); return `<div class="history-item"><div class="history-top"><strong>Pedido ${safe(o.id)}</strong><span>${fmtDate(o.finalizedAt || o.createdAt)}</span></div><p>Total: ${fmtMoney(t.total)} • ${t.pares} pares</p><div class="history-actions"><button class="mini-solid" onclick="location.href='historico-pedidos.html'">Ver histórico</button></div></div>`; }).join('') : '<div class="obs-box">Nenhum pedido para este cliente ainda.</div>'}</div></section></div>`;
  }

  function renderFinalize(){
    const db = loadDB();
    const order = db.currentOrder;
    const root = qs('#finalizacaoRoot');
    if(!root) return;
    if(!order || !order.items?.length){
      root.innerHTML = '<section class="empty-state">Nenhum pedido em aberto para finalizar.</section>';
      return;
    }
    const client = db.clients.find(c=>c.id===order.clientId);
    const t = orderTotals(order);
    root.innerHTML = `<div class="layout"><section class="card"><h2>Cliente</h2><div class="info-list"><div class="info-item"><span>Nome / Razão social</span><strong>${safe(client?.nome || '-')}</strong></div><div class="info-item"><span>CNPJ</span><strong>${safe(client?.cnpj || '-')}</strong></div><div class="info-item"><span>Telefone</span><strong>${safe(client?.telefone || '-')}</strong></div><div class="info-item"><span>Endereço</span><strong>${safe([client?.endereco, client?.numero, client?.bairro, client?.cidade].filter(Boolean).join(' • ') || '-')}</strong></div></div></section><section class="card"><h2>Resumo do pedido</h2><div class="summary-box"><div class="summary-mini"><span>Total de itens</span><strong>${t.itens}</strong></div><div class="summary-mini"><span>Total de pares</span><strong>${t.pares}</strong></div><div class="summary-mini"><span>Pedido Nº</span><strong>#${safe(String(order.id).padStart(3,'0'))}</strong></div><div class="summary-mini"><span>Data</span><strong>${fmtDate(order.createdAt)}</strong></div></div></section><section class="card full"><h2>Itens do pedido</h2><div class="order-list">${order.items.map(item => `<div class="order-item"><div class="order-top"><h3>${safe(item.nome)} • ${safe(item.cor || 'Palha')}</h3><strong>${fmtMoney(item.subtotal)}</strong></div><p>${item.qtd} pares<br>Código: ${safe(item.codigo || '-')}</p></div>`).join('')}</div></section><section class="card full"><h2>Observações do pedido</h2><textarea id="obsPedido" class="obs-textarea" placeholder="Ex: entrega combinada, pedido urgente, observação interna do vendedor...">${safe(order.notes || '')}</textarea></section><section class="card full"><div class="alert-box">Revise os dados antes de finalizar. O pedido será salvo no histórico e também poderá voltar depois via backup JSON.</div></section></div>`;
    const totals = qs('#finalizacaoTotais');
    if(totals) totals.innerHTML = `<div><small>Total geral</small><strong>${fmtMoney(t.total)}</strong></div><span>${t.pares} pares no total</span>`;
    const btnVoltar = qs('#btnVoltarCarrinho'); if(btnVoltar) btnVoltar.onclick = ()=> location.href='carrinho-vendedores.html';
  }

  function renderRoute(){
    const db = loadDB();
    const box = qs('#rotaLista');
    if(!box) return;
    const clients = db.route.clients.map(id => db.clients.find(c=>c.id===id)).filter(Boolean);
    box.innerHTML = clients.length ? clients.map((c, idx) => {
      const last = db.orders.filter(o=>o.clientId===c.id).slice().sort((a,b)=>new Date(b.finalizedAt||0)-new Date(a.finalizedAt||0))[0];
      return `<article class="route-card"><div class="route-top"><div class="route-main"><h3>${safe(c.nome)}</h3><p>${safe(c.bairro || 'Sem bairro')} • ${safe(c.cidade || '-')}</p></div><span class="ordem-chip">${idx+1}ª parada</span></div><div class="meta-grid"><div class="meta-box"><span>Telefone</span><strong>${safe(c.telefone || '-')}</strong></div><div class="meta-box"><span>Último pedido</span><strong>${last ? fmtDate(last.finalizedAt || last.createdAt) : 'Sem pedido'}</strong></div></div><div class="obs-box">${safe(c.obs || 'Sem observações.')}</div><div class="status-row"><span class="status-chip status-ok">Cliente ativo</span>${last ? '<span class="status-chip status-ok">Com histórico</span>' : '<span class="status-chip status-pendente">Sem pedidos</span>'}</div><div class="route-actions"><button class="btn-maps" onclick="VendorDB.openMaps('${c.id}')">Abrir no Maps</button><button class="btn btn-solid" onclick="location.href='cliente-ficha.html?id=${c.id}'">Abrir cliente</button></div><div class="route-actions-bottom"><button class="btn btn-solid" onclick="VendorDB.startOrder('${c.id}')">Novo pedido</button><button class="btn btn-outline" onclick="VendorDB.removeRoute('${c.id}')">Remover</button></div></article>`;
    }).join('') : '<section class="empty-state">Nenhum cliente adicionado na rota.</section>';
  }

  function renderPage(){
    switch(page()){
      case 'vendedores.html': renderDashboard(); break;
      case 'clientes.html': renderClients(); break;
      case 'cliente-ficha.html': renderClientProfile(); break;
      case 'finalizacao-pedido.html': renderFinalize(); break;
      case 'rota.html': renderRoute(); break;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const importInput = qs('#importBackupInput');
    if(importInput) importInput.addEventListener('change', e => importBackup(e.target.files[0]));
    const saveClientBtn = qs('#salvarClienteBtn');
    if(saveClientBtn) saveClientBtn.addEventListener('click', createClientFromForm);
    const searchClient = qs('#buscaCliente');
    if(searchClient) searchClient.addEventListener('input', renderClients);
    const exportJSONBtn = qs('#exportarJsonBtn');
    if(exportJSONBtn) exportJSONBtn.onclick = exportJSON;
    const exportCSVBtn = qs('#exportarCsvBtn');
    if(exportCSVBtn) exportCSVBtn.onclick = exportCSV;
    const importJsonBtn = qs('#importarJsonBtn');
    if(importJsonBtn) importJsonBtn.onclick = () => importInput && importInput.click();
    const finalizarBtn = qs('#confirmarPedidoBtn');
    if(finalizarBtn) finalizarBtn.onclick = finalizeOrder;
    renderPage();
  });

  window.VendorDB = { exportJSON, exportCSV, importBackup, startOrder, addRoute, removeRoute, openMaps };
})();
