import { toast, track } from './global.js';

const storageKey = 'kevinception:kevazon-v2';

const orders = [
  { id: 'ORD-10482', customer: 'Maya C.', channel: 'StealStreet.com', payment: 'Authorized', status: 'Ready to pick', fulfillment: 'Direct', tracking: 'Pending' },
  { id: 'ORD-10477', customer: 'Jordan R.', channel: 'Amazon FBA', payment: 'Settled', status: 'Packed', fulfillment: 'FBA', tracking: 'FBA transfer' },
  { id: 'ORD-10465', customer: 'Avery S.', channel: 'Walmart', payment: 'Review', status: 'Exception', fulfillment: 'Direct', tracking: 'Held' },
  { id: 'ORD-10441', customer: 'Sam T.', channel: 'BuyGiftsWholesale.com', payment: 'Invoice', status: 'Shipped', fulfillment: 'Wholesale', tracking: 'Carrier scan' }
];

const purchaseOrders = [
  { id: 'PO-7814', vendor: 'Northstar Housewares', method: 'JIT · MOQ met', expected: 'In transit', quantity: 'Sample 240', receiving: 'Awaiting dock', status: 'Open' },
  { id: 'PO-7809', vendor: 'Atlas Tool Supply', method: 'Replenishment', expected: 'Overdue', quantity: 'Sample 96', receiving: 'Vendor follow-up', status: 'Exception' },
  { id: 'PO-7802', vendor: 'Brightline Electronics', method: 'Minimum order', expected: 'Confirmed', quantity: 'Sample 180', receiving: 'Partial receipt', status: 'Receiving' },
  { id: 'PO-7798', vendor: 'Heritage Collectibles', method: 'Forecast buy', expected: 'Scheduled', quantity: 'Sample 60', receiving: 'Not started', status: 'Open' }
];

const catalog = [
  { sku: 'KV-100042', upc: '000000100042', name: 'Modular packing station labels', category: 'Fulfillment', stock: 284, listings: '8 active', health: 'Healthy' },
  { sku: 'KV-225190', upc: '000000225190', name: 'Low-profile inventory scanner cradle', category: 'Operations', stock: 12, listings: '5 active', health: 'Low' },
  { sku: 'KV-331990', upc: '000000331990', name: 'Circuit of Time collector cartridge', category: 'Archive', stock: 3, listings: 'Not listed', health: 'Hidden' },
  { sku: 'KV-740204', upc: '000000740204', name: 'Reusable fulfillment tote — blue', category: 'Fulfillment', stock: 864, listings: '12 active', health: 'Healthy' },
  { sku: 'KV-910331', upc: '000000910331', name: 'Marketplace integration field guide', category: 'Systems', stock: 47, listings: '3 active', health: 'Healthy' }
];

const inventory = [
  { sku: 'KV-225190', available: 12, allocated: 8, incoming: 96, reserved: 2, damaged: 0, state: 'Replenish' },
  { sku: 'KV-100042', available: 284, allocated: 31, incoming: 0, reserved: 12, damaged: 4, state: 'Healthy' },
  { sku: 'KV-740204', available: 864, allocated: 64, incoming: 240, reserved: 24, damaged: 7, state: 'Healthy' },
  { sku: 'KV-910331', available: 47, allocated: 18, incoming: 60, reserved: 4, damaged: 1, state: 'Watch' }
];

const marketplaces = [
  'StealStreet.com', 'BuyGiftsWholesale.com', 'Amazon', 'Amazon FBA', 'Amazon Direct', 'Amazon Canada',
  'Amazon Canada Direct', 'Amazon Canada FBA', 'Amazon Mexico', 'Amazon Mexico FBA', 'Amazon Europe',
  'Rakuten', 'Houzz', 'Sears Marketplace', 'Walmart', 'Target.com', 'eBay', 'Craigslist', 'Newegg',
  'Overstock', 'Wayfair', 'Bed Bath & Beyond', 'Home Depot'
];

