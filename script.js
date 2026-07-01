/* ═══════════════════════════════════════════
   ITElect — script.js
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   DATA — edit candidates, positions & FAQs
   ───────────────────────────────────────── */
const positions = [
  {
    id: 'president',
    label: 'President',
    icon: '👑',
    count: '2 candidates',
    desc: 'Leads the IT organization, represents students in faculty meetings, and oversees all chapter activities and initiatives.',
    candidates: [
      {
        name: 'Alex Chen',
        slogan: 'Innovate. Lead. Inspire.',
        votes: 0,
        bio: 'Third-year Computer Science major with 2 years of student council experience. Passionate about bridging the gap between students and the tech industry through workshops and networking events.'
      },
      {
        name: 'Sarah Kim',
        slogan: 'Building Tomorrow, Today.',
        votes: 0,
        bio: 'Senior in Software Engineering, founded the campus hackathon club. Committed to creating more hands-on learning opportunities and industry partnerships.'
      }
    ]
  },
  {
    id: 'vp',
    label: 'Vice President',
    icon: '🛡️',
    count: '2 candidates',
    desc: 'Assists the President, manages internal committees, and ensures smooth coordination of org activities.',
    candidates: [
      {
        name: 'Marcus Rivera',
        slogan: 'Together We Rise.',
        votes: 0,
        bio: 'Second-year BSIT student, active in multiple tech committees. Believes in collaborative leadership and inclusive decision-making.'
      },
      {
        name: 'Emily Zhang',
        slogan: 'Empower Through Knowledge.',
        votes: 0,
        bio: 'Third-year student with background in event management and student welfare. Focused on member engagement and development programs.'
      }
    ]
  },
  {
    id: 'secretary',
    label: 'Secretary',
    icon: '📋',
    count: '1 candidate',
    desc: 'Maintains org records, takes minutes during meetings, and handles official correspondence.',
    candidates: [
      {
        name: 'Jordan Patel',
        slogan: 'Precision in Every Detail.',
        votes: 0,
        bio: 'Meticulous second-year student known for exceptional organizational skills. Has served as class secretary for two consecutive years.'
      }
    ]
  },
  {
    id: 'treasurer',
    label: 'Treasurer',
    icon: '💰',
    count: '1 candidate',
    desc: "Manages the organization's finances, prepares budgets, and ensures transparent financial reporting.",
    candidates: [
      {
        name: 'Taylor Wong',
        slogan: 'Funding Our Future.',
        votes: 0,
        bio: 'Finance-minded IT student with experience managing club budgets. Advocates for transparent spending and better-funded events.'
      }
    ]
  },
  {
    id: 'pro',
    label: 'Public Relations Officer',
    icon: '📢',
    count: '2 candidates',
    desc: "Manages social media, handles communications, and promotes the organization's image and events.",
    candidates: [
      {
        name: 'Nina Okonkwo',
        slogan: 'Amplify Our Voice.',
        votes: 0,
        bio: "Creative communications student running the org's social accounts. Wants to triple online engagement and expand community outreach."
      },
      {
        name: 'Dev Patel',
        slogan: 'Make IT Visible.',
        votes: 0,
        bio: "Graphic design enthusiast with a knack for storytelling. Aims to modernize the org's brand with fresh visuals and compelling campaigns."
      }
    ]
  }
];

const faqs = [
  {
    q: 'Who is eligible to vote?',
    a: 'All currently enrolled IT students who are active members of the IT Student Organization are eligible to vote. You must have attended at least one chapter meeting this semester and have a valid student ID.'
  },
  {
    q: 'How many votes do I get per position?',
    a: 'Each student can cast exactly one vote per candidate per position. This means for each position (President, VP, etc.), you select one candidate. You cannot vote for the same candidate more than once.'
  },
  {
    q: 'Can I change my vote after submitting?',
    a: 'No, once your vote is submitted it is final and cannot be changed. Please review your selections carefully before confirming. This ensures the integrity of the election process.'
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
    q: 'I forgot my login credentials. What should I do?',
    a: 'Click the "Forgot password?" link on the sign-in page. A reset link will be sent to your registered student email. Contact the Election Committee if you still have trouble.'
  }
];

