const KEY = 'aristoteles_vendedor_pro_db';

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

    function loadDB(){
      try{
        const db = JSON.parse(localStorage.getItem(KEY)) || {};
        db.currentOrder = db.currentOrder && typeof db.currentOrder === 'object' ? db.currentOrder : null;
        return db;
      }catch(e){
        return { currentOrder:null };
      }
    }

    function saveDB(db){
      localStorage.setItem(KEY, JSON.stringify(db));
    }

    function orderTotals(order){
      const itens = order?.items || [];
      return {
        pares: itens.reduce((a, i) => a + Number(i.qtd || 0), 0),
        total: itens.reduce((a, i) => a + Number(i.subtotal || 0), 0)
      };
    }

    function render(){
      const db = loadDB();
      const list = document.getElementById('carrinhoLista');
      const totals = document.getElementById('carrinhoTotais');
      const order = db.currentOrder;

      if(!order || !order.items || !order.items.length){
        list.innerHTML = '<section class="empty-state">Nenhum item no carrinho ainda.</section>';
        totals.innerHTML = '<div><small>Total do pedido</small><strong>R$ 0,00</strong></div><span>0 pares no total</span>';
        return;
      }

      list.innerHTML = order.items.map((item, idx) => `
        <article class="cart-card">
          <div class="cart-image">
            <img src="${item.imagem}" alt="${safe(item.nome)}">
          </div>

          <div class="cart-body">
            <h3>${safe(item.nome)}</h3>

            <div class="cart-meta">
              <span class="chip">Cor: ${safe(item.cor || 'Palha')}</span>
              <span class="chip">${item.qtd} pares</span>
            </div>

            <div class="sizes-box">${safe(item.tamanhos || ('Produto ' + (item.codigo || '')))}</div>

            <div class="price-line">
              <div>
                <small>Preço unitário</small>
                <strong>${fmtMoney(item.preco)}</strong>
              </div>

              <div style="text-align:right;">
                <small>Total do item</small>
                <strong>${fmtMoney(item.subtotal)}</strong>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-light" onclick="editarItem(${idx})">Editar</button>
              <button class="btn-duplicate" onclick="duplicateItem(${idx})">Duplicar</button>
              <button class="btn-remove" onclick="removeItem(${idx})">Excluir</button>
            </div>
          </div>
        </article>
      `).join('');

      const t = orderTotals(order);
      totals.innerHTML = `
        <div>
          <small>Total do pedido</small>
          <strong>${fmtMoney(t.total)}</strong>
        </div>
        <span>${t.pares} pares no total</span>
      `;
    }

    function editarItem(idx){
      const db = loadDB();
      const item = db.currentOrder?.items?.[idx];
      if(!item) return;

      localStorage.setItem('editarItemIndex', idx);
      location.href = 'novo-pedido.html';
    }

    function duplicateItem(idx){
      const db = loadDB();
      const item = db.currentOrder?.items?.[idx];
      if(!item) return;

      db.currentOrder.items.push({
        ...item,
        subtotal: Number((item.qtd * item.preco).toFixed(2))
      });

      saveDB(db);
      render();
    }

    function removeItem(idx){
      const db = loadDB();
      if(!db.currentOrder?.items) return;

      db.currentOrder.items.splice(idx, 1);
      saveDB(db);
      render();
    }

    document.addEventListener('DOMContentLoaded', render);
