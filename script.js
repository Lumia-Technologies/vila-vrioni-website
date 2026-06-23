var lbImages = [];
var lbIndex = 0;

function openLightbox(src, caption) {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lbImg').src = src;
  document.getElementById('lbCaption').textContent = caption || '';
  lb.classList.add('active');
  buildImageList(src);
}

function buildImageList(currentSrc) {
  var items = document.querySelectorAll('.gallery-item:not(.hidden) img, .timeline-photos img[src], .izedin-photos img, .heritage-photos img');
  lbImages = [];
  items.forEach(function(img) {
    if (img.src && img.src.indexOf('openLightbox') === -1) {
      lbImages.push(img.src);
    }
  });
  lbIndex = lbImages.indexOf(currentSrc);
  if (lbIndex === -1) lbIndex = 0;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

function lbNav(dir) {
  if (lbImages.length === 0) return;
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  document.getElementById('lbImg').src = lbImages[lbIndex];
  document.getElementById('lbCaption').textContent = '';
}

(function() {
  var lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'ArrowLeft') lbNav(-1);
  });
})();

function filterGallery(year, btn) {
  document.querySelectorAll('.gallery-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.gallery-item').forEach(function(item) {
    if (year === 'all' || item.dataset.year === year) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

// Inquiry form — only on pages with the form
(function() {
  var checkin = document.getElementById('checkin');
  if (!checkin) return;

  var today = new Date().toISOString().split('T')[0];
  var checkout = document.getElementById('checkout');
  checkin.min = today;
  checkout.min = today;

  checkin.addEventListener('change', function() {
    if (this.value) {
      var next = new Date(this.value);
      next.setDate(next.getDate() + 1);
      checkout.min = next.toISOString().split('T')[0];
      if (checkout.value && checkout.value <= this.value) checkout.value = '';
    }
  });

  document.getElementById('inquiryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = document.getElementById('formSubmit');
    var status = document.getElementById('formStatus');

    if (checkout.value && checkout.value <= checkin.value) {
      status.className = 'form-status error';
      status.textContent = 'Check-out must be after check-in.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    var data = new FormData(this);

    fetch('send.php', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(res) {
      if (res.ok) {
        status.className = 'form-status success';
        status.textContent = 'Thank you — we will be in touch shortly.';
        document.getElementById('inquiryForm').reset();
        checkin.min = today;
        checkout.min = today;
      } else {
        throw new Error();
      }
    })
    .catch(function() {
      status.className = 'form-status error';
      status.textContent = 'Something went wrong. Please email us directly.';
    })
    .finally(function() {
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    });
  });
})();

// Intersection Observer for fade-in
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });

// Hamburger menu
document.getElementById('navToggle').addEventListener('click', function() {
  var ul = this.parentElement.querySelector('ul');
  var expanded = this.getAttribute('aria-expanded') === 'true';
  ul.classList.toggle('nav-open');
  this.classList.toggle('active');
  this.setAttribute('aria-expanded', String(!expanded));
});
document.querySelectorAll('nav ul li a').forEach(function(link) {
  link.addEventListener('click', function() {
    var ul = document.querySelector('nav ul');
    var toggle = document.getElementById('navToggle');
    ul.classList.remove('nav-open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Redirect legacy #gallery hash to gallery page
if (window.location.hash === '#gallery' && !document.getElementById('gallery')) {
  window.location.replace('gallery.html');
}
