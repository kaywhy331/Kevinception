import { toast, track } from './global.js';

const STORAGE_KEY = 'stealstreet-commerce-os-v5';
const MODULES = ['dashboard', 'orders', 'purchase-orders', 'catalog', 'inventory', 'marketplaces', 'vendors', 'customer-service', 'warehouse', 'returns', 'reports', 'settings'];
const MODULE_LABELS = {
  dashboard: 'Dashboard', orders: 'Orders', 'purchase-orders': 'Purchase Orders', catalog: 'Catalog', inventory: 'Inventory',
  marketplaces: 'Marketplaces', vendors: 'Vendors', 'customer-service': 'Customer Service', warehouse: 'Warehouse',
  returns: 'Returns', reports: 'Reports', settings: 'Settings / Administration'
};
const CHANNEL_NAMES = [
  'StealStreet.com', 'BuyGiftsWholesale.com', 'Amazon', 'Amazon FBA', 'Amazon Direct', 'Amazon Canada',
  'Amazon Canada Direct', 'Amazon Canada FBA', 'Amazon Mexico', 'Amazon Mexico FBA', 'Amazon Europe',
  'Rakuten', 'Houzz', 'Sears Marketplace', 'Walmart', 'Target.com', 'eBay', 'Craigslist', 'Newegg',
  'Overstock', 'Wayfair', 'Bed Bath & Beyond', 'Home Depot'
];
const WAREHOUSE_TABS = ['Receiving', 'Putaway', 'Picking', 'Packing', 'Shipments', 'Amazon FBA', 'Exceptions'];
const REPORT_TABS = ['Inventory', 'Sales Trends', 'Product Trajectory', 'Marketplace Health', 'Finance', 'Customer Service', 'Warehouse'];
const SETTINGS_TABS = ['Users & Roles', 'Integrations', 'Warehouses', 'Shipping', 'Marketplace Rules', 'Automation', 'Notifications', 'Audit History', 'Demo Controls'];

function createMarketplaces() {
  return CHANNEL_NAMES.map((name, index) => {
    const international = /Canada|Mexico|Europe/.test(name);
    const wholesale = /Wholesale/.test(name);
    const direct = /Direct/.test(name) || name === 'StealStreet.com';
    const hasIssue = ['Amazon Mexico FBA', 'Sears Marketplace', 'Wayfair'].includes(name);
    return {
      id: `CH-${String(index + 1).padStart(2, '0')}`,
      name,
      model: wholesale ? 'Wholesale / B2B' : name.includes('FBA') ? 'Marketplace FBA' : direct ? 'Direct fulfillment' : 'Marketplace',
      region: international ? (name.includes('Canada') ? 'Canada' : name.includes('Mexico') ? 'Mexico' : 'Europe') : 'United States',
      listings: 1480 + index * 317,
      feed: hasIssue ? 'Exception' : 'Healthy',
      inventorySync: hasIssue && index % 2 ? 'Delayed' : 'Current',
      orderSync: 'Current',
      settlement: index % 7 === 0 ? 'Review' : 'Reconciled',
      lastSync: index % 3 === 0 ? '10:42 AM' : index % 3 === 1 ? '10:39 AM' : '10:35 AM',
      errors: hasIssue ? 1 : 0,
      rejected: hasIssue ? [name === 'Sears Marketplace'
        ? 'KV-910331 Executive Decision-Making Mug rejected: “Leadership Accessories” is not a recognized category.'
        : `${name} listing rejected: missing channel attribute`] : [],
      mapping: hasIssue ? 'Review required' : 'Mapped'
    };
  });
}

function createSeedState() {
  return {
    version: 5,
    lastSync: '10:42 AM',
    sequence: { po: 7820, return: 4010, case: 2208, import: 1 },
    ui: {
      activeModule: 'dashboard', filters: {}, sort: {}, pages: {}, warehouseTab: 'Receiving', reportTab: 'Inventory',
      settingsTab: 'Users & Roles', selectedChannel: 'CH-01', selectedVendor: 'VEN-01', selectedCase: 'CASE-2201'
    },
    orders: [
      { id: 'ORD-10482', customer: 'Maya Chen', channel: 'StealStreet.com', date: '04/18/2012', items: 3, total: 86.40, payment: 'Authorized', fulfillment: 'Direct', status: 'Ready to Pick', tracking: '', notes: 'Customer asked whether decisions are included. Customer Service advised: sold separately.', timeline: ['10:18 AM · Payment authorized', '10:19 AM · Inventory reserved', '10:21 AM · Mug inscription cleared by Legal-ish'], itemNames: ['Executive Decision-Making Mug', 'Modular packing labels', 'Reusable fulfillment tote'] },
      { id: 'ORD-10477', customer: 'Jordan Rivera', channel: 'Amazon FBA', date: '04/18/2012', items: 1, total: 42.00, payment: 'Settled', fulfillment: 'FBA', status: 'Packed', tracking: 'FBA transfer', notes: 'Marketplace fulfillment.', timeline: ['9:52 AM · Imported from Amazon', '10:01 AM · Inventory allocated', '10:31 AM · Packed'], itemNames: ['Scanner cradle'] },
      { id: 'ORD-10465', customer: 'Avery Singh', channel: 'Walmart', date: '04/17/2012', items: 6, total: 214.18, payment: 'Review', fulfillment: 'Direct', status: 'Exception', tracking: '', notes: 'Payment address mismatch.', timeline: ['Yesterday · Imported from Walmart', 'Yesterday · Payment review flagged'], itemNames: ['Tool set', 'Kitchen accessories'] },
      { id: 'ORD-10441', customer: 'Sam Torres', channel: 'BuyGiftsWholesale.com', date: '04/17/2012', items: 12, total: 638.75, payment: 'Invoice', fulfillment: 'Wholesale', status: 'Shipped', tracking: '1Z804201041', notes: 'Wholesale carton labels included.', timeline: ['Yesterday · Invoice approved', 'Yesterday · Picked and packed', 'Yesterday · Carrier handoff'], itemNames: ['Assorted gift case'] },
      { id: 'ORD-10436', customer: 'Priya Patel', channel: 'eBay', date: '04/17/2012', items: 2, total: 58.90, payment: 'Captured', fulfillment: 'Direct', status: 'Picked', tracking: '', notes: '', timeline: ['Yesterday · Payment captured', '9:48 AM · Pick completed'], itemNames: ['Outdoor lantern'] },
      { id: 'ORD-10428', customer: 'Leo Martin', channel: 'Wayfair', date: '04/16/2012', items: 1, total: 119.00, payment: 'Captured', fulfillment: 'Direct', status: 'Ready to Pick', tracking: '', notes: 'Channel SLA due today.', timeline: ['04/16 · Order imported', '04/16 · Inventory reserved'], itemNames: ['Entryway rack'] },
      { id: 'ORD-10402', customer: 'Nora Kim', channel: 'Amazon Canada', date: '04/15/2012', items: 4, total: 172.20, payment: 'Settled', fulfillment: 'Direct', status: 'Complete', tracking: '94001042010402', notes: 'International documents archived.', timeline: ['04/15 · Order imported', '04/16 · Shipped', '04/18 · Delivery confirmed'], itemNames: ['Office storage set'] }
    ],
    purchaseOrders: [
      { id: 'PO-7814', vendorId: 'VEN-01', vendor: 'Northstar Housewares', method: 'JIT · MOQ met', orderDate: '04/12/2012', expectedDate: '04/18/2012', quantity: 240, received: 0, damaged: 0, cost: 3120.00, status: 'Awaiting Receiving', sku: 'KV-740204', location: 'A-01' },
      { id: 'PO-7809', vendorId: 'VEN-02', vendor: 'Atlas Tool Supply', method: 'Replenishment', orderDate: '04/08/2012', expectedDate: '04/16/2012', quantity: 96, received: 0, damaged: 0, cost: 2304.00, status: 'Overdue', sku: 'KV-820118', location: 'B-14' },
      { id: 'PO-7802', vendorId: 'VEN-03', vendor: 'Brightline Electronics', method: 'Minimum order', orderDate: '04/06/2012', expectedDate: '04/19/2012', quantity: 180, received: 90, damaged: 2, cost: 4050.00, status: 'Partial', sku: 'KV-225190', location: 'C-07' },
      { id: 'PO-7798', vendorId: 'VEN-04', vendor: 'Heritage Collectibles', method: 'Forecast buy', orderDate: '04/04/2012', expectedDate: '04/22/2012', quantity: 60, received: 0, damaged: 0, cost: 1680.00, status: 'Open', sku: 'KV-331990', location: 'D-02' },
      { id: 'PO-7791', vendorId: 'VEN-05', vendor: 'Summit Outdoor Goods', method: 'Replenishment', orderDate: '04/01/2012', expectedDate: '04/14/2012', quantity: 120, received: 120, damaged: 1, cost: 2880.00, status: 'Received', sku: 'KV-630442', location: 'E-11' },
      { id: 'PO-7784', vendorId: 'VEN-06', vendor: 'Big Idea Ceramics', method: 'JIT', orderDate: '03/29/2012', expectedDate: '04/10/2012', quantity: 300, received: 300, damaged: 0, cost: 1350.00, status: 'Complete', sku: 'KV-910331', location: 'F-02' }
    ],
    catalog: [
      { sku: 'KV-100042', upc: '000000100042', product: 'Modular packing station labels', category: 'Fulfillment', cost: 3.10, price: 8.95, listings: 8, health: 'Healthy', updated: '10:31 AM', attributes: 24, media: 4, mappings: '8 / 8', audit: ['10:31 AM · Listing copy updated'] },
      { sku: 'KV-225190', upc: '000000225190', product: 'Low-profile inventory scanner cradle', category: 'Electronics', cost: 12.40, price: 29.95, listings: 5, health: 'Low Stock', updated: '10:22 AM', attributes: 31, media: 5, mappings: '5 / 5', audit: ['10:22 AM · Replenishment flag updated'] },
      { sku: 'KV-331990', upc: '000000331990', product: 'Circuit of Time collector cartridge', category: 'Collectibles', cost: 18.00, price: 44.95, listings: 0, health: 'Hidden', updated: 'Yesterday', attributes: 18, media: 2, mappings: '0 / 0', audit: ['Yesterday · Record moved to archive'] },
      { sku: 'KV-740204', upc: '000000740204', product: 'Reusable fulfillment tote — blue', category: 'Housewares', cost: 6.80, price: 16.95, listings: 12, health: 'Healthy', updated: '10:18 AM', attributes: 27, media: 6, mappings: '12 / 12', audit: ['10:18 AM · Inventory feed refreshed'] },
      { sku: 'KV-910331', upc: '000000910331', product: 'Executive Decision-Making Mug', category: 'Office Supplies', cost: 4.50, price: 12.95, listings: 3, health: 'Needs Taxonomy', updated: '9:58 AM', attributes: 14, media: 3, mappings: '2 / 3', audit: ['9:58 AM · Category “Leadership Accessories” rejected', '9:54 AM · Claim “decisions sold separately” approved by Legal-ish'] },
      { sku: 'KV-820118', upc: '000000820118', product: 'Household tool set — 18 piece', category: 'Tools', cost: 24.00, price: 54.95, listings: 9, health: 'Rejected', updated: '9:41 AM', attributes: 33, media: 7, mappings: '8 / 9', audit: ['9:41 AM · Wayfair listing rejected'] },
      { sku: 'KV-630442', upc: '000000630442', product: 'Weatherproof outdoor lantern', category: 'Outdoors', cost: 9.20, price: 24.95, listings: 11, health: 'Healthy', updated: '9:32 AM', attributes: 29, media: 5, mappings: '11 / 11', audit: ['9:32 AM · Price rule applied'] },
      { sku: 'KV-510046', upc: '000000510046', product: 'Stackable office organizer', category: 'Office Supplies', cost: 5.60, price: 14.95, listings: 7, health: 'Healthy', updated: '9:20 AM', attributes: 22, media: 4, mappings: '7 / 7', audit: ['9:20 AM · Feed accepted'] }
    ],
    inventory: [
      { sku: 'KV-100042', product: 'Modular packing station labels', location: 'A-03', onHand: 284, allocated: 31, incoming: 0, reorderPoint: 80, damaged: 4, status: 'Healthy' },
      { sku: 'KV-225190', product: 'Low-profile inventory scanner cradle', location: 'C-07', onHand: 12, allocated: 8, incoming: 90, reorderPoint: 24, damaged: 0, status: 'Low Stock' },
      { sku: 'KV-331990', product: 'Circuit of Time collector cartridge', location: 'D-02', onHand: 3, allocated: 0, incoming: 60, reorderPoint: 5, damaged: 0, status: 'Low Stock' },
      { sku: 'KV-740204', product: 'Reusable fulfillment tote — blue', location: 'A-01', onHand: 864, allocated: 64, incoming: 240, reorderPoint: 180, damaged: 7, status: 'Healthy' },
      { sku: 'KV-910331', product: 'Executive Decision-Making Mug', location: 'F-02', onHand: 47, allocated: 18, incoming: 0, reorderPoint: 40, damaged: 1, status: 'Watch' },
      { sku: 'KV-820118', product: 'Household tool set — 18 piece', location: 'B-14', onHand: 0, allocated: 4, incoming: 96, reorderPoint: 32, damaged: 0, status: 'Stockout' },
      { sku: 'KV-630442', product: 'Weatherproof outdoor lantern', location: 'E-11', onHand: 120, allocated: 12, incoming: 0, reorderPoint: 30, damaged: 1, status: 'Healthy' },
      { sku: 'KV-510046', product: 'Stackable office organizer', location: 'F-04', onHand: 300, allocated: 28, incoming: 0, reorderPoint: 75, damaged: 0, status: 'Healthy' }
    ],
    marketplaces: createMarketplaces(),
    vendors: [
      { id: 'VEN-01', name: 'Northstar Housewares', contact: 'Elena Brooks', email: 'elena@northstar.example', terms: 'Net 30', moq: 120, leadTime: 6, openPOs: 1, status: 'Active', categories: 'Housewares · Kitchen', notes: ['04/12 · JIT program confirmed'] },
      { id: 'VEN-02', name: 'Atlas Tool Supply', contact: 'Marcus Lee', email: 'marcus@atlas.example', terms: 'Net 15', moq: 72, leadTime: 8, openPOs: 1, status: 'Shipment Late', categories: 'Tools · Accessories', notes: ['04/17 · Requested overdue shipment update'] },
      { id: 'VEN-03', name: 'Brightline Electronics', contact: 'Naomi Wells', email: 'naomi@brightline.example', terms: 'Net 30', moq: 180, leadTime: 12, openPOs: 1, status: 'Active', categories: 'Electronics', notes: ['04/18 · Partial receipt recorded'] },
      { id: 'VEN-04', name: 'Heritage Collectibles', contact: 'Andre Chen', email: 'andre@heritage.example', terms: 'Prepaid', moq: 48, leadTime: 14, openPOs: 1, status: 'Active', categories: 'Collectibles · Toys', notes: ['04/04 · Forecast buy placed'] },
      { id: 'VEN-05', name: 'Summit Outdoor Goods', contact: 'Dana Cole', email: 'dana@summit.example', terms: 'Net 45', moq: 96, leadTime: 9, openPOs: 0, status: 'Active', categories: 'Outdoors · Accessories', notes: ['04/14 · Receipt completed'] },
      { id: 'VEN-06', name: 'Big Idea Ceramics', contact: 'Riley Gomez', email: 'riley@bigidea.example', terms: 'Net 30', moq: 200, leadTime: 5, openPOs: 0, status: 'Active', categories: 'Office Supplies · Ceramics', notes: ['04/10 · Mug PO completed', '03/28 · Confirmed decisions remain sold separately'] }
    ],
    cases: [
      { id: 'CASE-2201', customer: 'Avery Singh', channel: 'Walmart', orderId: 'ORD-10465', issue: 'Payment verification', priority: 'High', age: '1d 3h', status: 'Escalated', tracking: '', notes: ['Yesterday · Case opened from order exception', '9:20 AM · Requested address verification'], timeline: ['Yesterday · Payment review flagged', '9:20 AM · Escalated to operator'] },
      { id: 'CASE-2202', customer: 'Jordan Rivera', channel: 'Amazon FBA', orderId: 'ORD-10477', issue: 'Shipment status', priority: 'Medium', age: '5h', status: 'Waiting', tracking: 'FBA transfer', notes: ['10:04 AM · Waiting for FBA receive scan'], timeline: ['10:04 AM · Customer message imported'] },
      { id: 'CASE-2203', customer: 'Priya Patel', channel: 'eBay', orderId: 'ORD-10436', issue: 'Address correction', priority: 'Normal', age: '3h', status: 'Open', tracking: '', notes: ['10:16 AM · Address corrected before packing'], timeline: ['10:12 AM · New message', '10:16 AM · Order note updated'] },
      { id: 'CASE-2204', customer: 'Maya Chen', channel: 'StealStreet.com', orderId: 'ORD-10482', issue: 'Product expectations', priority: 'Normal', age: '2h', status: 'New', tracking: '', notes: ['10:30 AM · Confirmed mug provides caffeine support, not executive authority'], timeline: ['10:28 AM · Customer asked whether decisions are included', '10:30 AM · Reply drafted with unusual precision'] },
      { id: 'CASE-2205', customer: 'Leo Martin', channel: 'Wayfair', orderId: 'ORD-10428', issue: 'Late-order concern', priority: 'High', age: '1d', status: 'Open', tracking: '', notes: ['Yesterday · Channel SLA warning'], timeline: ['Yesterday · Automatic late-order alert'] },
      { id: 'CASE-2206', customer: 'Nora Kim', channel: 'Amazon Canada', orderId: 'ORD-10402', issue: 'Delivery confirmation', priority: 'Normal', age: '1h', status: 'Resolved', tracking: '94001042010402', notes: ['10:35 AM · Delivery confirmed'], timeline: ['10:35 AM · Resolved'] }
    ],
    warehouseTasks: [
      { id: 'WH-R-101', type: 'Receiving', record: 'PO-7814', route: 'Dock 2 → A-01', itemCount: 240, weight: '', service: '', label: '', tracking: '', status: 'Awaiting Dock', note: 'Verify quantity and damage.' },
      { id: 'WH-R-102', type: 'Receiving', record: 'PO-7802', route: 'Dock 1 → C-07', itemCount: 90, weight: '', service: '', label: '', tracking: '', status: 'Partial', note: 'Second carton pending.' },
      { id: 'WH-U-103', type: 'Putaway', record: 'PO-7791', route: 'Dock 3 → E-11', itemCount: 119, weight: '', service: '', label: '', tracking: '', status: 'Ready', note: 'One damaged unit quarantined.' },
      { id: 'WH-P-201', type: 'Picking', record: 'ORD-10482', route: 'F-02 → A-03 → A-01', itemCount: 3, weight: '', service: '', label: '', tracking: '', status: 'Queued', note: 'Wave 18-A. Keep mug upright; decisions may shift in transit.' },
      { id: 'WH-P-202', type: 'Picking', record: 'ORD-10436', route: 'E-11', itemCount: 2, weight: '', service: '', label: '', tracking: '', status: 'Complete', note: 'Delivered to packing.' },
      { id: 'WH-K-301', type: 'Packing', record: 'ORD-10436', route: 'Station 2', itemCount: 2, weight: '4.2 lb', service: 'UPS Ground', label: 'Pending', tracking: '', status: 'Ready', note: 'Verify corrected address.' },
      { id: 'WH-S-401', type: 'Shipments', record: 'ORD-10441', route: 'Carrier lane 1', itemCount: 12, weight: '28.6 lb', service: 'UPS Ground', label: 'Printed', tracking: '1Z804201041', status: 'Complete', note: 'Carrier scan received.' },
      { id: 'WH-F-501', type: 'Amazon FBA', record: 'FBA-1204', route: 'Staging FBA-2', itemCount: 48, weight: '112 lb', service: 'LTL', label: 'Awaiting confirmation', tracking: '', status: 'Carton Labels', note: 'Carton plan generated.' },
      { id: 'WH-X-601', type: 'Exceptions', record: 'ORD-10428', route: 'Packing hold', itemCount: 1, weight: '12.1 lb', service: 'FedEx Home', label: 'Mismatch', tracking: '', status: 'Open', note: 'Package weight differs from catalog record.' }
    ],
    companyHub: {
      announcement: 'Operations note: the break-room fridge is not an inventory location. The scanner now knows this too.',
      projects: [
        { id: 'TASK-01', name: 'Review overdue vendor shipment', due: 'Today', complete: false },
        { id: 'TASK-02', name: 'Retire spreadsheet_final_FINAL_v7.xls', due: 'Today-ish', complete: false },
        { id: 'TASK-03', name: 'Confirm warehouse handoff', due: 'Tomorrow', complete: true }
      ],
      events: ['11:00 AM · Vendor review (coffee is the agenda)', '2:00 PM · Marketplace feed window', 'Tomorrow · All-hands, assuming the feed behaves'],
      messages: 3,
      employees: [{ name: 'Kevin', status: 'In', note: 'making systems talk' }, { name: 'Warehouse', status: 'In', note: 'found the other carton' }, { name: 'Catalog', status: 'Away', note: 'escaping spreadsheet limbo' }, { name: 'Customer Service', status: 'In', note: 'translating ALL CAPS' }],
      resources: ['Time-Off Request', 'Onboarding', 'Training Material', 'SOPs', 'Company Resources']
    },
    returns: [
      { id: 'RMA-4001', orderId: 'ORD-10402', customer: 'Nora Kim', sku: 'KV-510046', item: 'Stackable office organizer', quantity: 1, reason: 'Duplicate item', condition: 'Unopened', disposition: 'Restock', refund: 14.95, status: 'Inspection' },
      { id: 'RMA-4002', orderId: 'ORD-10374', customer: 'Mateo Cruz', sku: 'KV-225190', item: 'Low-profile inventory scanner cradle', quantity: 1, reason: 'Does not fit', condition: 'Unknown', disposition: 'Pending', refund: 29.95, status: 'Awaiting Arrival' },
      { id: 'RMA-4003', orderId: 'ORD-10369', customer: 'Olivia Park', sku: 'KV-820118', item: 'Household tool set — 18 piece', quantity: 1, reason: 'Missing part', condition: 'Opened', disposition: 'Damaged', refund: 54.95, status: 'Received' },
      { id: 'RMA-4004', orderId: 'ORD-10352', customer: 'Noah Brown', sku: 'KV-630442', item: 'Weatherproof outdoor lantern', quantity: 2, reason: 'Changed mind', condition: 'Unopened', disposition: 'Restock', refund: 49.90, status: 'Refund Pending' },
      { id: 'RMA-4005', orderId: 'ORD-10344', customer: 'Sophia Lin', sku: 'KV-100042', item: 'Modular packing station labels', quantity: 1, reason: 'Damaged in transit', condition: 'Damaged', disposition: 'Vendor Return', refund: 8.95, status: 'Requested' },
      { id: 'RMA-4006', orderId: 'ORD-10318', customer: 'Ethan Davis', sku: 'KV-510046', item: 'Stackable office organizer', quantity: 1, reason: 'Duplicate order', condition: 'Unopened', disposition: 'Restocked', refund: 14.95, status: 'Completed' }
    ],
    users: [
      { id: 'USR-01', name: 'Kevin', role: 'Administrator', modules: 'All modules', status: 'Active' },
      { id: 'USR-02', name: 'Warehouse Operator', role: 'Fulfillment', modules: 'Inventory · Warehouse · Returns', status: 'Active' },
      { id: 'USR-03', name: 'Customer Service', role: 'Support', modules: 'Orders · Cases · Returns', status: 'Active' },
      { id: 'USR-04', name: 'Catalog Operator', role: 'Catalog', modules: 'Catalog · Marketplaces', status: 'Active' }
    ],
    integrations: [
      { id: 'INT-01', name: 'Marketplace order importer', type: 'Scheduled job', status: 'Healthy', lastRun: '10:42 AM' },
      { id: 'INT-02', name: 'Inventory availability feed', type: 'Channel feed', status: 'Healthy', lastRun: '10:40 AM' },
      { id: 'INT-03', name: 'Wayfair listing feed', type: 'Channel feed', status: 'Exception', lastRun: '10:36 AM' },
      { id: 'INT-04', name: 'Carrier tracking update', type: 'Carrier', status: 'Healthy', lastRun: '10:35 AM' },
      { id: 'INT-05', name: 'Settlement importer', type: 'Finance', status: 'Review', lastRun: '10:30 AM' }
    ],
    automation: [
      { id: 'AUTO-01', name: 'Import marketplace orders', trigger: 'Every 5 minutes', enabled: true },
      { id: 'AUTO-02', name: 'Reserve inventory', trigger: 'Order payment authorized', enabled: true },
      { id: 'AUTO-03', name: 'Low-stock alert', trigger: 'Available below reorder point', enabled: true },
      { id: 'AUTO-04', name: 'Retry failed feed', trigger: 'Feed rejected', enabled: true },
      { id: 'AUTO-05', name: 'Flag late vendor shipment', trigger: 'Expected date missed', enabled: true },
      { id: 'AUTO-06', name: 'Escalate customer-service case', trigger: 'High priority open 4 hours', enabled: false }
    ],
    notifications: [
      { id: 'NOT-01', name: 'Warehouse exception alerts', channel: 'Dashboard + Email', enabled: true },
      { id: 'NOT-02', name: 'Vendor overdue alerts', channel: 'Dashboard', enabled: true },
      { id: 'NOT-03', name: 'Marketplace feed failures', channel: 'Dashboard + Email', enabled: true },
      { id: 'NOT-04', name: 'Settlement mismatches', channel: 'Dashboard', enabled: false }
    ],
    audit: [
      { time: '10:42 AM', user: 'System', module: 'Integrations', action: 'Got every system talking again', record: '4 channels', result: 'Success' },
      { time: '10:40 AM', user: 'System', module: 'Warehouse', action: 'Located the missing carton', record: 'Behind the other carton', result: 'Found' },
      { time: '10:36 AM', user: 'System', module: 'Marketplaces', action: 'Flagged rejected listing', record: 'Sears / KV-910331', result: 'Review' },
      { time: '10:31 AM', user: 'Kevin', module: 'Catalog', action: 'Rescued listings from spreadsheet limbo', record: '1,204 records', result: 'Saved' },
      { time: '10:22 AM', user: 'System', module: 'Inventory', action: 'Raised low-stock alert', record: 'KV-225190', result: 'Attention' },
      { time: '10:18 AM', user: 'Kevin', module: 'Customer Service', action: 'Translated an ALL-CAPS message', record: 'CASE-2204', result: 'Punctuation restored' },
      { time: '10:04 AM', user: 'System', module: 'Customer Service', action: 'Imported customer message', record: 'CASE-2202', result: 'Waiting' },
      { time: '9:58 AM', user: 'System', module: 'Catalog', action: 'Flagged missing taxonomy', record: 'KV-910331', result: 'Review' }
    ],
    artifactRecovered: false
  };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (parsed?.version === 5 && parsed.companyHub) return parsed;
  } catch { /* Reset to the deterministic seed. */ }
  return createSeedState();
}
let state = readState();