/* Live results data — auto-updated from Supabase */
const resultsData = [
  {
    id: 'president', label: 'President', icon: '👑', totalVotes: 0,
    candidates: [
      { name: 'Alex Chen',  votes: 0, leading: false },
      { name: 'Sarah Kim',  votes: 0, leading: false }
    ]
  },
  {
    id: 'vp', label: 'Vice President', icon: '🛡️', totalVotes: 0,
    candidates: [
      { name: 'Marcus Rivera', votes: 0, leading: false },
      { name: 'Emily Zhang',   votes: 0, leading: false }
    ]
  },
  {
    id: 'secretary', label: 'Secretary', icon: '📋', totalVotes: 0,
    candidates: [
      { name: 'Jordan Patel', votes: 0, leading: false }
    ]
  },
  {
    id: 'treasurer', label: 'Treasurer', icon: '💰', totalVotes: 0,
    candidates: [
      { name: 'Taylor Wong', votes: 0, leading: false }
    ]
  },
  {
    id: 'pro', label: 'Public Relations Officer', icon: '📢', totalVotes: 0,
    candidates: [
      { name: 'Nina Okonkwo', votes: 0, leading: false },
      { name: 'Dev Patel',    votes: 0, leading: false }
    ]
  }
];

/* ─────────────────────────────────────────
   CANDIDATES SECTION
   ───────────────────────────────────────── */
let activeTab = 'president';

function renderCandidates(posId) {
  const pos  = positions.find(p => p.id === posId);
  const grid = document.getElementById('candidates-grid');
  const desc = document.getElementById('pos-desc');

  desc.querySelector('span').textContent = pos.desc;
  desc.querySelector('.position-desc-icon').textContent = pos.icon;

  grid.innerHTML = pos.candidates.map(c => `
    <div class="candidate-card">
      <div class="candidate-card-top">
        <div class="candidate-avatar">👤</div>
        <div class="candidate-info">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
            <div>
              <div class="candidate-name">${c.name}</div>
              <div class="candidate-slogan">${c.slogan}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div class="candidate-votes">${c.votes}</div>
              <div class="candidate-votes-label">votes</div>
            </div>
          </div>
        </div>
      </div>
      <div class="candidate-bio">${c.bio}</div>
    </div>
  `).join('');
}

function switchTab(el, posId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeTab = posId;
  renderCandidates(posId);
}

/* ─────────────────────────────────────────
   FAQ SECTION
   ───────────────────────────────────────── */
function renderFAQ() {
  const list = document.getElementById('faq-list');
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

  // close all
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-answer').classList.remove('open');
    el.querySelector('.faq-toggle').textContent = '+';
  });

  // open clicked (if it was closed)
  if (!isOpen) {
    item.classList.add('open');
    ans.classList.add('open');
    tog.textContent = '✕';
  }
}

/* ─────────────────────────────────────────
   AUTH STATE
   ───────────────────────────────────────── */
let currentUser = null;

function setLoggedIn(user) {
  currentUser = user;
  document.getElementById('nav-logged-out').style.display = 'none';
  document.getElementById('nav-logged-in').style.display  = 'block';
  document.getElementById('user-name-nav').textContent    = user.name.split(' ')[0];
  document.getElementById('ud-name').textContent          = user.name;
  document.getElementById('ud-email').textContent         = user.email;
}

function setLoggedOut() {
  currentUser = null;
  document.getElementById('nav-logged-out').style.display = '';
  document.getElementById('nav-logged-in').style.display  = 'none';
  document.getElementById('user-dropdown').classList.remove('open');
}

function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const btn      = document.getElementById('btn-user');
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// Check existing session on page load (demo — no persistence)
function checkSession() {
  // Demo mode — no session to restore
}

/* ─────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────── */
function showError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.style.display = 'block';
  el.className = 'modal-error';
}

function showSuccess(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.style.display = 'block';
  el.className = 'modal-success';
}

function hideMsg(elId) {
  const el = document.getElementById(elId);
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label || btn.textContent;
}

/* ─────────────────────────────────────────
   SIGN UP MODAL
   ───────────────────────────────────────── */
function openSignUpModal() {
  hideMsg('signup-error');
  document.getElementById('login-overlay').classList.remove('open');
  document.getElementById('signup-overlay').classList.add('open');
}

