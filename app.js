const STORAGE_KEY = 'shelfed_users_v1';
const CURRENT_EMAIL_KEY = 'shelfed_current_email';
const THEMES = [
  { id: 'default', name: 'Warm pages', emblem: '☕', desc: 'Amber highlights and paper-soft warmth', colors: { accent: '#ff9900', accentDeep: '#e47911', accent2: '#007185' } },
  { id: 'mint', name: 'Mint library', emblem: '🌿', desc: 'Fresh greens and calm sea tones', colors: { accent: '#2b8a3e', accentDeep: '#1f6d2f', accent2: '#20a4f3' } },
  { id: 'twilight', name: 'Twilight', emblem: '🌙', desc: 'Cool violet pages and midnight ink', colors: { accent: '#9f7eff', accentDeep: '#7b5cff', accent2: '#4aa8ff' } },
  { id: 'paper', name: 'Bright ledger', emblem: '📝', desc: 'Clean white space with crisp contrast', colors: { accent: '#007185', accentDeep: '#00576d', accent2: '#ff9900' } }
];

const state = {
  user: null,
  profiles: [],
  previewBook: null,
  scanMode: false,
  scanner: null,
  currentStatus: 'own'
};

const ids = [
  'signin', 'app', 'signinStatus', 'profileList', 'themeEmblem', 'avatar', 'whoName',
  'searchInput', 'groupSelect', 'ownFilter', 'sortSelect', 'libraryGrid', 'libraryEmpty',
  'wishlistGrid', 'wishlistEmpty', 'scanBtn', 'reader', 'scanHint', 'isbnInput', 'lookupStatus',
  'previewPanel', 'previewDetail', 'statusChips', 'recStatus', 'recList', 'profileAvatar',
  'profileName', 'profileMail', 'avatarPicker', 'avatarHint', 'top5Row', 'friendLinkStatus',
  'friendsList', 'shareCard', 'shareText', 'copyStatus', 'darkToggle', 'themeGrid', 'toast',
  'modalBg', 'modalContent'
].reduce((map, id) => { map[id] = document.getElementById(id); return map; }, {});

function $(id) { return document.getElementById(id); }

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem(CURRENT_EMAIL_KEY);
  if (!email) return null;
  const users = loadUsers();
  return users[email] || null;
}

function getOrCreateUser(name, email) {
  const users = loadUsers();
  const trimmedEmail = email.trim().toLowerCase();
  if (users[trimmedEmail]) {
    const user = users[trimmedEmail];
    user.name = name || user.name;
    return user;
  }

  const avatar = name.trim().charAt(0).toUpperCase() || 'S';
  return {
    name: name.trim() || 'Reader',
    email: trimmedEmail,
    avatar,
    theme: 'default',
    dark: false,
    top5: [null, null, null, null, null],
    books: [],
    friends: []
  };
}

function saveCurrentUser() {
  if (!state.user) return;
  const users = loadUsers();
  users[state.user.email] = state.user;
  saveUsers(users);
  localStorage.setItem(CURRENT_EMAIL_KEY, state.user.email);
}

function loadProfiles() {
  const users = Object.values(loadUsers());
  const list = $('profileList');
  list.innerHTML = '';
  if (!users.length) return;

  const heading = document.createElement('div');
  heading.className = 'pl';
  heading.textContent = 'Saved accounts';
  list.appendChild(heading);

  users.forEach(user => {
    const row = document.createElement('div');
    row.className = 'profile-row';
    row.addEventListener('click', () => {
      $('nameInput').value = user.name;
      $('emailInput').value = user.email;
      signIn();
    });
    row.innerHTML = `<strong>${user.name}</strong><span class="pe">${user.email}</span>`;
    list.appendChild(row);
  });
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2400);
}

function signIn() {
  const name = $('nameInput').value.trim();
  const email = $('emailInput').value.trim().toLowerCase();
  const status = $('signinStatus');

  if (!name || !email) {
    status.className = 'status err';
    status.textContent = 'Please enter both name and email.';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.className = 'status err';
    status.textContent = 'Please enter a valid email address.';
    return;
  }

  state.user = getOrCreateUser(name, email);
  saveCurrentUser();
  saveCurrentUser();
  state.user = getCurrentUser();
  loadProfiles();
  showApp();
}