const workspace = document.querySelector('[data-kz-workspace]');
const recordDialog = document.querySelector('[data-dialog="record"]');

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Persistence remains optional. */ }
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
function money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0)); }
function number(value) { return new Intl.NumberFormat('en-US').format(Number(value || 0)); }
function currentTime() { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date()); }
function statusClass(status) {
  const normalized = String(status).toLowerCase();
  if (/exception|overdue|stockout|rejected|damaged|escalated|failed|open/.test(normalized)) return 'danger';
  if (/healthy|complete|completed|active|shipped|received|resolved|reconciled|current|success|restocked/.test(normalized)) return 'success';
  if (/partial|waiting|review|low|watch|pending|awaiting|ready|queued|requested|inspection|delayed/.test(normalized)) return 'warning';
  return 'info';
}
function status(value) { return `<span class="kz-status kz-status--${statusClass(value)}">${escapeHtml(value)}</span>`; }
function available(item) { return Math.max(0, item.onHand - item.allocated); }
function updateInventoryStatus(item) {
  const free = available(item);
  item.status = free <= 0 ? 'Stockout' : free <= item.reorderPoint ? 'Low Stock' : free <= item.reorderPoint * 1.35 ? 'Watch' : 'Healthy';
}
function addAudit(module, action, record, result) {
  state.audit.unshift({ time: currentTime(), user: 'Kevin', module, action, record, result });
  state.audit = state.audit.slice(0, 60);
}
function commit(message) { saveState(); renderActiveModule(); if (message) toast(message); }
function moduleName(id) { return MODULE_LABELS[id] || id; }
function pageHeader(title, description, actions = '') {
  return `<header class="kz-page-header"><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div><div class="kz-page-header__actions">${actions}</div></header>`;
}
function illustrativeBadge() { return '<span class="kz-illustrative-badge">Illustrative records</span>'; }
const CHARACTER_SKU = 'KV-910331';
function storyMark(label = 'A product with a surprisingly long paper trail') { return `<span class="kz-story-mark" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">✦</span>`; }
function storyProduct(value, sku) { return `${escapeHtml(value)}${sku === CHARACTER_SKU ? storyMark() : ''}`; }
function interfacePulse(message) {
  const shell = document.querySelector('[data-kevazon]');
  shell?.classList.remove('is-delighted');
  requestAnimationFrame(() => shell?.classList.add('is-delighted'));
  window.setTimeout(() => shell?.classList.remove('is-delighted'), 1250);
  if (message) toast(message);
}
function summaryStrip(items) {
  return `<div class="kz-summary-strip">${items.map((item) => `<div><span>${escapeHtml(item.label)}</span><b>${escapeHtml(item.value)}</b><small>${escapeHtml(item.note || '')}</small></div>`).join('')}</div>`;
}
function panel(title, body, tools = '', className = '') {
  return `<section class="kz-panel ${className}"><header class="kz-panel-header"><h2>${escapeHtml(title)}</h2><div class="kz-panel-header__tools">${tools}</div></header>${body}</section>`;
}
function toolbar(module, { placeholder = 'Filter records', filters = '', actions = '' } = {}) {
  const query = state.ui.filters[module]?.query || '';
  return `<form class="kz-toolbar" data-filter-form="${module}"><label>Find <input type="search" name="query" value="${escapeHtml(query)}" placeholder="${escapeHtml(placeholder)}"></label>${filters}<button type="submit">Apply</button><button type="button" data-action="clear-filter" data-module="${module}">Clear</button><span class="kz-toolbar__spacer"></span>${illustrativeBadge()}${actions}</form>`;
}
function getFilter(module, key = 'query') { return String(state.ui.filters[module]?.[key] || '').toLowerCase(); }
function matchesQuery(row, query) { return !query || Object.values(row).join(' ').toLowerCase().includes(query); }

function sortRows(tableId, rows, columns) {
  const sortState = state.ui.sort[tableId];
  if (!sortState) return [...rows];
  const column = columns.find((item) => item.key === sortState.key);
  if (!column) return [...rows];
  return [...rows].sort((a, b) => {
    const first = column.sortValue ? column.sortValue(a) : a[column.key];
    const second = column.sortValue ? column.sortValue(b) : b[column.key];
    const result = typeof first === 'number' && typeof second === 'number' ? first - second : String(first ?? '').localeCompare(String(second ?? ''), undefined, { numeric: true });
    return sortState.direction === 'desc' ? -result : result;
  });
}
function renderTable({ id, label, columns, rows, actions, pageSize = 6, minWidth = 900 }) {
  const sorted = sortRows(id, rows, columns);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(pages, Math.max(1, Number(state.ui.pages[id] || 1)));
  state.ui.pages[id] = current;
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);
  const head = columns.map((column) => {
    const active = state.ui.sort[id]?.key === column.key;
    const indicator = active ? (state.ui.sort[id].direction === 'asc' ? ' ▲' : ' ▼') : '';
    return `<th class="${column.numeric ? 'is-numeric' : ''}"><button type="button" data-action="sort" data-table="${id}" data-key="${column.key}">${escapeHtml(column.label)}${indicator}</button></th>`;
  }).join('') + (actions ? '<th>Action</th>' : '');
  const body = visible.length ? visible.map((row) => `<tr data-row-id="${escapeHtml(row.id || row.sku)}">${columns.map((column) => `<td class="${column.numeric ? 'is-numeric' : ''}">${column.render ? column.render(row) : escapeHtml(row[column.key])}</td>`).join('')}${actions ? `<td class="kz-table__actions">${actions(row)}</td>` : ''}</tr>`).join('') : `<tr><td class="kz-table-empty" colspan="${columns.length + (actions ? 1 : 0)}">No records match this view.</td></tr>`;
  return `<div class="kz-table-wrap"><table class="kz-table" style="min-width:${minWidth}px"><caption class="sr-only">${escapeHtml(label)}</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><div class="kz-pagination"><span>Showing ${visible.length ? (current - 1) * pageSize + 1 : 0}–${Math.min(current * pageSize, sorted.length)} of ${sorted.length}</span><div><button type="button" data-action="page" data-table="${id}" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>Previous</button><span>Page ${current} of ${pages}</span><button type="button" data-action="page" data-table="${id}" data-page="${current + 1}" ${current >= pages ? 'disabled' : ''}>Next</button></div></div>`;
}
function actionButton(label, action, type, id, primary = false) {
  return `<button type="button" class="${primary ? 'kz-action-button' : ''}" data-action="${action}" data-record-type="${type}" data-record-id="${escapeHtml(id)}">${escapeHtml(label)}</button>`;
}