function closeSignUpModal() {
  document.getElementById('signup-overlay').classList.remove('open');
  hideMsg('signup-error');
}

function closeSignUpOutside(e) {
  if (e.target === document.getElementById('signup-overlay')) closeSignUpModal();
}

function handleSignUp() {
  const name    = document.getElementById('signup-name').value.trim();
  const email   = document.getElementById('signup-email').value.trim().toLowerCase();
  const pass    = document.getElementById('signup-pass').value;
  const confirm = document.getElementById('signup-confirm').value;

  hideMsg('signup-error');

  if (!name || !email || !pass || !confirm) {
    showError('signup-error', 'Please fill in all fields.'); return;
  }
  if (pass.length < 6) {
    showError('signup-error', 'Password must be at least 6 characters.'); return;
  }
  if (pass !== confirm) {
    showError('signup-error', 'Passwords do not match.'); return;
  }

  // Demo mode — accept any credentials
  closeSignUpModal();
  setLoggedIn({ name, email });
  openVotePage();
}

function switchToLogin(e) {
  e.preventDefault();
  closeSignUpModal();
  openLoginModal();
}

/* ─────────────────────────────────────────
   LOG IN MODAL
   ───────────────────────────────────────── */
function openLoginModal() {
  if (currentUser) { openVotePage(); return; }
  hideMsg('login-error');
  document.getElementById('signup-overlay').classList.remove('open');
  document.getElementById('login-overlay').classList.add('open');
}

function closeLoginModal() {
  document.getElementById('login-overlay').classList.remove('open');
  hideMsg('login-error');
}

function closeLoginOutside(e) {
  if (e.target === document.getElementById('login-overlay')) closeLoginModal();
}

function handleLogin() {
  const email = document.getElementById('modal-email').value.trim().toLowerCase();
  const pass  = document.getElementById('modal-pass').value;

  hideMsg('login-error');

  if (!email || !pass) {
    showError('login-error', 'Please enter your email and password.'); return;
  }

  // Demo mode — derive name from email, accept any credentials
  const name = email.split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  closeLoginModal();
  setLoggedIn({ name, email });
  openVotePage();
}

function switchToSignUp(e) {
  e.preventDefault();
  closeLoginModal();
  openSignUpModal();
}

