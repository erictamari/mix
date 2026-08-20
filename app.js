const DEMO={
  config:{labor:5200,fixed:2800,target:20000},
  ingredients:[
    {id:1,name:"Filé de frango",unit:"kg",price:18.9,supplier:"Atacado",stock:32,min:10,marketPrices:[{supplier:"Atacado",price:18.9},{supplier:"Mercado Central",price:19.5},{supplier:"Distribuidora Sul",price:18.2}]},
    {id:2,name:"Batata congelada",unit:"kg",price:12.5,supplier:"Distribuidor",stock:25,min:8,marketPrices:[]},
    {id:3,name:"Linguiça de frango",unit:"kg",price:21.9,supplier:"Atacado",stock:12,min:5,marketPrices:[]},
    {id:4,name:"Farinha de trigo",unit:"kg",price:6.8,supplier:"Atacado",stock:9,min:4,marketPrices:[]},
    {id:5,name:"Óleo de soja",unit:"L",price:7.9,supplier:"Atacado",stock:18,min:6,marketPrices:[]},
    {id:6,name:"Gochujang",unit:"kg",price:39.9,supplier:"Importados",stock:2.5,min:1,marketPrices:[]},
    {id:7,name:"Molho de laranja",unit:"kg",price:22,supplier:"Produção própria",stock:3,min:1,marketPrices:[]},
    {id:8,name:"Muçarela",unit:"kg",price:34.9,supplier:"Laticínios",stock:5,min:2,marketPrices:[]}
  ],
  products:[
    {id:1,name:"TRIO",price:45,recipe:[{i:1,q:.18},{i:3,q:.15},{i:2,q:.25}],sold:96,image:""},
    {id:2,name:"Frango Supremo",price:85,recipe:[{i:1,q:.65},{i:4,q:.08},{i:5,q:.04}],sold:72,image:""},
    {id:3,name:"Korean Chicken",price:59.9,recipe:[{i:1,q:.45},{i:6,q:.06},{i:4,q:.06},{i:5,q:.03}],sold:58,image:""},
    {id:4,name:"Orange Chicken",price:59.9,recipe:[{i:1,q:.45},{i:7,q:.08},{i:4,q:.06},{i:5,q:.03}],sold:44,image:""},
    {id:5,name:"Porção Mista G",price:72,recipe:[{i:1,q:.4},{i:3,q:.2},{i:2,q:.25}],sold:51,image:""},
    {id:6,name:"Porção Frango Empanado G",price:79,recipe:[{i:1,q:.65},{i:4,q:.08},{i:5,q:.04}],sold:63,image:""},
    {id:7,name:"Mac & Cheese + Frango",price:36.9,recipe:[{i:1,q:.16},{i:8,q:.06},{i:4,q:.03}],sold:39,image:""}
  ],
  sales:[
    {id:1,date:"2026-08-20",product:1,qty:5},{id:2,date:"2026-08-20",product:3,qty:3},{id:3,date:"2026-08-19",product:2,qty:2},
    {id:4,date:"2026-08-19",product:5,qty:4},{id:5,date:"2026-08-18",product:4,qty:3},{id:6,date:"2026-08-18",product:7,qty:5}
  ],
  transactions:[
    {id:1,date:"2026-08-20",type:"entrada",cat:"Vendas",desc:"Vendas do dia",value:1240},
    {id:2,date:"2026-08-19",type:"entrada",cat:"Vendas",desc:"Vendas do dia",value:980},
    {id:3,date:"2026-08-18",type:"entrada",cat:"Vendas",desc:"Vendas do dia",value:1120},
    {id:4,date:"2026-08-18",type:"saida",cat:"Insumos",desc:"Compra de frango",value:540},
    {id:5,date:"2026-08-17",type:"saida",cat:"Insumos",desc:"Compra de batata",value:280},
    {id:6,date:"2026-08-15",type:"saida",cat:"Mão de obra",desc:"Folha",value:5200},
    {id:7,date:"2026-08-10",type:"saida",cat:"Despesas",desc:"Energia",value:780}
  ],
  purchases:[]
};