function dashboardExceptions() {
  const result = [];
  state.orders.filter((item) => item.status === 'Exception').forEach((item) => result.push({ issue: 'Payment review required', module: 'orders', age: '1d', status: item.status, record: item.id, action: 'Open' }));
  state.purchaseOrders.filter((item) => item.status === 'Overdue').forEach((item) => result.push({ issue: 'Vendor shipment overdue', module: 'purchase-orders', age: '2d', status: item.status, record: item.id, action: 'Review' }));
  state.inventory.filter((item) => ['Low Stock', 'Stockout'].includes(item.status)).slice(0, 1).forEach((item) => result.push({ issue: `${item.sku} ${item.status.toLowerCase()}`, module: 'inventory', age: '3h', status: item.status, record: item.sku, action: 'Reorder' }));
  state.catalog.filter((item) => ['Needs Taxonomy', 'Rejected'].includes(item.health)).slice(0, 1).forEach((item) => result.push({ issue: `${item.sku} catalog exception`, module: 'catalog', age: '1h', status: item.health, record: item.sku, action: 'Fix' }));
  const channel = state.marketplaces.find((item) => item.errors > 0);
  if (channel) result.push({ issue: `${channel.name} feed exception`, module: 'marketplaces', age: '28m', status: channel.feed, record: channel.id, action: 'Retry' });
  const wh = state.warehouseTasks.find((item) => item.type === 'Exceptions' && item.status !== 'Complete');
  if (wh) result.push({ issue: 'Shipment weight mismatch', module: 'warehouse', age: '42m', status: wh.status, record: wh.id, action: 'Inspect' });
  const service = state.cases.find((item) => item.status === 'Escalated');
  if (service) result.push({ issue: 'Escalation awaiting response', module: 'customer-service', age: service.age, status: service.status, record: service.id, action: 'Open' });
  const settlement = state.marketplaces.find((item) => item.settlement === 'Review');
  if (settlement) result.push({ issue: 'Marketplace settlement mismatch', module: 'reports', age: '4h', status: 'Review', record: 'Finance', action: 'Reconcile' });
  return result;
}
function updateNavCounts() {
  const counts = {
    orders: state.orders.filter((item) => !['Complete', 'Shipped'].includes(item.status)).length,
    'purchase-orders': state.purchaseOrders.filter((item) => !['Complete', 'Received'].includes(item.status)).length,
    inventory: state.inventory.filter((item) => item.status !== 'Healthy').length,
    'customer-service': state.cases.filter((item) => !['Resolved', 'Closed'].includes(item.status)).length,
    warehouse: state.warehouseTasks.filter((item) => item.status !== 'Complete').length,
    returns: state.returns.filter((item) => item.status !== 'Completed').length
  };
  document.querySelectorAll('[data-nav-count]').forEach((node) => { node.textContent = String(counts[node.dataset.navCount] || 0); });
}

function renderDashboard() {
  const exceptions = dashboardExceptions();
  const summary = summaryStrip([
    { label: 'Open Orders', value: state.orders.filter((item) => !['Complete', 'Shipped'].includes(item.status)).length, note: 'Customer fulfillment' },
    { label: 'Open POs', value: state.purchaseOrders.filter((item) => !['Complete', 'Received'].includes(item.status)).length, note: 'Vendor purchasing' },
    { label: 'Inventory Alerts', value: state.inventory.filter((item) => item.status !== 'Healthy').length, note: 'Stock intervention' },
    { label: 'Catalog Queue', value: state.catalog.filter((item) => !['Healthy', 'Hidden'].includes(item.health)).length, note: 'Data exceptions' },
    { label: 'Channel Exceptions', value: state.marketplaces.reduce((total, item) => total + item.errors, 0), note: 'Feeds and mappings' },
    { label: 'Warehouse Queue', value: state.warehouseTasks.filter((item) => item.status !== 'Complete').length, note: 'Physical work' }
  ]);
  const flowModules = [
    ['vendors', 'Vendors', 'Terms + products'], ['purchase-orders', 'Purchase Orders', 'JIT + MOQ'], ['inventory', 'Inventory', 'Stock state'], ['catalog', 'Catalog', '1.5M records'],
    ['marketplaces', 'Marketplaces', '20+ channels'], ['orders', 'Orders', 'Payment + status'], ['warehouse', 'Warehouse', 'Receive → ship'], ['customer-service', 'Customer', 'Service + returns']
  ];
  const flow = `<ol class="kz-flow" aria-label="Vendor-to-customer operating flow">${flowModules.map((item, index) => `<li><button type="button" data-navigate="${item[0]}" title="Open ${item[1]} — ${item[2]}"><em>${String(index + 1).padStart(2, '0')}</em><b>${item[1]}</b><span>${item[2]}</span></button></li>`).join('')}</ol>`;
  const attention = `<div class="kz-exception-table-wrap"><table class="kz-exception-table"><caption class="sr-only">Open operational exceptions requiring attention</caption><thead><tr><th scope="col">Exception</th><th scope="col">Record</th><th scope="col">Workspace</th><th scope="col">Age</th><th scope="col">State</th><th scope="col">Action</th></tr></thead><tbody>${exceptions.slice(0, 8).map((item) => `<tr><td><b>${escapeHtml(item.issue)}</b></td><td><code>${escapeHtml(item.record)}</code></td><td>${escapeHtml(moduleName(item.module))}</td><td><time>${escapeHtml(item.age)}</time></td><td>${status(item.status)}</td><td><button type="button" data-navigate="${item.module}" data-focus-record="${escapeHtml(item.record)}">${escapeHtml(item.action)}</button></td></tr>`).join('')}</tbody></table></div>`;
  const scale = `<div class="kz-scale-ledger"><div><b>~1.5M</b><span>Catalog records</span><small>Verified historical scale</small></div><div><b>20+</b><span>Commerce channels</span><small>Verified historical scale</small></div><div><b>12</b><span>Operating workspaces</span><small>Connected in this reconstruction</small></div></div>`;
  const activity = `<ul class="kz-activity-list">${state.audit.slice(0, 6).map((item) => `<li><time>${escapeHtml(item.time)}</time><b>${escapeHtml(item.module)}</b><span>${escapeHtml(item.action)}</span><span>${escapeHtml(item.record)} · ${escapeHtml(item.result)}</span></li>`).join('')}</ul>`;
  const companyHub = `<div class="kz-company-hub"><section><h3>Company Announcements</h3><p>${escapeHtml(state.companyHub.announcement)}</p></section><section><h3>My Projects &amp; Tasks</h3><ul>${state.companyHub.projects.map((item)=>`<li><button type="button" data-action="toggle-company-task" data-record-id="${item.id}" aria-pressed="${item.complete}"><span>${item.complete?'✓':'○'}</span>${escapeHtml(item.name)}<small>${escapeHtml(item.due)}</small></button></li>`).join('')}</ul></section><section><h3>Upcoming Events / Calendar</h3><ul>${state.companyHub.events.map((item)=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section><h3>Messages &amp; Employee Status</h3><p><button type="button" data-action="open-company-messages">${state.companyHub.messages} internal messages</button></p><div class="kz-employee-status">${state.companyHub.employees.map((item)=>`<span title="${escapeHtml(item.note)}"><i class="is-${item.status.toLowerCase()}"></i>${escapeHtml(item.name)} · ${escapeHtml(item.status)}<small>${escapeHtml(item.note)}</small></span>`).join('')}</div></section><section><h3>Resources</h3><div class="kz-resource-links">${state.companyHub.resources.map((item)=>`<button type="button" data-action="open-company-resource" data-record-id="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('')}</div></section></div>`;
  const commandCenter = `<div class="kz-dashboard-main">${panel('Exception Queue', attention, `${illustrativeBadge()}<span>${exceptions.length} open</span>`, 'kz-exception-panel')}<aside class="kz-dashboard-rail" aria-label="Commerce scale and recent activity">${panel('Commerce Scale', scale, '<span>Operating footprint</span>', 'kz-scale-panel')}${panel('Recent ERP Activity', activity, '<button type="button" data-navigate="settings" data-settings-tab="Audit History">Audit history</button>', 'kz-dashboard-activity')}</aside></div>`;
  workspace.innerHTML = pageHeader('Operations Dashboard', 'One connected command center for purchasing, catalog, inventory, marketplaces, fulfillment, customers, and company operations.', `<button type="button" class="kz-button kz-button--primary" data-action="sync-all">Run System Sync</button>`) + summary + `<div class="kz-grid kz-grid--dashboard kz-dashboard">${panel('Vendor-to-Customer Operating Flow', flow, '<span>8 connected stages</span><span>Vendor → customer</span>', 'kz-flow-panel')}${commandCenter}${panel('Company Homebase', companyHub, '<span>Secondary operations intranet</span>', 'kz-company-panel')}</div>`;
}

function renderOrders() {
  const query = getFilter('orders');
  const statusFilter = state.ui.filters.orders?.status || '';
  const rows = state.orders.filter((item) => matchesQuery(item, query) && (!statusFilter || item.status === statusFilter));
  const columns = [
    { key: 'id', label: 'Order', render: (row) => `<strong>${row.id}</strong>` }, { key: 'customer', label: 'Customer' }, { key: 'channel', label: 'Channel' },
    { key: 'date', label: 'Date' }, { key: 'items', label: 'Items', numeric: true }, { key: 'total', label: 'Total', numeric: true, render: (row) => money(row.total) },
    { key: 'payment', label: 'Payment', render: (row) => status(row.payment) }, { key: 'fulfillment', label: 'Fulfillment' }, { key: 'status', label: 'Status', render: (row) => status(row.status) },
    { key: 'tracking', label: 'Tracking', render: (row) => escapeHtml(row.tracking || '—') }
  ];
  const nextLabels = { 'Ready to Pick': 'Mark Picked', Picked: 'Mark Packed', Packed: 'Mark Shipped', Shipped: 'Complete', Exception: 'Resolve' };
  const table = renderTable({ id: 'orders', label: 'Customer orders', columns, rows, pageSize: 6, minWidth: 1180, actions: (row) => `${actionButton('Open', 'open-record', 'order', row.id)}${nextLabels[row.status] ? actionButton(nextLabels[row.status], 'advance-order', 'order', row.id, true) : ''}` });
  const filterOptions = ['', 'Ready to Pick', 'Picked', 'Packed', 'Shipped', 'Complete', 'Exception'].map((item) => `<option value="${item}" ${statusFilter === item ? 'selected' : ''}>${item || 'All statuses'}</option>`).join('');
  workspace.innerHTML = pageHeader('Orders', 'Cross-channel customer orders with payment, fulfillment, tracking, exceptions, notes, and history.', `<button class="kz-button" type="button" data-action="export" data-export="orders">Export Orders</button>`) + summaryStrip([
    { label: 'Open', value: state.orders.filter((item) => !['Complete', 'Shipped'].includes(item.status)).length }, { label: 'Ready to Pick', value: state.orders.filter((item) => item.status === 'Ready to Pick').length },
    { label: 'Packed', value: state.orders.filter((item) => item.status === 'Packed').length }, { label: 'Exceptions', value: state.orders.filter((item) => item.status === 'Exception').length },
    { label: 'Shipped', value: state.orders.filter((item) => item.status === 'Shipped').length }, { label: 'Complete', value: state.orders.filter((item) => item.status === 'Complete').length }
  ]) + toolbar('orders', { placeholder: 'Order, customer, channel, tracking', filters: `<label>Status <select name="status">${filterOptions}</select></label>` }) + table;
}

function renderPurchaseOrders() {
  const query = getFilter('purchase-orders');
  const rows = state.purchaseOrders.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'id', label: 'PO', render: (row) => `<strong>${row.id}</strong>` }, { key: 'vendor', label: 'Vendor' }, { key: 'method', label: 'Method' },
    { key: 'orderDate', label: 'Order Date' }, { key: 'expectedDate', label: 'Expected Date' }, { key: 'quantity', label: 'Quantity', numeric: true },
    { key: 'received', label: 'Received', numeric: true }, { key: 'cost', label: 'Cost', numeric: true, render: (row) => money(row.cost) }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const table = renderTable({ id: 'purchase-orders', label: 'Purchase orders', columns, rows, minWidth: 1080, actions: (row) => `${actionButton('Open', 'open-record', 'po', row.id)}${!['Complete', 'Received'].includes(row.status) ? actionButton('Receive', 'receive-po-form', 'po', row.id, true) : ''}` });
  const expected = state.purchaseOrders.reduce((total, item) => total + Math.max(0, item.quantity - item.received), 0);
  workspace.innerHTML = pageHeader('Purchase Orders', 'JIT purchasing, MOQ controls, expected inventory, receiving, vendor tracking, and reorder workflows.', `<button class="kz-button kz-button--primary" type="button" data-action="create-po-form">Create Purchase Order</button>`) + summaryStrip([
    { label: 'Open POs', value: state.purchaseOrders.filter((item) => !['Complete', 'Received'].includes(item.status)).length }, { label: 'Expected Units', value: number(expected) },
    { label: 'Overdue', value: state.purchaseOrders.filter((item) => item.status === 'Overdue').length }, { label: 'Awaiting Receiving', value: state.purchaseOrders.filter((item) => /Awaiting|Partial/.test(item.status)).length },
    { label: 'MOQ Exceptions', value: state.purchaseOrders.filter((item) => item.quantity < (state.vendors.find((vendor) => vendor.id === item.vendorId)?.moq || 0)).length }, { label: 'Received', value: state.purchaseOrders.filter((item) => /Received|Complete/.test(item.status)).length }
  ]) + toolbar('purchase-orders', { placeholder: 'PO, vendor, method, SKU', actions: '<button type="button" data-action="export" data-export="purchase-orders">Export</button>' }) + table;
}

function renderCatalog() {
  const query = getFilter('catalog');
  const rows = state.catalog.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'sku', label: 'SKU / UPC', render: (row) => `<strong>${row.sku}</strong><small>${row.upc}</small>` }, { key: 'product', label: 'Product', render: (row) => storyProduct(row.product, row.sku) }, { key: 'category', label: 'Category' },
    { key: 'cost', label: 'Cost', numeric: true, render: (row) => money(row.cost) }, { key: 'price', label: 'Price', numeric: true, render: (row) => money(row.price) },
    { key: 'available', label: 'Available', numeric: true, sortValue: (row) => available(state.inventory.find((item) => item.sku === row.sku) || { onHand: 0, allocated: 0 }), render: (row) => number(available(state.inventory.find((item) => item.sku === row.sku) || { onHand: 0, allocated: 0 })) },
    { key: 'allocated', label: 'Allocated', numeric: true, sortValue: (row) => state.inventory.find((item) => item.sku === row.sku)?.allocated || 0, render: (row) => number(state.inventory.find((item) => item.sku === row.sku)?.allocated || 0) },
    { key: 'listings', label: 'Listings', numeric: true }, { key: 'health', label: 'Data Health', render: (row) => status(row.health) }, { key: 'updated', label: 'Updated' }
  ];
  const table = renderTable({ id: 'catalog', label: 'Catalog records', columns, rows, minWidth: 1160, actions: (row) => `${actionButton('Open Record', 'open-record', 'catalog', row.sku)}${['Rejected', 'Needs Taxonomy'].includes(row.health) ? actionButton('Fix', 'fix-listing', 'catalog', row.sku, true) : ''}` });
  const actions = '<button type="button" data-action="catalog-bulk">Bulk Edit</button><button type="button" data-action="catalog-import">CSV Import</button><button type="button" data-action="export" data-export="catalog">CSV Export</button><button type="button" data-action="catalog-map">Map Listings</button><button type="button" data-action="catalog-price">Update Pricing</button><button type="button" data-action="catalog-taxonomy">Edit Taxonomy</button>';
  workspace.innerHTML = pageHeader('Catalog · 1.5M Records', 'Product information, pricing, taxonomy, marketplace mappings, listing health, and audit history in one searchable catalog engine.') + summaryStrip([
    { label: 'Verified Scale', value: '1.5M', note: 'Catalog records / SKUs' }, { label: 'Sample Healthy', value: state.catalog.filter((item) => item.health === 'Healthy').length },
    { label: 'Data Queue', value: state.catalog.filter((item) => !['Healthy', 'Hidden'].includes(item.health)).length }, { label: 'Mapped Listings', value: number(state.catalog.reduce((total, item) => total + item.listings, 0)) },
    { label: 'Low Stock', value: state.catalog.filter((item) => item.health === 'Low Stock').length }, { label: 'Hidden', value: state.catalog.filter((item) => item.health === 'Hidden').length }
  ]) + toolbar('catalog', { placeholder: 'SKU, UPC, product, category', actions }) + table;
}

