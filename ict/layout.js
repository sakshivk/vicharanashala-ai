// Reading layout for the HB302 pages. The pages read fine without it;
// this only groups the text into blocks and keeps the section menu in view.
(function () {
  var main = document.querySelector('main');
  if (!main) return;

  // 1. Each h2 and everything after it (up to the next h2) becomes one block.
  var h2s = Array.prototype.slice.call(main.querySelectorAll(':scope > h2'));
  h2s.forEach(function (h2) {
    var block = document.createElement('section');
    block.className = 'block';
    if (h2.id) { block.id = h2.id; h2.removeAttribute('id'); }
    h2.parentNode.insertBefore(block, h2);
    var node = h2;
    while (node && !(node !== h2 && node.nodeType === 1 && (node.tagName === 'H2' || node.tagName === 'FOOTER'))) {
      var next = node.nextSibling;
      block.appendChild(node);
      node = next;
    }
  });

  // 2. A reading title box and its fold-out guide become one card.
  Array.prototype.slice.call(main.querySelectorAll('p.tb')).forEach(function (p) {
    var next = p.nextElementSibling;
    if (!next || !(next.tagName === 'DETAILS' || next.tagName === 'UL')) return;
    var card = document.createElement('div');
    card.className = 'reading';
    p.parentNode.insertBefore(card, p);
    card.appendChild(p);
    card.appendChild(next);
  });

  // Small headings such as "Going further (optional)." stand out a little.
  Array.prototype.slice.call(main.querySelectorAll('section.block > p > strong:first-child')).forEach(function (s) {
    if (/^Going further/.test(s.textContent)) s.parentNode.classList.add('subhead');
  });

  // 3. Keep the in-page menu in view and mark the section being read.
  var nav = main.querySelector('header nav');
  if (!nav || !('IntersectionObserver' in window)) return;
  // Move the menu just below the header so it can stay in view while scrolling.
  var header = nav.parentNode;
  header.parentNode.insertBefore(nav, header.nextSibling);
  nav.classList.add('sticky');
  var links = {};
  Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')).forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || !links[e.target.id]) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('here'); });
      links[e.target.id].classList.add('here');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  Array.prototype.slice.call(main.querySelectorAll('section.block[id]')).forEach(function (s) { obs.observe(s); });

  // 4. A small "back to top" button once the reader has scrolled.
  var top = document.createElement('a');
  top.href = '#';
  top.className = 'to-top';
  top.textContent = '↑ Top';
  top.setAttribute('aria-label', 'Back to top of page');
  document.body.appendChild(top);
  window.addEventListener('scroll', function () {
    top.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
})();