let S = JSON.parse(localStorage.getItem("mixPro")||"null") || structuredClone(DEMO);
let charts = {};
let customStart = null, customEnd = null;
let zoomState = {};

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n||0);
const pct = n => (n||0).toFixed(1).replace(".",",")+"%";
const ing = id => S.ingredients.find(x=>x.id==id);
const prod = id => S.products.find(x=>x.id==id);
const cost = p => (p.recipe||[]).reduce((a,r)=>a+(ing(r.i)?.price||0)*r.q,0);
const cmv = p => p.price?cost(p)/p.price*100:0;
const markup = p => cost(p)?p.price/cost(p):0;
const save = () => localStorage.setItem("mixPro",JSON.stringify(S));

const nav = [
  ["dashboard","⌂","Início"],
  ["vendas","＋","Vendas"],
  ["financeiro","R$","Financeiro"],
  ["compras","▤","Compras"],
  ["insumos","◫","Insumos"],
  ["estoque","□","Estoque"],
  ["fichas","⚖","Fichas"],
  ["relatorios","▥","Relatórios"],
  ["vendasproduto","📊","Vendas mês"]
];

function buildNav(){
  let a = $("sideNav"), b = $("bottomNav");
  a.innerHTML = nav.map(n => `<button class="navbtn" data-go="${n[0]}">${n[1]} <span>${n[2]}</span></button>`).join("");
  b.innerHTML = nav.slice(0,5).map(n => `<button data-go="${n[0]}"><span class="nav-icon">${n[1]}</span>${n[2]}</button>`).join("") +
    `<button data-go="mais"><span class="nav-icon">•••</span>Mais</button>`;
  document.querySelectorAll("[data-go]").forEach(x => x.onclick = () => go(x.dataset.go));
}

function go(id){
  if(id==="mais") id = "estoque";
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll("[data-go]").forEach(x => x.classList.toggle("active", x.dataset.go === id));
  $("title").textContent = ({
    dashboard:"Dashboard",
    vendas:"Vendas",
    financeiro:"Financeiro",
    compras:"Compras",
    insumos:"Insumos",
    estoque:"Estoque",
    fichas:"Fichas técnicas",
    produtos:"Produtos",
    relatorios:"Relatórios",
    config:"Configurações",
    vendasproduto:"Vendas por produto"
  })[id] || "Estoque";
  render();
}

function toast(x){
  let t = $("toast");
  t.textContent = x;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2000);
}

function modal(title, body, cb){
  $("modalTitle").textContent = title;
  $("form").innerHTML = body;
  $("modal").classList.remove("hidden");
  $("form").onsubmit = e => {
    e.preventDefault();
    cb(new FormData(e.target));
    close();
  };
}

function close(){ $("modal").classList.add("hidden"); }
$("close").onclick = close;

function periodTx(){
  const sel = $("period").value;
  if(sel === "-1" && customStart && customEnd){
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23,59,59,999);
    return S.transactions.filter(t => {
      const dt = new Date(t.date);
      return dt >= start && dt <= end;
    });
  }
  let d = +sel;
  let start = new Date();
  start.setDate(start.getDate() - d);
  return S.transactions.filter(t => new Date(t.date) >= start);
}

function revenue(){
  return S.sales.reduce((a,s) => a + prod(s.product).price * s.qty, 0);
}