function renderInventory() {
  const query = getFilter('inventory');
  const rows = state.inventory.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'sku', label: 'SKU', render: (row) => `<strong>${row.sku}</strong>` }, { key: 'product', label: 'Product', render: (row) => storyProduct(row.product, row.sku) }, { key: 'location', label: 'Location' },
    { key: 'onHand', label: 'On Hand', numeric: true }, { key: 'allocated', label: 'Allocated', numeric: true }, { key: 'available', label: 'Available', numeric: true, sortValue: available, render: (row) => number(available(row)) },
    { key: 'incoming', label: 'Incoming', numeric: true }, { key: 'reorderPoint', label: 'Reorder Point', numeric: true }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const table = renderTable({ id: 'inventory', label: 'Inventory stock state', columns, rows, minWidth: 1020, actions: (row) => `${actionButton('Adjust', 'adjust-stock-form', 'inventory', row.sku)}${actionButton('Reorder', 'reorder-stock', 'inventory', row.sku, row.status !== 'Healthy')}` });
  workspace.innerHTML = pageHeader('Inventory', 'Stock accounting across on-hand, allocated, available, incoming, damaged, locations, and reorder thresholds.', `<button type="button" class="kz-button" data-action="export" data-export="inventory">Export Inventory</button>`) + summaryStrip([
    { label: 'On Hand', value: number(state.inventory.reduce((total, item) => total + item.onHand, 0)) }, { label: 'Allocated', value: number(state.inventory.reduce((total, item) => total + item.allocated, 0)) },
    { label: 'Available', value: number(state.inventory.reduce((total, item) => total + available(item), 0)) }, { label: 'Incoming', value: number(state.inventory.reduce((total, item) => total + item.incoming, 0)) },
    { label: 'Low Stock', value: state.inventory.filter((item) => item.status === 'Low Stock').length }, { label: 'Stockouts', value: state.inventory.filter((item) => item.status === 'Stockout').length }
  ]) + toolbar('inventory', { placeholder: 'SKU, product, location, status', actions: '<button type="button" data-action="transfer-stock-form">Transfer Stock</button>' }) + table;
}

function renderMarketplaces() {
  const query = getFilter('marketplaces');
  const rows = state.marketplaces.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'name', label: 'Channel', render: (row) => `<strong>${row.name}</strong>` }, { key: 'model', label: 'Business Model' }, { key: 'region', label: 'Region' },
    { key: 'listings', label: 'Listings', numeric: true, render: (row) => number(row.listings) }, { key: 'feed', label: 'Feed', render: (row) => status(row.feed) },
    { key: 'inventorySync', label: 'Inventory Sync', render: (row) => status(row.inventorySync) }, { key: 'orderSync', label: 'Order Sync', render: (row) => status(row.orderSync) },
    { key: 'settlement', label: 'Settlement', render: (row) => status(row.settlement) }, { key: 'lastSync', label: 'Last Sync' }
  ];
  const table = renderTable({ id: 'marketplaces', label: 'Marketplace channels', columns, rows, minWidth: 1120, actions: (row) => `${actionButton('Select', 'select-channel', 'channel', row.id)}${row.errors ? actionButton('Retry Feed', 'retry-feed', 'channel', row.id, true) : ''}` });
  const selected = state.marketplaces.find((item) => item.id === state.ui.selectedChannel) || state.marketplaces[0];
  const inspector = `<div class="kz-inspector-body"><h3>${escapeHtml(selected.name)}</h3><p>${escapeHtml(selected.model)} · ${escapeHtml(selected.region)}</p><dl class="kz-detail-list"><div><dt>Listings</dt><dd>${number(selected.listings)}</dd></div><div><dt>Pricing rules</dt><dd>Channel floor · promotional override</dd></div><div><dt>Inventory mapping</dt><dd>${escapeHtml(selected.mapping)}</dd></div><div><dt>Orders</dt><dd>${escapeHtml(selected.orderSync)}</dd></div><div><dt>Fulfillment</dt><dd>${selected.name.includes('FBA') ? 'Amazon FBA' : 'Direct / channel rules'}</dd></div><div><dt>Customer issues</dt><dd>${state.cases.filter((item) => item.channel === selected.name).length} linked cases</dd></div><div><dt>Settlement</dt><dd>${escapeHtml(selected.settlement)}</dd></div><div><dt>Errors</dt><dd>${selected.errors}</dd></div><div><dt>Last sync</dt><dd>${escapeHtml(selected.lastSync)}</dd></div></dl><div class="kz-inspector-actions"><button class="kz-button kz-button--primary" type="button" data-action="sync-channel" data-record-id="${selected.id}">Run Demo Sync</button><button class="kz-button" type="button" data-action="retry-feed" data-record-id="${selected.id}">Retry Failed Feed</button><button class="kz-button" type="button" data-action="view-rejected" data-record-id="${selected.id}">Rejected Listings</button><button class="kz-button" type="button" data-action="resolve-mapping" data-record-id="${selected.id}">Resolve Mapping</button></div><h3 style="margin-top:10px">Sync history</h3><ul class="kz-timeline-list"><li><b>${selected.lastSync} · Inventory sync</b>${selected.inventorySync}</li><li><b>10:30 AM · Order import</b>${selected.orderSync}</li><li><b>10:15 AM · Listing feed</b>${selected.feed}</li></ul></div>`;
  workspace.innerHTML = pageHeader('Marketplaces · 20+', 'Centralized feeds, listings, pricing, inventory, orders, fulfillment, customer issues, and settlement reconciliation across external channels.', `<button class="kz-button kz-button--primary" type="button" data-action="sync-all-channels">Run All Channel Syncs</button>`) + summaryStrip([
    { label: 'Connected Channels', value: '20+', note: 'Verified scale' }, { label: 'Representative Rows', value: state.marketplaces.length },
    { label: 'Feed Exceptions', value: state.marketplaces.filter((item) => item.feed === 'Exception').length }, { label: 'Inventory Delays', value: state.marketplaces.filter((item) => item.inventorySync === 'Delayed').length },
    { label: 'Settlement Review', value: state.marketplaces.filter((item) => item.settlement === 'Review').length }, { label: 'Business Models', value: 'DTC + B2B' }
  ]) + `<div class="kz-grid kz-grid--two"><div>${toolbar('marketplaces', { placeholder: 'Channel, model, region, state' })}${table}</div>${panel('Channel Inspector', inspector, illustrativeBadge(), 'kz-inspector')}</div>`;
}

function renderVendors() {
  const query = getFilter('vendors');
  const rows = state.vendors.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'name', label: 'Vendor', render: (row) => `<strong>${row.name}</strong>` }, { key: 'contact', label: 'Contact' }, { key: 'terms', label: 'Terms' },
    { key: 'moq', label: 'MOQ', numeric: true }, { key: 'leadTime', label: 'Lead Time', numeric: true, render: (row) => `${row.leadTime} days` },
    { key: 'openPOs', label: 'Open POs', numeric: true }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const table = renderTable({ id: 'vendors', label: 'Vendors', columns, rows, minWidth: 850, actions: (row) => `${actionButton('Open', 'select-vendor', 'vendor', row.id)}${actionButton('Create PO', 'create-po-vendor', 'vendor', row.id, true)}` });
  const selected = state.vendors.find((item) => item.id === state.ui.selectedVendor) || state.vendors[0];
  const purchaseHistory = state.purchaseOrders.filter((po) => po.vendorId === selected.id);
  const inspector = `<div class="kz-inspector-body"><h3>${escapeHtml(selected.name)}</h3><p>${escapeHtml(selected.categories)}</p><dl class="kz-detail-list"><div><dt>Contact</dt><dd>${escapeHtml(selected.contact)} · ${escapeHtml(selected.email)}</dd></div><div><dt>Terms</dt><dd>${escapeHtml(selected.terms)}</dd></div><div><dt>MOQ</dt><dd>${selected.moq} units</dd></div><div><dt>Lead time</dt><dd>${selected.leadTime} days</dd></div><div><dt>Products</dt><dd>${state.catalog.filter((item) => purchaseHistory.some((po) => po.sku === item.sku)).map((item) => item.product).join(', ') || 'Category assortment'}</dd></div><div><dt>Purchase history</dt><dd>${purchaseHistory.length} representative POs</dd></div><div><dt>Open POs</dt><dd>${purchaseHistory.filter((po) => !['Complete', 'Received'].includes(po.status)).map((po) => po.id).join(', ') || 'None'}</dd></div></dl><div class="kz-inspector-actions"><button class="kz-button kz-button--primary" type="button" data-action="create-po-vendor" data-record-id="${selected.id}">Create PO</button><button class="kz-button" type="button" data-action="vendor-terms-form" data-record-id="${selected.id}">Update Terms</button><button class="kz-button" type="button" data-action="vendor-lead-form" data-record-id="${selected.id}">Update Lead Time</button><button class="kz-button" type="button" data-action="vendor-note-form" data-record-id="${selected.id}">Add Note</button></div><h3 style="margin-top:10px">Notes</h3><ul class="kz-timeline-list">${selected.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>`;
  workspace.innerHTML = pageHeader('Vendors', 'Vendor directory, contacts, pricing terms, minimum orders, lead times, products, purchase history, and performance context.', `<button class="kz-button kz-button--primary" type="button" data-action="create-po-form">Create Purchase Order</button>`) + summaryStrip([
    { label: 'Active Vendors', value: state.vendors.filter((item) => item.status === 'Active').length }, { label: 'Open POs', value: state.purchaseOrders.filter((item) => !['Complete', 'Received'].includes(item.status)).length },
    { label: 'Overdue Shipments', value: state.purchaseOrders.filter((item) => item.status === 'Overdue').length }, { label: 'MOQ Exceptions', value: state.purchaseOrders.filter((po) => po.quantity < (state.vendors.find((vendor) => vendor.id === po.vendorId)?.moq || 0)).length },
    { label: 'Categories', value: '10+', note: 'Representative assortment' }, { label: 'JIT Vendors', value: state.purchaseOrders.filter((item) => item.method.includes('JIT')).length }
  ]) + `<div class="kz-grid kz-grid--two"><div>${toolbar('vendors', { placeholder: 'Vendor, contact, category, status' })}${table}</div>${panel('Vendor Detail', inspector, illustrativeBadge(), 'kz-inspector')}</div>`;
}

function renderCustomerService() {
  const query = getFilter('customer-service');
  const rows = state.cases.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'id', label: 'Case', render: (row) => `<strong>${row.id}</strong>` }, { key: 'customer', label: 'Customer' }, { key: 'channel', label: 'Channel' }, { key: 'orderId', label: 'Order' },
    { key: 'issue', label: 'Issue' }, { key: 'priority', label: 'Priority', render: (row) => `<span class="kz-priority--${row.priority.toLowerCase()}">${row.priority}</span>` },
    { key: 'age', label: 'Age' }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const table = renderTable({ id: 'customer-service', label: 'Customer service cases', columns, rows, minWidth: 1000, actions: (row) => `${actionButton('Open', 'select-case', 'case', row.id)}${row.status !== 'Resolved' ? actionButton('Resolve', 'case-resolve', 'case', row.id, true) : actionButton('Reopen', 'case-reopen', 'case', row.id)}` });
  const selected = state.cases.find((item) => item.id === state.ui.selectedCase) || state.cases[0];
  const order = state.orders.find((item) => item.id === selected.orderId);
  const linkedReturn = state.returns.find((item) => item.orderId === selected.orderId);
  const inspector = `<div class="kz-inspector-body"><h3>${escapeHtml(selected.id)} · ${escapeHtml(selected.issue)}</h3><p>${escapeHtml(selected.customer)} · ${escapeHtml(selected.channel)}</p><dl class="kz-detail-list"><div><dt>Linked order</dt><dd>${escapeHtml(selected.orderId)}</dd></div><div><dt>Shipment</dt><dd>${order ? escapeHtml(order.fulfillment) : 'Archived order'}</dd></div><div><dt>Tracking</dt><dd>${escapeHtml(selected.tracking || order?.tracking || 'Pending')}</dd></div><div><dt>Return state</dt><dd>${linkedReturn ? `${linkedReturn.id} · ${linkedReturn.status}` : 'No return'}</dd></div><div><dt>Priority</dt><dd>${escapeHtml(selected.priority)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(selected.status)}</dd></div></dl><div class="kz-inspector-actions"><button class="kz-button" type="button" data-action="case-note-form" data-record-id="${selected.id}">Add Note</button><button class="kz-button" type="button" data-action="case-reply" data-record-id="${selected.id}">Reply</button><button class="kz-button" type="button" data-action="case-escalate" data-record-id="${selected.id}">Escalate</button><button class="kz-button" type="button" data-action="case-create-return" data-record-id="${selected.id}">Create Return</button><button class="kz-button kz-button--primary" type="button" data-action="${selected.status === 'Resolved' ? 'case-reopen' : 'case-resolve'}" data-record-id="${selected.id}">${selected.status === 'Resolved' ? 'Reopen' : 'Resolve'}</button></div><h3 style="margin-top:10px">Timeline &amp; messages</h3><ul class="kz-timeline-list">${[...selected.timeline, ...selected.notes].map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`;
  workspace.innerHTML = pageHeader('Customer Service', 'Centralized cross-channel support linking customer messages, orders, payments, shipments, returns, notes, and case history.') + summaryStrip([
    { label: 'New', value: state.cases.filter((item) => item.status === 'New').length }, { label: 'Open', value: state.cases.filter((item) => item.status === 'Open').length },
    { label: 'Waiting', value: state.cases.filter((item) => item.status === 'Waiting').length }, { label: 'Escalated', value: state.cases.filter((item) => item.status === 'Escalated').length },
    { label: 'Returns', value: state.returns.filter((item) => item.status !== 'Completed').length }, { label: 'Resolved', value: state.cases.filter((item) => item.status === 'Resolved').length }
  ]) + `<div class="kz-grid kz-grid--two"><div>${toolbar('customer-service', { placeholder: 'Case, customer, order, issue' })}${table}</div>${panel('Case Detail', inspector, illustrativeBadge(), 'kz-inspector')}</div>`;
}

