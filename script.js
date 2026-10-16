/**
 * yuhang234.github.io — Vanilla JS Interaction Engine
 * Features: Live GitHub Stats, Cursor Glow, Particle Field,
 * Floating Nav & ScrollSpy, Typing Effect, 3D Tilt, Lightbox, Parallax Orbs.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. GitHub API: Live Stats Fetching & Fallback ──
  const GH_USER = 'yuhang234';

  async function fetchGitHubStats() {
    const elRepos = document.getElementById('statRepos');
    const elProjects = document.getElementById('statProjects');
    const elLocalFirst = document.getElementById('statLocalFirst');

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${GH_USER}`),
        fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=stars`)
      ]);

      if (userRes.ok) {
        const user = await userRes.json();
        const totalRepos = user.public_repos || 29;
        animateNumber(elRepos, totalRepos, '+');
      } else {
        animateNumber(elRepos, 29, '+');
      }

      animateNumber(elProjects, 3);
      animateNumber(elLocalFirst, 100, '%');

      if (reposRes.ok) {
        const repos = await reposRes.json();
        const repoMap = {};
        repos.forEach(r => { repoMap[r.name] = r.stargazers_count; });

        document.querySelectorAll('[data-repo]').forEach(el => {
          const name = el.dataset.repo;
          if (repoMap[name] !== undefined) {
            const starEl = el.querySelector('.live-stars') || el.querySelector('.card-stars');
            if (starEl) {
              starEl.textContent = `⭐ ${repoMap[name]}`;
            }
          }
        });
      }

    } catch (e) {
      // Graceful fallback for offline or rate-limited environments
      animateNumber(elRepos, 29, '+');
      animateNumber(elProjects, 3);
      animateNumber(elLocalFirst, 100, '%');
    }
  }

  function animateNumber(el, target, suffix = '') {
    if (!el) return;
    const duration = 1800;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 4);

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  fetchGitHubStats();

  // ── 2. Cursor Glow Follower (Desktop Only) ──
  const glow = document.getElementById('cursorGlow');
  if (glow && window.innerWidth > 768) {
    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });
    (function animateGlow() {
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(animateGlow);
    })();
  }

  // ── 3. Particle Field (Desktop Only) ──
  const particleField = document.getElementById('particleField');
  if (particleField && window.innerWidth > 768) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 3}px;
        height: ${2 + Math.random() * 3}px;
        background: rgba(59, 130, 246, ${0.15 + Math.random() * 0.35});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleDrift ${12 + Math.random() * 18}s linear infinite;
        animation-delay: ${-Math.random() * 20}s;
      `;
      particleField.appendChild(p);
    }
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particleDrift {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        15% { opacity: 0.8; }
        85% { opacity: 0.8; }
        100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${40 + Math.random() * 80}px, ${-120 - Math.random() * 180}px) scale(0.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── 4. Floating Nav & ScrollSpy ──
  const nav = document.getElementById('floatingNav');
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-links a');

  const updateNav = () => {
    if (nav) {
      nav.classList.toggle('visible', window.scrollY > 100);
    }
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) current = s.id;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === current));
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── 5. Reveal on Scroll ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── 6. Typing Effect ──
  const typingEl = document.getElementById('typingText');
  const phrases = [
    'AI Agent 系统架构与工程化探索',
    '本地优先 (Local-First) 架构践行者',
    'VoiceNote · NoteFlow · TeamFlow 独立创作者',
    '河北农业大学计科 (2023级) · 推免保送东北大学控制工程',
    '追求极致响应与 100% 离线自主的数据架构'
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  const type = () => {
    if (!typingEl) return;
    const current = phrases[phraseIdx];
    if (!deleting) {
      typingEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        setTimeout(() => { deleting = true; type(); }, 2200);
        return;
      }
      setTimeout(type, 80);
    } else {
      typingEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 500);
        return;
      }
      setTimeout(type, 40);
    }
  };
  setTimeout(type, 800);

  // ── 7. Card 3D Tilt Effect ──
  document.querySelectorAll('.project-card, .achievement-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── 8. Gallery Lightbox Modal ──
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '图片放大查看');
  lightbox.innerHTML = '<button class="lightbox-close" aria-label="关闭">&times;</button><img src="" alt="放大图鉴">';
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lbImg.src = img.src;
        lbImg.alt = img.alt || '放大图鉴';
        lightbox.classList.add('active');
      }
    });
  });

  const closeLb = () => lightbox.classList.remove('active');
  lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLb();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLb();
  });

  // ── 9. Parallax Background Orbs (Desktop Only) ──
  if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      document.querySelectorAll('.gradient-orb').forEach((orb, i) => {
        orb.style.transform = `translateY(${s * (0.08 + i * 0.04)}px)`;
      });
    }, { passive: true });
  }

});