// --- Dashboard ---
function dashboard(){
  let tx = periodTx();
  let rev = tx.filter(t=>t.type==="entrada"&&t.cat==="Vendas").reduce((a,t)=>a+t.value,0);
  let cm = tx.filter(t=>t.type==="saida"&&t.cat==="Insumos").reduce((a,t)=>a+t.value,0);
  let lab = tx.filter(t=>t.type==="saida"&&t.cat==="Mão de obra").reduce((a,t)=>a+t.value,0);
  let orders = S.sales.reduce((a,s)=>a+s.qty,0);
  let margin = rev ? ((rev-cm-lab)/rev*100) : 0;

  $("mRevenue").textContent = money(rev);
  $("mCMV").textContent = pct(rev ? cm/rev*100 : 0);
  $("mCMVSub").textContent = money(cm);
  $("mCMO").textContent = pct(rev ? lab/rev*100 : 0);
  $("mCMOSub").textContent = money(lab);
  $("mMargin").textContent = pct(margin);
  $("mMarginSub").textContent = money(rev-cm-lab);
  $("mTicket").textContent = money(orders ? rev/orders : 0);
  $("mOrders").textContent = orders + " unidades";

  $("alerts").innerHTML = S.ingredients.filter(i => i.stock <= i.min).map(i =>
    `<div class="alert"><span>${i.name}</span><b>${i.stock} ${i.unit}</b></div>`
  ).join("") || `<p class="muted">Nenhum item crítico.</p>`;

  // Destroi gráficos antigos
  Object.values(charts).forEach(c => c.destroy());
  charts = {};

  let labels = ["1","2","3","4","5","6","7"];
  let base = rev || 6000;
  charts.s = new Chart($("salesChart"), {
    type:"line",
    data:{
      labels: labels.map(x=>"Sem. "+x),
      datasets:[
        {label:"Faturamento", data: labels.map((_,i)=> base*(.7+i*.05)), tension:.3},
        {label:"Custos", data: labels.map((_,i)=> (cm+lab || base*.6)*(.75+i*.035)), tension:.3}
      ]
    },
    options:{responsive:true, plugins:{legend:{position:"bottom"}}}
  });

  charts.c = new Chart($("costChart"), {
    type:"doughnut",
    data:{
      labels:["CMV","CMO","Outros"],
      datasets:[{data:[cm, lab, Math.max(0, rev-cm-lab - margin*rev/100)]}]
    },
    options:{plugins:{legend:{position:"bottom"}}}
  });

  // Top 6 mais vendidos (histórico)
  let top = [...S.products].sort((a,b)=>b.sold - a.sold).slice(0,6);
  charts.t = new Chart($("topChart"), {
    type:"bar",
    data:{
      labels: top.map(p=>p.name),
      datasets:[{label:"Unidades", data: top.map(p=>p.sold)}]
    },
    options:{indexAxis:"y", plugins:{legend:{display:false}}}
  });

  // Gráfico de vendas por produto nos últimos 30 dias
  const last30 = S.sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const diff = (now - d) / (1000*60*60*24);
    return diff <= 30;
  });
  const map = {};
  last30.forEach(s => {
    const p = prod(s.product);
    if(p) map[p.id] = (map[p.id] || 0) + s.qty;
  });
  const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]);
  const labels30 = sorted.map(([id,q]) => prod(+id)?.name || id);
  const data30 = sorted.map(([id,q]) => q);
  if(charts.m) charts.m.destroy();
  if(labels30.length){
    charts.m = new Chart($("monthlySalesChart"), {
      type:"bar",
      data:{
        labels: labels30,
        datasets:[{label:"Quantidade (últimos 30 dias)", data: data30, backgroundColor:"#ff9b34"}]
      },
      options:{plugins:{legend:{display:false}}}
    });
  } else {
    // gráfico vazio
    charts.m = new Chart($("monthlySalesChart"), {
      type:"bar",
      data:{labels:["Nenhuma venda"], datasets:[{label:"Quantidade", data:[0]}]},
      options:{plugins:{legend:{display:false}}}
    });
  }
}

// --- Vendas ---
function sales(){
  let today = new Date().toISOString().slice(0,10);
  let ts = S.sales.filter(s => s.date === today);
  let r = ts.reduce((a,s)=>a+prod(s.product).price*s.qty,0);
  $("todayRevenue").textContent = money(r);
  $("todayOrders").textContent = ts.reduce((a,s)=>a+s.qty,0);
  $("todayTicket").textContent = money(ts.length ? r / ts.reduce((a,s)=>a+s.qty,0) : 0);
  let q = ($("saleSearch").value||"").toLowerCase();
  $("salesTable").innerHTML = S.sales.slice().reverse().filter(s => prod(s.product).name.toLowerCase().includes(q)).map(s => {
    let p = prod(s.product), tot = p.price * s.qty;
    return `<tr><td>${s.date}</td><td>${p.name}</td><td>${s.qty}</td><td>${money(p.price)}</td><td>${money(tot)}</td><td>${pct(cmv(p))}</td><td><button class="icon-btn delete" onclick="delSale(${s.id})">×</button></td></tr>`;
  }).join("");
}