const flowNodes = {
  vendors: { kicker: 'Vendors · Source', title: 'Terms, pricing, minimums, and lead times', description: 'Vendor records connected product costs and purchasing history to every downstream inventory decision.', module: 'vendors' },
  'purchase-orders': { kicker: 'Purchase Orders · Plan', title: 'JIT purchasing, MOQ controls, and expected inventory', description: 'Purchase orders translated demand into tracked inbound quantities and a receiving commitment.', module: 'purchase-orders' },
  inventory: { kicker: 'Inventory · Position', title: 'Available, allocated, incoming, reserved, and damaged', description: 'A shared stock position supported replenishment, shortages, aging analysis, and warehouse availability.', module: 'inventory' },
  catalog: { kicker: 'Catalog · Normalize', title: '1.5M searchable product records', description: 'Product information, taxonomy, pricing, channel mappings, and data quality lived in one catalog engine.', module: 'catalog' },
  marketplaces: { kicker: 'Marketplaces · Publish', title: '20+ external channels, one internal model', description: 'Feeds, listings, repricing, promotions, orders, and account health were normalized across channels.', module: 'marketplaces' },
  orders: { kicker: 'Customer Orders · Orchestrate', title: 'Source, payment, fulfillment state, and exceptions', description: 'Every order retained its marketplace context while entering a consistent operational workflow.', module: 'orders' },
  warehouse: { kicker: 'Warehouse · Fulfill', title: 'Receive, pick, pack, ship, and track', description: 'Warehouse work connected expected inventory and customer demand to physical execution and carrier evidence.', module: 'warehouse' },
  customer: { kicker: 'Customer · Deliver', title: 'One promise across every commerce channel', description: 'Centralized service, returns, payments, and tracking protected the customer experience after the sale.', module: 'customer-service' }
};

const moduleViews = {
  inventory: {
    eyebrow: 'Inventory control', title: 'Inventory', description: 'Available, allocated, incoming, reserved, damaged, aging, and replenishment views.', scope: 'POs → inventory → listings → orders', workspace: 'Stock position & replenishment',
    capabilities: ['Replenishment rules', 'Stock adjustments', 'Shortage alerts', 'Aging inventory', 'Warehouse availability', 'Audit history'], connections: ['Purchase orders create incoming stock', 'Catalog records identify the item', 'Marketplaces consume availability', 'Orders create allocations'],
    records: inventory.map((item) => `<div class="kz-inventory-record"><b>${item.sku}</b><span>Available <strong>${item.available}</strong></span><span>Allocated <strong>${item.allocated}</strong></span><span>Incoming <strong>${item.incoming}</strong></span><span>Reserved <strong>${item.reserved}</strong></span><span>Damaged <strong>${item.damaged}</strong></span><i class="kz-status kz-status--${item.state === 'Healthy' ? 'success' : item.state === 'Watch' ? 'warning' : 'danger'}">${item.state}</i></div>`).join('')
  },
  vendors: {
    eyebrow: 'Source management', title: 'Vendors', description: 'Directory, categories, pricing, terms, minimums, purchasing history, lead times, and vendor performance.', scope: 'Vendor → PO → inventory', workspace: 'Vendor directory & scorecards',
    capabilities: ['Categories and contacts', 'Pricing and COGS', 'Payment terms', 'Minimum order quantities', 'Lead-time history', 'Vendor scorecards'], connections: ['Housewares · toys · office supplies', 'Jewelry · collectibles · clothing', 'Tools · kitchen · electronics', 'Outdoors · accessories'],
    records: '<div class="kz-record-list"><p><b>Northstar Housewares</b><span>Housewares · JIT eligible · PO-7814 open</span></p><p><b>Atlas Tool Supply</b><span>Tools · shipment follow-up · lead time monitored</span></p><p><b>Brightline Electronics</b><span>Electronics · minimum-order program · partial receipt</span></p><p><b>Heritage Collectibles</b><span>Collectibles · forecast purchasing · scheduled</span></p></div>'
  },
  'customer-service': {
    eyebrow: 'Centralized customer operations', title: 'Customer Service', description: 'Cross-channel support across orders, purchase orders, payments, refunds, escalations, chargebacks, and marketplace account issues.', scope: 'Customer context across every channel', workspace: 'Unified case queue',
    capabilities: ['Order and payment lookup', 'Refunds and replacements', 'Escalation routing', 'Chargeback evidence', 'Marketplace account issues', 'Audit history'], connections: ['Orders and tracking', 'Payments and settlements', 'Returns and RMAs', 'Marketplace messages'],
    records: '<div class="kz-record-list"><p><b>Escalation · awaiting response</b><span>Order, payment, shipment, and channel context linked in one case.</span></p><p><b>Refund review</b><span>Return state and marketplace policy visible beside the customer record.</span></p><p><b>Marketplace account issue</b><span>Channel health and listing history available to the support operator.</span></p></div>'
  },
  returns: {
    eyebrow: 'Reverse logistics', title: 'Returns', description: 'Customer returns, marketplace returns, RMAs, refunds, replacements, restocking, damaged merchandise, and vendor returns.', scope: 'Customer → RMA → stock or vendor', workspace: 'Returns & RMA queue',
    capabilities: ['RMA authorization', 'Refunds and replacements', 'Restocking decisions', 'Damage disposition', 'Marketplace returns', 'Vendor returns'], connections: ['Customer service opens the case', 'Warehouse inspects the item', 'Inventory records disposition', 'Finance records refund or credit'],
    records: '<div class="kz-record-list"><p><b>RMA review</b><span>Reason, order, channel policy, and requested outcome linked.</span></p><p><b>Warehouse inspection</b><span>Restock, damaged, replace, or return-to-vendor decision.</span></p><p><b>Financial closeout</b><span>Refund, fee, and vendor-credit evidence retained.</span></p></div>'
  },
  administration: {
    eyebrow: 'System governance', title: 'Settings / Administration', description: 'Users, roles, vendors, marketplaces, system configuration, permissions, integrations, reference data, scheduled jobs, and automation.', scope: 'Governance across every module', workspace: 'Configuration & automation',
    capabilities: ['Users and roles', 'Permissions', 'Marketplace integrations', 'Scheduled jobs', 'Workflow rules and alerts', 'Reference data and audit history'], connections: ['Product and vendor reference data', 'Channel credentials and mappings', 'Carrier and payment integrations', 'Employee access and approvals'],
    records: '<div class="kz-admin-grid"><section><b>Rules & alerts</b><span>Route only the exceptions that require an operator.</span></section><section><b>Scheduled jobs</b><span>Imports, exports, feeds, inventory, orders, and settlements.</span></section><section><b>Permissions</b><span>Role-based access to commercial and operational controls.</span></section><section><b>Audit history</b><span>Who changed what, when, and from which workflow.</span></section></div>'
  }
};