function signOut() {
  localStorage.removeItem(CURRENT_EMAIL_KEY);
  state.scanMode = false;
  stopScanner();
  window.location.reload();
}

function showApp() {
  $('signin').style.display = 'none';
  $('app').style.display = 'block';
  state.currentStatus = 'own';
  updateUserHeader();
  renderLibrary();
  renderWishlist();
  renderProfile();
  renderThemeGrid();
  setDark(state.user.dark);
  applyTheme(state.user.theme);
}

function updateUserHeader() {
  $('whoName').textContent = state.user.name;
  $('avatar').textContent = state.user.avatar;
  $('profileName').textContent = state.user.name;
  $('profileMail').textContent = state.user.email;
  $('profileAvatar').textContent = state.user.avatar;
  $('themeEmblem').textContent = THEMES.find(theme => theme.id === state.user.theme)?.emblem || '';
}

function showView(view) {
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === `view-${view}`);
  });
  document.querySelectorAll('.tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  if (view !== 'add') {
    stopScanner();
  }
  if (view === 'library') {
    renderLibrary();
  }
  if (view === 'wishlist') {
    renderWishlist();
  }
  if (view === 'profile') {
    renderProfile();
  }
}

function renderLibrary() {
  if (!state.user) return;
  const query = $('searchInput').value.trim().toLowerCase();
  const groupBy = $('groupSelect').value;
  const filter = $('ownFilter').value;
  const sortBy = $('sortSelect').value;

  let books = state.user.books.slice();

  books = books.filter(book => {
    if (filter === 'own' && book.status !== 'own') return false;
    if (filter === 'borrow' && book.status !== 'borrow') return false;
    if (!query) return true;
    return [book.title, book.author, book.series, book.isbn, book.status].some(value =>
      String(value || '').toLowerCase().includes(query)
    );
  });

  if (sortBy === 'rating') {
    books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'title') {
    books.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'author') {
    books.sort((a, b) => a.author.localeCompare(b.author));
  } else {
    books.sort((a, b) => b.addedAt - a.addedAt);
  }

  const grid = $('libraryGrid');
  grid.innerHTML = '';

  if (!books.length) {
    $('libraryEmpty').style.display = 'block';
    return;
  }
  $('libraryEmpty').style.display = 'none';

  if (groupBy !== 'none') {
    const groups = books.reduce((acc, book) => {
      const key = (book[groupBy] || 'Unknown').trim() || 'Unknown';
      acc[key] = acc[key] || [];
      acc[key].push(book);
      return acc;
    }, {});

    Object.keys(groups).sort().forEach((groupName) => {
      const groupSection = document.createElement('div');
      groupSection.className = 'group-block';
      groupSection.innerHTML = `
        <div class="group-head">
          <button class="group-title plain">${groupName}</button>
          <span class="group-count">${groups[groupName].length} book${groups[groupName].length === 1 ? '' : 's'}</span>
        </div>
      `;
      const groupGrid = document.createElement('div');
      groupGrid.className = 'grid';
      groups[groupName].forEach(book => groupGrid.appendChild(createBookCard(book)));
      groupSection.appendChild(groupGrid);
      grid.appendChild(groupSection);
    });
  } else {
    grid.className = 'grid';
    books.forEach(book => grid.appendChild(createBookCard(book)));
  }

  renderShelfStats(books);
}

function renderShelfStats(books) {
  const total = books.length;
  const owned = books.filter(book => book.status === 'own').length;
  const borrowed = books.filter(book => book.status === 'borrow').length;
  const wishlist = books.filter(book => book.status === 'wishlist').length;
  const stats = $('shelfStats');
  stats.innerHTML = `
    <div class="stat"><div class="num">${total}</div><div class="lbl">Shelf total</div></div>
    <div class="stat"><div class="num">${owned}</div><div class="lbl">Owned</div></div>
    <div class="stat"><div class="num">${borrowed}</div><div class="lbl">Borrowed</div></div>
    <div class="stat"><div class="num">${wishlist}</div><div class="lbl">Wishlist</div></div>
  `;
}