// --- Financeiro ---
function finance(){
  let ins = S.transactions.filter(t=>t.type==="entrada").reduce((a,t)=>a+t.value,0);
  let out = S.transactions.filter(t=>t.type==="saida").reduce((a,t)=>a+t.value,0);
  $("finIn").textContent = money(ins);
  $("finOut").textContent = money(out);
  $("finNet").textContent = money(ins-out);
  let q = ($("txSearch").value||"").toLowerCase();
  $("txTable").innerHTML = S.transactions.slice().reverse().filter(t => (t.desc+" "+t.cat).toLowerCase().includes(q)).map(t =>
    `<tr><td>${t.date}</td><td>${t.type==="entrada"?"Entrada":"Saída"}</td><td>${t.cat}</td><td>${t.desc}</td><td class="${t.type==="entrada"?"positive":"negative"}">${money(t.value)}</td><td><button class="icon-btn delete" onclick="delTx(${t.id})">×</button></td></tr>`
  ).join("");
}

// --- Insumos ---
function ingredients(){
  let q = ($("ingredientSearch").value||"").toLowerCase();
  $("ingredientTable").innerHTML = S.ingredients.filter(i => i.name.toLowerCase().includes(q)).map(i => {
    const prices = (i.marketPrices || []).map(m => `${m.supplier}: ${money(m.price)}`).join("<br>");
    return `<tr><td>${i.name}</td><td>${i.unit}</td><td>${money(i.price)}</td><td>${i.supplier}</td><td>${i.stock}</td><td>${i.min}</td><td>${prices || "—"}</td><td><button class="icon-btn" onclick="editIng(${i.id})">✎</button><button class="icon-btn delete" onclick="delIng(${i.id})">×</button></td></tr>`;
  }).join("");
}

// --- Estoque ---
function stock(){
  let val = S.ingredients.reduce((a,i)=>a+i.stock*i.price,0);
  let low = S.ingredients.filter(i=>i.stock<=i.min).length;
  $("stockValue").textContent = money(val);
  $("stockCount").textContent = S.ingredients.length;
  $("stockCritical").textContent = low;
  let q = ($("stockSearch").value||"").toLowerCase();
  $("stockTable").innerHTML = S.ingredients.filter(i => i.name.toLowerCase().includes(q)).map(i =>
    `<tr><td>${i.name}</td><td>${i.stock}</td><td>${i.unit}</td><td>${money(i.price)}</td><td>${money(i.stock*i.price)}</td><td><span class="tag ${i.stock<=i.min?"low":"ok"}">${i.stock<=i.min?"Repor":"OK"}</span></td><td><button class="icon-btn" onclick="move(${i.id})">Mov.</button></td></tr>`
  ).join("");
}

// --- Fichas técnicas (com imagem e zoom) ---
function recipes(){
  let html = S.products.map(p => {
    const img = p.image ? `<div class="recipe-image-wrap"><img class="recipe-image" id="img-${p.id}" src="${p.image}" style="transform: scale(${zoomState[p.id] || 1}); object-fit: contain; width:100%; height:auto; max-height:200px;"></div><div class="image-controls"><button class="zoom-btn" data-id="${p.id}" data-dir="in">+</button><button class="zoom-btn" data-id="${p.id}" data-dir="out">−</button><button class="zoom-btn" data-id="${p.id}" data-dir="reset">⟲</button></div>` : '<div class="recipe-image-placeholder">Sem imagem</div>';
    return `<article class="recipe"><div class="panel-title"><div><h3>${p.name}</h3><span class="badge">${p.sold} vendidos</span></div><button class="icon-btn" onclick="editProduct(${p.id})">✎</button></div><div class="recipe-price">${money(p.price)}</div>${img}${p.recipe.map(r => `<div class="recipe-line"><span>${ing(r.i)?.name||"—"} × ${r.q}</span><b>${money((ing(r.i)?.price||0)*r.q)}</b></div>`).join("")}<div class="recipe-total"><span>Custo</span><b>${money(cost(p))}</b></div><div class="recipe-total"><span>CMV</span><b>${pct(cmv(p))}</b></div><div class="recipe-total"><span>Markup</span><b>${markup(p).toFixed(2)}x</b></div></article>`;
  }).join("");
  $("recipeGrid").innerHTML = html;
  // Eventos de zoom delegados
  document.querySelectorAll(".zoom-btn").forEach(btn => {
    btn.onclick = function(e){
      e.stopPropagation();
      const id = +this.dataset.id;
      const dir = this.dataset.dir;
      if(!zoomState[id]) zoomState[id] = 1;
      if(dir === "in") zoomState[id] = Math.min(zoomState[id] + 0.1, 3);
      else if(dir === "out") zoomState[id] = Math.max(zoomState[id] - 0.1, 0.3);
      else if(dir === "reset") zoomState[id] = 1;
      const img = document.getElementById("img-"+id);
      if(img) img.style.transform = `scale(${zoomState[id]})`;
    };
  });
}

