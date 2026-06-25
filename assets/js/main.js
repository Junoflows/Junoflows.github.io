(function () {
  'use strict';

  /* -------- Theme toggle -------- */
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* -------- Post-only enhancements -------- */
  var body = document.getElementById('post-body');
  if (!body) return;

  /* Wrap tables for horizontal scroll on mobile */
  body.querySelectorAll('table').forEach(function (table) {
    if (table.parentElement.classList.contains('table-scroll')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  /* Copy buttons on code blocks */
  body.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });
    pre.appendChild(btn);
  });

  /* Heading anchors + TOC */
  var headings = body.querySelectorAll('h2, h3');
  var tocNav = document.getElementById('toc-nav');
  var tocItems = [];

  headings.forEach(function (h) {
    if (!h.id) {
      h.id = h.textContent.trim().toLowerCase()
        .replace(/[^\w가-힣\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    /* anchor link */
    var a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.setAttribute('aria-hidden', 'true');
    h.appendChild(a);

    /* toc entry */
    if (tocNav) {
      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.textContent = h.textContent.replace(/#$/, '').trim();
      if (h.tagName === 'H3') link.className = 'toc-h3';
      tocNav.appendChild(link);
      tocItems.push({ id: h.id, link: link, el: h });
    }
  });

  /* Scrollspy */
  if (tocItems.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocItems.forEach(function (it) { it.link.classList.remove('is-active'); });
          var active = tocItems.filter(function (it) { return it.id === entry.target.id; })[0];
          if (active) active.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    tocItems.forEach(function (it) { observer.observe(it.el); });
  }
})();
