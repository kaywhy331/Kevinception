(() => {
  if (window.__kevtokNativeLoaded) return;
  window.__kevtokNativeLoaded = true;

  const MAIN_STATE_KEY = 'kevinception:timeline-v6';
  const NATIVE_STATE_KEY = 'kevinception:kevtok-native-v1';

  function readJson(key, fallback) {
    try { return { ...fallback, ...(JSON.parse(localStorage.getItem(key) || '{}') || {}) }; }
    catch { return { ...fallback }; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local storage unavailable */ }
  }
  function mainState() {
    const state = readJson(MAIN_STATE_KEY, {});
    state.y2020 ||= { likes: {}, saves: {}, comments: {} };
    state.y2020.likes ||= {};
    state.y2020.saves ||= {};
    state.y2020.comments ||= {};
    return state;
  }
  function nativeState() {
    return readJson(NATIVE_STATE_KEY, { drafts: [], shares: {}, inboxRead: false, activeNav: 'home' });
  }
  function saveNative(state) { writeJson(NATIVE_STATE_KEY, state); }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function formatCount(value) {
    if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    return String(value);
  }
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  function toast(message) {
    let node = document.querySelector('[data-kt-native-toast]');
    if (!node) {
      node = document.createElement('div');
      node.className = 'kt-native-toast';
      node.dataset.ktNativeToast = 'true';
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove('is-visible'), 2400);
  }
  function ensureStyles() {
    if (document.querySelector('link[data-kevtok-native-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/legacy/assets/styles/kevtok-native.css';
    link.dataset.kevtokNativeStyle = 'true';
    document.head.append(link);
  }
  function clips() { return [...document.querySelectorAll('[data-kt-clip]')]; }
  function clipId(clip) { return clip?.dataset?.clipId || ''; }
  function clipTitle(clip) { return clip?.querySelector('h1')?.textContent?.trim() || 'KevTok clip'; }
  function clipCategory(clip) { return clip?.dataset?.category || 'Kevin'; }
  function clipById(id) { return clips().find((clip) => clipId(clip) === id); }
  function scrollToClip(id) {
    const clip = clipById(id);
    if (!clip) return;
    document.querySelector('[data-kt-filter="all"]')?.click();
    window.setTimeout(() => clip.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 0);
  }

  function createDialog(name, label, body) {
    const existing = document.querySelector(`[data-kt-native-dialog="${name}"]`);
    if (existing) return existing;
    const dialog = document.createElement('dialog');
    dialog.className = `era-dialog kt-native-dialog kt-native-dialog--${name}`;
    dialog.dataset.ktNativeDialog = name;
    dialog.setAttribute('aria-label', label);
    dialog.innerHTML = body;
    dialog.querySelectorAll('[data-kt-native-close]').forEach((button) => button.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); });
    document.body.append(dialog);
    return dialog;
  }

  function ensureNativeDialogs() {
    createDialog('discover', 'Discover KevTok clips', `
      <article>
        <header><div><p class="eyebrow">Discover</p><h2>Search Kevin's clips</h2></div><button type="button" data-kt-native-close aria-label="Close discover">×</button></header>
        <div class="kt-native-search"><label>Search<input type="search" data-kt-native-search placeholder="Projects, systems, AI…" autocomplete="off"></label><div data-kt-native-categories></div></div>
        <div class="kt-native-results" data-kt-native-results></div>
      </article>
    `);
    createDialog('create', 'Create a KevTok draft', `
      <article>
        <header><div><p class="eyebrow">Create</p><h2>Draft a new clip</h2></div><button type="button" data-kt-native-close aria-label="Close create">×</button></header>
        <form class="kt-native-create" data-kt-native-create-form>
          <label>Caption<textarea name="caption" maxlength="220" required placeholder="What would this clip teach or show?"></textarea></label>
          <label>Format<select name="format"><option>Talking point</option><option>Project walkthrough</option><option>System diagram</option><option>Before / after</option></select></label>
          <button type="submit">Save local draft</button>
        </form>
        <section class="kt-native-drafts"><header><h3>Drafts on this device</h3><span data-kt-native-draft-count>0</span></header><div data-kt-native-drafts></div></section>
      </article>
    `);
    createDialog('inbox', 'KevTok inbox', `
      <article>
        <header><div><p class="eyebrow">Inbox</p><h2>Activity</h2></div><button type="button" data-kt-native-close aria-label="Close inbox">×</button></header>
        <div class="kt-native-inbox" data-kt-native-inbox></div>
      </article>
    `);
    createDialog('profile', 'Kevin's KevTok profile', `
      <article>
        <header><div><p class="eyebrow">Profile</p><h2>@kevinbuilds</h2></div><button type="button" data-kt-native-close aria-label="Close profile">×</button></header>
        <section class="kt-native-profile">
          <div class="kt-native-profile__hero"><span>K</span><div><h3>Kevin Yang</h3><p>Systems, products, automation, AI, and the path from ambiguous idea to practical execution.</p></div></div>
          <dl data-kt-native-profile-stats></dl>
          <nav aria-label="Profile content"><button type="button" class="is-active" data-kt-profile-tab="posts">Posts</button><button type="button" data-kt-profile-tab="liked">Liked</button><button type="button" data-kt-profile-tab="saved">Saved</button></nav>
          <div class="kt-native-profile__grid" data-kt-native-profile-grid></div>
          <a class="kt-native-profile__portfolio" href="/portfolio/">Open full portfolio</a>
        </section>
      </article>
    `);
  }

  function setActiveNav(name) {
    const state = nativeState();
    state.activeNav = name;
    saveNative(state);
    document.querySelectorAll('[data-kt-nav]').forEach((button) => button.classList.toggle('is-active', button.dataset.ktNav === name));
  }

  function replaceBottomNavigation() {
    const nav = document.querySelector('.kt-nav');
    if (!nav) return;
    nav.innerHTML = `
      <button type="button" class="is-active" data-kt-nav="home"><span aria-hidden="true">⌂</span><small>Home</small></button>
      <button type="button" data-kt-nav="discover"><span aria-hidden="true">⌕</span><small>Discover</small></button>
      <button type="button" class="kt-nav__create" data-kt-nav="create"><span aria-hidden="true">＋</span><small>Create</small></button>
      <button type="button" data-kt-nav="inbox"><span aria-hidden="true">✉</span><small>Inbox</small><b class="kt-nav__badge" data-kt-native-inbox-badge>1</b></button>
      <button type="button" data-kt-nav="profile"><span aria-hidden="true">K</span><small>Profile</small></button>
    `;
  }

  function actionBases(index) {
    return { likes: 128 + index * 71, comments: 2 + index, saves: 18 + index * 9, shares: 7 + index * 5 };
  }

  function syncActionCounts() {
    const main = mainState();
    const local = nativeState();
    clips().forEach((clip, index) => {
      const id = clipId(clip);
      const base = actionBases(index);
      const like = clip.querySelector('[data-kt-like]');
      const comment = clip.querySelector('[data-kt-comment]');
      const save = clip.querySelector('[data-kt-save]');
      const share = clip.querySelector('[data-kt-share]');
      if (like?.querySelector('b')) like.querySelector('b').textContent = formatCount(base.likes + (main.y2020.likes[id] ? 1 : 0));
      if (comment?.querySelector('b')) comment.querySelector('b').textContent = formatCount(base.comments + (main.y2020.comments[id]?.length || 0));
      if (save?.querySelector('b')) save.querySelector('b').textContent = formatCount(base.saves + (main.y2020.saves[id] ? 1 : 0));
      if (share) {
        let count = share.querySelector('b');
        if (!count) {
          count = document.createElement('b');
          share.querySelector('small')?.before(count);
        }
        count.textContent = formatCount(base.shares + (local.shares[id] || 0));
      }
    });
  }

  function renderDiscover(query = '') {
    const dialog = document.querySelector('[data-kt-native-dialog="discover"]');
    if (!dialog) return;
    const normalized = query.trim().toLowerCase();
    const results = clips().filter((clip) => !normalized || `${clipTitle(clip)} ${clipCategory(clip)} ${clip.textContent}`.toLowerCase().includes(normalized));
    const container = dialog.querySelector('[data-kt-native-results]');
    container.innerHTML = results.length ? results.map((clip) => `
      <button type="button" data-kt-native-result="${escapeHtml(clipId(clip))}">
        <span>${escapeHtml(clipCategory(clip))}</span><b>${escapeHtml(clipTitle(clip))}</b><small>Open clip</small>
      </button>
    `).join('') : '<p class="kt-native-empty">No clips match that search.</p>';
    container.querySelectorAll('[data-kt-native-result]').forEach((button) => button.addEventListener('click', () => {
      closeDialog(dialog);
      setActiveNav('home');
      scrollToClip(button.dataset.ktNativeResult);
    }));
  }

  function openDiscover() {
    setActiveNav('discover');
    const dialog = document.querySelector('[data-kt-native-dialog="discover"]');
    const categories = dialog.querySelector('[data-kt-native-categories]');
    categories.innerHTML = ['Kevin', 'Systems', 'Projects', 'AI'].map((category) => `<button type="button" data-kt-native-category="${category}">${category}</button>`).join('');
    categories.querySelectorAll('[data-kt-native-category]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector(`[data-kt-filter="${button.dataset.ktNativeCategory}"]`)?.click();
      closeDialog(dialog);
    }));
    const input = dialog.querySelector('[data-kt-native-search]');
    input.value = '';
    input.oninput = () => renderDiscover(input.value);
    renderDiscover();
    openDialog(dialog);
    requestAnimationFrame(() => input.focus());
  }

  function renderDrafts() {
    const dialog = document.querySelector('[data-kt-native-dialog="create"]');
    if (!dialog) return;
    const state = nativeState();
    dialog.querySelector('[data-kt-native-draft-count]').textContent = String(state.drafts.length);
    const container = dialog.querySelector('[data-kt-native-drafts]');
    container.innerHTML = state.drafts.length ? state.drafts.slice().reverse().map((draft) => `
      <article><span>${escapeHtml(draft.format)}</span><p>${escapeHtml(draft.caption)}</p><small>${new Date(draft.createdAt).toLocaleString()}</small><button type="button" data-kt-native-delete-draft="${draft.id}">Delete</button></article>
    `).join('') : '<p class="kt-native-empty">No drafts yet. Nothing leaves this browser.</p>';
    container.querySelectorAll('[data-kt-native-delete-draft]').forEach((button) => button.addEventListener('click', () => {
      const current = nativeState();
      current.drafts = current.drafts.filter((draft) => draft.id !== button.dataset.ktNativeDeleteDraft);
      saveNative(current);
      renderDrafts();
      updateInboxBadge();
    }));
  }

  function openCreate() {
    setActiveNav('create');
    const dialog = document.querySelector('[data-kt-native-dialog="create"]');
    renderDrafts();
    openDialog(dialog);
    requestAnimationFrame(() => dialog.querySelector('textarea')?.focus());
  }

  function renderInbox() {
    const dialog = document.querySelector('[data-kt-native-dialog="inbox"]');
    if (!dialog) return;
    const main = mainState();
    const local = nativeState();
    const liked = Object.values(main.y2020.likes).filter(Boolean).length;
    const saved = Object.values(main.y2020.saves).filter(Boolean).length;
    const comments = Object.values(main.y2020.comments).reduce((total, items) => total + (items?.length || 0), 0);
    const shares = Object.values(local.shares).reduce((total, value) => total + Number(value || 0), 0);
    dialog.querySelector('[data-kt-native-inbox]').innerHTML = `
      <article><span>NEW</span><div><b>Kevin posted eight finite clips.</b><p>No infinite feed. Every clip maps to a real capability, project, or decision.</p></div></article>
      <article><span>${liked}</span><div><b>Liked clips</b><p>Your likes remain stored only on this device.</p></div></article>
      <article><span>${comments}</span><div><b>Comments added</b><p>Local timeline comments are ready when you return.</p></div></article>
      <article><span>${saved}</span><div><b>Saved clips</b><p>Open Profile to revisit saved posts.</p></div></article>
      <article><span>${shares}</span><div><b>Shares prepared</b><p>Native share or clipboard actions are available per clip.</p></div></article>
      <article><span>${local.drafts.length}</span><div><b>Creator drafts</b><p>Drafts stay private in this browser.</p></div></article>
    `;
  }

  function updateInboxBadge() {
    const local = nativeState();
    const badge = document.querySelector('[data-kt-native-inbox-badge]');
    if (!badge) return;
    const count = local.inboxRead ? 0 : 1 + local.drafts.length;
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function openInbox() {
    setActiveNav('inbox');
    const local = nativeState();
    local.inboxRead = true;
    saveNative(local);
    renderInbox();
    updateInboxBadge();
    openDialog(document.querySelector('[data-kt-native-dialog="inbox"]'));
  }

  function renderProfile(tab = 'posts') {
    const dialog = document.querySelector('[data-kt-native-dialog="profile"]');
    if (!dialog) return;
    const main = mainState();
    const likedIds = Object.entries(main.y2020.likes).filter(([, value]) => value).map(([id]) => id);
    const savedIds = Object.entries(main.y2020.saves).filter(([, value]) => value).map(([id]) => id);
    dialog.querySelectorAll('[data-kt-profile-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.ktProfileTab === tab));
    dialog.querySelector('[data-kt-native-profile-stats]').innerHTML = `<div><dt>8</dt><dd>Posts</dd></div><div><dt>${likedIds.length}</dt><dd>Liked</dd></div><div><dt>${savedIds.length}</dt><dd>Saved</dd></div>`;
    const ids = tab === 'liked' ? likedIds : tab === 'saved' ? savedIds : clips().map(clipId);
    const grid = dialog.querySelector('[data-kt-native-profile-grid]');
    grid.innerHTML = ids.length ? ids.map((id) => {
      const clip = clipById(id);
      return `<button type="button" data-kt-profile-clip="${escapeHtml(id)}"><span>${escapeHtml(clipCategory(clip))}</span><b>${escapeHtml(clipTitle(clip))}</b></button>`;
    }).join('') : `<p class="kt-native-empty">No ${escapeHtml(tab)} clips yet.</p>`;
    grid.querySelectorAll('[data-kt-profile-clip]').forEach((button) => button.addEventListener('click', () => {
      closeDialog(dialog);
      setActiveNav('home');
      scrollToClip(button.dataset.ktProfileClip);
    }));
  }

  function openProfile() {
    setActiveNav('profile');
    const dialog = document.querySelector('[data-kt-native-dialog="profile"]');
    renderProfile('posts');
    openDialog(dialog);
  }

  function showHeartBurst(visual) {
    const heart = document.createElement('span');
    heart.className = 'kt-heart-burst';
    heart.textContent = '♥';
    visual.append(heart);
    window.setTimeout(() => heart.remove(), 720);
  }

  function bindSocialInteractions() {
    clips().forEach((clip) => {
      const id = clipId(clip);
      const like = clip.querySelector('[data-kt-like]');
      const save = clip.querySelector('[data-kt-save]');
      const share = clip.querySelector('[data-kt-share]');
      const visual = clip.querySelector('.kt-clip__visual');
      [like, save].forEach((button) => button?.addEventListener('click', () => window.setTimeout(() => { syncActionCounts(); renderProfile(); renderInbox(); }, 0)));
      share?.addEventListener('click', () => {
        const local = nativeState();
        local.shares[id] = (local.shares[id] || 0) + 1;
        saveNative(local);
        window.setTimeout(() => { syncActionCounts(); renderInbox(); }, 0);
      });
      let lastTap = 0;
      visual?.addEventListener('pointerup', (event) => {
        if (event.target.closest('button, a')) return;
        const now = Date.now();
        if (now - lastTap < 320) {
          if (!like.classList.contains('is-active')) like.click();
          showHeartBurst(visual);
          lastTap = 0;
        } else lastTap = now;
      });
    });
    document.querySelector('[data-kt-comment-form]')?.addEventListener('submit', () => window.setTimeout(() => { syncActionCounts(); renderInbox(); }, 0));
  }

  function bindNativeNavigation() {
    document.querySelector('[data-kt-nav="home"]')?.addEventListener('click', () => {
      setActiveNav('home');
      document.querySelector('[data-kt-filter="all"]')?.click();
      clips()[0]?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    document.querySelector('[data-kt-nav="discover"]')?.addEventListener('click', openDiscover);
    document.querySelector('[data-kt-nav="create"]')?.addEventListener('click', openCreate);
    document.querySelector('[data-kt-nav="inbox"]')?.addEventListener('click', openInbox);
    document.querySelector('[data-kt-nav="profile"]')?.addEventListener('click', openProfile);

    const inboxButton = document.querySelector('.kt-header > button');
    if (inboxButton) {
      const cleanInbox = inboxButton.cloneNode(true);
      inboxButton.replaceWith(cleanInbox);
      cleanInbox.textContent = 'Inbox';
      cleanInbox.addEventListener('click', openInbox);
    }

    document.querySelector('[data-kt-logo]')?.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector('[data-kt-nav="home"]')?.click();
    }, true);

    const draftsFilter = document.querySelector('[data-kt-filter="drafts"]');
    draftsFilter?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openCreate();
    }, true);

    document.querySelectorAll('[data-kt-profile-tab]').forEach((button) => button.addEventListener('click', () => renderProfile(button.dataset.ktProfileTab)));
    const createForm = document.querySelector('[data-kt-native-create-form]');
    createForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const caption = form.elements.caption.value.trim();
      if (!caption) return;
      const local = nativeState();
      local.drafts.push({ id: `draft-${Date.now()}`, caption, format: form.elements.format.value, createdAt: new Date().toISOString() });
      local.inboxRead = false;
      saveNative(local);
      form.reset();
      renderDrafts();
      updateInboxBadge();
      toast('Draft saved on this device.');
    });
  }

  function init() {
    const app = document.querySelector('.kt-app');
    if (!app) return;
    ensureStyles();
    ensureNativeDialogs();
    replaceBottomNavigation();
    bindNativeNavigation();
    bindSocialInteractions();
    syncActionCounts();
    updateInboxBadge();
    app.dataset.deviceNative = 'true';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
