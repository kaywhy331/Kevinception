import { toast, track } from './global.js';

const storageKey = 'kevinception:kevazon-v1';
const orders = [
  { id: 'KVZ-10482', customer: 'Maya C.', channel: 'Marketplace', status: 'Ready to pick', items: 3, total: '$86.40' },
  { id: 'KVZ-10477', customer: 'Jordan R.', channel: 'FBA', status: 'Packed', items: 1, total: '$42.00' },
  { id: 'KVZ-10465', customer: 'Avery S.', channel: 'ERP', status: 'Exception', items: 6, total: '$214.18' },
  { id: 'KVZ-10441', customer: 'Sam T.', channel: 'Marketplace', status: 'Shipped', items: 2, total: '$63.75' }
];
const catalog = [
  { sku: 'KV-100042', name: 'Modular packing station labels', category: 'Fulfillment', stock: 284, health: 'Healthy' },
  { sku: 'KV-225190', name: 'Low-profile inventory scanner cradle', category: 'Operations', stock: 12, health: 'Low' },
  { sku: 'KV-331990', name: 'Circuit of Time collector cartridge', category: 'Archive', stock: 3, health: 'Hidden' },
  { sku: 'KV-740204', name: 'Reusable fulfillment tote — blue', category: 'Fulfillment', stock: 864, health: 'Healthy' },
  { sku: 'KV-910331', name: 'Marketplace integration field guide', category: 'Systems', stock: 47, health: 'Healthy' }
];
const projects = {
  kevinception: { eyebrow: 'Interactive portfolio platform', title: 'Kevinception', summary: 'One canonical body of work rendered through six radically different technology interfaces without sacrificing direct, accessible routes.', commerce: 'The same operating principle powers both: separate the source of truth from the channels and workflows that render it.' },
  tokenpak: { eyebrow: 'Context logistics', title: 'TokenPak', summary: 'A local-first AI context system focused on packaging, routing, reusing, governing, dispatching, and recording context.', commerce: 'Like commerce operations, context logistics depends on the right payload reaching the right destination with policy, status, evidence, and receipts.' },
  'agentic-work-fleet': { eyebrow: 'AI operating system', title: 'Agentic Work Fleet', summary: 'A governed multi-agent operating model with explicit roles, evidence, authority, handoffs, and human decision gates.', commerce: 'Fulfillment is a handoff system. Reliable AI work also needs visible owners, queues, exceptions, and recoverable transitions.' },
  'mcp-knowledge-logistics': { eyebrow: 'Knowledge systems', title: 'MCP & Knowledge Logistics', summary: 'A source-backed knowledge packaging model for interoperable AI tools and clients.', commerce: 'Catalog quality and knowledge quality share a lesson: scale only helps when records preserve identity, freshness, provenance, and findability.' }
};

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { statuses: parsed.statuses || {}, fbaConfirmed: Boolean(parsed.fbaConfirmed), exception: parsed.exception || '', recovered: Boolean(parsed.recovered) };
  } catch { return { statuses: {}, fbaConfirmed: false, exception: '', recovered: false }; }
}
const state = readState();
function saveState() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* storage is optional */ } }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function openDialog(name) { const dialog = document.querySelector(`[data-kz-dialog="${name}"]`); if (!dialog) return; if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); }
function closeDialog(dialog) { if (!dialog) return; if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }

let activeTab = 'overview';
let orderFilter = 'all';
let globalQuery = '';