const warehouseViews = {
  Receiving: ['PO-7814 · Awaiting dock', 'Expected inventory is linked to vendor terms, receiving quantities, product records, and downstream availability.', ['Verify shipment against PO', 'Record received and damaged units', 'Route exceptions before putaway']],
  Picking: ['Pick route · Direct fulfillment', 'Orders are grouped into an efficient route while inventory remains allocated to the originating customer promise.', ['Generate pick list', 'Scan SKU and location', 'Record shortage or substitute']],
  Packing: ['Packing station · Order evidence', 'Items, payment state, packing slip, channel requirements, and carrier service meet at the pack station.', ['Verify order contents', 'Print channel-specific documents', 'Capture package weight and dimensions']],
  Shipments: ['Shipment creation · Carrier handoff', 'Shipment and tracking records update the originating marketplace, customer service, and finance workflows.', ['Select service and collect payment', 'Create label and tracking', 'Post fulfillment confirmation']],
  FBA: ['Amazon FBA · Inbound workflow', 'A separate but connected flow prepares inventory, cartons, labels, and carrier evidence for marketplace fulfillment.', ['Select replenishment inventory', 'Build carton plan', 'Confirm labels and carrier handoff']],
  Exceptions: ['Warehouse exception queue', 'Shortages, damage, scan mismatches, carrier failures, and late shipments stay visible until an operator records a decision.', ['Inspect evidence', 'Assign owner and action', 'Retain an audit receipt']]
};

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { statuses: parsed.statuses || {}, poStatuses: parsed.poStatuses || {}, fbaConfirmed: Boolean(parsed.fbaConfirmed), exception: parsed.exception || '', recovered: Boolean(parsed.recovered) };
  } catch {
    return { statuses: {}, poStatuses: {}, fbaConfirmed: false, exception: '', recovered: false };
  }
}

const state = readState();
let activeTab = 'dashboard';
let orderFilter = 'all';
let globalQuery = '';
let channelsExpanded = false;

