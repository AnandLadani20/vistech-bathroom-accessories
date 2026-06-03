/**
 * Vistech — Products page (static data, no filters, no pagination)
 * Requires: products-data.js (window.PRODUCTS_CATALOG)
 * Laravel-ready: card HTML structure mirrors what a Blade template would render.
 */
(function () {
  'use strict';

  var allProducts = [];
  var filtered = [];
  var activeCollection = '';
  var searchTimer = null;

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Build a single product card — mirrors future Laravel Blade template */
  function cardHtml(p) {
    var url = 'product-details.html?id=' + p.id;
    var img = p.image || 'assets/images/logo.png';
    return (
      '<div class="col-6 col-md-4 col-lg-3 mb-4">' +
        '<article class="product-card-v2" itemscope itemtype="https://schema.org/Product">' +
          '<div class="pc-img-wrap">' +
            '<span class="pc-badge">' + esc(p.series) + '</span>' +
            '<img src="' + esc(img) + '"' +
                ' alt="' + esc(p.name) + ' ' + esc(p.series) + '"' +
                ' loading="lazy" decoding="async" width="400" height="400"' +
                ' itemprop="image"' +
                ' onerror="this.src=\'assets/images/logo.png\'">' +
            '<div class="pc-overlay">' +
              '<a href="' + url + '" class="btn-luxury btn-sm">View Details</a>' +
            '</div>' +
          '</div>' +
          '<div class="pc-body">' +
            '<div class="pc-collection">' + esc(p.collection || '') + ' Series</div>' +
            '<div class="pc-series" itemprop="sku">' + esc(p.series) + '</div>' +
            '<h3 class="pc-name" itemprop="name"><a href="' + url + '">' + esc(p.name) + '</a></h3>' +
            '<p class="pc-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">' +
              '<span itemprop="priceCurrency" content="INR"></span>' +
              '<span itemprop="price">' + esc(p.price) + '</span>' +
            '</p>' +
            '<a href="' + url + '" class="pc-action">View Details <i class="fas fa-arrow-right fa-xs"></i></a>' +
          '</div>' +
        '</article>' +
      '</div>'
    );
  }

  function renderGrid() {
    var grid = document.getElementById('products-grid');
    var countEl = document.getElementById('product-count');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML =
        '<div class="col-12 no-results">' +
          '<i class="fas fa-box-open"></i>' +
          '<h4>No products found</h4>' +
          '<p>Try a different search term or collection.</p>' +
        '</div>';
    } else {
      grid.innerHTML = filtered.map(cardHtml).join('');
    }

    if (countEl) {
      countEl.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');
    }
  }

  function applyFilters() {
    var searchEl = document.getElementById('product-search');
    var search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    filtered = allProducts.filter(function (p) {
      var matchCollection = !activeCollection || p.collection === activeCollection;
      var matchSearch =
        !search ||
        p.name.toLowerCase().indexOf(search) !== -1 ||
        p.series.toLowerCase().indexOf(search) !== -1 ||
        (p.collection && p.collection.toLowerCase().indexOf(search) !== -1) ||
        p.category.toLowerCase().indexOf(search) !== -1;
      return matchCollection && matchSearch;
    });

    renderGrid();
  }

  function buildTabs() {
    var tabsInner = document.getElementById('collection-tabs-inner');
    if (!tabsInner) return;

    var cols = {};
    allProducts.forEach(function (p) {
      if (p.collection) cols[p.collection] = true;
    });

    var html = '<button type="button" class="collection-tab active" data-collection="">All Products</button>';
    Object.keys(cols).sort().forEach(function (c) {
      html += '<button type="button" class="collection-tab" data-collection="' + esc(c) + '">' + esc(c) + ' Series</button>';
    });
    tabsInner.innerHTML = html;

    tabsInner.querySelectorAll('.collection-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabsInner.querySelectorAll('.collection-tab').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeCollection = btn.getAttribute('data-collection') || '';
        applyFilters();
      });
    });
  }

  function applyUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var coll = params.get('collection');
    var cat = params.get('category');

    if (coll) {
      activeCollection = coll;
      var tabsInner = document.getElementById('collection-tabs-inner');
      if (tabsInner) {
        tabsInner.querySelectorAll('.collection-tab').forEach(function (b) {
          b.classList.toggle('active', (b.getAttribute('data-collection') || '') === coll);
        });
      }
    }

    if (cat) {
      filtered = allProducts.filter(function (p) {
        return p.category === cat && (!coll || p.collection === coll);
      });
      renderGrid();
      var countEl = document.getElementById('product-count');
      if (countEl) countEl.textContent = filtered.length + ' products';
    } else if (coll) {
      applyFilters();
    }
  }

  function bindEvents() {
    var searchEl = document.getElementById('product-search');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 280);
      });
    }
  }

  function init() {
    if (!document.getElementById('products-grid')) return;

    if (!window.PRODUCTS_CATALOG || !window.PRODUCTS_CATALOG.length) {
      var grid = document.getElementById('products-grid');
      if (grid) {
        grid.innerHTML =
          '<div class="col-12 no-results"><h4>Product data not loaded</h4>' +
          '<p>Ensure <code>assets/js/products-data.js</code> is loaded before this script.</p></div>';
      }
      return;
    }

    allProducts = window.PRODUCTS_CATALOG.slice();
    filtered = allProducts.slice();

    buildTabs();
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
