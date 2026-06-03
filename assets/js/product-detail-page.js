/**
 * Vistech - Product detail page (vanilla JS, no AJAX)
 */
(function () {
  'use strict';

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

  function hideLoader() {
    var loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('hidden');
    document.body.classList.remove('loading');
  }

  function render(product) {
    document.title = product.series + ' - ' + product.name + ' | Vistech';

    var bc = $('breadcrumb-product-name');
    if (bc) bc.textContent = product.name;

    var col = $('pd-collection');
    if (col) col.textContent = (product.collection || '') + ' Collection';

    $('pd-series').textContent = 'Series: ' + product.series;
    $('pd-name').textContent = product.name;
    $('pd-price').textContent = product.price;
    $('pd-material').textContent = product.material || '—';
    $('pd-finish').textContent = product.finish || '—';
    $('pd-dimensions').textContent = product.dimensions || '—';
    $('pd-description').textContent = product.description || '';

    var feat = $('pd-features');
    if (feat) {
      feat.innerHTML = (product.features || [])
        .map(function (f) {
          return '<li><i class="fas fa-check text-accent me-2"></i>' + escapeHtml(f) + '</li>';
        })
        .join('');
    }

    var specs = $('pd-specs');
    if (specs && product.specifications) {
      specs.innerHTML = Object.keys(product.specifications)
        .map(function (k) {
          return '<tr><td>' + escapeHtml(k) + '</td><td>' + escapeHtml(product.specifications[k]) + '</td></tr>';
        })
        .join('');
    }

    var pdf = $('pd-pdf');
    if (pdf) pdf.href = product.pdf || '#';

    var inquiry = $('pd-inquiry');
    if (inquiry) {
      inquiry.href =
        'contact.html?product=' + encodeURIComponent(product.name + ' (' + product.series + ')');
    }

    var images = product.images && product.images.length ? product.images : [product.image];
    var main = $('pd-main-img');
    if (main) {
      main.src = images[0];
      main.alt = product.name;
    }

    var thumbs = $('pd-thumbs');
    if (thumbs) {
      thumbs.innerHTML = images
        .map(function (img, i) {
          return (
            '<div class="col-3"><img src="' +
            escapeHtml(img) +
            '" class="product-thumb' +
            (i === 0 ? ' active' : '') +
            '" alt="View ' +
            (i + 1) +
            '"></div>'
          );
        })
        .join('');
      thumbs.querySelectorAll('.product-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          if (main) main.src = this.src;
          thumbs.querySelectorAll('.product-thumb').forEach(function (t) {
            t.classList.remove('active');
          });
          this.classList.add('active');
        });
      });
    }

    var catalog = window.PRODUCTS_CATALOG || [];
    var idx = -1;
    for (var i = 0; i < catalog.length; i++) {
      if (String(catalog[i].id) === String(product.id)) {
        idx = i;
        break;
      }
    }
    var prev = $('pd-prev');
    var next = $('pd-next');
    if (prev && idx > 0) {
      prev.href = 'product-details.html?id=' + catalog[idx - 1].id;
      prev.classList.remove('d-none');
    }
    if (next && idx >= 0 && idx < catalog.length - 1) {
      next.href = 'product-details.html?id=' + catalog[idx + 1].id;
      next.classList.remove('d-none');
    }

    renderRelated(product, catalog);
  }

  function renderRelated(product, catalog) {
    var slider = $('related-products-slider');
    if (!slider) return;

    var related = catalog.filter(function (p) {
      return p.collection === product.collection && String(p.id) !== String(product.id);
    });
    if (related.length < 4) {
      catalog.forEach(function (p) {
        if (String(p.id) !== String(product.id) && related.indexOf(p) === -1 && related.length < 8) {
          related.push(p);
        }
      });
    }
    related = related.slice(0, 8);

    slider.innerHTML = related
      .map(function (p) {
        var url = 'product-details.html?id=' + p.id;
        return (
          '<div class="col-md-6 col-lg-3 mb-3">' +
            '<article class="product-card">' +
              '<div class="product-img-wrap">' +
                '<a href="' + url + '"><img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '"></a>' +
              '</div>' +
              '<div class="product-body">' +
                '<span class="product-series">Series: ' + escapeHtml(p.series) + '</span>' +
                '<h3 class="product-name"><a href="' + url + '">' + escapeHtml(p.name) + '</a></h3>' +
                '<p class="product-price">' + escapeHtml(p.price) + '</p>' +
              '</div>' +
            '</article>' +
          '</div>'
        );
      })
      .join('');
    slider.className = 'row';
  }

  function init() {
    if (!$('product-detail-root')) return;

    hideLoader();
    setTimeout(hideLoader, 100);

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) {
      window.location.href = 'products.html';
      return;
    }

    var catalog = window.PRODUCTS_CATALOG;
    if (!catalog || !catalog.length) {
      $('pd-name').textContent = 'Product data not loaded';
      return;
    }

    var product = null;
    for (var i = 0; i < catalog.length; i++) {
      if (String(catalog[i].id) === String(id)) {
        product = catalog[i];
        break;
      }
    }

    if (!product) {
      window.location.href = '404.html';
      return;
    }

    render(product);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