function saveState() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Local storage is optional. */ }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function openDialog(name) {
  const dialog = document.querySelector(`[data-kz-dialog="${name}"]`);
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function resolvePanel(tab) {
  if (document.querySelector(`[data-kz-panel="${tab}"]`)) return tab;
  return moduleViews[tab] ? 'module' : '';
}

function setTab(tab) {
  const panelName = resolvePanel(tab);
  if (!panelName) return;
  activeTab = tab;
  document.querySelectorAll('[data-kz-tab]').forEach((button) => {
    const selected = button.dataset.kzTab === tab;
    button.classList.toggle('is-active', selected);
    if (selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-kz-panel]').forEach((panel) => {
    const selected = panel.dataset.kzPanel === panelName;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
  });
  if (panelName === 'module') renderModule(tab);
  track('kevazon_module_opened', { module: tab });
}

function statusClass(status) {
  if (status === 'Exception' || status === 'Replenish') return 'danger';
  if (status === 'Shipped' || status === 'Healthy' || status === 'Reviewed') return 'success';
  if (status === 'Packed' || status === 'Receiving') return 'info';
  return 'warning';
}

function orderStatus(order) { return state.statuses[order.id] || order.status; }
function nextOrderStatus(status) {
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
    return matchesFilter && (!query || Object.values({ ...order, status }).join(' ').toLowerCase().includes(query));
  });
  root.innerHTML = visible.map((order) => {
    const status = orderStatus(order);
    const action = status === 'Shipped' ? 'Complete' : status === 'Exception' ? 'Resolve' : `Mark ${nextOrderStatus(status).toLowerCase()}`;
    return `<div class="kz-order-row" role="row" data-kz-order="${escapeHtml(order.id)}"><strong role="cell">${escapeHtml(order.id)}</strong><span role="cell">${escapeHtml(order.customer)}</span><span role="cell">${escapeHtml(order.channel)}</span><span role="cell">${escapeHtml(order.payment)}</span><span role="cell">${escapeHtml(order.fulfillment)}</span><span role="cell"><i class="kz-status kz-status--${statusClass(status)}">${escapeHtml(status)}</i></span><span role="cell">${escapeHtml(order.tracking)}</span><span role="cell"><button type="button" data-kz-order-advance="${escapeHtml(order.id)}" ${status === 'Shipped' ? 'disabled' : ''}>${escapeHtml(action)}</button></span></div>`;
  }).join('');
  document.querySelector('[data-kz-orders-empty]').hidden = visible.length > 0;
  root.querySelectorAll('[data-kz-order-advance]').forEach((button) => button.addEventListener('click', () => advanceOrder(button.dataset.kzOrderAdvance)));
  const openCount = orders.filter((order) => orderStatus(order) !== 'Shipped').length;
  document.querySelectorAll('[data-kz-open-orders]').forEach((node) => { node.textContent = String(openCount); });
  document.querySelector('[data-kz-order-badge]').textContent = String(openCount);
}

function advanceOrder(id) {
  const order = orders.find((item) => item.id === id);
  if (!order) return;
  const previous = orderStatus(order);
  const next = nextOrderStatus(previous);
  state.statuses[id] = next;
  saveState();
  renderOrders();
  toast(`${id} moved from ${previous} to ${next}.`);
  track('kevazon_order_progressed', { order: id, from: previous, to: next });
}

function renderPurchaseOrders(query = globalQuery) {
  const root = document.querySelector('[data-kz-purchase-orders]');
  if (!root) return;
  const normalized = query.toLowerCase().trim();
  const visible = purchaseOrders.filter((po) => !normalized || Object.values(po).join(' ').toLowerCase().includes(normalized));
  root.innerHTML = visible.map((po) => {
    const status = state.poStatuses[po.id] || po.status;
    return `<div class="kz-po-row" role="row" data-kz-po="${escapeHtml(po.id)}"><strong role="cell">${escapeHtml(po.id)}</strong><span role="cell">${escapeHtml(po.vendor)}</span><span role="cell">${escapeHtml(po.method)}</span><span role="cell">${escapeHtml(po.expected)}</span><span role="cell">${escapeHtml(po.quantity)}</span><span role="cell">${escapeHtml(po.receiving)}</span><span role="cell"><i class="kz-status kz-status--${statusClass(status)}">${escapeHtml(status)}</i></span><span role="cell"><button type="button" data-kz-po-review="${escapeHtml(po.id)}">${status === 'Reviewed' ? 'Reviewed' : 'Review'}</button></span></div>`;
  }).join('');
  document.querySelector('[data-kz-pos-empty]').hidden = visible.length > 0;
  root.querySelectorAll('[data-kz-po-review]').forEach((button) => button.addEventListener('click', () => reviewPurchaseOrder(button.dataset.kzPoReview)));
}