function setTab(tab) {
  if (!document.querySelector(`[data-kz-panel="${tab}"]`)) return;
  activeTab = tab;
  document.querySelectorAll('[data-kz-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.kzTab === tab));
  document.querySelectorAll('[data-kz-panel]').forEach((panel) => { const selected = panel.dataset.kzPanel === tab; panel.hidden = !selected; panel.classList.toggle('is-active', selected); });
  track('kevazon_tab_opened', { tab });
}

function statusClass(status) {
  if (status === 'Exception') return 'exception';
  if (status === 'Shipped') return 'success';
  if (status === 'Packed') return 'info';
  return 'warning';
}
function orderStatus(order) { return state.statuses[order.id] || order.status; }
function nextStatus(status) {
  if (status === 'Ready to pick') return 'Packed';
  if (status === 'Packed') return 'Shipped';
  if (status === 'Exception') return 'Ready to pick';
  return 'Shipped';
}
function renderOrders() {
  const root = document.querySelector('[data-kz-orders]');
  if (!root) return;
  const query = globalQuery.toLowerCase();
  const visible = orders.filter((order) => {
    const status = orderStatus(order);
    const matchesFilter = orderFilter === 'all' || (orderFilter === 'open' && status !== 'Shipped') || (orderFilter === 'exception' && status === 'Exception');
    return matchesFilter && (!query || `${order.id} ${order.customer} ${order.channel} ${status}`.toLowerCase().includes(query));
  });
  root.innerHTML = visible.map((order) => {
    const status = orderStatus(order);
    const action = status === 'Shipped' ? 'Complete' : status === 'Exception' ? 'Resolve' : `Mark ${nextStatus(status).toLowerCase()}`;
    return `<div class="kz-order-row" role="row" data-kz-order="${escapeHtml(order.id)}"><strong role="cell">${escapeHtml(order.id)}</strong><span role="cell">${escapeHtml(order.customer)}</span><span role="cell">${escapeHtml(order.channel)}</span><span role="cell">${order.items}</span><span role="cell">${escapeHtml(order.total)}</span><span role="cell"><i class="kz-status kz-status--${statusClass(status)}">${escapeHtml(status)}</i></span><span role="cell"><button type="button" data-kz-order-advance="${escapeHtml(order.id)}" ${status === 'Shipped' ? 'disabled' : ''}>${action}</button></span></div>`;
  }).join('');
  document.querySelector('[data-kz-orders-empty]').hidden = visible.length > 0;
  root.querySelectorAll('[data-kz-order-advance]').forEach((button) => button.addEventListener('click', () => advanceOrder(button.dataset.kzOrderAdvance)));
  const openCount = orders.filter((order) => orderStatus(order) !== 'Shipped').length;
  document.querySelector('[data-kz-open-orders]').textContent = String(openCount);
  document.querySelector('[data-kz-order-badge]').textContent = String(openCount);
}
function advanceOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  const previous = orderStatus(order);
  const next = nextStatus(previous);
  state.statuses[id] = next;
  if (id === 'KVZ-10465') state.exception = 'release';
  saveState(); renderOrders(); renderException();
  toast(`${id} moved from ${previous} to ${next}.`);
  track('kevazon_order_progressed', { order: id, from: previous, to: next });
}

function renderCatalog(query = '') {
  const root = document.querySelector('[data-kz-catalog]');
  if (!root) return;
  const q = query.toLowerCase().trim();
  const visible = catalog.filter((item) => !q || `${item.sku} ${item.name} ${item.category} ${item.health}`.toLowerCase().includes(q));
  root.innerHTML = visible.map((item) => `<div class="kz-catalog-row" role="row"><b role="cell">${escapeHtml(item.sku)}</b><span role="cell">${escapeHtml(item.name)}</span><span role="cell">${escapeHtml(item.category)}</span><span role="cell">${item.stock}</span><span role="cell" class="kz-health kz-health--${item.health.toLowerCase()}">${escapeHtml(item.health)}</span></div>`).join('');
  document.querySelector('[data-kz-catalog-empty]').hidden = visible.length > 0;
  if (q === 'kv-331990' || q.includes('circuit of time')) openDialog('archive');
}

function runGlobalSearch(query) {
  globalQuery = query.trim();
  const normalized = globalQuery.toLowerCase();
  if (!normalized) {
    renderOrders();
    renderCatalog(document.querySelector('[data-kz-catalog-search]')?.value || '');
    return;
  }
  const matchesOrder = orders.some((order) => `${order.id} ${order.customer} ${order.channel} ${orderStatus(order)}`.toLowerCase().includes(normalized));
  const matchesCatalog = catalog.some((item) => `${item.sku} ${item.name} ${item.category} ${item.health}`.toLowerCase().includes(normalized));
  if (matchesCatalog && !matchesOrder) {
    const catalogSearch = document.querySelector('[data-kz-catalog-search]');
    if (catalogSearch) catalogSearch.value = globalQuery;
    setTab('catalog');
    renderCatalog(globalQuery);
    return;
  }
  setTab('orders');
  renderOrders();
}

function renderFba() {
  const percent = state.fbaConfirmed ? 100 : 82;
  document.querySelector('[data-kz-fba-progress]').style.width = `${percent}%`;
  document.querySelector('[data-kz-fba-percent]').textContent = String(percent);
  const step = document.querySelector('[data-kz-fba-step]');
  step.textContent = state.fbaConfirmed ? 'Carton labels confirmed' : 'Labels awaiting confirmation';
  step.classList.toggle('is-complete', state.fbaConfirmed);
  const button = document.querySelector('[data-kz-fba-confirm]');
  button.disabled = state.fbaConfirmed;
  button.textContent = state.fbaConfirmed ? 'Plan ready for carrier handoff' : 'Confirm carton labels';
}
function renderException() {
  const result = document.querySelector('[data-kz-exception-result]');
  if (!state.exception) result.textContent = 'Decision not recorded.';
  else if (state.exception === 'release') result.textContent = 'Released with substitute inventory; customer promise retained.';
  else result.textContent = 'Held for human review; no customer promise changed.';
}
function decideException(decision) {
  state.exception = decision;
  if (decision === 'release') state.statuses['KVZ-10465'] = 'Ready to pick';
  saveState(); renderException(); renderOrders();
  toast(decision === 'release' ? 'Substitute inventory released with an operator receipt.' : 'Order held for reconciliation.');
  track('kevazon_exception_decided', { decision });
}