// --- Produtos ---
function products(){
  $("productTable").innerHTML = S.products.map(p =>
    `<tr><td>${p.name}</td><td>${money(p.price)}</td><td>${money(cost(p))}</td><td>${pct(cmv(p))}</td><td>${markup(p).toFixed(2)}x</td><td>${money(p.price-cost(p))}</td><td>${p.sold}</td><td><button class="icon-btn" onclick="editProduct(${p.id})">✎</button><button class="icon-btn delete" onclick="delProduct(${p.id})">×</button></td></tr>`
  ).join("");
}

// --- Relatórios ---
function reports(){
  $("profitTable").innerHTML = S.products.slice().sort((a,b)=>cmv(a)-cmv(b)).map(p =>
    `<tr><td>${p.name}</td><td>${money(p.price)}</td><td>${money(cost(p))}</td><td>${money(p.price-cost(p))}</td><td>${pct(cmv(p))}</td></tr>`
  ).join("");
  let rev = revenue();
  let c = S.products.reduce((a,p)=>a+cost(p)*p.sold,0);
  let ticket = S.sales.length ? rev / S.sales.reduce((a,s)=>a+s.qty,0) : 0;
  $("indicators").innerHTML = [
    ["Faturamento acumulado", money(rev)],
    ["CMV teórico por vendas", pct(rev?c/rev*100:0)],
    ["Ticket médio", money(ticket)],
    ["Produto com melhor margem", [...S.products].sort((a,b)=>(b.price-cost(b))-(a.price-cost(a)))[0]?.name||"—"],
    ["Produtos cadastrados", S.products.length]
  ].map(x => `<div class="indicator"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("");
}

// --- Configurações ---
function config(){
  $("cfgLabor").value = S.config.labor;
  $("cfgFixed").value = S.config.fixed;
  $("cfgTarget").value = S.config.target;
}

// --- Compras ---
function purchases(){
  $("purchaseTable").innerHTML = S.purchases.slice().reverse().map(p =>
    `<tr><td>${p.date}</td><td>${ing(p.i)?.name}</td><td>${p.q}</td><td>${money(p.unit)}</td><td>${money(p.q*p.unit)}</td><td>${p.supplier||"—"}</td><td><button class="icon-btn delete" onclick="delPurchase(${p.id})">×</button></td></tr>`
  ).join("");
}

// --- Vendas por produto (últimos 30 dias) ---
function vendasProduto(){
  const last30 = S.sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const diff = (now - d) / (1000*60*60*24);
    return diff <= 30;
  });
  const map = {};
  last30.forEach(s => {
    const p = prod(s.product);
    if(p) map[p.id] = (map[p.id] || 0) + s.qty;
  });
  const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]);
  let html = sorted.map(([id,q]) => {
    const p = prod(+id);
    return `<tr><td>${p?p.name:"—"}</td><td>${q}</td><td>${money(q * (p?p.price:0))}</td></tr>`;
  }).join("") || `<tr><td colspan="3" class="muted">Nenhuma venda nos últimos 30 dias.</td></tr>`;
  $("vendasProdutoTable").innerHTML = html;

  // Gráfico específico da view
  const labels = sorted.map(([id,q]) => prod(+id)?.name || id);
  const data = sorted.map(([id,q]) => q);
  if(charts.vp) charts.vp.destroy();
  if(labels.length){
    charts.vp = new Chart($("vendasProdutoChart"), {
      type:"bar",
      data:{labels, datasets:[{label:"Quantidade (30 dias)", data, backgroundColor:"#ff9b34"}]},
      options:{plugins:{legend:{display:false}}}
    });
  } else {
    charts.vp = new Chart($("vendasProdutoChart"), {
      type:"bar",
      data:{labels:["Nenhuma venda"], datasets:[{label:"Quantidade", data:[0]}]},
      options:{plugins:{legend:{display:false}}}
    });
  }
}

// --- Renderização geral ---
function render(){
  dashboard();
  sales();
  finance();
  ingredients();
  stock();
  recipes();
  products();
  reports();
  config();
  purchases();
  vendasProduto();
}

// --- Ações de modal ---
function newSale(){
  modal("Registrar venda",
    `<div class="form-grid"><label>Data<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label><label>Produto<select name="product">${S.products.map(p => `<option value="${p.id}">${p.name} — ${money(p.price)}</option>`).join("")}</select></label><label>Quantidade<input name="qty" type="number" min="1" value="1" required></label></div><button class="primary">Registrar</button>`,
    d => {
      let p = prod(d.get("product")), q = +d.get("qty"), date = d.get("date");
      S.sales.push({id:Date.now(), date, product:+d.get("product"), qty:q});
      p.sold += q;
      S.transactions.push({id:Date.now()+1, date, type:"entrada", cat:"Vendas", desc:p.name, value:p.price*q});
      p.recipe.forEach(r => { let i = ing(r.i); i.stock = Math.max(0, i.stock - r.q*q); });
      save();
      toast("Venda registrada e estoque baixado");
      render();
    }
  );
}

function newTx(){
  modal("Novo lançamento",
    `<div class="form-row"><label>Data<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Tipo<select name="type"><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label></div><label>Categoria<select name="cat"><option>Vendas</option><option>Insumos</option><option>Mão de obra</option><option>Despesas</option><option>Impostos</option><option>Marketing</option><option>Outros</option></select></label><label>Descrição<input name="desc" required></label><label>Valor<input name="value" type="number" step=".01" min="0" required></label><button class="primary">Salvar</button>`,
    d => {
      S.transactions.push({id:Date.now(), date:d.get("date"), type:d.get("type"), cat:d.get("cat"), desc:d.get("desc"), value:+d.get("value")});
      save();
      toast("Lançamento salvo");
      render();
    }
  );
}

function newIngredient(old){
  let i = old || {id:Date.now(), name:"", unit:"kg", price:0, supplier:"", stock:0, min:0, marketPrices:[]};
  const mp = i.marketPrices || [];
  const mpFields = [0,1,2].map(n => `
    <div class="form-row">
      <label>Fornecedor ${n+1} <input name="mktSupplier${n}" value="${mp[n]?.supplier||''}"></label>
      <label>Preço ${n+1} <input name="mktPrice${n}" type="number" step="0.01" value="${mp[n]?.price||''}"></label>
    </div>
  `).join("");
  modal(old?"Editar insumo":"Novo insumo",
    `<label>Nome<input name="name" value="${i.name}" required></label><div class="form-row"><label>Unidade<select name="unit"><option>kg</option><option>g</option><option>L</option><option>un</option></select></label><label>Preço unitário<input name="price" type="number" step=".0001" value="${i.price}"></label></div><label>Fornecedor<input name="supplier" value="${i.supplier}"></label><div class="form-row"><label>Estoque<input name="stock" type="number" step=".001" value="${i.stock}"></label><label>Mínimo<input name="min" type="number" step=".001" value="${i.min}"></label></div><h4>Preços de mercado</h4>${mpFields}<button class="primary">Salvar</button>`,
    d => {
      const marketPrices = [];
      for(let n=0; n<3; n++){
        const supplier = d.get(`mktSupplier${n}`);
        const price = parseFloat(d.get(`mktPrice${n}`));
        if(supplier && !isNaN(price) && price>0) marketPrices.push({supplier, price});
      }
      Object.assign(i, {
        name:d.get("name"),
        unit:d.get("unit"),
        price:+d.get("price"),
        supplier:d.get("supplier"),
        stock:+d.get("stock"),
        min:+d.get("min"),
        marketPrices
      });
      if(!old) S.ingredients.push(i);
      save();
      toast("Insumo salvo");
      render();
    }
  );
}

function newPurchase(){
  modal("Nova compra",
    `<label>Data<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Insumo<select name="i">${S.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join("")}</select></label><div class="form-row"><label>Quantidade<input name="q" type="number" step=".001" min=".001" required></label><label>Preço unitário<input name="unit" type="number" step=".0001" min="0" required></label></div><label>Fornecedor<input name="supplier"></label><button class="primary">Registrar compra</button>`,
    d => {
      let q = +d.get("q"), u = +d.get("unit"), i = ing(d.get("i"));
      i.stock += q; i.price = u;
      S.purchases.push({id:Date.now(), date:d.get("date"), i:+d.get("i"), q, unit:u, supplier:d.get("supplier")});
      S.transactions.push({id:Date.now()+1, date:d.get("date"), type:"saida", cat:"Insumos", desc:"Compra de "+i.name, value:q*u});
      save();
      toast("Compra registrada e estoque atualizado");
      render();
    }
  );
}

function move(id){
  let i = ing(id);
  modal("Movimentar estoque",
    `<label>Insumo<input value="${i.name}" disabled></label><div class="form-row"><label>Tipo<select name="type"><option value="in">Entrada</option><option value="out">Saída</option><option value="loss">Perda</option></select></label><label>Quantidade<input name="q" type="number" step=".001" min=".001" required></label></div><button class="primary">Aplicar</button>`,
    d => {
      let q = +d.get("q");
      i.stock = Math.max(0, i.stock + (d.get("type")==="in" ? q : -q));
      save();
      toast("Estoque atualizado");
      render();
    }
  );
}

// --- Produto com imagem ---
function newProduct(old){
  let p = old || {id:Date.now(), name:"", price:0, sold:0, recipe:[{i:S.ingredients[0]?.id, q:0}], image:""};
  const imageHtml = `<label>Imagem do produto (PNG/JPG, max 500x500)<input type="file" accept="image/png,image/jpeg" id="productImageInput"><div id="imagePreview" style="width:100px;height:100px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;margin-top:5px;overflow:hidden;">${p.image ? `<img src="${p.image}" style="max-width:100%;max-height:100%;">` : "Sem imagem"}</div></label>`;
  modal(old?"Editar produto":"Nova ficha técnica",
    `<label>Produto<input name="name" value="${p.name}" required></label><div class="form-row"><label>Preço de venda<input name="price" type="number" step=".01" value="${p.price}"></label><label>Vendidos<input name="sold" type="number" value="${p.sold}"></label></div>${imageHtml}<div id="recipeFields">${p.recipe.map((r,n) => `<div class="form-row r"><label>Insumo<select name="i${n}">${S.ingredients.map(i => `<option value="${i.id}" ${i.id==r.i?"selected":""}>${i.name}</option>`).join("")}</select></label><label>Quantidade<input name="q${n}" type="number" step=".001" value="${r.q}"></label></div>`).join("")}</div><button type="button" class="secondary" id="addIngRow">+ Ingrediente</button><button class="primary">Salvar ficha</button>`,
    d => {
      // Processar imagem
      const fileInput = document.getElementById("productImageInput");
      const file = fileInput.files[0];
      if(file){
        const reader = new FileReader();
        reader.onload = function(e){
          const img = new Image();
          img.onload = function(){
            const canvas = document.createElement("canvas");
            let w = img.width, h = img.height;
            if(w > 500 || h > 500){
              const ratio = Math.min(500/w, 500/h);
              w = Math.round(w*ratio);
              h = Math.round(h*ratio);
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            p.image = dataUrl;
            finalize();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        finalize();
      }
      function finalize(){
        let n = document.querySelectorAll("#recipeFields .r").length;
        let recipe = [];
        for(let j=0; j<n; j++) recipe.push({i:+d.get("i"+j), q:+d.get("q"+j)});
        Object.assign(p, {name:d.get("name"), price:+d.get("price"), sold:+d.get("sold"), recipe});
        if(!old) S.products.push(p);
        save();
        toast("Ficha técnica salva");
        render();
      }
    }
  );
  // Evento de preview da imagem
  setTimeout(() => {
    const input = document.getElementById("productImageInput");
    if(input){
      input.onchange = function(){
        const file = this.files[0];
        if(file){
          const reader = new FileReader();
          reader.onload = function(e){
            const preview = document.getElementById("imagePreview");
            preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:100%;">`;
          };
          reader.readAsDataURL(file);
        }
      };
    }
    // Adicionar linha de ingrediente
    document.getElementById("addIngRow")?.addEventListener("click", function(){
      let n = document.querySelectorAll("#recipeFields .r").length;
      document.getElementById("recipeFields").insertAdjacentHTML("beforeend",
        `<div class="form-row r"><label>Insumo<select name="i${n}">${S.ingredients.map(i => `<option value="${i.id}">${i.name}</option>`).join("")}</select></label><label>Quantidade<input name="q${n}" type="number" step=".001" value="0"></label></div>`
      );
    });
  }, 100);
}