function reviewPurchaseOrder(id) {
  state.poStatuses[id] = 'Reviewed';
  saveState();
  renderPurchaseOrders();
  toast(`${id} reviewed; vendor and receiving context retained.`);
  track('kevazon_purchase_order_reviewed', { purchaseOrder: id });
}

function renderCatalog(query = '') {
  const root = document.querySelector('[data-kz-catalog]');
  if (!root) return;
  const normalized = query.toLowerCase().trim();
  const visible = catalog.filter((item) => !normalized || Object.values(item).join(' ').toLowerCase().includes(normalized));
  root.innerHTML = visible.map((item) => `<div class="kz-catalog-row" role="row"><span role="cell"><b>${escapeHtml(item.sku)}</b><small>${escapeHtml(item.upc)}</small></span><span role="cell">${escapeHtml(item.name)}</span><span role="cell">${escapeHtml(item.category)}</span><span role="cell">${item.stock}</span><span role="cell">${escapeHtml(item.listings)}</span><span role="cell"><i class="kz-status kz-status--${statusClass(item.health)}">${escapeHtml(item.health)}</i></span></div>`).join('');
  document.querySelector('[data-kz-catalog-empty]').hidden = visible.length > 0;
  if (normalized === 'kv-331990' || normalized.includes('circuit of time')) openDialog('archive');
}

function runGlobalSearch(query) {
  globalQuery = query.trim();
  const normalized = globalQuery.toLowerCase();
  if (!normalized) {
    renderOrders();
    renderPurchaseOrders('');
    renderCatalog(document.querySelector('[data-kz-catalog-search]')?.value || '');
    return;
  }

  const matchesOrder = orders.some((order) => Object.values(order).join(' ').toLowerCase().includes(normalized));
  const matchesPO = purchaseOrders.some((po) => Object.values(po).join(' ').toLowerCase().includes(normalized));
  const matchesCatalog = catalog.some((item) => Object.values(item).join(' ').toLowerCase().includes(normalized));
  const matchesChannel = marketplaces.some((marketplace) => marketplace.toLowerCase().includes(normalized));
  const vendorWords = ['vendor', 'northstar', 'atlas', 'brightline', 'heritage'];

  if (matchesOrder) {
    setTab('orders');
    renderOrders();
  } else if (matchesPO) {
    setTab('purchase-orders');
    renderPurchaseOrders(globalQuery);
  } else if (matchesCatalog) {
    const catalogSearch = document.querySelector('[data-kz-catalog-search]');
    if (catalogSearch) catalogSearch.value = globalQuery;
    setTab('catalog');
    renderCatalog(globalQuery);
  } else if (matchesChannel) {
    setTab('marketplaces');
    renderMarketplaces(globalQuery);
  } else if (vendorWords.some((word) => normalized.includes(word))) {
    setTab('vendors');
  } else {
    toast('No representative record matched. Search by order, PO, SKU / UPC, customer, vendor, or marketplace listing.');
  }
}

