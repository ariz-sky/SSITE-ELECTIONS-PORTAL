/* ═══════════════════════════════════════════
   ITElect — script.js
   Backed by Supabase: nominees + votes + auth
   session all come from the real database now.
   Requires supabase-config.js loaded before this file.
   ═══════════════════════════════════════════ */

const MAX_VOTES = 10;

/* Nominees are loaded from Supabase at page load (see init at bottom) */
let nominees = [];

async function loadNominees() {
  const { data, error } = await supabaseClient
    .from('nominees')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load nominees:', error.message);
    nominees = [];
    return;
  }
  nominees = data || [];
}

const faqs = [
  {
    q: 'Who is eligible to vote?',
    a: 'All currently enrolled IT students who are active members of the IT Student Organization are eligible to vote. You must have attended at least one chapter meeting this semester and have a valid student ID.'
  },
  {
    q: 'How many nominees can I vote for?',
    a: 'Each student can select and vote for up to 10 nominees of their choice. You can change your selections as many times as you like before submitting your ballot.'
  },
  {
    q: 'Can I change my vote after submitting?',
    a: 'No, once your ballot is submitted it is final and cannot be changed. Please review your selections carefully before confirming. This prevents double voting and ensures the integrity of the election.'
  },
  {
    q: 'When does voting close?',
    a: 'Voting closes on Friday at 11:59 PM. Results will be announced live on the dashboard immediately after voting ends. Make sure to cast your vote before the deadline.'
  },
  {
    q: 'Is my vote anonymous?',
    a: 'Yes, your identity is separated from your ballot after authentication. The system only records that you voted, not who you voted for, ensuring full anonymity.'
  },
  {
    q: "I didn't get my verification code during sign up. What should I do?",
    a: 'Check your spam folder first. If it still hasn\'t arrived after about 30 seconds, use the "Resend Code" button on the sign-up page. Contact the Election Committee if you still have trouble.'
  },
  {
    q: 'I forgot my password. What should I do?',
    a: 'Contact the Election Committee with your Student ID to have your password reset. Verification codes are only sent during account creation, not for everyday logins.'
  }
];

/* ─────────────────────────────────────────
   FAQ SECTION
   ───────────────────────────────────────── */
function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-question" onclick="toggleFAQ(${i})">
        ${f.q}
        <div class="faq-toggle">+</div>
      </button>
      <div class="faq-answer">${f.a}</div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const item   = document.getElementById(`faq-${i}`);
  const ans    = item.querySelector('.faq-answer');
  const tog    = item.querySelector('.faq-toggle');
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-answer').classList.remove('open');
    el.querySelector('.faq-toggle').textContent = '+';
  });

  if (!isOpen) {
    item.classList.add('open');
    ans.classList.add('open');
    tog.textContent = '✕';
  }
}

/* ─────────────────────────────────────────
   AUTH STATE
   currentUser = { id, studentId, email, voted, isAdmin } or null
   ───────────────────────────────────────── */
let currentUser = null;

function setLoggedIn(user) {
  currentUser = user;
  const displayName = user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  document.getElementById('nav-logged-out').style.display = 'none';
  document.getElementById('nav-logged-in').style.display  = 'block';
  document.getElementById('nav-links-guest').style.display = 'none';
  document.getElementById('nav-links-auth').style.display  = 'flex';
  document.getElementById('user-name-nav').textContent    = displayName.split(' ')[0];
  document.getElementById('ud-name').textContent          = displayName;
  document.getElementById('ud-email').textContent         = 'ID: ' + user.studentId;

  // Enter student mode: hide the public landing page, default to Nominees view
  document.getElementById('landing-content').style.display = 'none';
  showNomineesView();
}

function setLoggedOut() {
  currentUser = null;
  document.getElementById('nav-logged-out').style.display = '';
  document.getElementById('nav-logged-in').style.display  = 'none';
  document.getElementById('nav-links-guest').style.display = 'flex';
  document.getElementById('nav-links-auth').style.display  = 'none';
  document.getElementById('user-dropdown').classList.remove('open');

  document.getElementById('landing-content').style.display = '';
  hideAllViews();
}

function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const btn      = document.getElementById('btn-user');
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// Restore session from Supabase on page load (session itself is
// persisted by supabase-js under the hood, we just read it back)
async function checkSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) return; // no profile row yet — treat as logged out

  setLoggedIn({
    id: profile.id,
    studentId: profile.student_id,
    email: session.user.email,
    voted: profile.voted,
    isAdmin: profile.is_admin
  });
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  setLoggedOut();
  window.location.href = 'index.html';
}