// --- Funções de exclusão ---
window.delSale = id => { if(confirm("Excluir venda?")){ S.sales = S.sales.filter(x=>x.id!==id); save(); render(); } };
window.delTx = id => { if(confirm("Excluir lançamento?")){ S.transactions = S.transactions.filter(x=>x.id!==id); save(); render(); } };
window.editIng = id => newIngredient(ing(id));
window.delIng = id => { if(confirm("Excluir insumo?")){ S.ingredients = S.ingredients.filter(x=>x.id!=id); save(); render(); } };
window.move = move;
window.editProduct = id => newProduct(prod(id));
window.delProduct = id => { if(confirm("Excluir produto?")){ S.products = S.products.filter(x=>x.id!=id); save(); render(); } };
window.delPurchase = id => { if(confirm("Excluir compra do histórico? Isso não desfaz o estoque automaticamente.")){ S.purchases = S.purchases.filter(x=>x.id!=id); save(); render(); } };

// --- Backup e restore ---
function backup(){
  let a = document.createElement("a");
  let b = new Blob([JSON.stringify(S,null,2)], {type:"application/json"});
  a.href = URL.createObjectURL(b);
  a.download = "mix-chicken-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- Event listeners iniciais ---
$("newSale").onclick = newSale;
$("quickSale").onclick = newSale;
$("newTx").onclick = newTx;
$("newIngredient").onclick = () => newIngredient();
$("newPurchase").onclick = newPurchase;
$("newMovement").onclick = () => move(S.ingredients[0]?.id);
$("newProduct").onclick = () => newProduct();
$("newProduct2").onclick = () => newProduct();
$("period").onchange = function(){
  if(this.value === "-1"){
    $("customDateRange").style.display = "flex";
  } else {
    $("customDateRange").style.display = "none";
    customStart = null; customEnd = null;
    render();
  }
};
$("applyCustomPeriod").onclick = function(){
  customStart = $("customStartDate").value;
  customEnd = $("customEndDate").value;
  if(customStart && customEnd) render();
  else toast("Selecione ambas as datas");
};
["saleSearch","txSearch","ingredientSearch","stockSearch"].forEach(x => $(x).oninput = render);

$("saveCfg").onclick = () => {
  S.config.labor = +$("cfgLabor").value;
  S.config.fixed = +$("cfgFixed").value;
  S.config.target = +$("cfgTarget").value;
  save();
  toast("Configurações salvas");
  render();
};

$("exportBtn").onclick = backup;
$("export2").onclick = backup;
$("importBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = e => {
  let f = e.target.files[0];
  if(!f) return;
  let r = new FileReader;
  r.onload = () => {
    try{ S = JSON.parse(r.result); save(); render(); toast("Backup restaurado"); }
    catch{ toast("Arquivo inválido"); }
  };
  r.readAsText(f);
};
$("reset").onclick = () => {
  if(confirm("Restaurar os dados de demonstração?")){
    S = structuredClone(DEMO);
    save();
    render();
    toast("Dados restaurados");
  }
};
$("printReport").onclick = () => window.print();

buildNav();
go("dashboard");
