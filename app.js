const STORAGE_KEY = 'shelfed_users_v1';
const CURRENT_EMAIL_KEY = 'shelfed_current_email';

function makeSvgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function makeThemeBackground(colors, motif) {
  const base = colors.base || '#f7f3eb';
  const accent = colors.accent || '#9b5e1b';
  const accent2 = colors.accent2 || '#4a6b5d';
  const motifs = {
    hogwarts: `<path d="M120 110l24 42 46 10-33 30 10 44-47-24-47 24 10-44-33-30 46-10z" fill="${accent}" opacity="0.2"/>`,
    middleearth: `<path d="M150 140L110 40 80 92 50 60v82h100z" fill="${accent}" opacity="0.18"/>`,
    gatsby: `<path d="M100 40h120v20H100zm0 40h120v20H100zm0 80h120v20H100z" fill="${accent}" opacity="0.16"/><rect x="70" y="120" width="140" height="120" rx="18" fill="${accent2}" opacity="0.12"/>`,
    sherlock: `<path d="M70 140h140M140 70v140M90 90l100 100M90 190l100-100" stroke="${accent}" stroke-width="12" opacity="0.16"/>`
  };
  const pattern = motifs[motif] || `<rect x="70" y="70" width="140" height="140" rx="20" fill="${accent}" opacity="0.14"/>`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <rect width="320" height="220" rx="28" fill="${base}"/>
      <rect x="24" y="24" width="272" height="172" rx="24" fill="${accent2}" opacity="0.16"/>
      <rect x="44" y="44" width="232" height="132" rx="20" fill="${accent}" opacity="0.12"/>
      ${pattern}
    </svg>`;
  return makeSvgDataUri(svg);
}

function makeAvatarImage(label, colors) {
  const [bg, ring, accent] = colors;
  const safeLabel = String(label).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="36" fill="${bg}"/>
      <circle cx="120" cy="92" r="46" fill="${ring}"/>
      <path d="M58 204c12-34 38-54 62-54s50 20 62 54" fill="${accent}"/>
      <text x="120" y="218" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="30" font-weight="700" fill="#fff">${safeLabel}</text>
    </svg>`;
  return makeSvgDataUri(svg);
}

const THEMES = [
  {
    id: 'hogwarts',
    name: 'Hogwarts Library',
    emblem: '🦉',
    desc: 'Candle-lit shelves, hidden spells, and wizarding wonder.',
    colors: { accent: '#b2923f', accentDeep: '#5d431b', accent2: '#2e5338' },
    background: makeThemeBackground({ base: '#f6ebd3', accent: '#b2923f', accent2: '#2e5338' }, 'hogwarts')
  },
  {
    id: 'middleearth',
    name: 'Middle-earth',
    emblem: '💍',
    desc: 'Warm parchment, map lines, and the quiet comfort of a hobbit hole.',
    colors: { accent: '#a67c3e', accentDeep: '#5c4526', accent2: '#3f5c4f' },
    background: makeThemeBackground({ base: '#f3e8d2', accent: '#a67c3e', accent2: '#3f5c4f' }, 'middleearth')
  },
  {
    id: 'gatsby',
    name: 'Gatsby Jazz',
    emblem: '🌃',
    desc: 'Emerald nights, golden art deco lines, and roaring party glow.',
    colors: { accent: '#f2d46f', accentDeep: '#907545', accent2: '#12233d' },
    background: makeThemeBackground({ base: '#fef6dd', accent: '#f2d46f', accent2: '#12233d' }, 'gatsby')
  },
  {
    id: 'sherlock',
    name: 'Baker Street',
    emblem: '🕯️',
    desc: 'Velvet shadows, brass accents, and the scent of old paper and mystery.',
    colors: { accent: '#d7b26a', accentDeep: '#4d402f', accent2: '#3b4f56' },
    background: makeThemeBackground({ base: '#efe6d6', accent: '#d7b26a', accent2: '#3b4f56' }, 'sherlock')
  }
];

