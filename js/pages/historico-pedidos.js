const KEY = 'aristoteles_vendedor_pro_db';
    let filtroAtual = 'todos';

    function safe(v){
      return String(v ?? '').replace(/[&<>"]/g, m => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;'
      }[m]));
    }

    function excluirPedido(id){
      if(!confirm("Deseja excluir este pedido?")) return;

      const db = loadDB();

      db.orders = db.orders.filter(p => String(p.id) !== String(id));

      saveDB(db);

      renderHistorico();
    }

    function fmtMoney(v){
      return Number(v || 0).toLocaleString('pt-BR', {
        style:'currency',
        currency:'BRL'
      });
    }

    function formatDateBR(iso){
      if(!iso) return '-';
      const d = new Date(iso);
      if(Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('pt-BR');
    }

    function loadDB(){
      try{
        const db = JSON.parse(localStorage.getItem(KEY)) || {};
        db.orders = Array.isArray(db.orders) ? db.orders : [];
        db.clients = Array.isArray(db.clients) ? db.clients : [];
        db.currentOrder = db.currentOrder && typeof db.currentOrder === 'object' ? db.currentOrder : null;
        return db;
      }catch(e){
        return {
          orders: [],
          clients: [],
          currentOrder: null
        };
      }
    }

    function saveDB(db){
      localStorage.setItem(KEY, JSON.stringify(db));
    }

    function uid(p){
      return p + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    function getClient(db, clientId){
      return db.clients.find(x => x.id === clientId) || null;
    }

    function getClientName(db, clientId){
      const c = getClient(db, clientId);
      return c ? c.nome : 'Cliente não encontrado';
    }

    function getClientCity(db, clientId){
      const c = getClient(db, clientId);
      if(!c) return '-';
      if(c.bairro && c.cidade) return `${c.bairro} - ${c.cidade}`;
      return c.cidade || c.bairro || '-';
    }

    function resumoItens(order){
      const items = order?.items || [];
      return items.map(i => `${i.nome} - ${i.qtd} pares`).join('\n');
    }

    function totalPares(order){
      return (order?.items || []).reduce((a, i) => a + Number(i.qtd || 0), 0);
    }

    function totalProdutos(order){
      return (order?.items || []).length;
    }

    function hojeRange(){
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return { start, end };
    }

    function semanaRange(){
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { start, end };
    }

    function mesRange(){
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { start, end };
    }

    function applyFilter(orders){
      let lista = [...orders];

      if(filtroAtual === 'maior'){
        lista.sort((a,b) => Number(b.total || 0) - Number(a.total || 0));
        return lista;
      }

      if(filtroAtual === 'hoje' || filtroAtual === 'semana' || filtroAtual === 'mes'){
        const range = filtroAtual === 'hoje'
          ? hojeRange()
          : filtroAtual === 'semana'
            ? semanaRange()
            : mesRange();

        lista = lista.filter(o => {
          const d = new Date(o.createdAt || o.criadoEm || o.data || '');
          if(Number.isNaN(d.getTime())) return false;
          return d >= range.start && d < range.end;
        });
      }

      lista.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return lista;
    }

    function applySearch(db, orders){
      const term = (document.getElementById('buscaHistorico').value || '').toLowerCase().trim();
      if(!term) return orders;

      return orders.filter(order => {
        const cliente = getClientName(db, order.clientId).toLowerCase();
        const cidade = getClientCity(db, order.clientId).toLowerCase();
        const id = String(order.id || '').toLowerCase();
        const data = formatDateBR(order.createdAt || order.criadoEm || '').toLowerCase();
        const itens = (order.items || []).map(i => `${i.nome} ${i.qtd} ${i.codigo || ''}`).join(' ').toLowerCase();

        return (
          id.includes(term) ||
          cliente.includes(term) ||
          cidade.includes(term) ||
          data.includes(term) ||
          itens.includes(term)
        );
      });
    }

    function renderHistorico(){
      const db = loadDB();
      const box = document.getElementById('historicoLista');

      let orders = Array.isArray(db.orders) ? db.orders : [];
      orders = applyFilter(orders);
      orders = applySearch(db, orders);

      if(!orders.length){
        box.innerHTML = `<div class="empty">Nenhum pedido encontrado.</div>`;
        return;
      }

      box.innerHTML = orders.map(order => `
        <article class="order-card">
          <div class="order-head">
            <div>
              <h3>Pedido #${safe(order.id || '')}</h3>
              <p>Cliente: ${safe(getClientName(db, order.clientId))}<br>Bairro / Cidade: ${safe(getClientCity(db, order.clientId))}</p>
            </div>
            <span class="status">${safe(order.status || 'Finalizado')}</span>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <small>Data</small>
              <strong>${safe(formatDateBR(order.createdAt || order.criadoEm || ''))}</strong>
            </div>

            <div class="info-box">
              <small>Total</small>
              <strong>${fmtMoney(calcularTotalPedido(order))}</strong>
            </div>

            <div class="info-box">
              <small>Pares</small>
              <strong>${totalPares(order)} pares</strong>
            </div>

            <div class="info-box">
              <small>Itens</small>
              <strong>${totalProdutos(order)} produto${totalProdutos(order) === 1 ? '' : 's'}</strong>
            </div>
          </div>

          <div class="items-box">${safe(resumoItens(order))}</div>

          <div class="actions">
            <button class="btn-light" onclick="verDetalhes('${safe(order.id)}')">Ver detalhes</button>
            <button class="btn-pdf" onclick="baixarPdfPedido('${safe(order.id)}')">PDF</button>
            <button class="btn-repeat" onclick="repetirPedido('${safe(order.id)}')">Repetir pedido</button>
            <button class="btn-remove" onclick="excluirPedido('${order.id}')">Excluir</button>
          </div>
        </article>
      `).join('');
    }

    function verDetalhes(orderId){
      const db = loadDB();
      const order = db.orders.find(o => String(o.id) === String(orderId));
      if(!order) return;

      const cliente = getClient(db, order.clientId);

      const html = `
        <div class="detail-top">
          <h3>Resumo do Pedido #${safe(order.id || '')}</h3>
          <p>
            Cliente: ${safe(cliente?.nome || 'Cliente não encontrado')}<br>
            Data: ${safe(formatDateBR(order.createdAt || order.criadoEm || ''))}<br>
            Status: ${safe(order.status || 'Finalizado')}
          </p>
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <small>Telefone</small>
            <strong>${safe(cliente?.telefone || '-')}</strong>
          </div>
          <div class="detail-card">
            <small>Apelido</small>
            <strong>${safe(cliente?.apelido || '-')}</strong>
          </div>
          <div class="detail-card">
            <small>Cidade / Bairro</small>
            <strong>${safe(getClientCity(db, order.clientId))}</strong>
          </div>
          <div class="detail-card">
            <small>Endereço</small>
            <strong>${safe(cliente?.endereco || '-')}</strong>
          </div>
        </div>

        <div class="detail-items">
          ${(order.items || []).map(item => `
            <div class="detail-item">
              <img src="${safe(item.imagem || '')}" alt="${safe(item.nome || '')}">
              <div>
                <h4>${safe(item.nome || '')}</h4>
                <p>
Cor: ${safe(item.cor || '-')}
Quantidade: ${safe(item.qtd || 0)} pares
Preço unitário: ${fmtMoney(item.preco || 0)}
Subtotal: ${fmtMoney(item.subtotal || 0)}

Tamanhos:
${safe(item.tamanhos || '-')}
                </p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="detail-total">
          <div><strong>Total de pares:</strong> ${totalPares(order)}</div>
          <div><strong>Total do pedido:</strong> ${fmtMoney(calcularTotalPedido(order))}</div>
        </div>
      `;

      document.getElementById('detalheConteudo').innerHTML = html;
      document.getElementById('detalheModal').style.display = 'flex';
    }

    function fecharDetalhes(){
      document.getElementById('detalheModal').style.display = 'none';
    }

    function repetirPedido(orderId){
      const db = loadDB();
      const order = db.orders.find(o => String(o.id) === String(orderId));
      if(!order) return;

      db.currentOrder = JSON.parse(JSON.stringify({
        ...order,
        id: uid('ped'),
        status: 'rascunho',
        createdAt: new Date().toISOString()
      }));

      saveDB(db);
      location.href = 'carrinho-vendedores.html';
    }

    function montarPdfHtml(order, cliente){
      const itensHtml = (order.items || []).map(item => `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;text-align:center;">
            ${item.imagem ? `<img src="${item.imagem}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">` : '-'}
          </td>
          <td style="padding:10px;border:1px solid #ddd;">${safe(item.nome || '-')}</td>
          <td style="padding:10px;border:1px solid #ddd;">${safe(item.cor || '-')}</td>
          <td style="padding:10px;border:1px solid #ddd;white-space:pre-line;">${safe(item.tamanhos || '-')}</td>
          <td style="padding:10px;border:1px solid #ddd;text-align:center;">${safe(item.qtd || 0)}</td>
          <td style="padding:10px;border:1px solid #ddd;text-align:right;">${fmtMoney(item.preco || 0)}</td>
          <td style="padding:10px;border:1px solid #ddd;text-align:right;">${fmtMoney(item.subtotal || 0)}</td>
        </tr>
      `).join('');

      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Pedido ${safe(order.id || '')}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}
  .topo{border-bottom:3px solid #254e39;padding-bottom:12px;margin-bottom:20px}
  .topo h1{margin:0;color:#254e39}
  .topo p{margin:6px 0 0;color:#555}
  .box{border:1px solid #ddd;border-radius:12px;padding:14px;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .campo{background:#fafafa;border:1px solid #eee;border-radius:10px;padding:10px}
  .campo small{display:block;color:#666;margin-bottom:4px}
  .campo strong{color:#254e39}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#254e39;color:#fff;padding:10px;border:1px solid #ddd;font-size:12px}
  td{font-size:12px;vertical-align:top}
  .total{margin-top:16px;background:#254e39;color:#fff;padding:14px;border-radius:12px;text-align:right;font-size:18px;font-weight:bold}
</style>
</head>
<body>
  <div class="topo">
    <h1>Aristóteles Botinas</h1>
    <p>Resumo do pedido #${safe(order.id || '')}</p>
  </div>

  <div class="box">
    <div class="grid">
      <div class="campo"><small>Cliente</small><strong>${safe(cliente?.nome || '-')}</strong></div>
      <div class="campo"><small>Apelido</small><strong>${safe(cliente?.apelido || '-')}</strong></div>
      <div class="campo"><small>Telefone</small><strong>${safe(cliente?.telefone || '-')}</strong></div>
      <div class="campo"><small>Cidade</small><strong>${safe(cliente?.cidade || '-')}</strong></div>
      <div class="campo"><small>Bairro</small><strong>${safe(cliente?.bairro || '-')}</strong></div>
      <div class="campo"><small>Endereço</small><strong>${safe(cliente?.endereco || '-')}</strong></div>
      <div class="campo"><small>Data</small><strong>${safe(formatDateBR(order.createdAt || order.criadoEm || ''))}</strong></div>
      <div class="campo"><small>Status</small><strong>${safe(order.status || 'Finalizado')}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Miniatura</th>
        <th>Produto</th>
        <th>Cor</th>
        <th>Tamanhos</th>
        <th>Qtd</th>
        <th>Unitário</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itensHtml}
    </tbody>
  </table>

  <div class="total">
    Total de pares: ${totalPares(order)}<br>
    Valor final: ${fmtMoney(calcularTotalPedido(order))}
  </div>
</body>
</html>
      `;
    }

    function calcularTotalPedido(order){
      return (order?.items || []).reduce((acc, item) => {
        return acc + Number(item.subtotal || (Number(item.qtd || 0) * Number(item.preco || 0)));
      }, 0);
    }

    function baixarPdfPedido(orderId){
      const db = loadDB();
      const order = db.orders.find(o => String(o.id) === String(orderId));
      if(!order) return;

      const cliente = getClient(db, order.clientId);
      const html = montarPdfHtml(order, cliente);

      const win = window.open('', '_blank');
      win.document.open();
      win.document.write(html);
      win.document.close();

      setTimeout(() => {
        win.focus();
        win.print();
      }, 400);
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderHistorico();

      document.getElementById('buscaHistorico').addEventListener('input', renderHistorico);

      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filtroAtual = btn.dataset.filter;
          renderHistorico();
        });
      });
    });