function warehouseAction(task) {
  if (task.status === 'Complete') return actionButton('Open', 'open-record', 'warehouse', task.id);
  const labels = { Receiving: 'Receive Units', Putaway: 'Complete Putaway', Picking: 'Complete Pick', Packing: 'Pack & Label', Shipments: 'Carrier Handoff', 'Amazon FBA': 'Confirm Carton Labels', Exceptions: 'Resolve' };
  return `${actionButton('Open', 'open-record', 'warehouse', task.id)}${actionButton(labels[task.type] || 'Complete', 'warehouse-complete', 'warehouse', task.id, true)}`;
}
function renderWarehouse() {
  const activeTab = state.ui.warehouseTab;
  const rows = state.warehouseTasks.filter((item) => item.type === activeTab);
  const columns = [
    { key: 'id', label: 'Task', render: (row) => `<strong>${row.id}</strong>` }, { key: 'record', label: activeTab === 'Receiving' ? 'PO' : activeTab === 'Amazon FBA' ? 'Plan' : 'Order / Record' },
    { key: 'route', label: 'Route / Station' }, { key: 'itemCount', label: 'Items', numeric: true }, { key: 'weight', label: 'Weight', render: (row) => escapeHtml(row.weight || '—') },
    { key: 'service', label: 'Service', render: (row) => escapeHtml(row.service || '—') }, { key: 'label', label: 'Label', render: (row) => escapeHtml(row.label || '—') },
    { key: 'tracking', label: 'Tracking', render: (row) => escapeHtml(row.tracking || '—') }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const tabs = `<div class="kz-tabs" role="tablist">${WAREHOUSE_TABS.map((tab) => `<button type="button" role="tab" aria-selected="${tab === activeTab}" class="${tab === activeTab ? 'is-active' : ''}" data-subtab="warehouse" data-value="${tab}">${tab}</button>`).join('')}</div>`;
  const table = renderTable({ id: `warehouse-${activeTab}`, label: `${activeTab} tasks`, columns, rows, pageSize: 8, minWidth: 1050, actions: warehouseAction });
  workspace.innerHTML = pageHeader('Warehouse', 'Physical receiving, putaway, picking, packing, shipment creation, carrier handoff, Amazon FBA, and exception work.', `<button type="button" class="kz-button" data-action="export" data-export="warehouse">Export Queue</button>`) + summaryStrip([
    { label: 'Receiving', value: state.warehouseTasks.filter((item) => item.type === 'Receiving' && item.status !== 'Complete').length }, { label: 'Putaway', value: state.warehouseTasks.filter((item) => item.type === 'Putaway' && item.status !== 'Complete').length },
    { label: 'Picking', value: state.warehouseTasks.filter((item) => item.type === 'Picking' && item.status !== 'Complete').length }, { label: 'Packing', value: state.warehouseTasks.filter((item) => item.type === 'Packing' && item.status !== 'Complete').length },
    { label: 'Shipments', value: state.warehouseTasks.filter((item) => item.type === 'Shipments' && item.status !== 'Complete').length }, { label: 'Exceptions', value: state.warehouseTasks.filter((item) => item.type === 'Exceptions' && item.status !== 'Complete').length }
  ]) + tabs + table;
}

function returnAction(item) {
  const map = { Requested: ['Approve', 'return-approve'], 'Awaiting Arrival': ['Receive', 'return-receive'], Received: ['Inspect', 'return-inspect-form'], Inspection: item.disposition === 'Restock' ? ['Restock', 'return-restock'] : ['Mark Damaged', 'return-damaged'], 'Refund Pending': ['Complete', 'return-complete'] };
  const next = map[item.status];
  return `${actionButton('Open', 'open-record', 'return', item.id)}${next ? actionButton(next[0], next[1], 'return', item.id, true) : ''}`;
}
function renderReturns() {
  const query = getFilter('returns');
  const rows = state.returns.filter((item) => matchesQuery(item, query));
  const columns = [
    { key: 'id', label: 'RMA', render: (row) => `<strong>${row.id}</strong>` }, { key: 'orderId', label: 'Order' }, { key: 'customer', label: 'Customer' }, { key: 'item', label: 'Item' },
    { key: 'reason', label: 'Reason' }, { key: 'condition', label: 'Condition' }, { key: 'disposition', label: 'Disposition' },
    { key: 'refund', label: 'Refund', numeric: true, render: (row) => money(row.refund) }, { key: 'status', label: 'Status', render: (row) => status(row.status) }
  ];
  const table = renderTable({ id: 'returns', label: 'Returns and RMAs', columns, rows, minWidth: 1120, actions: returnAction });
  workspace.innerHTML = pageHeader('Returns', 'Customer and marketplace returns linking RMAs, inspection, refunds, replacements, stock disposition, damage, and vendor returns.') + summaryStrip([
    { label: 'Requested', value: state.returns.filter((item) => item.status === 'Requested').length }, { label: 'Awaiting Arrival', value: state.returns.filter((item) => item.status === 'Awaiting Arrival').length },
    { label: 'Received', value: state.returns.filter((item) => item.status === 'Received').length }, { label: 'Inspection', value: state.returns.filter((item) => item.status === 'Inspection').length },
    { label: 'Refund Pending', value: state.returns.filter((item) => item.status === 'Refund Pending').length }, { label: 'Completed', value: state.returns.filter((item) => item.status === 'Completed').length }
  ]) + toolbar('returns', { placeholder: 'RMA, order, customer, item, status' }) + table;
}

function reportData() {
  return {
    Inventory: { values: [42, 48, 45, 58, 64, 61, 72, 78], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Inventory velocity','78','Index'],['Aging over threshold','4','SKUs'],['Projected stockouts',String(state.inventory.filter((item) => ['Low Stock','Stockout'].includes(item.status)).length),'SKUs'],['Incoming units',String(state.inventory.reduce((total,item)=>total+item.incoming,0)),'Units']] },
    'Sales Trends': { values: [38, 44, 51, 47, 62, 68, 73, 81], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Order trend','81','Index'],['Direct channels','6','Channels'],['Wholesale accounts','Active','State'],['Late orders',String(state.orders.filter((item) => item.status === 'Exception').length),'Orders']] },
    'Product Trajectory': { values: [29, 33, 41, 55, 63, 76, 70, 84], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Fast-rising products','3','Products'],['Replenishment candidates',String(state.inventory.filter((item) => item.status !== 'Healthy').length),'SKUs'],['Promotion candidates','2','Products'],['Data exceptions',String(state.catalog.filter((item) => !['Healthy','Hidden'].includes(item.health)).length),'Records']] },
    'Marketplace Health': { values: [82, 88, 79, 92, 86, 90, 77, 94], labels: ['AMZ','WMT','EBY','TGT','WAY','OVR','SEARS','DTC'], rows: [['Healthy feeds',String(state.marketplaces.filter((item) => item.feed === 'Healthy').length),'Channels'],['Feed exceptions',String(state.marketplaces.filter((item) => item.feed === 'Exception').length),'Channels'],['Settlement review',String(state.marketplaces.filter((item) => item.settlement === 'Review').length),'Channels'],['Listing errors',String(state.marketplaces.reduce((total,item)=>total+item.errors,0)),'Errors']] },
    Finance: { values: [55, 62, 48, 71, 66, 74, 69, 82], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Settlement exceptions',String(state.marketplaces.filter((item) => item.settlement === 'Review').length),'Records'],['AP review','2','Vendors'],['AR review','1','Wholesale account'],['Margin visibility','Enabled','State']] },
    'Customer Service': { values: [68, 59, 52, 63, 47, 44, 38, 31], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Open cases',String(state.cases.filter((item) => !['Resolved','Closed'].includes(item.status)).length),'Cases'],['Escalations',String(state.cases.filter((item) => item.status === 'Escalated').length),'Cases'],['Returns open',String(state.returns.filter((item) => item.status !== 'Completed').length),'RMAs'],['Resolved',String(state.cases.filter((item) => item.status === 'Resolved').length),'Cases']] },
    Warehouse: { values: [34, 49, 58, 61, 72, 67, 78, 85], labels: ['W1','W2','W3','W4','W5','W6','W7','W8'], rows: [['Open work',String(state.warehouseTasks.filter((item) => item.status !== 'Complete').length),'Tasks'],['Receiving queue',String(state.warehouseTasks.filter((item) => item.type === 'Receiving' && item.status !== 'Complete').length),'Tasks'],['Shipment exceptions',String(state.warehouseTasks.filter((item) => item.type === 'Exceptions' && item.status !== 'Complete').length),'Tasks'],['FBA plans',String(state.warehouseTasks.filter((item) => item.type === 'Amazon FBA').length),'Plans']] }
  };
}
function renderReports() {
  const active = state.ui.reportTab;
  const report = reportData()[active];
  const tabs = `<div class="kz-tabs" role="tablist">${REPORT_TABS.map((tab) => `<button type="button" role="tab" aria-selected="${tab === active}" class="${tab === active ? 'is-active' : ''}" data-subtab="reports" data-value="${tab}">${tab}</button>`).join('')}</div>`;
  const chart = `<div class="kz-report-chart" role="img" aria-label="Illustrative ${escapeHtml(active)} operational chart"><div class="kz-bars">${report.values.map((value) => `<i style="--value:${value}%"><span>${value}</span></i>`).join('')}</div><div class="kz-chart-labels">${report.labels.map((label) => `<span>${label}</span>`).join('')}</div></div>`;
  const metrics = `<div class="kz-table-wrap"><table class="kz-table" style="min-width:420px"><thead><tr><th>Metric</th><th>Value</th><th>Unit / State</th></tr></thead><tbody>${report.rows.map((row) => `<tr><td><strong>${escapeHtml(row[0])}</strong></td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`).join('')}</tbody></table></div>`;
  workspace.innerHTML = pageHeader('Reports & Intelligence', 'Compact operational analysis for inventory, sales, products, channels, finance, customer service, and warehouse decisions.', `<button type="button" class="kz-button" data-action="export" data-export="reports">Export Current Report</button>`) + summaryStrip([
    { label: 'Report Area', value: active, note: 'Selected view' }, { label: 'Illustrative Index', value: report.values.at(-1), note: 'Not historical performance' },
    { label: 'Periods', value: report.values.length }, { label: 'Metrics', value: report.rows.length }, { label: 'Scheduled Reports', value: 7 }, { label: 'Last Refresh', value: state.lastSync }
  ]) + tabs + `<div class="kz-grid kz-grid--two">${panel(`${active} Chart`, chart, illustrativeBadge())}${panel('Operational Metrics', metrics, illustrativeBadge())}</div>`;
}

function settingsTable(tab) {
  if (tab === 'Users & Roles') return renderTable({ id: 'settings-users', label: 'Users and roles', rows: state.users, pageSize: 10, minWidth: 650, columns: [{ key:'name',label:'User',render:(row)=>`<strong>${row.name}</strong>`},{key:'role',label:'Role'},{key:'modules',label:'Module Access'},{key:'status',label:'Status',render:(row)=>status(row.status)}], actions: (row) => actionButton('Edit Role','edit-user-role','user',row.id) });
  if (tab === 'Integrations') return renderTable({ id: 'settings-integrations', label: 'Integrations', rows: state.integrations, pageSize: 10, minWidth: 680, columns: [{key:'name',label:'Integration',render:(row)=>`<strong>${row.name}</strong>`},{key:'type',label:'Type'},{key:'status',label:'Status',render:(row)=>status(row.status)},{key:'lastRun',label:'Last Run'}], actions:(row)=>actionButton('Run Now','run-integration','integration',row.id,true) });
  if (tab === 'Warehouses') return `<div class="kz-table-wrap"><table class="kz-table"><thead><tr><th>Warehouse</th><th>Locations</th><th>Receiving</th><th>Picking</th><th>Status</th><th>Action</th></tr></thead><tbody><tr><td><strong>Main Warehouse</strong></td><td>A-01 through F-14</td><td>3 docks</td><td>Wave routing</td><td>${status('Active')}</td><td>${actionButton('Update','warehouse-config','warehouse-config','MAIN')}</td></tr><tr><td><strong>Amazon FBA Staging</strong></td><td>FBA-1 through FBA-4</td><td>Carton staging</td><td>FBA plans</td><td>${status('Active')}</td><td>${actionButton('Update','warehouse-config','warehouse-config','FBA')}</td></tr></tbody></table></div>`;
  if (tab === 'Shipping') return `<div class="kz-table-wrap"><table class="kz-table"><thead><tr><th>Carrier / Service</th><th>Use</th><th>Tracking</th><th>Label</th><th>Status</th><th>Action</th></tr></thead><tbody>${[['UPS Ground','Direct + wholesale'],['FedEx Home','Direct'],['USPS Priority','Direct'],['LTL Freight','FBA + wholesale']].map((row,index)=>`<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>Automatic</td><td>Integrated</td><td>${status('Active')}</td><td>${actionButton('Test','test-shipping','shipping',String(index))}</td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'Marketplace Rules') return `<div class="kz-table-wrap"><table class="kz-table"><thead><tr><th>Rule</th><th>Scope</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>${[['Price floor','All marketplaces','1'],['Reserve safety stock','Direct channels','2'],['Suppress zero inventory','All channels','3'],['FBA routing','Amazon FBA','4']].map((row,index)=>`<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${status('Active')}</td><td>${actionButton('Run Rule','run-marketplace-rule','rule',String(index))}</td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'Automation') return `<ul class="kz-rule-list">${state.automation.map((rule) => `<li><div><b>${escapeHtml(rule.name)}</b><small>${escapeHtml(rule.trigger)}</small></div><button type="button" class="kz-switch ${rule.enabled ? 'is-on' : ''}" data-action="toggle-automation" data-record-id="${rule.id}" aria-pressed="${rule.enabled}" aria-label="${rule.enabled ? 'Disable' : 'Enable'} ${escapeHtml(rule.name)}"></button></li>`).join('')}</ul>`;
  if (tab === 'Notifications') return `<ul class="kz-rule-list">${state.notifications.map((rule) => `<li><div><b>${escapeHtml(rule.name)}</b><small>${escapeHtml(rule.channel)}</small></div><button type="button" class="kz-switch ${rule.enabled ? 'is-on' : ''}" data-action="toggle-notification" data-record-id="${rule.id}" aria-pressed="${rule.enabled}" aria-label="${rule.enabled ? 'Disable' : 'Enable'} ${escapeHtml(rule.name)}"></button></li>`).join('')}</ul>`;
  if (tab === 'Audit History') return renderTable({ id:'settings-audit',label:'Audit history',rows:state.audit,pageSize:10,minWidth:760,columns:[{key:'time',label:'Time'},{key:'user',label:'User'},{key:'module',label:'Module'},{key:'action',label:'Action'},{key:'record',label:'Record'},{key:'result',label:'Result',render:(row)=>status(row.result)}] });
  return `<div class="kz-inspector-body"><h3>Seeded Demo Controls</h3><p>The demo store is versioned and persists locally. Reset restores every order, PO, inventory record, listing, task, case, return, rule, notification, and audit entry to the deterministic starting state.</p><dl class="kz-detail-list"><div><dt>Storage key</dt><dd>${STORAGE_KEY}</dd></div><div><dt>State version</dt><dd>${state.version}</dd></div><div><dt>Active module</dt><dd>${moduleName(state.ui.activeModule)}</dd></div><div><dt>Audit entries</dt><dd>${state.audit.length}</dd></div></dl><div class="kz-inspector-actions"><button type="button" class="kz-button kz-button--danger" data-action="reset-form">Reset Demo Data</button><button type="button" class="kz-button" data-action="export" data-export="audit">Export Audit History</button></div></div>`;
}
function renderSettings() {
  const active = state.ui.settingsTab;
  const tabs = `<div class="kz-tabs" role="tablist">${SETTINGS_TABS.map((tab) => `<button type="button" role="tab" aria-selected="${tab === active}" class="${tab === active ? 'is-active' : ''}" data-subtab="settings" data-value="${tab}">${tab}</button>`).join('')}</div>`;
  workspace.innerHTML = pageHeader('Settings / Administration', 'Users, permissions, integrations, warehouses, shipping, marketplace rules, automation, notifications, audit history, and demo controls.') + summaryStrip([
    { label: 'Users', value: state.users.length }, { label: 'Integrations', value: state.integrations.length }, { label: 'Warehouses', value: 2 },
    { label: 'Automation Rules', value: state.automation.filter((item) => item.enabled).length }, { label: 'Notifications', value: state.notifications.filter((item) => item.enabled).length }, { label: 'Audit Entries', value: state.audit.length }
  ]) + tabs + panel(active, settingsTable(active), illustrativeBadge());
}

function renderActiveModule() {
  updateNavCounts();
  document.querySelectorAll('[data-kz-tab]').forEach((button) => {
    const active = button.dataset.kzTab === state.ui.activeModule;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  document.querySelector('[data-module-breadcrumb]').textContent = moduleName(state.ui.activeModule);
  const renderers = {
    dashboard: renderDashboard, orders: renderOrders, 'purchase-orders': renderPurchaseOrders, catalog: renderCatalog,
    inventory: renderInventory, marketplaces: renderMarketplaces, vendors: renderVendors, 'customer-service': renderCustomerService,
    warehouse: renderWarehouse, returns: renderReturns, reports: renderReports, settings: renderSettings
  };
  (renderers[state.ui.activeModule] || renderDashboard)();
  document.querySelector('[data-last-sync]').textContent = state.lastSync;
}

function setModule(module, { notify = true, history = 'push', focusRecord = '' } = {}) {
  const normalized = module === 'administration' ? 'settings' : module;
  if (!MODULES.includes(normalized)) return;
  state.ui.activeModule = normalized;
  state.ui.pages[normalized] = state.ui.pages[normalized] || 1;
  saveState();
  renderActiveModule();
  workspace.focus?.({ preventScroll: true });
  if (notify && window.parent !== window) window.parent.postMessage({ type: 'kevinception:module', module: normalized, history }, window.location.origin);
  else if (notify) {
    const params = new URLSearchParams(window.location.search);
    params.set('module', normalized);
    window.history[history === 'replace' ? 'replaceState' : 'pushState']({ module: normalized }, '', `${window.location.pathname}?${params.toString()}`);
  }
  if (focusRecord) window.setTimeout(() => openAnyRecord(focusRecord), 0);
  track('stealstreet_module_opened', { module: normalized });
}

function openDialog(name) {
  const dialog = document.querySelector(`[data-dialog="${name}"]`);
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
}
function closeDialog(dialog) { if (!dialog) return; if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
function openForm({ kicker = 'Update record', title, body, submitLabel = 'Save', submitAction, recordId = '', recordType = '' }) {
  recordDialog.querySelector('[data-dialog-kicker]').textContent = kicker;
  recordDialog.querySelector('[data-dialog-title]').textContent = title;
  recordDialog.querySelector('[data-dialog-body]').innerHTML = body;
  recordDialog.querySelector('[data-dialog-actions]').innerHTML = `<button type="button" data-dialog-close>Cancel</button><button type="button" class="kz-button--primary" data-action="${submitAction}" data-record-id="${escapeHtml(recordId)}" data-record-type="${escapeHtml(recordType)}">${escapeHtml(submitLabel)}</button>`;
  openDialog('record');
  window.setTimeout(() => recordDialog.querySelector('input, select, textarea')?.focus(), 0);
}
function details(entries) { return `<dl class="kz-detail-list">${entries.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${value}</dd></div>`).join('')}</dl>`; }
function showRecord({ kicker, title, body, actions = '' }) {
  recordDialog.querySelector('[data-dialog-kicker]').textContent = kicker;
  recordDialog.querySelector('[data-dialog-title]').textContent = title;
  recordDialog.querySelector('[data-dialog-body]').innerHTML = body;
  recordDialog.querySelector('[data-dialog-actions]').innerHTML = `<button type="button" data-dialog-close>Close</button>${actions}`;
  openDialog('record');
}
function openRecord(type, id) {
  if (type === 'order') {
    const item = state.orders.find((row) => row.id === id); if (!item) return;
    const returns = state.returns.filter((row) => row.orderId === id);
    const nextLabels = { 'Ready to Pick': 'Mark Picked', Picked: 'Mark Packed', Packed: 'Mark Shipped', Shipped: 'Complete', Exception: 'Resolve Exception' };
    showRecord({ kicker: 'Order detail', title: item.id, body: details([['Customer',escapeHtml(item.customer)],['Channel',escapeHtml(item.channel)],['Items',`${item.items} · ${escapeHtml(item.itemNames.join(', '))}`],['Payment',status(item.payment)],['Fulfillment',escapeHtml(item.fulfillment)],['Shipment',escapeHtml(item.status)],['Tracking',escapeHtml(item.tracking || 'Pending')],['Returns',returns.length ? returns.map((row)=>`${row.id} · ${row.status}`).join('<br>') : 'None'],['Notes',escapeHtml(item.notes || 'No notes')]]) + `<h3>Customer / order history</h3><ul class="kz-timeline-list">${item.timeline.map((entry)=>`<li>${escapeHtml(entry)}</li>`).join('')}</ul>`, actions: nextLabels[item.status] ? actionButton(nextLabels[item.status],'advance-order','order',item.id,true) : '' });
    return;
  }
  if (type === 'po') {
    const item = state.purchaseOrders.find((row) => row.id === id); if (!item) return;
    showRecord({ kicker:'Purchase order detail',title:item.id,body:details([['Vendor',escapeHtml(item.vendor)],['Method',escapeHtml(item.method)],['Order date',escapeHtml(item.orderDate)],['Expected date',escapeHtml(item.expectedDate)],['SKU',escapeHtml(item.sku)],['Quantity',number(item.quantity)],['Received',number(item.received)],['Damaged',number(item.damaged)],['Cost',money(item.cost)],['Receiving location',escapeHtml(item.location)],['Status',status(item.status)]]),actions:`${!['Complete','Received'].includes(item.status)?actionButton('Receive Units','receive-po-form','po',item.id,true):''}${actionButton('Record Damage','damage-po-form','po',item.id)}${actionButton('Update Expected Date','po-date-form','po',item.id)}${actionButton('Mark Complete','complete-po','po',item.id)}` });
    return;
  }
  if (type === 'catalog') {
    const item = state.catalog.find((row) => row.sku === id); if (!item) return;
    const inv = state.inventory.find((row)=>row.sku===id);
    const margin = item.price ? Math.round(((item.price-item.cost)/item.price)*100) : 0;
    showRecord({ kicker:'Catalog record',title:item.sku,body:`<h3>${storyProduct(item.product, item.sku)}</h3>${details([['UPC',escapeHtml(item.upc)],['Attributes',`${item.attributes} fields`],['Media',`${item.media} assets`],['Taxonomy',escapeHtml(item.category)],['Cost',money(item.cost)],['Margin',`${margin}%`],['Price',money(item.price)],['Available',number(inv?available(inv):0)],['Listings',number(item.listings)],['Marketplace mappings',escapeHtml(item.mappings)],['Data health',status(item.health)]])}<h3>Audit history</h3><ul class="kz-timeline-list">${item.audit.map((entry)=>`<li>${escapeHtml(entry)}</li>`).join('')}</ul>`,actions:`${actionButton('Update Pricing','catalog-price-one','catalog',item.sku,true)}${actionButton('Edit Taxonomy','catalog-taxonomy-one','catalog',item.sku)}${['Rejected','Needs Taxonomy'].includes(item.health)?actionButton('Fix Listing','fix-listing','catalog',item.sku):''}` });
    return;
  }
  if (type === 'inventory') {
    const item=state.inventory.find((row)=>row.sku===id); if(!item)return;
    const po=state.purchaseOrders.find((row)=>row.sku===id&&!['Complete','Received'].includes(row.status));
    showRecord({kicker:'Inventory record',title:item.sku,body:`<h3>${escapeHtml(item.product)}</h3>${details([['Location',escapeHtml(item.location)],['On hand',number(item.onHand)],['Allocated',number(item.allocated)],['Available',number(available(item))],['Incoming',number(item.incoming)],['Damaged',number(item.damaged)],['Reorder point',number(item.reorderPoint)],['Status',status(item.status)],['Linked PO',po?escapeHtml(po.id):'None']])}`,actions:`${actionButton('Adjust Quantity','adjust-stock-form','inventory',item.sku,true)}${actionButton('Transfer Stock','transfer-one-form','inventory',item.sku)}${actionButton('Create Reorder','reorder-stock','inventory',item.sku)}${po?actionButton('Open Linked PO','open-record','po',po.id):''}`});
    return;
  }
  if (type === 'warehouse') {
    const item=state.warehouseTasks.find((row)=>row.id===id); if(!item)return;
    showRecord({kicker:`Warehouse · ${item.type}`,title:item.id,body:details([['Record',escapeHtml(item.record)],['Route / station',escapeHtml(item.route)],['Item count',number(item.itemCount)],['Weight',escapeHtml(item.weight||'Pending')],['Shipping service',escapeHtml(item.service||'Pending')],['Label',escapeHtml(item.label||'Pending')],['Tracking',escapeHtml(item.tracking||'Pending')],['Exception / note',escapeHtml(item.note)],['Status',status(item.status)]]),actions:item.status!=='Complete'?warehouseAction(item):''});
    return;
  }
  if (type === 'return') {
    const item=state.returns.find((row)=>row.id===id); if(!item)return;
    showRecord({kicker:'Return / RMA detail',title:item.id,body:details([['Order',escapeHtml(item.orderId)],['Customer',escapeHtml(item.customer)],['SKU',escapeHtml(item.sku)],['Item',escapeHtml(item.item)],['Quantity',number(item.quantity)],['Reason',escapeHtml(item.reason)],['Condition',escapeHtml(item.condition)],['Disposition',escapeHtml(item.disposition)],['Refund',money(item.refund)],['Status',status(item.status)]]),actions:returnAction(item)});
  }
}
function openAnyRecord(id) {
  if (state.ui.activeModule === 'inventory' && state.inventory.some((item)=>item.sku===id)) return openRecord('inventory',id);
  if (state.ui.activeModule === 'catalog' && state.catalog.some((item)=>item.sku===id)) return openRecord('catalog',id);
  const channel = state.marketplaces.find((item)=>item.id===id);
  if (channel) { state.ui.selectedChannel=channel.id; saveState(); renderActiveModule(); return; }
  const serviceCase = state.cases.find((item)=>item.id===id);
  if (serviceCase) { state.ui.selectedCase=serviceCase.id; saveState(); renderActiveModule(); return; }
  if (id === 'Finance') { state.ui.reportTab='Finance'; saveState(); renderActiveModule(); return; }
  if (state.orders.some((item)=>item.id===id)) return openRecord('order',id);
  if (state.purchaseOrders.some((item)=>item.id===id)) return openRecord('po',id);
  if (state.catalog.some((item)=>item.sku===id)) return openRecord('catalog',id);
  if (state.inventory.some((item)=>item.sku===id)) return openRecord('inventory',id);
  if (state.returns.some((item)=>item.id===id)) return openRecord('return',id);
  if (state.warehouseTasks.some((item)=>item.id===id)) return openRecord('warehouse',id);
}

function advanceOrder(id) {
  const item=state.orders.find((row)=>row.id===id); if(!item)return;
  const transitions={Exception:'Ready to Pick','Ready to Pick':'Picked',Picked:'Packed',Packed:'Shipped',Shipped:'Complete'};
  const next=transitions[item.status]; if(!next)return;
  const previous=item.status; item.status=next;
  if(previous==='Exception'){item.payment='Authorized'; const linked=state.cases.find((row)=>row.orderId===id);if(linked){linked.status='Open';linked.timeline.push(`${currentTime()} · Order exception resolved`);}}
  if(next==='Picked'){const task=state.warehouseTasks.find((row)=>row.record===id&&row.type==='Picking');if(task)task.status='Complete';let pack=state.warehouseTasks.find((row)=>row.record===id&&row.type==='Packing');if(!pack){pack={id:`WH-K-${310+state.warehouseTasks.length}`,type:'Packing',record:id,route:'Station 1',itemCount:item.items,weight:'',service:'UPS Ground',label:'Pending',tracking:'',status:'Ready',note:'Verify contents and address.'};state.warehouseTasks.push(pack);}}
  if(next==='Packed'){const task=state.warehouseTasks.find((row)=>row.record===id&&row.type==='Packing');if(task){task.status='Complete';task.label='Printed';}if(!state.warehouseTasks.some((row)=>row.record===id&&row.type==='Shipments'))state.warehouseTasks.push({id:`WH-S-${410+state.warehouseTasks.length}`,type:'Shipments',record:id,route:'Carrier lane 1',itemCount:item.items,weight:'Pending',service:'UPS Ground',label:'Printed',tracking:'',status:'Ready',note:'Awaiting carrier handoff.'});}
  if(next==='Shipped'){item.tracking=`1Z8042${id.replace(/\D/g,'').slice(-5)}`;const task=state.warehouseTasks.find((row)=>row.record===id&&row.type==='Shipments');if(task){task.status='Complete';task.tracking=item.tracking;}const channel=state.marketplaces.find((row)=>row.name===item.channel);if(channel){channel.orderSync='Current';channel.lastSync=currentTime();}state.cases.filter((row)=>row.orderId===id).forEach((row)=>{row.tracking=item.tracking;row.timeline.push(`${currentTime()} · Shipment posted · ${item.tracking}`);});}
  item.timeline.push(`${currentTime()} · ${next}`);addAudit('Orders',`${previous} → ${next}`,id,next);closeDialog(recordDialog);commit();interfacePulse(next==='Shipped'?`${id} shipped. The box is now someone else’s responsibility.`:`${id} updated to ${next}. Connected warehouse and customer records were refreshed.`);
}

function receivePO(id, quantity, damaged=0) {
  const po=state.purchaseOrders.find((row)=>row.id===id);if(!po)return;
  const remaining=Math.max(0,po.quantity-po.received);const received=Math.max(0,Math.min(remaining,Number(quantity)||0));const damage=Math.max(0,Math.min(received,Number(damaged)||0));if(!received){toast('Enter a receiving quantity greater than zero.');return;}
  po.received+=received;po.damaged+=damage;po.status=po.received>=po.quantity?'Received':'Partial';
  const inv=state.inventory.find((row)=>row.sku===po.sku);if(inv){inv.onHand+=received-damage;inv.damaged+=damage;inv.incoming=Math.max(0,inv.incoming-received);updateInventoryStatus(inv);}
  const receiving=state.warehouseTasks.find((row)=>row.record===id&&row.type==='Receiving');if(receiving)receiving.status=po.received>=po.quantity?'Complete':'Partial';
  if(!state.warehouseTasks.some((row)=>row.record===id&&row.type==='Putaway'))state.warehouseTasks.push({id:`WH-U-${110+state.warehouseTasks.length}`,type:'Putaway',record:id,route:`Dock → ${po.location}`,itemCount:received-damage,weight:'',service:'',label:'',tracking:'',status:'Ready',note:damage?`${damage} damaged units quarantined.`:'Assign received inventory to location.'});
  addAudit('Purchase Orders','Received units',id,`${received-damage} stocked · ${damage} damaged`);closeDialog(recordDialog);commit(`${id}: ${received} units received. Inventory and warehouse queues updated.`);
}
function createReorder(sku, vendorId='', quantity=0) {
  const inv=state.inventory.find((row)=>row.sku===sku);if(!inv)return;
  const existing=state.purchaseOrders.find((row)=>row.sku===sku&&!['Complete','Received'].includes(row.status));if(existing){setModule('purchase-orders');window.setTimeout(()=>openRecord('po',existing.id),0);toast(`${existing.id} is already open for ${sku}.`);return;}
  const vendor=state.vendors.find((row)=>row.id===vendorId)||state.vendors[0];const qty=Number(quantity)||Math.max(vendor.moq,inv.reorderPoint*2);const id=`PO-${++state.sequence.po}`;
  const po={id,vendorId:vendor.id,vendor:vendor.name,method:'Replenishment',orderDate:'04/18/2012',expectedDate:'04/25/2012',quantity:qty,received:0,damaged:0,cost:qty*(state.catalog.find((row)=>row.sku===sku)?.cost||10),status:'Open',sku,location:inv.location};state.purchaseOrders.unshift(po);inv.incoming+=qty;vendor.openPOs+=1;state.warehouseTasks.unshift({id:`WH-R-${120+state.warehouseTasks.length}`,type:'Receiving',record:id,route:`Expected → ${inv.location}`,itemCount:qty,weight:'',service:'',label:'',tracking:'',status:'Expected',note:'Created from inventory replenishment.'});addAudit('Inventory','Created reorder',sku,id);commit(`${id} created. Incoming stock and warehouse receiving are linked.`);
}
function fixListing(sku) {
  const item=state.catalog.find((row)=>row.sku===sku);if(!item)return;const previous=item.health;item.health='Healthy';item.category=item.category==='Office Supplies'?item.category:item.category;item.mappings=`${Math.max(1,item.listings)} / ${Math.max(1,item.listings)}`;item.updated=currentTime();item.audit.unshift(`${currentTime()} · Listing and mapping exception resolved`);
  state.marketplaces.forEach((channel)=>{if(channel.errors&&channel.rejected.some((entry)=>entry.includes(sku)||previous==='Rejected')){channel.errors=0;channel.feed='Healthy';channel.mapping='Mapped';channel.rejected=[];channel.lastSync=currentTime();}});addAudit('Catalog','Resolved listing exception',sku,'Healthy');commit(`${sku} listing fixed. Catalog health, channel feed, and dashboard exceptions updated.`);
}
function restockReturn(id) {
  const item=state.returns.find((row)=>row.id===id);if(!item)return;const inv=state.inventory.find((row)=>row.sku===item.sku);if(inv){inv.onHand+=item.quantity;updateInventoryStatus(inv);}item.disposition='Restocked';item.status='Completed';const order=state.orders.find((row)=>row.id===item.orderId);if(order)order.timeline.push(`${currentTime()} · ${id} restocked · ${item.quantity} unit(s)`);addAudit('Returns','Restocked return',id,`${item.quantity} unit(s) to inventory`);closeDialog(recordDialog);commit(`${id} restocked. Inventory and the linked order timeline were updated.`);
}
function completeWarehouseTask(id) {
  const task=state.warehouseTasks.find((row)=>row.id===id);if(!task)return;
  if(task.type==='Receiving'){const po=state.purchaseOrders.find((row)=>row.id===task.record);if(po)return openReceiveForm(po.id);}
  if(task.type==='Picking'||task.type==='Packing'||task.type==='Shipments'){const order=state.orders.find((row)=>row.id===task.record);if(order){const desired=task.type==='Picking'?'Picked':task.type==='Packing'?'Packed':'Shipped';while(order.status!==desired&&['Ready to Pick','Picked','Packed'].includes(order.status))advanceOrder(order.id);closeDialog(recordDialog);return;}}
  task.status='Complete';if(task.type==='Amazon FBA'){task.label='Confirmed';task.note='Carton labels confirmed; ready for carrier handoff.';}if(task.type==='Exceptions')task.note='Exception resolved with operator receipt.';addAudit('Warehouse',`Completed ${task.type.toLowerCase()} task`,id,task.record);closeDialog(recordDialog);commit(`${id} completed. Connected workflow state updated.`);
}

function openReceiveForm(id) { const po=state.purchaseOrders.find((row)=>row.id===id);if(!po)return;const remaining=Math.max(0,po.quantity-po.received);openForm({kicker:'Purchase order receiving',title:`Receive ${id}`,body:`<form class="kz-inline-form"><div class="kz-inline-form__row"><label>Units received<input name="quantity" type="number" min="1" max="${remaining}" value="${remaining}"></label><label>Damaged units<input name="damaged" type="number" min="0" max="${remaining}" value="0"></label></div><label>Assign location<select name="location"><option>${escapeHtml(po.location)}</option><option>QUARANTINE</option></select></label><p>${remaining} units remain open. Receiving updates the PO, inventory, warehouse work, and audit history.</p></form>`,submitLabel:'Receive Units',submitAction:'submit-receive-po',recordId:id,recordType:'po'}); }
function openStockAdjustForm(sku) { const item=state.inventory.find((row)=>row.sku===sku);if(!item)return;openForm({kicker:'Inventory adjustment',title:`Adjust ${sku}`,body:`<form class="kz-inline-form"><label>Quantity change<input name="quantity" type="number" value="1"></label><label>Reason<select name="reason"><option>Cycle count</option><option>Damage correction</option><option>Found inventory</option><option>Manual correction</option></select></label><p>Use a negative quantity to reduce on-hand stock. Every adjustment creates an audit entry.</p></form>`,submitLabel:'Record Adjustment',submitAction:'submit-stock-adjust',recordId:sku,recordType:'inventory'}); }
function openTransferForm(sku='') { const options=state.inventory.map((item)=>`<option value="${item.sku}" ${sku===item.sku?'selected':''}>${item.sku} · ${escapeHtml(item.product)}</option>`).join('');openForm({kicker:'Warehouse stock transfer',title:'Transfer Stock',body:`<form class="kz-inline-form"><label>SKU<select name="sku">${options}</select></label><div class="kz-inline-form__row"><label>Quantity<input name="quantity" type="number" min="1" value="1"></label><label>Destination<select name="location"><option>A-01</option><option>B-14</option><option>C-07</option><option>D-02</option><option>E-11</option><option>F-04</option></select></label></div></form>`,submitLabel:'Transfer',submitAction:'submit-transfer-stock',recordId:sku,recordType:'inventory'}); }
function openCreatePOForm(vendorId='') { const vendors=state.vendors.map((item)=>`<option value="${item.id}" ${vendorId===item.id?'selected':''}>${escapeHtml(item.name)}</option>`).join('');const products=state.inventory.map((item)=>`<option value="${item.sku}">${item.sku} · ${escapeHtml(item.product)}</option>`).join('');openForm({kicker:'Vendor purchasing',title:'Create Purchase Order',body:`<form class="kz-inline-form"><label>Vendor<select name="vendorId">${vendors}</select></label><label>Product / SKU<select name="sku">${products}</select></label><div class="kz-inline-form__row"><label>Quantity<input name="quantity" type="number" min="1" value="120"></label><label>Expected date<input name="expectedDate" type="text" value="04/25/2012"></label></div></form>`,submitLabel:'Create PO',submitAction:'submit-create-po',recordId:vendorId,recordType:'vendor'}); }

function exportCsv(type) {
  const sources={orders:state.orders,'purchase-orders':state.purchaseOrders,catalog:state.catalog,inventory:state.inventory,warehouse:state.warehouseTasks,audit:state.audit,reports:reportData()[state.ui.reportTab].rows};const rows=sources[type]||[];if(!rows.length){toast('No records to export.');return;}let csv='';if(Array.isArray(rows[0]))csv=rows.map((row)=>row.map(csvValue).join(',')).join('\n');else{const headers=Object.keys(rows[0]).filter((key)=>!Array.isArray(rows[0][key]));csv=`${headers.join(',')}\n${rows.map((row)=>headers.map((key)=>csvValue(row[key])).join(',')).join('\n')}`;}const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`stealstreet-${type}.csv`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),0);addAudit(moduleName(state.ui.activeModule),'Exported records',type,`${rows.length} rows`);saveState();toast(`${rows.length} ${type} rows exported.`);
}
function csvValue(value){return `"${String(value??'').replaceAll('"','""')}"`;}

function globalSearch(query) {
  const normalized=query.trim().toLowerCase();if(!normalized){toast('Enter an order, PO, SKU, UPC, customer, vendor, or tracking number.');return;}
  const order=state.orders.find((item)=>[item.id,item.customer,item.tracking].join(' ').toLowerCase().includes(normalized));if(order){setModule('orders');window.setTimeout(()=>openRecord('order',order.id),0);return;}
  const po=state.purchaseOrders.find((item)=>[item.id,item.vendor,item.sku].join(' ').toLowerCase().includes(normalized));if(po){setModule('purchase-orders');window.setTimeout(()=>openRecord('po',po.id),0);return;}
  const product=state.catalog.find((item)=>[item.sku,item.upc,item.product].join(' ').toLowerCase().includes(normalized));if(product){setModule('catalog');window.setTimeout(()=>openRecord('catalog',product.sku),0);return;}
  const vendor=state.vendors.find((item)=>[item.name,item.contact].join(' ').toLowerCase().includes(normalized));if(vendor){state.ui.selectedVendor=vendor.id;setModule('vendors');return;}
  const channel=state.marketplaces.find((item)=>[item.name,item.region,item.model].join(' ').toLowerCase().includes(normalized));if(channel){state.ui.selectedChannel=channel.id;setModule('marketplaces');return;}
  toast('No representative record matched that search.');
}

document.addEventListener('submit',(event)=>{
  const form=event.target;if(form.matches('[data-global-search]')){event.preventDefault();globalSearch(new FormData(form).get('query')||'');return;}
  if(form.matches('[data-filter-form]')){event.preventDefault();const data=Object.fromEntries(new FormData(form).entries());state.ui.filters[form.dataset.filterForm]=data;state.ui.pages[form.dataset.filterForm]=1;saveState();renderActiveModule();}
});

document.addEventListener('click',(event)=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.matches('[data-kz-tab]')){setModule(button.dataset.kzTab);return;}
  if(button.matches('[data-navigate]')){if(button.dataset.settingsTab)state.ui.settingsTab=button.dataset.settingsTab;setModule(button.dataset.navigate,{focusRecord:button.dataset.focusRecord||''});return;}
  if(button.matches('[data-dialog-close]')){closeDialog(button.closest('dialog'));return;}
  const action=button.dataset.action;if(!action)return;
  const id=button.dataset.recordId;const type=button.dataset.recordType;
  if(action==='timeline')return openDialog('timeline');
  if(action==='archive')return openDialog('archive');
  if(action==='disclosure')return openDialog('disclosure');
  if(action==='user-menu'){const menu=document.querySelector('[data-user-menu]');menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));return;}
  if(action==='toggle-company-task'){const item=state.companyHub.projects.find((row)=>row.id===id);if(item){item.complete=!item.complete;addAudit('Company','Updated project task',item.name,item.complete?'Complete':'Open');}return commit(`${item.name} marked ${item.complete?'complete':'open'}.`);}
  if(action==='open-company-messages')return showRecord({kicker:'Company homebase',title:'Internal Messages',body:'<ul class="kz-timeline-list"><li><b>Warehouse</b>Found the missing carton. It was behind the other carton.</li><li><b>Catalog</b>The Executive Decision-Making Mug is back in taxonomy review. Decisions remain sold separately.</li><li><b>Customer Service</b>Converted an ALL-CAPS message into three sentences and a thank-you.</li></ul>'});
  if(action==='open-company-resource')return showRecord({kicker:'Company resources',title:id,body:`<p>${escapeHtml(id)} is represented as part of the internal company homebase. The reconstructed interface does not contain private historical documents.</p>`});
  if(action==='recover'){state.artifactRecovered=true;saveState();window.parent.postMessage({type:'kevinception:artifact',id:'project-blueprint',year:'2010'},window.location.origin);button.textContent='Recovered ✓';button.disabled=true;toast('Project Blueprint recovered: connected commerce operating-system map.');return;}
  if(action==='sort'){const previous=state.ui.sort[button.dataset.table];state.ui.sort[button.dataset.table]={key:button.dataset.key,direction:previous?.key===button.dataset.key&&previous.direction==='asc'?'desc':'asc'};saveState();renderActiveModule();return;}
  if(action==='page'){state.ui.pages[button.dataset.table]=Number(button.dataset.page);saveState();renderActiveModule();return;}
  if(action==='clear-filter'){state.ui.filters[button.dataset.module]={};state.ui.pages[button.dataset.module]=1;saveState();renderActiveModule();return;}
  if(action==='open-record')return openRecord(type,id);
  if(action==='advance-order')return advanceOrder(id);
  if(action==='receive-po-form')return openReceiveForm(id);
  if(action==='submit-receive-po'){const form=recordDialog.querySelector('form');const data=new FormData(form);return receivePO(id,data.get('quantity'),data.get('damaged'));}
  if(action==='damage-po-form')return openForm({kicker:'Purchase order receiving',title:`Record Damage · ${id}`,body:'<form class="kz-inline-form"><label>Damaged units<input name="damaged" type="number" min="1" value="1"></label><label>Note<textarea name="note">Damage found during receiving inspection.</textarea></label></form>',submitLabel:'Record Damage',submitAction:'submit-po-damage',recordId:id});
  if(action==='submit-po-damage'){const po=state.purchaseOrders.find((row)=>row.id===id);const qty=Number(new FormData(recordDialog.querySelector('form')).get('damaged'))||0;if(po){po.damaged+=qty;const inv=state.inventory.find((row)=>row.sku===po.sku);if(inv)inv.damaged+=qty;addAudit('Purchase Orders','Recorded damaged units',id,String(qty));}closeDialog(recordDialog);return commit(`${qty} damaged units recorded on ${id}.`);}
  if(action==='po-date-form'){const po=state.purchaseOrders.find((row)=>row.id===id);return openForm({kicker:'Purchase order schedule',title:`Update ${id}`,body:`<form class="kz-inline-form"><label>Expected date<input name="expectedDate" value="${po?.expectedDate||''}"></label></form>`,submitLabel:'Update Date',submitAction:'submit-po-date',recordId:id});}
  if(action==='submit-po-date'){const po=state.purchaseOrders.find((row)=>row.id===id);const date=new FormData(recordDialog.querySelector('form')).get('expectedDate');if(po){po.expectedDate=String(date);if(po.status==='Overdue')po.status='Open';addAudit('Purchase Orders','Updated expected date',id,String(date));}closeDialog(recordDialog);return commit(`${id} expected date updated.`);}
  if(action==='complete-po'){const po=state.purchaseOrders.find((row)=>row.id===id);if(!po)return;if(po.received<po.quantity){toast(`${id} cannot close until all units are received.`);return;}po.status='Complete';state.vendors.find((row)=>row.id===po.vendorId).openPOs=Math.max(0,state.vendors.find((row)=>row.id===po.vendorId).openPOs-1);addAudit('Purchase Orders','Completed PO',id,'Complete');closeDialog(recordDialog);return commit(`${id} marked complete.`);}
  if(action==='create-po-form')return openCreatePOForm();
  if(action==='create-po-vendor')return openCreatePOForm(id);
  if(action==='submit-create-po'){const data=new FormData(recordDialog.querySelector('form'));const sku=String(data.get('sku'));const vendorId=String(data.get('vendorId'));const inv=state.inventory.find((row)=>row.sku===sku);if(!inv)return;const vendor=state.vendors.find((row)=>row.id===vendorId);const qty=Number(data.get('quantity'))||vendor.moq;const poId=`PO-${++state.sequence.po}`;state.purchaseOrders.unshift({id:poId,vendorId:vendor.id,vendor:vendor.name,method:'Manual reorder',orderDate:'04/18/2012',expectedDate:String(data.get('expectedDate')),quantity:qty,received:0,damaged:0,cost:qty*(state.catalog.find((row)=>row.sku===sku)?.cost||10),status:qty<vendor.moq?'MOQ Exception':'Open',sku,location:inv.location});inv.incoming+=qty;vendor.openPOs+=1;state.warehouseTasks.unshift({id:`WH-R-${130+state.warehouseTasks.length}`,type:'Receiving',record:poId,route:`Expected → ${inv.location}`,itemCount:qty,weight:'',service:'',label:'',tracking:'',status:'Expected',note:'Created from vendor purchasing.'});addAudit('Purchase Orders','Created PO',poId,`${qty} units`);closeDialog(recordDialog);return commit(`${poId} created and connected to inventory and receiving.`);}
  if(action==='adjust-stock-form')return openStockAdjustForm(id);
  if(action==='submit-stock-adjust'){const item=state.inventory.find((row)=>row.sku===id);const data=new FormData(recordDialog.querySelector('form'));const qty=Number(data.get('quantity'))||0;if(item){item.onHand=Math.max(0,item.onHand+qty);updateInventoryStatus(item);addAudit('Inventory','Adjusted quantity',id,`${qty>=0?'+':''}${qty} · ${data.get('reason')}`);}closeDialog(recordDialog);return commit(`${id} stock adjusted by ${qty}. Dashboard alerts recalculated.`);}
  if(action==='transfer-stock-form')return openTransferForm();
  if(action==='transfer-one-form')return openTransferForm(id);
  if(action==='submit-transfer-stock'){const data=new FormData(recordDialog.querySelector('form'));const item=state.inventory.find((row)=>row.sku===data.get('sku'));if(item){item.location=String(data.get('location'));addAudit('Inventory','Transferred stock',item.sku,`${data.get('quantity')} units → ${item.location}`);}closeDialog(recordDialog);return commit(`${data.get('sku')} transferred to ${data.get('location')}.`);}
  if(action==='reorder-stock')return createReorder(id);
  if(action==='catalog-bulk'){const targets=state.catalog.filter((row)=>row.health==='Needs Taxonomy');targets.forEach((row)=>{row.category='Office Supplies';row.health='Healthy';row.updated=currentTime();row.audit.unshift(`${currentTime()} · Bulk taxonomy edit applied`);});addAudit('Catalog','Bulk edited records',`${targets.length} records`,'Saved');return commit(`${targets.length} catalog records updated.`);}
  if(action==='catalog-import'){const suffix=String(state.sequence.import++).padStart(3,'0');const sku=`IMP-2012-${suffix}`;state.catalog.unshift({sku,upc:`0099002012${suffix}`,product:`Imported sample product ${suffix}`,category:'Pending Cataloging',cost:8.00,price:19.95,listings:0,health:'Needs Taxonomy',updated:currentTime(),attributes:8,media:0,mappings:'0 / 0',audit:[`${currentTime()} · Imported from CSV`]});state.inventory.unshift({sku,product:`Imported sample product ${suffix}`,location:'UNASSIGNED',onHand:0,allocated:0,incoming:0,reorderPoint:12,damaged:0,status:'Stockout'});addAudit('Catalog','Imported CSV record',sku,'Needs Taxonomy');return commit(`${sku} imported. Catalog queue and inventory were updated.`);}
  if(action==='catalog-map'){const target=state.catalog.find((row)=>['Rejected','Needs Taxonomy'].includes(row.health));if(target)return fixListing(target.sku);toast('No mapping exceptions remain.');return;}
  if(action==='catalog-price'){const targets=state.catalog.filter((row)=>row.health!=='Hidden');targets.forEach((row)=>{row.price=Number((row.price+0.5).toFixed(2));row.updated=currentTime();});addAudit('Catalog','Bulk pricing update',`${targets.length} records`,'Saved');return commit(`${targets.length} representative prices updated by $0.50.`);}
  if(action==='catalog-taxonomy'){const target=state.catalog.find((row)=>row.health==='Needs Taxonomy');if(target){target.category='Office Supplies';target.health='Healthy';target.updated=currentTime();addAudit('Catalog','Edited taxonomy',target.sku,'Healthy');return commit(`${target.sku} taxonomy completed.`);}toast('No taxonomy records are waiting.');return;}
  if(action==='catalog-price-one'){const item=state.catalog.find((row)=>row.sku===id);return openForm({kicker:'Catalog pricing',title:`Update ${id}`,body:`<form class="kz-inline-form"><label>Price<input name="price" type="number" step="0.01" value="${item?.price||0}"></label><label>Cost<input name="cost" type="number" step="0.01" value="${item?.cost||0}"></label></form>`,submitLabel:'Save Pricing',submitAction:'submit-catalog-price',recordId:id});}
  if(action==='submit-catalog-price'){const item=state.catalog.find((row)=>row.sku===id);const data=new FormData(recordDialog.querySelector('form'));if(item){item.price=Number(data.get('price'));item.cost=Number(data.get('cost'));item.updated=currentTime();item.audit.unshift(`${currentTime()} · Pricing updated`);addAudit('Catalog','Updated pricing',id,money(item.price));}closeDialog(recordDialog);return commit(`${id} pricing updated.`);}
  if(action==='catalog-taxonomy-one'){const item=state.catalog.find((row)=>row.sku===id);return openForm({kicker:'Catalog taxonomy',title:`Edit ${id}`,body:`<form class="kz-inline-form"><label>Category<input name="category" value="${escapeHtml(item?.category||'')}"></label></form>`,submitLabel:'Save Taxonomy',submitAction:'submit-catalog-taxonomy',recordId:id});}
  if(action==='submit-catalog-taxonomy'){const item=state.catalog.find((row)=>row.sku===id);const category=new FormData(recordDialog.querySelector('form')).get('category');if(item){item.category=String(category);item.health='Healthy';item.updated=currentTime();item.audit.unshift(`${currentTime()} · Taxonomy updated`);addAudit('Catalog','Updated taxonomy',id,String(category));}closeDialog(recordDialog);return commit(`${id} taxonomy updated.`);}
  if(action==='fix-listing')return fixListing(id);
  if(action==='select-channel'){state.ui.selectedChannel=id;saveState();return renderActiveModule();}
  if(action==='sync-channel'){const item=state.marketplaces.find((row)=>row.id===id);if(item){item.lastSync=currentTime();item.orderSync='Current';item.inventorySync='Current';state.lastSync=item.lastSync;addAudit('Marketplaces','Ran channel sync',item.name,'Success');}return commit(`${item.name} sync completed.`);}
  if(action==='sync-all-channels'){const time=currentTime();state.marketplaces.forEach((item)=>{item.lastSync=time;if(!item.errors){item.feed='Healthy';item.inventorySync='Current';item.orderSync='Current';}});state.lastSync=time;addAudit('Marketplaces','Ran all channel syncs','20+ channels','Exceptions retained');commit();return interfacePulse('All channels checked in. Even the dramatic ones.');}
  if(action==='retry-feed'){const item=state.marketplaces.find((row)=>row.id===id);if(item){item.feed='Healthy';item.inventorySync='Current';item.errors=0;item.rejected=[];item.lastSync=currentTime();addAudit('Marketplaces','Retried failed feed',item.name,'Success');}return commit(`${item?.name||'Channel'} feed retry succeeded.`);}
  if(action==='view-rejected'){const item=state.marketplaces.find((row)=>row.id===id);return showRecord({kicker:'Rejected listings',title:item.name,body:item.rejected.length?`<ul class="kz-timeline-list">${item.rejected.map((entry)=>`<li>${escapeHtml(entry)}</li>`).join('')}</ul>`:'<p>No rejected listings remain for this channel.</p>',actions:item.rejected.length?actionButton('Retry Feed','retry-feed','channel',id,true):''});}
  if(action==='resolve-mapping'){const item=state.marketplaces.find((row)=>row.id===id);if(item){item.mapping='Mapped';item.errors=0;item.feed='Healthy';item.rejected=[];item.lastSync=currentTime();addAudit('Marketplaces','Resolved mapping',item.name,'Mapped');}return commit(`${item?.name||'Channel'} mapping resolved.`);}
  if(action==='select-vendor'){state.ui.selectedVendor=id;saveState();return renderActiveModule();}
  if(action==='vendor-terms-form'){const item=state.vendors.find((row)=>row.id===id);return openForm({kicker:'Vendor terms',title:item.name,body:`<form class="kz-inline-form"><label>Payment terms<select name="terms"><option>Net 15</option><option ${item.terms==='Net 30'?'selected':''}>Net 30</option><option>Net 45</option><option>Prepaid</option></select></label><label>MOQ<input name="moq" type="number" value="${item.moq}"></label></form>`,submitLabel:'Update Terms',submitAction:'submit-vendor-terms',recordId:id});}
  if(action==='submit-vendor-terms'){const item=state.vendors.find((row)=>row.id===id);const data=new FormData(recordDialog.querySelector('form'));if(item){item.terms=String(data.get('terms'));item.moq=Number(data.get('moq'));item.notes.unshift(`${currentTime()} · Terms updated`);addAudit('Vendors','Updated terms',item.name,`${item.terms} · MOQ ${item.moq}`);}closeDialog(recordDialog);return commit(`${item.name} terms updated.`);}
  if(action==='vendor-lead-form'){const item=state.vendors.find((row)=>row.id===id);return openForm({kicker:'Vendor lead time',title:item.name,body:`<form class="kz-inline-form"><label>Lead time (days)<input name="leadTime" type="number" value="${item.leadTime}"></label></form>`,submitLabel:'Update Lead Time',submitAction:'submit-vendor-lead',recordId:id});}
  if(action==='submit-vendor-lead'){const item=state.vendors.find((row)=>row.id===id);const value=Number(new FormData(recordDialog.querySelector('form')).get('leadTime'));if(item){item.leadTime=value;item.notes.unshift(`${currentTime()} · Lead time updated to ${value} days`);addAudit('Vendors','Updated lead time',item.name,`${value} days`);}closeDialog(recordDialog);return commit(`${item.name} lead time updated.`);}
  if(action==='vendor-note-form')return openForm({kicker:'Vendor note',title:'Add Purchasing Note',body:'<form class="kz-inline-form"><label>Note<textarea name="note">Follow up on pricing and expected inventory.</textarea></label></form>',submitLabel:'Add Note',submitAction:'submit-vendor-note',recordId:id});
  if(action==='submit-vendor-note'){const item=state.vendors.find((row)=>row.id===id);const note=String(new FormData(recordDialog.querySelector('form')).get('note'));if(item){item.notes.unshift(`${currentTime()} · ${note}`);addAudit('Vendors','Added note',item.name,'Saved');}closeDialog(recordDialog);return commit(`Note added to ${item.name}.`);}
  if(action==='select-case'){state.ui.selectedCase=id;saveState();return renderActiveModule();}
  if(action==='case-note-form')return openForm({kicker:'Customer service note',title:`Add Note · ${id}`,body:'<form class="kz-inline-form"><label>Internal note<textarea name="note">Reviewed linked order, shipment, and marketplace context.</textarea></label></form>',submitLabel:'Add Note',submitAction:'submit-case-note',recordId:id});
  if(action==='submit-case-note'){const item=state.cases.find((row)=>row.id===id);const note=String(new FormData(recordDialog.querySelector('form')).get('note'));if(item){item.notes.push(`${currentTime()} · ${note}`);addAudit('Customer Service','Added case note',id,'Saved');}closeDialog(recordDialog);return commit(`Note added to ${id}.`);}
  if(action==='case-reply'){const item=state.cases.find((row)=>row.id===id);if(item){item.status='Waiting';item.timeline.push(`${currentTime()} · Reply sent; waiting for customer`);addAudit('Customer Service','Replied to customer',id,'Waiting');}return commit(`${id} reply recorded.`);}
  if(action==='case-escalate'){const item=state.cases.find((row)=>row.id===id);if(item){item.status='Escalated';item.priority='High';item.timeline.push(`${currentTime()} · Escalated to operator`);addAudit('Customer Service','Escalated case',id,'High priority');}return commit(`${id} escalated.`);}
  if(action==='case-resolve'){const item=state.cases.find((row)=>row.id===id);if(item){item.status='Resolved';item.timeline.push(`${currentTime()} · Case resolved`);addAudit('Customer Service','Resolved case',id,'Resolved');}return commit(`${id} resolved.`);}
  if(action==='case-reopen'){const item=state.cases.find((row)=>row.id===id);if(item){item.status='Open';item.timeline.push(`${currentTime()} · Case reopened`);addAudit('Customer Service','Reopened case',id,'Open');}return commit(`${id} reopened.`);}
  if(action==='case-create-return'){const item=state.cases.find((row)=>row.id===id);if(!item)return;if(state.returns.some((row)=>row.orderId===item.orderId)){toast('A return is already linked to this order.');return;}const order=state.orders.find((row)=>row.id===item.orderId);const inv=state.inventory[0];const rma=`RMA-${++state.sequence.return}`;state.returns.unshift({id:rma,orderId:item.orderId,customer:item.customer,sku:inv.sku,item:order?.itemNames[0]||inv.product,quantity:1,reason:item.issue,condition:'Unknown',disposition:'Pending',refund:0,status:'Requested'});item.timeline.push(`${currentTime()} · ${rma} created`);addAudit('Returns','Created RMA from case',rma,id);return commit(`${rma} created and linked to ${id}.`);}
  if(action==='warehouse-complete')return completeWarehouseTask(id);
  if(action==='return-approve'){const item=state.returns.find((row)=>row.id===id);item.status='Awaiting Arrival';addAudit('Returns','Approved return',id,'Awaiting Arrival');return commit(`${id} approved.`);}
  if(action==='return-receive'){const item=state.returns.find((row)=>row.id===id);item.status='Received';addAudit('Returns','Received return',id,'Received');return commit(`${id} received at warehouse.`);}
  if(action==='return-inspect-form'){const item=state.returns.find((row)=>row.id===id);return openForm({kicker:'Return inspection',title:`Inspect ${id}`,body:`<form class="kz-inline-form"><label>Condition<select name="condition"><option>Unopened</option><option>Opened</option><option>Damaged</option></select></label><label>Disposition<select name="disposition"><option>Restock</option><option>Damaged</option><option>Vendor Return</option></select></label></form>`,submitLabel:'Record Inspection',submitAction:'submit-return-inspect',recordId:id});}
  if(action==='submit-return-inspect'){const item=state.returns.find((row)=>row.id===id);const data=new FormData(recordDialog.querySelector('form'));item.condition=String(data.get('condition'));item.disposition=String(data.get('disposition'));item.status=item.disposition==='Restock'?'Inspection':item.disposition==='Damaged'?'Inspection':'Refund Pending';addAudit('Returns','Inspected return',id,item.disposition);closeDialog(recordDialog);return commit(`${id} inspection recorded.`);}
  if(action==='return-restock')return restockReturn(id);
  if(action==='return-damaged'){const item=state.returns.find((row)=>row.id===id);const inv=state.inventory.find((row)=>row.sku===item.sku);if(inv)inv.damaged+=item.quantity;item.disposition='Damaged';item.status='Refund Pending';addAudit('Returns','Marked return damaged',id,`${item.quantity} unit(s)`);return commit(`${id} marked damaged; inventory damage count updated.`);}
  if(action==='return-complete'){const item=state.returns.find((row)=>row.id===id);item.status='Completed';addAudit('Returns','Completed return',id,money(item.refund));return commit(`${id} completed.`);}
  if(action==='sync-all'){const time=currentTime();state.lastSync=time;state.integrations.forEach((item)=>{item.lastRun=time;if(item.status==='Healthy')item.status='Healthy';});addAudit('Integrations','Ran system sync','All modules','Success');commit();return interfacePulse('Everything is talking again. Suspiciously cooperative.');}
  if(action==='export')return exportCsv(button.dataset.export);
  if(action==='toggle-automation'){const item=state.automation.find((row)=>row.id===id);item.enabled=!item.enabled;addAudit('Automation',item.enabled?'Enabled rule':'Disabled rule',item.name,item.enabled?'Enabled':'Disabled');return commit(`${item.name} ${item.enabled?'enabled':'disabled'}.`);}
  if(action==='toggle-notification'){const item=state.notifications.find((row)=>row.id===id);item.enabled=!item.enabled;addAudit('Notifications',item.enabled?'Enabled notification':'Disabled notification',item.name,item.enabled?'Enabled':'Disabled');return commit(`${item.name} ${item.enabled?'enabled':'disabled'}.`);}
  if(action==='run-integration'){const item=state.integrations.find((row)=>row.id===id);item.status='Healthy';item.lastRun=currentTime();state.lastSync=item.lastRun;addAudit('Integrations','Ran integration',item.name,'Success');return commit(`${item.name} completed successfully.`);}
  if(action==='edit-user-role'){const item=state.users.find((row)=>row.id===id);return openForm({kicker:'Users & roles',title:item.name,body:`<form class="kz-inline-form"><label>Role<select name="role"><option>Administrator</option><option>Fulfillment</option><option>Support</option><option>Catalog</option><option>Reporting</option></select></label><label>Module access<input name="modules" value="${escapeHtml(item.modules)}"></label></form>`,submitLabel:'Save Role',submitAction:'submit-user-role',recordId:id});}
  if(action==='submit-user-role'){const item=state.users.find((row)=>row.id===id);const data=new FormData(recordDialog.querySelector('form'));item.role=String(data.get('role'));item.modules=String(data.get('modules'));addAudit('Administration','Updated user role',item.name,item.role);closeDialog(recordDialog);return commit(`${item.name} permissions updated.`);}
  if(action==='warehouse-config'||action==='test-shipping'||action==='run-marketplace-rule'){addAudit('Administration',action==='warehouse-config'?'Updated warehouse configuration':action==='test-shipping'?'Tested shipping integration':'Ran marketplace rule',id,'Success');return commit('Configuration action completed and recorded in audit history.');}
  if(action==='reset'||action==='reset-form')return openForm({kicker:'Demo controls',title:'Reset Demo Data',body:'<p>This restores the deterministic seeded ERP state and removes every local workflow change, note, audit entry, and selected record created during this visit.</p>',submitLabel:'Reset Demo Data',submitAction:'confirm-reset'});
  if(action==='confirm-reset'){state=createSeedState();saveState();closeDialog(recordDialog);setModule('dashboard',{history:'replace'});return toast('Demo data reset to the seeded starting state.');}
});

document.addEventListener('click',(event)=>{const menu=document.querySelector('[data-user-menu]');if(!menu.hidden&&!event.target.closest('.kz-user-control')){menu.hidden=true;document.querySelector('[data-action="user-menu"]').setAttribute('aria-expanded','false');}});
document.addEventListener('click',(event)=>{const tab=event.target.closest('[data-subtab]');if(!tab)return;if(tab.dataset.subtab==='warehouse')state.ui.warehouseTab=tab.dataset.value;if(tab.dataset.subtab==='reports')state.ui.reportTab=tab.dataset.value;if(tab.dataset.subtab==='settings')state.ui.settingsTab=tab.dataset.value;saveState();renderActiveModule();});
document.querySelectorAll('.kz-dialog').forEach((dialog)=>dialog.addEventListener('click',(event)=>{if(event.target===dialog)closeDialog(dialog);}));
window.addEventListener('keydown',(event)=>{if(event.key==='Escape')document.querySelectorAll('dialog[open]').forEach(closeDialog);});
window.addEventListener('message',(event)=>{if(event.origin!==window.location.origin||event.data?.type!=='kevinception:module-sync')return;setModule(event.data.module||'dashboard',{notify:false,history:'replace'});});
window.addEventListener('popstate',()=>{if(window.parent===window){const module=new URLSearchParams(window.location.search).get('module');setModule(module||'dashboard',{notify:false,history:'replace'});}});

const initialModule=new URLSearchParams(window.location.search).get('module')||state.ui.activeModule||'dashboard';
if(state.artifactRecovered){const recover=document.querySelector('[data-action="recover"]');recover.textContent='Recovered ✓';recover.disabled=true;}
setModule(initialModule,{notify:false,history:'replace'});
track('stealstreet_commerce_os_loaded',{era:'2010',chapter:'Commerce',version:state.version});
if(window.parent!==window)window.parent.postMessage({type:'kevinception:legacy-ready',path:window.location.pathname},window.location.origin);