function createBookCard(book) {
  const button = document.createElement('button');
  button.className = 'book-card';
  button.addEventListener('click', () => openBookModal(book.id));

  const cover = book.cover ?
    `<img src="${book.cover}" alt="${book.title} cover">` :
    `<div class="cover-fallback"><div class="t">${book.title}</div><div class="a">${book.author}</div></div>`;

  button.innerHTML = `
    <div class="cover-wrap">${cover}
      <div class="status-badge">${book.status === 'own' ? 'Owned' : book.status === 'borrow' ? 'Borrowed' : 'Wishlist'}</div>
      ${book.top5 ? '<div class="top-badge">★</div>' : ''}
    </div>
    <div class="card-meta">
      <span class="card-title">${book.title}</span>
      <div class="card-stars">${renderRating(book.rating)}</div>
    </div>
  `;
  return button;
}

function renderRating(rating) {
  if (!rating) return '<span class="unrated">No rating</span>';
  return '★'.repeat(Math.min(5, rating));
}

function renderWishlist() {
  if (!state.user) return;
  const wishlist = state.user.books.filter(book => book.status === 'wishlist');
  const grid = $('wishlistGrid');
  grid.innerHTML = '';
  if (!wishlist.length) {
    $('wishlistEmpty').style.display = 'block';
    return;
  }
  $('wishlistEmpty').style.display = 'none';
  wishlist.forEach(book => grid.appendChild(createBookCard(book)));
}

function openBookModal(bookId) {
  const book = state.user.books.find(item => item.id === bookId);
  if (!book) return;

  $('modalContent').innerHTML = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="detail">
      <div class="cover-wrap">${book.cover ? `<img src="${book.cover}" alt="${book.title} cover">` : `<div class="cover-fallback"><div class="t">${book.title}</div><div class="a">${book.author}</div></div>`}</div>
      <div class="detail-info">
        <h3>${book.title}</h3>
        <div class="author">${book.author}</div>
        ${book.series ? `<div class="series-line">Series: ${book.series}</div>` : ''}
        <div class="blurb">${book.blurb || 'No description available.'}</div>
        <div class="field-label">Status</div>
        <div class="chips">
          <button class="chip ${book.status === 'own' ? 'on' : ''}" onclick="updateBookStatus('${book.id}','own')">✓ Own</button>
          <button class="chip ${book.status === 'borrow' ? 'on' : ''}" onclick="updateBookStatus('${book.id}','borrow')">↩ Borrowed</button>
          <button class="chip ${book.status === 'wishlist' ? 'on' : ''}" onclick="updateBookStatus('${book.id}','wishlist')">🔐 Wishlist</button>
        </div>
      </div>
    </div>
  `;
  $('modalBg').classList.add('open');
}

function closeModal() {
  $('modalBg').classList.remove('open');
  $('modalContent').innerHTML = '';
}

function updateBookStatus(bookId, status) {
  const book = state.user.books.find(item => item.id === bookId);
  if (!book) return;
  book.status = status;
  saveCurrentUser();
  renderLibrary();
  renderWishlist();
  openBookModal(bookId);
}

async function lookupManual() {
  const query = $('isbnInput').value.trim();
  if (!query) {
    setStatus('lookupStatus', 'Enter an ISBN or title to search.', 'err');
    return;
  }
  clearPreview();
  setStatus('lookupStatus', 'Looking up your book…', '');

  if (/^\d{9}[\dXx]$|^\d{13}$/.test(query.replace(/[^0-9Xx]/g, ''))) {
    const normalized = normalizeIsbn(query);
    await lookupISBN(normalized);
    return;
  }

  await searchOpenLibrary(query);
}

function normalizeIsbn(input) {
  return input.replace(/[^0-9Xx]/g, '');
}

async function lookupISBN(isbn) {
  setStatus('scanHint', `Found barcode ${isbn}. Looking it up...`, '');
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    if (!response.ok) {
      return searchOpenLibrary(isbn);
    }
    const raw = await response.json();
    const edition = await fetch(`https://openlibrary.org${raw.key}.json`).then(res => res.json()).catch(() => raw);
    const book = mapOpenLibraryResult({ ...raw, ...edition, isbn });
    showPreview(book);
    setStatus('lookupStatus', '', '');
  } catch (error) {
    await searchOpenLibrary(isbn);
  }
}