function handleLogout() {
  setLoggedOut();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openVoteFromMenu() {
  toggleUserMenu();
  openVotePage();
}

/* aliases for any remaining references */
function openModal() { openLoginModal(); }
function closeModal() { closeLoginModal(); }
function closeModalOutside(e) { closeLoginOutside(e); }

/* ─────────────────────────────────────────
   VOTE PAGE
   ───────────────────────────────────────── */
const votes = {};

function openVotePage() {
  document.getElementById('vote-page').classList.add('open');
  renderBallot();
}

function closeVotePage() {
  document.getElementById('vote-page').classList.remove('open');
  // Reset votes and progress bar so a fresh ballot starts next time
  Object.keys(votes).forEach(k => delete votes[k]);
  updateProgress();
}

function renderBallot() {
  const container = document.getElementById('ballot-positions');
  container.innerHTML = positions.map(pos => `
    <div class="vote-position-block">
      <div class="vote-position-header">
        <div class="vote-pos-icon">${pos.icon}</div>
        <div>
          <div class="vote-pos-title">${pos.label}</div>
          <div class="vote-pos-count">${pos.count}</div>
        </div>
      </div>
      ${pos.candidates.map(c => `
        <div class="vote-option" id="opt-${pos.id}-${c.name.replace(/\s/g, '_')}"
          onclick="selectCandidate('${pos.id}', '${c.name}')">
          <div class="vote-option-left">
            <div class="vote-option-avatar">👤</div>
            <div>
              <div class="vote-option-name">${c.name}</div>
              <div class="vote-option-slogan">${c.slogan}</div>
            </div>
          </div>
          <div class="vote-radio"><div class="vote-radio-dot"></div></div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function selectCandidate(posId, name) {
  const pos = positions.find(p => p.id === posId);

  // Deselect all in this position
  pos.candidates.forEach(c => {
    const el = document.getElementById(`opt-${posId}-${c.name.replace(/\s/g, '_')}`);
    if (el) el.classList.remove('selected');
  });

  // Select chosen candidate
  votes[posId] = name;
  const selected = document.getElementById(`opt-${posId}-${name.replace(/\s/g, '_')}`);
  if (selected) selected.classList.add('selected');

  updateProgress();
}

function updateProgress() {
  const count = Object.keys(votes).length;
  const total = positions.length;
  const pct   = (count / total) * 100;

  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').innerHTML  = `<span>${count}</span> / ${total} selected`;

  const btn = document.getElementById('submit-ballot-btn');
  if (count === total) {
    btn.classList.add('ready');
  } else {
    btn.classList.remove('ready');
  }
}

function submitBallot() {
  document.getElementById('vote-page').classList.remove('open');
  document.getElementById('success-page').classList.add('open');
}

/* ─────────────────────────────────────────
   HERO CAROUSEL — JS infinite scroll
   Uses requestAnimationFrame + scrollLeft
   loop so it truly never ends regardless
   of card widths or gap sizes.
   ───────────────────────────────────────── */
function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  const strip   = document.getElementById('candidate-strip');
  if (!strip) return;

  const SPEED = 0.6; // px per frame — increase to scroll faster
  let pos     = 0;
  let paused  = false;
  let rafId   = null;

  // Wait for layout so offsetWidth is accurate
  requestAnimationFrame(() => {
    // halfW = width of ONE full set of cards (the original 8)
    // The strip contains two identical sets, so half = total / 2
    const halfW = strip.scrollWidth / 2;

    function tick() {
      if (!paused) {
        pos += SPEED;
        // Once we've scrolled a full set, jump back seamlessly
        if (pos >= halfW) pos -= halfW;
        strip.style.transform = `translateX(-${pos}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    // Pause when mouse is anywhere over the wrapper
    wrapper.addEventListener('mouseenter', () => { paused = true; });
    wrapper.addEventListener('mouseleave', () => { paused = false; });

    tick();
  });
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

function scrollToCandidates() {
  scrollToSection('candidates');
}

/* ─────────────────────────────────────────
   LIVE RESULTS PAGE
   ───────────────────────────────────────── */
function renderResultsPage() {
  const container = document.getElementById('results-positions');

  container.innerHTML = resultsData.map(pos => {
    const rows = pos.candidates.map(c => {
      const pct = Math.round((c.votes / pos.totalVotes) * 100);
      // Colour logic: uncontested → green | leading → cyan | trailing → pink
      const color = pos.candidates.length === 1 ? '#00ff88'
                  : c.leading                    ? '#00e5ff'
                  :                                '#ff2d78';
      return `
        <div class="results-candidate-row">
          <div class="results-candidate-info">
            <div class="results-candidate-left">
              <div class="results-avatar">👤</div>
              <span class="results-cname">${c.name}</span>
              ${c.leading ? '<span class="results-leading">Leading</span>' : ''}
            </div>
            <div class="results-right">
              <div class="results-pct">${pct}%</div>
              <div class="results-vcount">${c.votes}<br>votes</div>
            </div>
          </div>
          <div class="results-bar-track">
            <div class="results-bar-fill" data-width="${pct}"
                 style="width:0%; background:${color};"></div>
          </div>
        </div>
      `;a
    }).join('');

    return `
      <div class="results-position-card">
        <div class="results-pos-header">
          <div class="results-pos-icon">${pos.icon}</div>
          <div class="results-pos-title">${pos.label}</div>
        </div>
        <div class="results-pos-total">${pos.totalVotes} total votes cast</div>
        ${rows}
      </div>
    `;
  }).join('');

  // Animate bars in after a short delay
  setTimeout(() => {
    document.querySelectorAll('.results-bar-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  }, 120);
}

function openLiveResultsPage(e) {
  if (e) e.preventDefault();
  document.getElementById('success-page').classList.remove('open');
  renderResultsPage();
  const page = document.getElementById('results-page');
  page.classList.add('open');
  page.scrollTop = 0;
}

function closeResultsPage() {
  document.getElementById('results-page').classList.remove('open');
}

/* ─────────────────────────────────────────
   INIT — runs on page load
   ───────────────────────────────────────── */
renderCandidates('president');
renderFAQ();
initCarousel();
checkSession(); // restore session if student already logged in