function runSync() {
  const button = document.querySelector('[data-kz-sync]');
  const label = document.querySelector('[data-kz-sync-label]');
  const time = document.querySelector('[data-kz-sync-time]');
  const log = document.querySelector('[data-kz-sync-log]');
  button.disabled = true; button.textContent = 'Syncing…'; label.textContent = 'Reconciliation running';
  window.setTimeout(() => {
    button.disabled = false; button.textContent = 'Run ERP sync'; label.textContent = 'Marketplace connected'; time.textContent = 'ERP sync · just now';
    const item = document.createElement('p'); item.innerHTML = '<b>SYNC</b> Orders, inventory, and receipts reconciled'; log.prepend(item);
    toast('ERP workflow synchronized. The open exception remains visible.'); track('kevazon_erp_synced');
  }, document.documentElement.dataset.motion === 'reduced' ? 40 : 650);
}

function showProject(slug) {
  const project = projects[slug];
  if (!project) return;
  document.querySelector('[data-kz-project-eyebrow]').textContent = project.eyebrow;
  document.querySelector('[data-kz-project-title]').textContent = project.title;
  document.querySelector('[data-kz-project-summary]').textContent = project.summary;
  document.querySelector('[data-kz-project-commerce]').textContent = project.commerce;
  document.querySelector('[data-kz-project-link]').href = `/work/${slug}/`;
  openDialog('project'); track('kevazon_project_opened', { project: slug });
}
function recoverArchive() {
  state.recovered = true; saveState();
  toast('Project Blueprint recovered: fulfillment process map.');
  window.parent.postMessage({ type: 'kevinception:artifact', id: 'project-blueprint', year: '2010' }, window.location.origin);
  track('kevazon_archive_recovered', { artifact: 'project-blueprint' });
  document.querySelector('[data-kz-recover]').textContent = 'Recovered ✓';
  document.querySelector('[data-kz-recover]').disabled = true;
}

document.querySelectorAll('[data-kz-tab]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.kzTab)));
document.querySelectorAll('[data-kz-order-filter]').forEach((button) => button.addEventListener('click', () => { orderFilter = button.dataset.kzOrderFilter; document.querySelectorAll('[data-kz-order-filter]').forEach((item) => item.classList.toggle('is-active', item === button)); renderOrders(); }));
document.querySelector('[data-kz-search]')?.addEventListener('input', (event) => runGlobalSearch(event.target.value));
document.querySelector('[data-kz-catalog-search]')?.addEventListener('input', (event) => renderCatalog(event.target.value));
document.querySelectorAll('[data-kz-order-link]').forEach((button) => button.addEventListener('click', () => { globalQuery = button.dataset.kzOrderLink; setTab('orders'); renderOrders(); }));
document.querySelector('[data-kz-fba-confirm]')?.addEventListener('click', () => { state.fbaConfirmed = true; saveState(); renderFba(); toast('Carton labels confirmed. FBA plan is ready.'); });
document.querySelectorAll('[data-kz-station]').forEach((button) => button.addEventListener('click', () => { document.querySelector('[data-kz-station-result]').textContent = `${button.dataset.kzStation} station selected. Its queue, evidence, and next owner are visible.`; }));
document.querySelectorAll('[data-kz-exception]').forEach((button) => button.addEventListener('click', () => decideException(button.dataset.kzException)));
document.querySelector('[data-kz-sync]')?.addEventListener('click', runSync);
document.querySelectorAll('[data-kz-project]').forEach((button) => button.addEventListener('click', () => showProject(button.dataset.kzProject)));
document.querySelector('[data-kz-portfolio]')?.addEventListener('click', () => setTab('portfolio'));
document.querySelector('[data-kz-timeline]')?.addEventListener('click', () => openDialog('timeline'));
document.querySelector('[data-kz-archive]')?.addEventListener('click', () => openDialog('archive'));
document.querySelector('[data-kz-recover]')?.addEventListener('click', recoverArchive);
document.querySelector('[data-kz-peak]')?.addEventListener('click', () => { document.querySelector('.kz-trend-card')?.scrollIntoView({ behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth', block: 'center' }); toast('Q4 view uses an illustrative index projection, not historical revenue.'); });
document.querySelectorAll('[data-kz-dialog-close]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('.kz-dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); }));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.kz-dialog[open]').forEach(closeDialog); });

if (state.recovered) { document.querySelector('[data-kz-recover]').textContent = 'Recovered ✓'; document.querySelector('[data-kz-recover]').disabled = true; }
renderOrders(); renderCatalog(); renderFba(); renderException();
track('kevazon_loaded', { era: '2010', chapter: 'Commerce' });