async function searchOpenLibrary(query) {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`);
    const result = await response.json();
    if (!result.docs || !result.docs.length) {
      setStatus('lookupStatus', 'No matching book was found.', 'err');
      return;
    }
    const raw = result.docs[0];
    const book = mapOpenLibraryResult({ title: raw.title, author_name: raw.author_name, isbn: raw.isbn && raw.isbn[0], first_publish_year: raw.first_publish_year, subject: raw.subject, cover_i: raw.cover_i, subtitle: raw.subtitle, series: raw.series });
    showPreview(book);
    setStatus('lookupStatus', '', '');
  } catch (error) {
    setStatus('lookupStatus', 'Unable to look up the book right now.', 'err');
  }
}

function mapOpenLibraryResult(raw) {
  const title = raw.title || 'Untitled';
  const author = Array.isArray(raw.author_name) ? raw.author_name[0] : raw.author || 'Unknown author';
  const series = Array.isArray(raw.series) ? raw.series[0] : raw.series || '';
  const isbn = raw.isbn || raw.key || '';
  const cover = raw.cover_i ? `https://covers.openlibrary.org/b/id/${raw.cover_i}-L.jpg` : raw.cover ? `https://covers.openlibrary.org/b/isbn/${raw.cover}-L.jpg` : '';
  return {
    id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    author,
    series,
    isbn: String(isbn),
    cover,
    blurb: raw.subtitle || raw.description || (Array.isArray(raw.subject) ? raw.subject.slice(0, 4).join(', ') : '') || 'A fresh addition to your shelf.',
    status: state.currentStatus,
    rating: 0,
    addedAt: Date.now()
  };
}

function showPreview(book) {
  state.previewBook = book;
  state.currentStatus = book.status || 'own';
  $('previewPanel').style.display = 'block';
  $('previewDetail').innerHTML = `
    <div class="cover-wrap">${book.cover ? `<img src="${book.cover}" alt="${book.title} cover">` : `<div class="cover-fallback"><div class="t">${book.title}</div><div class="a">${book.author}</div></div>`}</div>
    <div class="detail-info">
      <h3>${book.title}</h3>
      <div class="author">${book.author}</div>
      ${book.series ? `<div class="series-line">Series: ${book.series}</div>` : ''}
      <div class="blurb">${book.blurb}</div>
    </div>
  `;
  updateStatusChips();
}

function updateStatusChips() {
  document.querySelectorAll('#statusChips .chip').forEach(button => {
    const status = button.dataset.s;
    button.classList.toggle('on', status === state.currentStatus);
  });
}

function pickStatus(status) {
  state.currentStatus = status;
  if (state.previewBook) {
    state.previewBook.status = status;
  }
  updateStatusChips();
}

function addPreviewToLibrary() {
  if (!state.previewBook || !state.user) {
    showToast('No book is ready to add.');
    return;
  }

  state.previewBook.status = state.currentStatus;
  state.previewBook.addedAt = Date.now();
  state.user.books.unshift(state.previewBook);
  saveCurrentUser();
  renderLibrary();
  renderWishlist();
  showToast('Book added to your shelf.');
  clearPreview();
}

function clearPreview() {
  state.previewBook = null;
  $('previewPanel').style.display = 'none';
  $('previewDetail').innerHTML = '';
  setStatus('lookupStatus', '', '');
}

function setStatus(id, text, stateClass = '') {
  const status = $(id);
  if (!status) return;
  status.className = `status ${stateClass}`.trim();
  status.textContent = text;
}

async function toggleScanner() {
  if (state.scanMode) {
    stopScanner();
    return;
  }
  startScanner();
}

function stopScanner() {
  if (!state.scanMode) return;
  state.scanMode = false;
  $('scanBtn').textContent = '📷 Start scanning';
  $('scanHint').textContent = '';
  if (!state.scanner) return;
  state.scanner.stop().then(() => state.scanner.clear()).catch(() => {}).finally(() => {
    state.scanner = null;
  });
}

