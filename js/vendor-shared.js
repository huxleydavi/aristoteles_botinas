(function(){
  const KEY = 'aristoteles_vendedor_pro_db';

  function loadDB(){
    try{
      const db = JSON.parse(localStorage.getItem(KEY)) || {};
      db.clients = Array.isArray(db.clients) ? db.clients : [];
      db.orders = Array.isArray(db.orders) ? db.orders : [];
      db.route = db.route && typeof db.route === 'object' ? db.route : { clients: [] };
      db.route.clients = Array.isArray(db.route.clients) ? db.route.clients : [];
      db.currentOrder = db.currentOrder && typeof db.currentOrder === 'object' ? db.currentOrder : null;
      return db;
    }catch(e){
      return { clients: [], orders: [], route: { clients: [] }, currentOrder: null };
    }
  }

  function saveDB(db){
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function safe(v){
    return String(v ?? '').replace(/[&<>"]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[m]));
  }

  function fmtMoney(v){
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtDate(v){
    try{
      return new Date(v).toLocaleDateString('pt-BR');
    }catch(e){
      return '-';
    }
  }

  function uid(prefixo){
    return `${prefixo}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
    const maior = (db.orders || []).reduce((max, pedido) => {
      const numero = Number(String(pedido.id || '').replace(/\D/g, '')) || 0;
      return numero > max ? numero : max;
    }, 0);
    const atual = Number(localStorage.getItem('pedidoSequencial') || 0);
    const novo = Math.max(maior, atual) + 1;
    localStorage.setItem('pedidoSequencial', String(novo));
    return String(novo).padStart(3, '0');
  }

  function calcularTotalPedido(order){
    return (order?.items || []).reduce((acc, item) => {
      return acc + Number(item.subtotal || (Number(item.qtd || 0) * Number(item.preco || 0)));
    }, 0);
  }

  function orderTotals(order){
    const itens = order?.items || [];
    return {
      itens: itens.length,
      pares: itens.reduce((acc, item) => acc + Number(item.qtd || 0), 0),
      total: calcularTotalPedido(order)
    };
  }

  function finalizarPedido(){
    const db = loadDB();

    if(!db.currentOrder || !db.currentOrder.clientId){
      alert('Selecione um cliente antes de finalizar o pedido.');
      return;
    }

    if(!db.currentOrder.items || !db.currentOrder.items.length){
      alert('Adicione produtos antes de finalizar.');
      return;
    }

    db.currentOrder.status = 'finalizado';
    db.currentOrder.createdAt = db.currentOrder.createdAt || new Date().toISOString();
    db.currentOrder.finalizedAt = new Date().toISOString();
    db.currentOrder.total = calcularTotalPedido(db.currentOrder);

    db.orders.push(db.currentOrder);
    db.currentOrder = null;

    saveDB(db);
    alert('Pedido finalizado com sucesso!');
    location.href = 'historico-pedidos.html';
  }

  function ativarMenuAtual(){
    const atual = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-header button').forEach(btn => {
      const onclick = btn.getAttribute('onclick') || '';
      const match = onclick.match(/location\.href\s*=\s*'([^']+)'/);
      if(match && match[1] === atual){
        btn.classList.add('ativo');
      }else{
        btn.classList.remove('ativo');
      }
    });
  }

  window.VendorShared = {
    KEY,
    loadDB,
    saveDB,
    safe,
    fmtMoney,
    fmtDate,
    uid,
    getSelectedClientId,
    setSelectedClientId,
    gerarNumeroPedido,
    calcularTotalPedido,
    orderTotals,
    finalizarPedido,
    ativarMenuAtual
  };

  window.loadDB = loadDB;
  window.saveDB = saveDB;
  window.safe = safe;
  window.fmtMoney = fmtMoney;
  window.fmtDate = fmtDate;
  window.uid = uid;
  window.getSelectedClientId = getSelectedClientId;
  window.setSelectedClientId = setSelectedClientId;
  window.gerarNumeroPedido = gerarNumeroPedido;
  window.calcularTotalPedido = calcularTotalPedido;
  window.orderTotals = orderTotals;
  window.finalizarPedido = finalizarPedido;

  document.addEventListener('DOMContentLoaded', ativarMenuAtual);
})();