function selectFlowNode(id) {
  const node = flowNodes[id];
  if (!node) return;
  document.querySelectorAll('[data-kz-flow-node]').forEach((button) => {
    const selected = button.dataset.kzFlowNode === id;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('[data-kz-flow-kicker]').textContent = node.kicker;
  document.querySelector('[data-kz-flow-title]').textContent = node.title;
  document.querySelector('[data-kz-flow-description]').textContent = node.description;
  document.querySelector('[data-kz-flow-open]').dataset.kzFlowOpen = node.module;
  document.querySelector('[data-kz-flow-open]').childNodes[0].textContent = `Open ${node.kicker.split(' · ')[0]} `;
}

function renderMarketplaces(query = '') {
  const root = document.querySelector('[data-kz-marketplace-list]');
  if (!root) return;
  const normalized = query.toLowerCase().trim();
  const base = channelsExpanded ? marketplaces : marketplaces.slice(0, 10);
  const visible = normalized ? marketplaces.filter((channel) => channel.toLowerCase().includes(normalized)) : base;
  root.innerHTML = visible.map((channel, index) => `<button type="button" data-kz-channel="${escapeHtml(channel)}" class="${index === 0 ? 'is-active' : ''}"><span>${escapeHtml(channel.slice(0, 2).toUpperCase())}</span><b>${escapeHtml(channel)}</b><small>${channel.includes('FBA') ? 'FBA workflow' : channel.includes('Wholesale') ? 'Wholesale / B2B' : channel.includes('Canada') || channel.includes('Mexico') || channel.includes('Europe') ? 'International' : 'Connected channel'}</small><i class="kz-status kz-status--success">Connected</i></button>`).join('') + (!channelsExpanded && !normalized ? '<p><b>+ additional channels</b><span>International Amazon variants, Rakuten, Sears, Craigslist, Bed Bath & Beyond, Home Depot, and more.</span></p>' : '');
  root.querySelectorAll('[data-kz-channel]').forEach((button) => button.addEventListener('click', () => selectMarketplace(button.dataset.kzChannel, button)));
}

function selectMarketplace(channel, button) {
  document.querySelectorAll('[data-kz-channel]').forEach((item) => item.classList.toggle('is-active', item === button));
  document.querySelector('[data-kz-channel-name]').textContent = channel;
  document.querySelector('[data-kz-channel-description]').textContent = `${channel} operations connected listing health, pricing, inventory, orders, fulfillment, support, and settlement records inside the same system.`;
  track('kevazon_marketplace_inspected', { marketplace: channel });
}

function renderModule(id) {
  const module = moduleViews[id];
  if (!module) return;
  document.querySelector('[data-kz-module-eyebrow]').textContent = module.eyebrow;
  document.querySelector('[data-kz-module-title]').textContent = module.title;
  document.querySelector('[data-kz-module-description]').textContent = module.description;
  document.querySelector('[data-kz-module-scope]').textContent = module.scope;
  document.querySelector('[data-kz-module-workspace]').textContent = module.workspace;
  document.querySelector('[data-kz-module-records]').innerHTML = module.records;
  document.querySelector('[data-kz-module-capabilities]').innerHTML = module.capabilities.map((capability) => `<li>${escapeHtml(capability)}</li>`).join('');
  document.querySelector('[data-kz-module-connections]').innerHTML = module.connections.map((connection) => `<p><span aria-hidden="true">↳</span>${escapeHtml(connection)}</p>`).join('');
}

function selectWarehouseView(name) {
  const view = warehouseViews[name];
  if (!view) return;
  document.querySelectorAll('[data-kz-warehouse-tab]').forEach((button) => {
    const selected = button.dataset.kzWarehouseTab === name;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  document.querySelector('[data-kz-warehouse-view]').textContent = name;
  document.querySelector('[data-kz-warehouse-detail]').innerHTML = `<b>${escapeHtml(view[0])}</b><p>${escapeHtml(view[1])}</p><ul>${view[2].map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
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
  button.textContent = state.fbaConfirmed ? 'Ready for carrier handoff' : 'Confirm carton labels';
}

function renderException() {
  const result = document.querySelector('[data-kz-exception-result]');
  if (!state.exception) result.textContent = 'Decision not recorded.';
  else if (state.exception === 'release') result.textContent = 'Returned to packing with an operator receipt.';
  else result.textContent = 'Shipment held for review; no customer promise changed.';
}

function decideException(decision) {
  state.exception = decision;
  saveState();
  renderException();
  toast(decision === 'release' ? 'Shipment returned to packing with an audit receipt.' : 'Shipment held for operator review.');
  track('kevazon_exception_decided', { decision });
}

function selectReport(title) {
  document.querySelectorAll('[data-kz-report-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.kzReportTab === title));
  document.querySelector('[data-kz-report-title]').textContent = title;
}

function runSync() {
  const button = document.querySelector('[data-kz-sync]');
  const label = document.querySelector('[data-kz-sync-label]');
  const time = document.querySelector('[data-kz-sync-time]');
  const log = document.querySelector('[data-kz-sync-log]');
  button.disabled = true;
  button.textContent = 'Checking…';
  label.textContent = 'Integration check running';
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = 'Run integration check';
    label.textContent = 'Systems healthy · 20+ channels connected';
    time.textContent = 'Jobs, feeds, and integrations monitored';
    const item = document.createElement('p');
    item.innerHTML = '<b>CHECK</b> Purchasing, catalog, channels, orders, warehouse, and finance reconciled';
    log.prepend(item);
    toast('Integration check recorded. Open exceptions remain visible.');
    track('kevazon_integrations_checked');
  }, document.documentElement.dataset.motion === 'reduced' ? 40 : 500);
}

function recoverArchive() {
  state.recovered = true;
  saveState();
  toast('Project Blueprint recovered: commerce operating-system map.');
  window.parent.postMessage({ type: 'kevinception:artifact', id: 'project-blueprint', year: '2010' }, window.location.origin);
  track('kevazon_archive_recovered', { artifact: 'project-blueprint' });
  const button = document.querySelector('[data-kz-recover]');
  button.textContent = 'Recovered ✓';
  button.disabled = true;
}

document.querySelectorAll('[data-kz-tab]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.kzTab)));
document.querySelectorAll('[data-kz-attention]').forEach((button) => button.addEventListener('click', () => setTab(button.dataset.kzAttention)));
document.querySelectorAll('[data-kz-flow-node]').forEach((button) => button.addEventListener('click', () => selectFlowNode(button.dataset.kzFlowNode)));
document.querySelector('[data-kz-flow-open]')?.addEventListener('click', (event) => setTab(event.currentTarget.dataset.kzFlowOpen));
document.querySelectorAll('[data-kz-order-filter]').forEach((button) => button.addEventListener('click', () => {
  orderFilter = button.dataset.kzOrderFilter;
  document.querySelectorAll('[data-kz-order-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
  renderOrders();
}));
document.querySelector('[data-kz-search-form]')?.addEventListener('submit', (event) => { event.preventDefault(); runGlobalSearch(document.querySelector('[data-kz-search]').value); });
document.querySelector('[data-kz-search]')?.addEventListener('search', (event) => runGlobalSearch(event.target.value));
document.querySelector('[data-kz-catalog-search]')?.addEventListener('input', (event) => renderCatalog(event.target.value));
document.querySelectorAll('[data-kz-catalog-action]').forEach((button) => button.addEventListener('click', () => toast(`${button.dataset.kzCatalogAction} opened as a representative catalog control.`)));
document.querySelector('[data-kz-channel-toggle]')?.addEventListener('click', (event) => {
  channelsExpanded = !channelsExpanded;
  event.currentTarget.textContent = channelsExpanded ? 'Show representative channels' : 'Show all channels';
  renderMarketplaces();
});
document.querySelectorAll('[data-kz-warehouse-tab]').forEach((button) => button.addEventListener('click', () => selectWarehouseView(button.dataset.kzWarehouseTab)));
document.querySelectorAll('[data-kz-report-tab]').forEach((button) => button.addEventListener('click', () => selectReport(button.dataset.kzReportTab)));
document.querySelector('[data-kz-fba-confirm]')?.addEventListener('click', () => { state.fbaConfirmed = true; saveState(); renderFba(); toast('Carton labels confirmed. FBA plan is ready for carrier handoff.'); });
document.querySelectorAll('[data-kz-exception]').forEach((button) => button.addEventListener('click', () => decideException(button.dataset.kzException)));
document.querySelector('[data-kz-sync]')?.addEventListener('click', runSync);
document.querySelector('[data-kz-timeline]')?.addEventListener('click', () => openDialog('timeline'));
document.querySelector('[data-kz-archive]')?.addEventListener('click', () => openDialog('archive'));
document.querySelector('[data-kz-recover]')?.addEventListener('click', recoverArchive);
document.querySelectorAll('[data-kz-dialog-close]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('.kz-dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); }));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.kz-dialog[open]').forEach(closeDialog); });

if (state.recovered) {
  const button = document.querySelector('[data-kz-recover]');
  button.textContent = 'Recovered ✓';
  button.disabled = true;
}

renderOrders();
renderPurchaseOrders();
renderCatalog();
renderMarketplaces();
renderFba();
renderException();
renderModule('inventory');
track('kevazon_loaded', { era: '2010', chapter: 'Commerce', system: 'commerce-operations' });