function startScanner() {
  const reader = $('reader');
  reader.innerHTML = '';
  const html5QrCode = new Html5Qrcode('reader');

  const config = { fps: 10, qrbox: 250 };
  state.scanMode = true;
  state.scanner = html5QrCode;
  $('scanBtn').textContent = '⏹ Stop scanning';
  $('scanHint').textContent = 'Point your camera at a book barcode.';
  setStatus('lookupStatus', '', '');

  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras || !cameras.length) {
      setStatus('lookupStatus', 'No camera found.', 'err');
      stopScanner();
      return;
    }
    const cameraId = cameras[0].id;
    html5QrCode.start(
      { deviceId: { exact: cameraId } },
      config,
      decodedText => {
        stopScanner();
        lookupISBN(decodedText);
      },
      () => {}
    ).catch(() => {
      setStatus('lookupStatus', 'Camera access blocked or unavailable.', 'err');
      stopScanner();
    });
  }).catch(() => {
    setStatus('lookupStatus', 'Unable to access camera.', 'err');
    stopScanner();
  });
}

function getRecommendations() {
  if (!state.user) return;
  const recList = $('recList');
  $('recStatus').innerHTML = '<span class="spinner"></span>Finding a few picks…';
  recList.innerHTML = '';

  const recommendations = [
    { title: 'The Midnight Library', author: 'Matt Haig', why: 'A thoughtful story about regret, books, and second chances.', link: 'https://www.amazon.com' },
    { title: 'Dune', author: 'Frank Herbert', why: 'A world-building classic with unforgettable scope.', link: 'https://www.amazon.com' },
    { title: 'The Night Circus', author: 'Erin Morgenstern', why: 'Spellbinding atmosphere and a magical rivalry.', link: 'https://www.amazon.com' }
  ];

  setTimeout(() => {
    $('recStatus').textContent = '';
    recommendations.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.innerHTML = `
        <div class="cover-wrap"><div class="cover-fallback"><div class="t">${rec.title}</div><div class="a">${rec.author}</div></div></div>
        <div>
          <h4>${rec.title}</h4>
          <div class="rec-author">${rec.author}</div>
          <div class="rec-why">${rec.why}</div>
          <div class="rec-add"><a class="btn ghost" target="_blank" rel="noreferrer" href="${rec.link}">View</a></div>
        </div>
      `;
      recList.appendChild(card);
    });
  }, 800);
}

function copyFriendLink() {
  if (!state.user) return;
  const base = window.location.href.split('?')[0];
  const url = `${base}?friend=${encodeURIComponent(state.user.email)}`;
  navigator.clipboard.writeText(url).then(() => {
    setStatus('friendLinkStatus', 'Friend link copied.', 'ok');
  }).catch(() => {
    setStatus('friendLinkStatus', 'Unable to copy link.', 'err');
  });
}

function copyShare() {
  if (!state.user) return;
  const lines = [`${state.user.name}'s shelf:`];
  state.user.books.slice(0, 10).forEach((book, index) => {
    lines.push(`${index + 1}. ${book.title} by ${book.author} (${book.status})`);
  });
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    setStatus('copyStatus', 'Copied to clipboard.', 'ok');
  }).catch(() => {
    setStatus('copyStatus', 'Unable to copy.', 'err');
  });
  $('shareCard').innerHTML = `<h3>Share text</h3><div class="sc-sub">A quick snapshot of your shelf.</div>`;
  $('shareText').textContent = text;
}

function setDark(isDark) {
  if (!state.user) return;
  state.user.dark = isDark;
  saveCurrentUser();
  document.documentElement.dataset.theme = isDark ? 'dark' : '';
  $('darkToggle').checked = isDark;
}

function renderThemeGrid() {
  const grid = $('themeGrid');
  grid.innerHTML = '';
  THEMES.forEach(theme => {
    const card = document.createElement('button');
    card.className = 'theme-card';
    if (state.user.theme === theme.id) card.classList.add('on');
    card.innerHTML = `
      <div><span class="tname">${theme.name}</span><span class="temblem">${theme.emblem}</span></div>
      <div class="tdesc">${theme.desc}</div>
      <div class="swatches">
        <span class="swatch" style="background:${theme.colors.accent}"></span>
        <span class="swatch" style="background:${theme.colors.accentDeep}"></span>
        <span class="swatch" style="background:${theme.colors.accent2}"></span>
      </div>
    `;
    card.addEventListener('click', () => {
      state.user.theme = theme.id;
      saveCurrentUser();
      applyTheme(theme.id);
      renderThemeGrid();
    });
    grid.appendChild(card);
  });
}