/* ─────────────────────────────────────────
   VIEW SWITCHING (Nominees / Live Results)
   ───────────────────────────────────────── */
function hideAllViews() {
  document.getElementById('nominees-view').classList.remove('open');
  document.getElementById('results-view').classList.remove('open');
  document.querySelectorAll('#nav-links-auth a').forEach(a => a.classList.remove('active-view'));
}

function showNomineesView(e) {
  if (e) e.preventDefault();
  if (!currentUser) { window.location.href = 'login.html'; return; }
  hideAllViews();
  document.getElementById('nominees-view').classList.add('open');
  const link = document.getElementById('nav-nominees-link');
  if (link) link.classList.add('active-view');
  renderNominees();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

async function showResultsView(e) {
  if (e) e.preventDefault();
  hideAllViews();
  document.getElementById('results-view').classList.add('open');
  const link = document.getElementById('nav-results-link');
  if (link) link.classList.add('active-view');

  // If viewing as a guest, hide the landing content behind the results view
  if (!currentUser) document.getElementById('landing-content').style.display = 'none';

  await renderResultsView();

  // Back button: students go back to Nominees, guests go back to the landing page
  const backWrap = document.getElementById('results-back-wrap');
  if (currentUser) {
    backWrap.innerHTML = `<button class="btn-hero-secondary" onclick="showNomineesView()">← Back to Nominees</button>`;
  } else {
    backWrap.innerHTML = `<button class="btn-hero-secondary" onclick="closeResultsToLanding()">← Back to Home</button>`;
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeResultsToLanding() {
  hideAllViews();
  document.getElementById('landing-content').style.display = '';
  scrollToSection('home');
}

/* ─────────────────────────────────────────
   NOMINEES BALLOT
   ───────────────────────────────────────── */
let selected = [];

function hasAlreadyVoted() {
  return !!(currentUser && currentUser.voted);
}

function renderNominees(justVotedCount) {
  const grid   = document.getElementById('nominees-grid');
  const banner = document.getElementById('already-voted-banner');
  const wrap   = document.getElementById('ballot-wrap');

  if (hasAlreadyVoted()) {
    banner.innerHTML = justVotedCount
      ? `
        <div class="voted-icon">🎉</div>
        <h3>Vote Submitted!</h3>
        <p>Thank you for voting for ${justVotedCount} nominee${justVotedCount === 1 ? '' : 's'}. Your ballot has been securely recorded and cannot be changed.</p>
        <button class="btn-hero-primary" onclick="showResultsView()">View Live Results →</button>
      `
      : `
        <div class="voted-icon">✔</div>
        <h3>You've Already Voted</h3>
        <p>Your ballot has already been recorded. Voting again isn't allowed, to keep the election fair.</p>
        <button class="btn-hero-primary" onclick="showResultsView()">View Live Results →</button>
      `;
    banner.style.display = 'flex';
    wrap.style.display   = 'none';
    return;
  }
  banner.style.display = 'none';
  wrap.style.display    = '';

  grid.innerHTML = nominees.map(n => `
    <div class="nominee-card" id="nom-${n.id}" onclick="toggleNominee('${n.id}')" title="${n.slogan || ''}">
      <div class="nominee-photo">
        ${n.photo_url ? `<img src="${n.photo_url}" alt="${n.name}"/>` : '👤'}
        <div class="nominee-check">✓</div>
      </div>
      <div class="nominee-name-row">
        <div class="nominee-name">${n.name}</div>
        ${n.slogan ? `<span class="nominee-slogan-badge">${n.slogan}</span>` : ''}
      </div>
    </div>
  `).join('');

  selected.forEach(id => {
    const el = document.getElementById(`nom-${id}`);
    if (el) el.classList.add('selected');
  });

  updateNomineeProgress();
}

function toggleNominee(id) {
  const idx = selected.indexOf(id);
  const el  = document.getElementById(`nom-${id}`);

  if (idx > -1) {
    // Deselect — always allowed (re-selection)
    selected.splice(idx, 1);
    if (el) el.classList.remove('selected');
  } else {
    // Already at the max — ignore the click silently.
    // Student must deselect one of their current picks first.
    if (selected.length >= MAX_VOTES) return;
    selected.push(id);
    if (el) el.classList.add('selected');
  }
  updateNomineeProgress();
}

function updateNomineeProgress() {
  const count = selected.length;
  document.getElementById('nominee-count').textContent = count;
  document.getElementById('nominee-progress-bar').style.width = (count / MAX_VOTES * 100) + '%';

  const btn = document.getElementById('submit-ballot-btn');
  if (count > 0) {
    btn.classList.add('ready');
  } else {
    btn.classList.remove('ready');
  }
}

async function submitBallot() {
  if (selected.length === 0) return;
  if (!currentUser) { window.location.href = 'login.html'; return; }
  if (hasAlreadyVoted()) return;

  const btn = document.getElementById('submit-ballot-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const rows = selected.map(nomineeId => ({ nominee_id: nomineeId, voter_id: currentUser.id }));
  const { error: voteErr } = await supabaseClient.from('votes').insert(rows);

  if (voteErr) {
    alert('Something went wrong submitting your ballot: ' + voteErr.message);
    btn.disabled = false;
    btn.textContent = 'Submit Ballot →';
    return;
  }

  const { error: profileErr } = await supabaseClient
    .from('profiles')
    .update({ voted: true })
    .eq('id', currentUser.id);

  if (profileErr) console.error('Could not flag profile as voted:', profileErr.message);

  currentUser.voted = true;
  const justVotedCount = selected.length;
  selected = [];
  renderNominees(justVotedCount);
}

/* ─────────────────────────────────────────
   LIVE RESULTS VIEW
   ───────────────────────────────────────── */
function photoBlock(n, className) {
  return n.photo_url
    ? `<img src="${n.photo_url}" alt="${n.name}"/>`
    : `<span class="results-photo-fallback">👤</span>`;
}

async function renderResultsView() {
  const container = document.getElementById('results-positions');
  container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:20px 0;">Loading results…</p>';

  const [countsRes, statsRes] = await Promise.all([
    supabaseClient.from('vote_counts').select('*'),
    supabaseClient.from('election_stats').select('*').single()
  ]);

  const countMap = {};
  (countsRes.data || []).forEach(row => { countMap[row.nominee_id] = row.votes; });
  nominees.forEach(n => { if (!(n.id in countMap)) countMap[n.id] = 0; });

  const stats = statsRes.data || { total_students: 0, voted_count: 0, total_votes: 0 };
  const totalVotes = stats.total_votes;
  const maxVotes = Math.max(1, ...Object.values(countMap));

  const ranked = nominees
    .slice()
    .sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0));

  /* ── Full ranked list ── */
  const rows = ranked.map((n, i) => {
      const v   = countMap[n.id] || 0;
      const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
      const leading = v > 0 && v === maxVotes;
      const color = leading ? '#00e5ff' : '#ff2d78';
      return `
        <div class="results-candidate-card${leading ? ' leading' : ''}">
          <div class="results-candidate-info">
            <div class="results-candidate-left">
              <div class="results-rank-num">${i + 1}</div>
              <div class="results-avatar">${photoBlock(n)}</div>
              <div class="results-cname-wrap">
                <span class="results-cname">${n.name}</span>
                ${leading ? '<span class="results-leading">Leading</span>' : ''}
              </div>
            </div>
            <div class="results-right">
              <div class="results-pct">${pct}%</div>
              <div class="results-vcount">${v} vote${v === 1 ? '' : 's'}</div>
            </div>
          </div>
          <div class="results-bar-track">
            <div class="results-bar-fill" data-width="${pct}" style="width:0%; background:${color};"></div>
          </div>
        </div>
      `;
    }).join('');

  container.innerHTML = `
    <div class="results-position-card">
      <div class="results-pos-header">
        <div class="results-pos-icon">🗳️</div>
        <div class="results-pos-title">Full Ranking</div>
      </div>
      <div class="results-pos-total">${totalVotes} total votes cast</div>
      ${rows || '<p style="text-align:center;color:var(--muted);padding:20px 0;">No nominees yet.</p>'}
    </div>
  `;

  const turnout = stats.total_students > 0 ? Math.round((stats.voted_count / stats.total_students) * 100) : 0;

  document.getElementById('stat-total-votes').textContent   = totalVotes;
  document.getElementById('stat-nominee-count').textContent = nominees.length;
  document.getElementById('stat-turnout').textContent       = turnout + '%';

  setTimeout(() => {
    document.querySelectorAll('.results-bar-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  }, 120);
}

/* ─────────────────────────────────────────
   HERO CAROUSEL — built from nominees list
   ───────────────────────────────────────── */
const CAROUSEL_ACCENTS = ['accent-cyan', 'accent-pink', 'accent-green'];

function renderHeroCarousel() {
  const strip = document.getElementById('candidate-strip');
  if (!strip) return;

  const cardHtml = (n, i, hidden) => `
    <div class="candidate-card-hero"${hidden ? ' aria-hidden="true"' : ''}>
      <div class="chero-img ${CAROUSEL_ACCENTS[i % CAROUSEL_ACCENTS.length]}">${
        n.photo_url
          ? `<img src="${n.photo_url}" alt="${n.name}"/>`
          : `<div class="candidate-placeholder">👤</div>`
      }</div>
      <div class="candidate-label"><div class="c-name">${n.name}</div></div>
    </div>
  `;

  // Duplicate the set so the scroll loop is seamless
  strip.innerHTML =
    nominees.map((n, i) => cardHtml(n, i, false)).join('') +
    nominees.map((n, i) => cardHtml(n, i, true)).join('');
}

/* ─────────────────────────────────────────
   HERO CAROUSEL — JS infinite scroll
   Uses requestAnimationFrame + a transform-based
   loop. halfW is recalculated live via
   ResizeObserver, so it self-corrects if the
   strip's size ever changes (window resize,
   nominee count changes, photos loading in,
   responsive breakpoints, etc.) instead of being
   measured once and trusted forever.
   ───────────────────────────────────────── */
function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  const strip   = document.getElementById('candidate-strip');
  if (!strip || !wrapper) return;

  const SPEED = 0.6; // px per frame — increase to scroll faster
  let pos     = 0;
  let paused  = false;
  let halfW   = strip.scrollWidth / 2;
  let wrapperWidth = wrapper.clientWidth;

  // Keep halfW / wrapperWidth accurate no matter what changes the strip's size
  const resizeObserver = new ResizeObserver(() => {
    const newHalf = strip.scrollWidth / 2;
    if (newHalf > 0) {
      if (halfW > 0) pos = (pos / halfW) * newHalf;
      halfW = newHalf;
    }
    wrapperWidth = wrapper.clientWidth;
  });
  resizeObserver.observe(strip);
  resizeObserver.observe(wrapper);

  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  // Coverflow — the card nearest the visual centre sits big, bright and
  // front-most; cards further out shrink, dim, tilt away in 3D and sink
  // back, like a fanned-out card carousel.
  function applyCoverflow() {
    const cards  = strip.children;
    const half   = wrapperWidth / 2 || 1;
    const centerLocal = pos + half; // strip-local x currently under the viewport centre

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const offset = cardCenter - centerLocal;
      const norm   = Math.min(Math.abs(offset) / half, 1); // 0 = centre, 1 = edge
      const sign   = offset < 0 ? 1 : -1;

      const scale   = 1.18 - norm * 0.46;
      const opacity = 1 - norm * 0.62;
      const lift    = norm * 22;
      const rotateY = sign * norm * 22;
      const bright  = 1 - norm * 0.4;
      const z       = Math.round((1 - norm) * 100);

      card.style.setProperty('--s', scale.toFixed(3));
      card.style.setProperty('--o', opacity.toFixed(2));
      card.style.setProperty('--y', lift.toFixed(1) + 'px');
      card.style.setProperty('--r', rotateY.toFixed(1) + 'deg');
      card.style.setProperty('--b', bright.toFixed(2));
      card.style.setProperty('--z', String(z));
      card.classList.toggle('is-featured', norm < 0.12);
    }
  }

  function tick() {
    if (!paused && halfW > 0) {
      pos += SPEED;
      if (pos >= halfW) pos -= halfW;
      strip.style.transform = `translateX(-${pos}px)`;
    }
    applyCoverflow();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ─────────────────────────────────────────
   NAV SCROLL — accounts for fixed 60px nav
   ───────────────────────────────────────── */
function navScrollTo(e, id) {
  if (e) e.preventDefault();
  scrollToSection(id);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = document.querySelector('nav').offsetHeight;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 12;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ─────────────────────────────────────────
   INIT — runs on page load
   ───────────────────────────────────────── */
(async function init() {
  renderFAQ();
  await loadNominees();
  renderHeroCarousel();
  initCarousel();
  await checkSession(); // restore session if student already logged in
})();