const CHARACTER_OPTIONS = [
  { name: 'Harry Potter', image: makeAvatarImage('HP', ['#8d4f2d', '#cfa86b', '#5b3b1f']) },
  { name: 'Frodo Baggins', image: makeAvatarImage('FB', ['#6d4d2d', '#c49a61', '#3f2b16']) },
  { name: 'Jay Gatsby', image: makeAvatarImage('JG', ['#20364a', '#d7be7b', '#7c4c21']) },
  { name: 'Hermione Granger', image: makeAvatarImage('HG', ['#3d5a4a', '#c7a56e', '#2f3f34']) },
  { name: 'Bilbo Baggins', image: makeAvatarImage('BB', ['#6a4a2b', '#d7b37d', '#4e3017']) },
  { name: 'Elizabeth Bennet', image: makeAvatarImage('EB', ['#6f4d4b', '#d3b38b', '#4a332b']) },
  { name: 'Sherlock Holmes', image: makeAvatarImage('SH', ['#3b4f56', '#cfa76b', '#2a343c']) },
  { name: 'Lyra Belacqua', image: makeAvatarImage('LB', ['#4a315d', '#a88b5f', '#2b2038']) }
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

  const avatar = CHARACTER_OPTIONS[0].name;
  return {
    name: name.trim() || 'Reader',
    email: trimmedEmail,
    avatar,
    theme: 'hogwarts',
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

function setDark(isDark) {
  if (!state.user) return;
  state.user.dark = !!isDark;
  const root = document.documentElement;
  if (state.user.dark) {
    root.dataset.theme = 'dark';
    document.body.dataset.theme = 'dark';
  } else {
    delete root.dataset.theme;
    delete document.body.dataset.theme;
  }
  const toggle = $('darkToggle');
  if (toggle) toggle.checked = state.user.dark;
  saveCurrentUser();
}

function getAvatarInitials(name) {
  const parts = String(name || '').split(' ').filter(Boolean);
  if (!parts.length) return 'R';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function updateUserHeader() {
  const selectedCharacter = CHARACTER_OPTIONS.find(item => item.name === state.user.avatar);
  $('whoName').textContent = state.user.name;
  if (selectedCharacter && selectedCharacter.image) {
    $('avatar').style.backgroundImage = `url('${selectedCharacter.image}')`;
    $('avatar').textContent = '';
  } else {
    $('avatar').style.backgroundImage = '';
    $('avatar').textContent = getAvatarInitials(state.user.avatar);
  }
  $('profileName').textContent = state.user.name;
  $('profileMail').textContent = state.user.email;
  if (selectedCharacter && selectedCharacter.image) {
    $('profileAvatar').style.backgroundImage = `url('${selectedCharacter.image}')`;
    $('profileAvatar').textContent = '';
  } else {
    $('profileAvatar').style.backgroundImage = '';
    $('profileAvatar').textContent = getAvatarInitials(state.user.avatar);
  }
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
  const ratedBooks = books.filter(book => Number(book.rating) > 0);
  const averageRating = ratedBooks.length ? (ratedBooks.reduce((sum, book) => sum + Number(book.rating), 0) / ratedBooks.length).toFixed(1) : '—';
  const stats = $('shelfStats');
  stats.innerHTML = `
    <div class="stat"><div class="num">${total}</div><div class="lbl">Shelf total</div></div>
    <div class="stat"><div class="num">${owned}</div><div class="lbl">Owned</div></div>
    <div class="stat"><div class="num">${borrowed}</div><div class="lbl">Borrowed</div></div>
    <div class="stat"><div class="num">${wishlist}</div><div class="lbl">Wishlist</div></div>
    <div class="stat"><div class="num">${averageRating}</div><div class="lbl">Avg rating</div></div>
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
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  if (!value) return '<span class="unrated">Not rated</span>';
  const stars = Array.from({ length: 5 }, (_, index) => {
    const fill = Math.max(0, Math.min(1, value - index));
    return `<span class="star-icon" style="--fill:${fill.toFixed(2)}"><span class="star-bg">☆</span><span class="star-fg">★</span></span>`;
  }).join('');
  return `<span class="rating-stars" aria-label="${value.toFixed(1)} out of 5 stars">${stars}</span>`;
}

function buildAmazonUrl(book) {
  const query = book.isbn ? `${book.isbn} ${book.title} ${book.author}` : `${book.title} ${book.author}`;
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function renderRatingEditor(book) {
  return `
    <div class="rating-editor">
      <div class="rating-row">
        <div class="rating-stars">${renderRating(book.rating)}</div>
        <span class="rating-readout">${Number(book.rating) > 0 ? `${Number(book.rating).toFixed(1)} / 5` : 'Not rated yet'}</span>
      </div>
      <input class="rating-range" type="range" min="0" max="5" step="0.5" value="${Number(book.rating) || 0}" onchange="setBookRating('${book.id}', parseFloat(this.value))">
      <div class="rating-scale"><span>0</span><span>2.5</span><span>5</span></div>
    </div>
  `;
}

function setBookRating(bookId, rating) {
  const book = state.user?.books.find(item => item.id === bookId);
  if (!book) return;
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0));
  book.rating = Math.round(normalized * 10) / 10;
  saveCurrentUser();
  renderLibrary();
  renderWishlist();
  openBookModal(bookId);
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

function renderRelatedResults(bookId, relationType) {
  const book = state.user.books.find(item => item.id === bookId);
  if (!book) return;

  const query = relationType === 'author' ? book.author : (book.series || book.title);
  const heading = relationType === 'author' ? `More by ${book.author}` : `More in ${book.series || book.title}`;
  $('modalContent').innerHTML = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <h3 class="mh">${escapeHtml(heading)}</h3>
    <div class="sub" style="margin-top:-6px">Searching for “${escapeHtml(query)}”.</div>
    <div class="status">Loading related books…</div>
  `;
  $('modalBg').classList.add('open');

  fetchOpenLibraryBooks(query, 8).then(books => {
    const filtered = books.filter(item => !(item.title === book.title && item.author === book.author));
    const content = document.createElement('div');
    content.className = 'picker-list';

    if (!filtered.length) {
      content.innerHTML = '<div class="empty">No related books were found.</div>';
    } else {
      filtered.forEach(result => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'picker-item';
        item.innerHTML = `
          <div class="cover-wrap">${result.cover ? `<img src="${result.cover}" alt="${escapeHtml(result.title)} cover">` : `<div class="cover-fallback"><div class="t">${escapeHtml(result.title)}</div></div>`}</div>
          <div>
            <div class="pt">${escapeHtml(result.title)}</div>
            <div class="pa">${escapeHtml(result.author)}</div>
          </div>
        `;
        item.addEventListener('click', () => addBookToLibrary(result));
        content.appendChild(item);
      });
    }

    $('modalContent').innerHTML = `
      <button class="modal-close" onclick="closeModal()">×</button>
      <h3 class="mh">${escapeHtml(heading)}</h3>
      <div class="sub" style="margin-top:-6px">Tap a result to add it to your shelf.</div>
      <div class="row" style="margin-bottom:12px">
        <button class="btn ghost small" onclick="openBookModal('${book.id}')">Back to book</button>
      </div>
    `;
    $('modalContent').appendChild(content);
  }).catch(() => {
    $('modalContent').innerHTML = `
      <button class="modal-close" onclick="closeModal()">×</button>
      <h3 class="mh">${escapeHtml(heading)}</h3>
      <div class="status err">Unable to load related books right now.</div>
    `;
  });
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
        <div class="author"><button class="author-link" onclick="renderRelatedResults('${book.id}','author')">${book.author}</button></div>
        ${book.series ? `<div class="series-line">Series: <button class="author-link" onclick="renderRelatedResults('${book.id}','series')">${book.series}</button></div>` : ''}
        <div class="blurb">${book.blurb || 'No description available.'}</div>
        <div class="field-label">Your rating</div>
        ${renderRatingEditor(book)}
        <div class="row" style="margin-top:16px">
          <a class="btn ghost" href="${buildAmazonUrl(book)}" target="_blank" rel="noreferrer">View on Amazon</a>
        </div>
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
    const books = await fetchOpenLibraryBooks(query, 8);
    if (!books.length) {
      setStatus('lookupStatus', 'No matching book was found.', 'err');
      return [];
    }

    if (books.length > 1) {
      showSearchResults(books, query);
    } else {
      showPreview(books[0]);
    }
    setStatus('lookupStatus', '', '');
    return books;
  } catch (error) {
    setStatus('lookupStatus', 'Unable to look up the book right now.', 'err');
    return [];
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addBookToLibrary(book, options = {}) {
  if (!book || !state.user) {
    if (options.showToast !== false) showToast('No book is ready to add.');
    return null;
  }

  const normalized = {
    ...book,
    status: book.status || state.currentStatus,
    rating: Number(book.rating) || 0,
    addedAt: Date.now()
  };

  state.user.books.unshift(normalized);
  saveCurrentUser();
  renderLibrary();
  renderWishlist();
  if (options.showToast !== false) showToast('Book added to your shelf.');
  clearPreview();
  return normalized;
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

async function fetchOpenLibraryBooks(query, limit = 8) {
  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
  const result = await response.json();
  if (!result.docs || !result.docs.length) return [];

  return result.docs
    .map(raw => mapOpenLibraryResult({ title: raw.title, author_name: raw.author_name, isbn: raw.isbn && raw.isbn[0], first_publish_year: raw.first_publish_year, subject: raw.subject, cover_i: raw.cover_i, subtitle: raw.subtitle, series: raw.series, description: raw.description }))
    .filter(book => book.title !== 'Untitled' || book.author !== 'Unknown author');
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

function showSearchResults(books, query) {
  state.searchResults = books;
  state.previewBook = null;
  $('previewPanel').style.display = 'block';
  $('previewDetail').innerHTML = '';

  const heading = document.createElement('div');
  heading.innerHTML = `
    <h3>Choose a match</h3>
    <div class="sub" style="margin: 4px 0 12px;">Showing ${books.length} result${books.length === 1 ? '' : 's'} for “${escapeHtml(query)}”.</div>
  `;
  $('previewDetail').appendChild(heading);

  const list = document.createElement('div');
  list.className = 'picker-list';
  books.forEach(book => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'picker-item';
    item.innerHTML = `
      <div class="cover-wrap">${book.cover ? `<img src="${book.cover}" alt="${escapeHtml(book.title)} cover">` : `<div class="cover-fallback"><div class="t">${escapeHtml(book.title)}</div></div>`}</div>
      <div>
        <div class="pt">${escapeHtml(book.title)}</div>
        <div class="pa">${escapeHtml(book.author)}</div>
      </div>
    `;
    item.addEventListener('click', () => showPreview(book));
    list.appendChild(item);
  });
  $('previewDetail').appendChild(list);
}

function addPreviewToLibrary() {
  if (!state.previewBook || !state.user) {
    showToast('No book is ready to add.');
    return;
  }

  state.previewBook.status = state.currentStatus;
  addBookToLibrary(state.previewBook, { showToast: true });
}

function clearPreview() {
  state.previewBook = null;
  state.searchResults = [];
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

function buildRecommendationBook(rec) {
  return {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: rec.title,
    author: rec.author,
    series: rec.series || '',
    isbn: rec.isbn || '',
    cover: rec.cover || '',
    blurb: rec.blurb || rec.why || 'A thoughtful pick for your shelf.',
    status: 'wishlist',
    rating: 0,
    addedAt: Date.now()
  };
}

function addRecommendationToWishlist(rec) {
  const book = buildRecommendationBook(rec);
  addBookToLibrary(book, { showToast: true });
  closeModal();
}

function dismissRecommendation(rec, recList) {
  const card = recList.querySelector(`[data-rec-title="${encodeURIComponent(rec.title)}"]`);
  if (card) card.remove();
  const remaining = Array.from(recList.children).filter(child => child.dataset.recTitle);
  if (!remaining.length) {
    getRecommendations();
  }
}

function openRecommendationModal(rec) {
  const book = buildRecommendationBook(rec);
  const modal = $('modalContent');
  modal.innerHTML = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="detail">
      <div class="cover-wrap">${book.cover ? `<img src="${book.cover}" alt="${escapeHtml(book.title)} cover">` : `<div class="cover-fallback"><div class="t">${escapeHtml(book.title)}</div><div class="a">${escapeHtml(book.author)}</div></div>`}</div>
      <div class="detail-info">
        <h3>${escapeHtml(book.title)}</h3>
        <div class="author">${escapeHtml(book.author)}</div>
        <div class="blurb">${escapeHtml(book.blurb || 'No description available.')}</div>
        <div class="row" style="margin-top:16px">
          <button class="btn js-add-wishlist">Add to wishlist</button>
          <a class="btn ghost" href="${buildAmazonUrl(book)}" target="_blank" rel="noreferrer">View on Amazon</a>
        </div>
      </div>
    </div>
  `;
  modal.querySelector('.js-add-wishlist').addEventListener('click', () => addRecommendationToWishlist(rec));
  $('modalBg').classList.add('open');
}

async function getRecommendations() {
  if (!state.user) return;
  const recList = $('recList');
  $('recStatus').innerHTML = '<span class="spinner"></span>Finding a few picks…';
  recList.innerHTML = '';

  const sourceBooks = state.user.books
    .filter(book => Number(book.rating) >= 4 && book.status !== 'wishlist')
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 4);

  if (!sourceBooks.length) {
    $('recStatus').textContent = 'Rate a few books to get personalized recommendations.';
    return;
  }

  const queries = sourceBooks.flatMap(book => {
    const items = [];
    if (book.author) items.push(book.author);
    if (book.series) items.push(book.series);
    return items;
  }).filter(Boolean);

  const recommendations = [];
  const seen = new Set();

  try {
    for (const query of queries) {
      if (recommendations.length >= 6) break;
      const matches = await fetchOpenLibraryBooks(query, 3);
      for (const match of matches) {
        const key = `${match.title}|${match.author}`.toLowerCase();
        if (seen.has(key)) continue;
        const alreadyOwned = state.user.books.some(book =>
          book.title === match.title && book.author === match.author
        );
        if (alreadyOwned) continue;

        const source = sourceBooks.find(book =>
          (book.author && match.author && book.author.toLowerCase() === match.author.toLowerCase()) ||
          (book.series && match.series && book.series.toLowerCase() === match.series.toLowerCase())
        ) || sourceBooks[0];

        seen.add(key);
        recommendations.push({
          title: match.title,
          author: match.author,
          why: `Because you rated ${source.title} highly.`,
          blurb: match.blurb || `A strong fit based on your love of ${source.title}.`,
          cover: match.cover || '',
          isbn: match.isbn || '',
          series: match.series || ''
        });

        if (recommendations.length >= 6) break;
      }
    }

    if (!recommendations.length) {
      $('recStatus').textContent = 'No tailored suggestions were found yet.';
      return;
    }

    $('recStatus').textContent = '';
    recommendations.forEach(rec => {
      const card = document.createElement('div');
      card.className = 'rec-card';
      card.dataset.recTitle = rec.title;
      card.innerHTML = `
        <button class="rec-dismiss" type="button" aria-label="Dismiss recommendation" onclick="dismissRecommendation(${JSON.stringify(rec)}, this.closest('#recList'))">×</button>
        <div class="cover-wrap">${rec.cover ? `<img src="${rec.cover}" alt="${escapeHtml(rec.title)} cover">` : `<div class="cover-fallback"><div class="t">${escapeHtml(rec.title)}</div><div class="a">${escapeHtml(rec.author)}</div></div>`}</div>
        <div class="rec-body">
          <h4>${escapeHtml(rec.title)}</h4>
          <div class="rec-author">${escapeHtml(rec.author)}</div>
          <div class="rec-why">${escapeHtml(rec.why)}</div>
          <div class="rec-add">
            <button class="btn ghost small js-view">View</button>
            <button class="btn small js-wishlist">Add to wishlist</button>
          </div>
        </div>
      `;
      card.querySelector('.js-view').addEventListener('click', () => openRecommendationModal(rec));
      card.querySelector('.js-wishlist').addEventListener('click', () => addRecommendationToWishlist(rec));
      recList.appendChild(card);
    });
  } catch (error) {
    $('recStatus').textContent = 'Unable to load recommendations right now.';
  }
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
  state.user.dark = !!isDark;
  saveCurrentUser();
  if (state.user.dark) {
    document.documentElement.dataset.theme = 'dark';
    document.body.dataset.theme = 'dark';
  } else {
    delete document.documentElement.dataset.theme;
    delete document.body.dataset.theme;
  }
  $('darkToggle').checked = state.user.dark;
}

function renderThemeGrid() {
  const grid = $('themeGrid');
  grid.innerHTML = '';
  THEMES.forEach(theme => {
    const card = document.createElement('button');
    card.className = 'theme-card';
    if (state.user.theme === theme.id) card.classList.add('on');
    card.innerHTML = `
      <div class="theme-preview" style="background-image: url('${theme.background}')"></div>
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
  root.style.setProperty('--background-image', `url('${theme.background}')`);
  root.dataset.story = themeId;
  document.body.dataset.story = themeId;
  $('themeEmblem').textContent = theme.emblem;
}

function renderProfile() {
  if (!state.user) return;
  const picker = $('avatarPicker');
  picker.innerHTML = '';

  CHARACTER_OPTIONS.forEach(character => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'avatar-opt';
    if (state.user.avatar === character.name) item.classList.add('on');
    item.innerHTML = `
      <img src="${character.image}" alt="${character.name}" loading="lazy">
      <div class="character-name">${character.name}</div>
      <div class="character-book">Select this character</div>
    `;
    item.addEventListener('click', () => {
      state.user.avatar = character.name;
      saveCurrentUser();
      updateUserHeader();
      renderProfile();
    });
    picker.appendChild(item);
  });

  $('avatarHint').textContent = `Character: ${state.user.avatar}`;
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
window.setBookRating = setBookRating;
window.renderRelatedResults = renderRelatedResults;
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
