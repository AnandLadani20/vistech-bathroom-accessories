/**
 * Vistech - Products page (vanilla JS, works offline, no AJAX)
 * Requires: products-data.js (window.PRODUCTS_CATALOG)
 */
(function () {
  'use strict';

  var allProducts = [];
  var filtered = [];
  var currentPage = 1;
  var perPage = 12;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function matchSeries(p, prefix) {
    if (!prefix) return true;
    if (prefix === '5xx') return /^\d/.test(p.series) && p.series.indexOf('KT') !== 0;
    if (prefix === 'KT') return p.series.indexOf('KT') === 0;
    return p.series.indexOf(prefix) === 0;
  }

  function cardHtml(p) {
    var url = 'product-details.html?id=' + p.id;
    var img = p.image || 'assets/images/logo.png';
    return (
      '<div class="col-md-6 col-lg-4 mb-4">' +
        '<article class="product-card">' +
          '<div class="product-img-wrap">' +
            '<span class="product-series-badge position-absolute top-0 start-0 m-2">' + escapeHtml(p.series) + '</span>' +
            '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(p.name) + ' ' + escapeHtml(p.series) + '" loading="lazy" decoding="async" width="400" height="400" onerror="this.src=\'assets/images/logo.png\'">' +
            '<div class="product-overlay">' +
              '<a href="' + url + '" class="btn-luxury btn-sm">View Details</a>' +
            '</div>' +
          '</div>' +
          '<div class="product-body">' +
            '<div class="product-collection">' + escapeHtml(p.collection || '') + ' Series</div>' +
            '<span class="product-series">Series: ' + escapeHtml(p.series) + '</span>' +
            '<h3 class="product-name"><a href="' + url + '">' + escapeHtml(p.name) + '</a></h3>' +
            '<p class="product-price">' + escapeHtml(p.price) + '</p>' +
            '<a href="' + url + '" class="btn-luxury mt-2">View Details</a>' +
          '</div>' +
        '</article>' +
      '</div>'
    );
  }

  function renderGrid() {
    var grid = $('products-grid');
    var countEl = $('product-count');
    if (!grid) return;

    var start = (currentPage - 1) * perPage;
    var slice = filtered.slice(start, start + perPage);

    if (!slice.length) {
      grid.innerHTML =
        '<div class="col-12 no-results"><i class="fas fa-box-open"></i>' +
        '<h4>No products found</h4><p>Try reset filters or another collection.</p></div>';
    } else {
      grid.innerHTML = slice.map(cardHtml).join('');
    }

    if (countEl) {
      countEl.textContent = filtered.length + ' products';
    }

    renderPagination();
  }

  function renderPagination() {
    var el = $('product-pagination');
    if (!el) return;
    var pages = Math.ceil(filtered.length / perPage);
    if (pages <= 1) {
      el.innerHTML = '';
      return;
    }
    var html = '<nav><ul class="pagination pagination-luxury justify-content-center">';
    for (var i = 1; i <= pages; i++) {
      html +=
        '<li class="page-item' + (i === currentPage ? ' active' : '') + '">' +
          '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
    }
    html += '</ul></nav>';
    el.innerHTML = html;
    var gridEl = $('products-grid');
    el.querySelectorAll('.page-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        currentPage = parseInt(this.getAttribute('data-page'), 10);
        renderGrid();
        if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function applyFilters() {
    var searchEl = $('product-search');
    var search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    var categories = [];
    document.querySelectorAll('input[name="filter-category"]:checked').forEach(function (cb) {
      categories.push(cb.value);
    });

    var collections = [];
    document.querySelectorAll('input[name="filter-collection"]:checked').forEach(function (cb) {
      collections.push(cb.value);
    });

    var seriesEl = document.querySelector('input[name="filter-series"]:checked');
    var seriesPrefix = seriesEl ? seriesEl.value : '';

    var priceMin = parseInt($('price-min') && $('price-min').value, 10) || 0;
    var priceMax = parseInt($('price-max') && $('price-max').value, 10) || 999999;

    filtered = allProducts.filter(function (p) {
      var matchSearch =
        !search ||
        p.name.toLowerCase().indexOf(search) !== -1 ||
        p.series.toLowerCase().indexOf(search) !== -1 ||
        (p.collection && p.collection.toLowerCase().indexOf(search) !== -1) ||
        p.category.toLowerCase().indexOf(search) !== -1;

      var matchCat = !categories.length || categories.indexOf(p.category) !== -1;
      var matchCol = !collections.length || collections.indexOf(p.collection) !== -1;
      var matchSer = matchSeries(p, seriesPrefix);
      var price = p.priceValue || 0;
      var matchPrice = price >= priceMin && price <= priceMax;

      return matchSearch && matchCat && matchCol && matchSer && matchPrice;
    });

    currentPage = 1;
    renderGrid();
  }

  function buildFilters() {
    var cats = {};
    var cols = {};
    allProducts.forEach(function (p) {
      cats[p.category] = true;
      if (p.collection) cols[p.collection] = true;
    });

    var catBox = $('filter-categories');
    if (catBox) {
      catBox.innerHTML = Object.keys(cats)
        .sort()
        .map(function (c) {
          return (
            '<label><input type="checkbox" name="filter-category" value="' +
            escapeHtml(c) +
            '"> ' +
            escapeHtml(c) +
            '</label>'
          );
        })
        .join('');
    }

    var colBox = $('filter-collections');
    if (colBox) {
      colBox.innerHTML = Object.keys(cols)
        .sort()
        .map(function (c) {
          return (
            '<label><input type="checkbox" name="filter-collection" value="' +
            escapeHtml(c) +
            '"> ' +
            escapeHtml(c) +
            ' Series</label>'
          );
        })
        .join('');
    }

    var prefixes = {};
    allProducts.forEach(function (p) {
      var prefix = p.series.split('-')[0];
      if (/^\d/.test(p.series) && p.series.indexOf('KT') !== 0) prefix = '5xx';
      else if (p.series.indexOf('KT') === 0) prefix = 'KT';
      prefixes[prefix] = true;
    });
    var labels = { KV: 'Kiva (KV)', RE: 'Rella (RE)', BR: 'Bruna (BR)', CA: 'Canata (CA)', '5xx': 'Vistech (500)', KT: 'Kitchen (KT)' };
    var serBox = $('filter-series');
    if (serBox) {
      var serHtml = '<label><input type="radio" name="filter-series" value="" checked> All Series</label>';
      Object.keys(prefixes)
        .sort()
        .forEach(function (s) {
          serHtml +=
            '<label><input type="radio" name="filter-series" value="' +
            escapeHtml(s) +
            '"> ' +
            escapeHtml(labels[s] || s) +
            '</label>';
        });
      serBox.innerHTML = serHtml;
    }

    var tabs = $('collection-tabs');
    if (tabs) {
      var tabHtml = '<button type="button" class="collection-tab active" data-collection="">All Products</button>';
      Object.keys(cols)
        .sort()
        .forEach(function (c) {
          tabHtml +=
            '<button type="button" class="collection-tab" data-collection="' +
            escapeHtml(c) +
            '">' +
            escapeHtml(c) +
            ' Series</button>';
        });
      tabs.innerHTML = tabHtml;
      tabs.querySelectorAll('.collection-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          tabs.querySelectorAll('.collection-tab').forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');
          var col = btn.getAttribute('data-collection');
          document.querySelectorAll('input[name="filter-collection"]').forEach(function (cb) {
            cb.checked = col && cb.value === col;
          });
          applyFilters();
        });
      });
    }
  }

  function bindEvents() {
    var searchEl = $('product-search');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(bindEvents.timer);
        bindEvents.timer = setTimeout(applyFilters, 300);
      });
    }

    document.addEventListener('change', function (e) {
      if (
        e.target.matches('input[name="filter-category"]') ||
        e.target.matches('input[name="filter-collection"]') ||
        e.target.matches('input[name="filter-series"]')
      ) {
        applyFilters();
      }
    });

    var applyBtn = $('btn-apply-filters');
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);

    var resetBtn = $('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        document.querySelectorAll('input[name="filter-category"]').forEach(function (cb) {
          cb.checked = false;
        });
        document.querySelectorAll('input[name="filter-collection"]').forEach(function (cb) {
          cb.checked = false;
        });
        var allSer = document.querySelector('input[name="filter-series"][value=""]');
        if (allSer) allSer.checked = true;
        if ($('price-min')) $('price-min').value = '';
        if ($('price-max')) $('price-max').value = '';
        document.querySelectorAll('.collection-tab').forEach(function (b, i) {
          b.classList.toggle('active', i === 0);
        });
        filtered = allProducts.slice();
        currentPage = 1;
        renderGrid();
      });
    }

    var priceMin = $('price-min');
    var priceMax = $('price-max');
    if (priceMin) priceMin.addEventListener('change', applyFilters);
    if (priceMax) priceMax.addEventListener('change', applyFilters);
  }

  function applyUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('category');
    var coll = params.get('collection');
    if (cat) {
      var c = document.querySelector('input[name="filter-category"][value="' + cat + '"]');
      if (c) c.checked = true;
    }
    if (coll) {
      var col = document.querySelector('input[name="filter-collection"][value="' + coll + '"]');
      if (col) col.checked = true;
      document.querySelectorAll('.collection-tab').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-collection') === coll);
      });
    }
    if (cat || coll) applyFilters();
  }

  function init() {
    if (!document.getElementById('products-grid')) return;

    if (!window.PRODUCTS_CATALOG || !window.PRODUCTS_CATALOG.length) {
      var grid = $('products-grid');
      if (grid) {
        grid.innerHTML =
          '<div class="col-12 no-results"><h4>Product data not loaded</h4>' +
          '<p>Make sure <code>assets/js/products-data.js</code> exists and loads before this script.</p></div>';
      }
      return;
    }

    allProducts = window.PRODUCTS_CATALOG.slice();
    filtered = allProducts.slice();

    buildFilters();
    bindEvents();
    renderGrid();
    applyUrlParams();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