function applyTheme(themeId) {
  const theme = THEMES.find(item => item.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-deep', theme.colors.accentDeep);
  root.style.setProperty('--accent-2', theme.colors.accent2);
  $('themeEmblem').textContent = theme.emblem;
}

function renderProfile() {
  if (!state.user) return;
  const avatars = ['📚', '🦉', '✨', '📖', '🌿', '☕', '🎩', '🧭'];
  const picker = $('avatarPicker');
  picker.innerHTML = '';

  avatars.forEach(symbol => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'avatar-opt';
    if (state.user.avatar === symbol) item.classList.add('on');
    item.textContent = symbol;
    item.addEventListener('click', () => {
      state.user.avatar = symbol;
      saveCurrentUser();
      updateUserHeader();
      renderProfile();
    });
    picker.appendChild(item);
  });

  $('avatarHint').textContent = 'Pick an icon to personalize your shelf.';
  renderTopFive();
  renderFriendSummary();
  copyShare();
}

function renderTopFive() {
  const row = $('top5Row');
  row.innerHTML = '';
  state.user.top5.forEach((bookId, index) => {
    const slot = document.createElement('div');
    slot.className = 'top5-slot';
    const book = state.user.books.find(b => b.id === bookId);
    slot.innerHTML = `
      <div class="slot-num">#${index + 1}</div>
      <button class="book-card" type="button" onclick="chooseTopFive(${index})">
        <div class="cover-wrap ${book ? '' : 'empty-slot'}">
          ${book ? (book.cover ? `<img src="${book.cover}" alt="${book.title} cover">` : `<div class="cover-fallback"><div class="t">${book.title}</div><div class="a">${book.author}</div></div>`) : '＋'}
        </div>
      </button>
      <span class="slot-title">${book ? book.title : 'Empty slot'}</span>
    `;
    row.appendChild(slot);
  });
}

function chooseTopFive(index) {
  const picker = document.createElement('div');
  picker.className = 'picker-list';
  state.user.books.forEach(book => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'picker-item';
    item.innerHTML = `
      <div class="cover-wrap">${book.cover ? `<img src="${book.cover}" alt="${book.title} cover">` : `<div class="cover-fallback"><div class="t">${book.title}</div></div>`}</div>
      <div>
        <div class="pt">${book.title}</div>
        <div class="pa">${book.author}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      state.user.top5[index] = book.id;
      saveCurrentUser();
      renderTopFive();
      closeModal();
    });
    picker.appendChild(item);
  });

  if (!state.user.books.length) {
    picker.textContent = 'Add books to your shelf to fill your top 5.';
  }

  $('modalContent').innerHTML = `<button class="modal-close" onclick="closeModal()">×</button><h3 class="mh">Choose top ${index + 1}</h3>`;
  $('modalContent').appendChild(picker);
  $('modalBg').classList.add('open');
}

function renderFriendSummary() {
  const list = $('friendsList');
  list.innerHTML = '';
  if (!state.user.friends.length) {
    list.innerHTML = '<div class="empty">No shared friends yet.</div>';
    return;
  }
  state.user.friends.forEach(email => {
    const friend = loadUsers()[email];
    if (!friend) return;
    const row = document.createElement('div');
    row.className = 'friend-row';
    row.innerHTML = `<div><div class="fname">${friend.name}</div><div class="fmeta">${friend.email}</div></div><div class="fx">View</div>`;
    list.appendChild(row);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
  const current = getCurrentUser();
  if (current) {
    state.user = current;
    showApp();
  }
});

window.updateBookStatus = updateBookStatus;
window.chooseTopFive = chooseTopFive;
window.closeModal = closeModal;
window.signIn = signIn;
window.signOut = signOut;
window.showView = showView;
window.lookupManual = lookupManual;
window.pickStatus = pickStatus;
window.addPreviewToLibrary = addPreviewToLibrary;
window.clearPreview = clearPreview;
window.toggleScanner = toggleScanner;
window.getRecommendations = getRecommendations;
window.copyFriendLink = copyFriendLink;
window.copyShare = copyShare;
window.setDark = setDark;
