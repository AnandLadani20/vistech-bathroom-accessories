/**
 * OM Steel Bath - Product Listing & Filtering
 */
(function ($) {
  'use strict';

  const ITEMS_PER_PAGE = 12;
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;

  function renderProductCard(product) {
    const detailUrl = 'product-details.html?id=' + product.id;
    const collection = product.collection || '';
    return (
      '<div class="col-md-6 col-lg-4 mb-4 product-item" data-collection="' + collection + '">' +
        '<article class="product-card">' +
          '<div class="product-img-wrap">' +
            '<span class="product-series-badge position-absolute top-0 start-0 m-2">' + product.series + '</span>' +
            '<img src="' + product.image + '" alt="' + product.name + ' - Series ' + product.series + '" loading="lazy" decoding="async" width="400" height="400">' +
            '<div class="product-overlay">' +
              '<a href="' + detailUrl + '" class="btn-luxury btn-sm">View Details</a>' +
            '</div>' +
          '</div>' +
          '<div class="product-body">' +
            (collection ? '<div class="product-collection">' + collection + ' Series</div>' : '') +
            '<span class="product-series">Series: ' + product.series + '</span>' +
            '<h3 class="product-name"><a href="' + detailUrl + '">' + product.name + '</a></h3>' +
            '<p class="product-price">' + product.price + '</p>' +
            '<a href="' + detailUrl + '" class="btn-luxury mt-2">View Details</a>' +
          '</div>' +
        '</article>' +
      '</div>'
    );
  }

  function renderProducts(products, container) {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageProducts = products.slice(start, start + ITEMS_PER_PAGE);

    if (pageProducts.length === 0) {
      container.html(
        '<div class="col-12 no-results">' +
          '<i class="fas fa-box-open"></i>' +
          '<h4>No products found</h4>' +
          '<p>Try adjusting your filters or search term.</p>' +
        '</div>'
      );
      return;
    }

    let html = '';
    pageProducts.forEach(function (p) {
      html += renderProductCard(p);
    });
    container.html(html);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const $pagination = $('#product-pagination');
    if (!$pagination.length || totalPages <= 1) {
      $pagination.empty();
      return;
    }

    let html = '<nav aria-label="Product pagination"><ul class="pagination pagination-luxury justify-content-center">';
    for (let i = 1; i <= totalPages; i++) {
      html +=
        '<li class="page-item' + (i === currentPage ? ' active' : '') + '">' +
          '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a>' +
        '</li>';
    }
    html += '</ul></nav>';
    $pagination.html(html);
  }

  function applyFilters() {
    const search = ($('#product-search').val() || '').toLowerCase().trim();
    const categories = [];
    $('input[name="filter-category"]:checked').each(function () {
      categories.push($(this).val());
    });
    const collections = [];
    $('input[name="filter-collection"]:checked').each(function () {
      collections.push($(this).val());
    });
    const seriesPrefix = $('input[name="filter-series"]:checked').val() || '';
    const priceMin = parseInt($('#price-min').val(), 10) || 0;
    const priceMax = parseInt($('#price-max').val(), 10) || 999999;

    filteredProducts = allProducts.filter(function (p) {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.series.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search);

      const matchCategory =
        categories.length === 0 || categories.indexOf(p.category) !== -1;

      const matchCollection =
        collections.length === 0 || collections.indexOf(p.collection) !== -1;

      const matchSeries = matchSeriesFilter(p, seriesPrefix);

      const price = p.priceValue || 0;
      const matchPrice = price >= priceMin && price <= priceMax;

      return matchSearch && matchCategory && matchCollection && matchSeries && matchPrice;
    });

    currentPage = 1;
    const $grid = $('#products-grid');
    renderProducts(filteredProducts, $grid);
    renderPagination(filteredProducts.length);
    $('#product-count').text(filteredProducts.length + ' products');
  }

  function buildCategoryFilters(categories) {
    const $container = $('#filter-categories');
    if (!$container.length) return;
    let html = '';
    categories.forEach(function (cat) {
      html +=
        '<label><input type="checkbox" name="filter-category" value="' + cat + '"> ' + cat + '</label>';
    });
    $container.html(html);
  }

  function buildCollectionFilters(collections) {
    const $container = $('#filter-collections');
    if (!$container.length) return;
    let html = '';
    collections.forEach(function (c) {
      html +=
        '<label><input type="checkbox" name="filter-collection" value="' + c + '"> ' + c + ' Series</label>';
    });
    $container.html(html);
  }

  function matchSeriesFilter(p, seriesPrefix) {
    if (!seriesPrefix) return true;
    if (seriesPrefix === '5xx') return /^\d/.test(p.series) && p.series.indexOf('KT') !== 0;
    if (seriesPrefix === 'KT') return p.series.indexOf('KT') === 0;
    return p.series.indexOf(seriesPrefix) === 0;
  }

  function buildSeriesFilters(seriesList) {
    const $container = $('#filter-series');
    if (!$container.length) return;
    const labels = { KV: 'Kiva (KV)', RE: 'Rella (RE)', BR: 'Bruna (BR)', CA: 'Canata (CA)', '5xx': 'Vistech (500)', KT: 'Kitchen (KT)' };
    let html = '<label><input type="radio" name="filter-series" value="" checked> All Series</label>';
    seriesList.forEach(function (s) {
      const label = labels[s] || s + ' Series';
      html +=
        '<label><input type="radio" name="filter-series" value="' + s + '"> ' + label + '</label>';
    });
    $container.html(html);
  }

  function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const coll = params.get('collection');
    const series = params.get('series');
    if (cat) {
      $('input[name="filter-category"][value="' + cat + '"]').prop('checked', true);
    }
    if (coll) {
      $('input[name="filter-collection"][value="' + coll + '"]').prop('checked', true);
      $('.collection-tab[data-collection="' + coll + '"]').addClass('active');
    }
    if (series) {
      $('input[name="filter-series"][value="' + series + '"]').prop('checked', true);
    }
    if (cat || coll || series) {
      applyFilters();
    }
  }

  function buildCollectionTabs(collections) {
    const $tabs = $('#collection-tabs');
    if (!$tabs.length) return;
    let html = '<button type="button" class="collection-tab active" data-collection="">All Products</button>';
    collections.forEach(function (c) {
      html += '<button type="button" class="collection-tab" data-collection="' + c + '">' + c + ' Series</button>';
    });
    $tabs.html(html);
    $tabs.on('click', '.collection-tab', function () {
      $('.collection-tab').removeClass('active');
      $(this).addClass('active');
      const col = $(this).data('collection');
      $('input[name="filter-collection"]').prop('checked', false);
      if (col) {
        $('input[name="filter-collection"][value="' + col + '"]').prop('checked', true);
      }
      applyFilters();
    });
  }

  function initProductsPage() {
    const $grid = $('#products-grid');
    if (!$grid.length) return;

    $grid.html('<div class="col-12 ajax-loading"><div class="spinner"></div><p>Loading products...</p></div>');

    ProductLoader.fetch()
      .done(function (products) {
        allProducts = products;
        filteredProducts = products.slice();

        ProductLoader.getCategories().done(buildCategoryFilters);
        ProductLoader.getSeriesList().done(buildSeriesFilters);
        const collections = [];
        products.forEach(function (p) {
          if (p.collection && collections.indexOf(p.collection) === -1) {
            collections.push(p.collection);
          }
        });
        const sortedCollections = collections.sort();
        buildCollectionFilters(sortedCollections);
        buildCollectionTabs(sortedCollections);

        renderProducts(filteredProducts, $grid);
        renderPagination(filteredProducts.length);
        $('#product-count').text(products.length + ' products');
        applyUrlFilters();
      })
      .fail(function () {
        $grid.html(
          '<div class="col-12 no-results">' +
            '<i class="fas fa-exclamation-triangle"></i>' +
            '<h4>Could not load products</h4>' +
            '<p>Please open this site using a local server (not by double-clicking the HTML file).</p>' +
            '<p class="small text-muted">Run: <code>npx serve .</code> in the project folder, then visit <code>http://localhost:3000/products.html</code></p>' +
          '</div>'
        );
      });

    $('#product-search').on('input', debounce(applyFilters, 300));
    $(document).on('change', 'input[name="filter-category"], input[name="filter-collection"], input[name="filter-series"]', applyFilters);
    $('#price-min, #price-max').on('change', applyFilters);
    $('#btn-apply-filters').on('click', applyFilters);
    $('#btn-reset-filters').on('click', function () {
      $('#product-search').val('');
      $('input[name="filter-category"]').prop('checked', false);
      $('input[name="filter-collection"]').prop('checked', false);
      $('input[name="filter-series"][value=""]').prop('checked', true);
      $('#price-min').val('');
      $('#price-max').val('');
      applyFilters();
    });

    $(document).on('click', '#product-pagination .page-link', function (e) {
      e.preventDefault();
      currentPage = parseInt($(this).data('page'), 10);
      renderProducts(filteredProducts, $grid);
      renderPagination(filteredProducts.length);
      $('html, body').animate({ scrollTop: $grid.offset().top - 120 }, 400);
    });
  }

  function initProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id || !$('#product-detail-root').length) return;

    ProductLoader.getById(id)
      .done(function (product) {
        if (!product) {
          window.location.href = '404.html';
          return;
        }
        renderProductDetail(product);
        loadRelatedProducts(product);
      })
      .fail(function () {
        window.location.href = '404.html';
      });
  }

  function renderProductDetail(product) {
    document.title = product.series + ' - ' + product.name + ' | Vistech';
    $('#pd-name').text(product.name);
    $('#pd-series').text('Series: ' + product.series);
    if ($('#pd-collection').length && product.collection) {
      $('#pd-collection').text(product.collection + ' Collection');
    }
    $('#pd-price').text(product.price);
    $('#pd-material').text(product.material);
    $('#pd-finish').text(product.finish);
    $('#pd-dimensions').text(product.dimensions);
    $('#pd-description').text(product.description);
    $('#pd-warranty').text(product.warranty);

    const features = product.features || [];
    let featHtml = '';
    features.forEach(function (f) {
      featHtml += '<li><i class="fas fa-check text-accent me-2"></i>' + f + '</li>';
    });
    $('#pd-features').html(featHtml);

    const specs = product.specifications || {};
    let specHtml = '';
    Object.keys(specs).forEach(function (key) {
      specHtml += '<tr><td>' + key + '</td><td>' + specs[key] + '</td></tr>';
    });
    $('#pd-specs').html(specHtml);

    $('#pd-pdf').attr('href', product.pdf);
    $('#pd-inquiry').attr('href', 'contact.html?product=' + encodeURIComponent(product.name + ' (' + product.series + ')'));

    ProductLoader.fetch().done(function (products) {
      const idx = products.findIndex(function (p) { return String(p.id) === String(product.id); });
      if (idx > 0) {
        $('#pd-prev').attr('href', 'product-details.html?id=' + products[idx - 1].id).removeClass('d-none');
      }
      if (idx >= 0 && idx < products.length - 1) {
        $('#pd-next').attr('href', 'product-details.html?id=' + products[idx + 1].id).removeClass('d-none');
      }
    });

    const images = product.images && product.images.length ? product.images : [product.image];
    let mainImg = images[0];
    $('#pd-main-img').attr({ src: mainImg, alt: product.name }).attr('data-lightbox', 'product-gallery');

    let thumbs = '';
    let galleryLinks = '';
    images.forEach(function (img, i) {
      thumbs +=
        '<div class="col-3"><img src="' + img + '" class="product-thumb' + (i === 0 ? ' active' : '') + '" alt="' + product.name + ' view ' + (i + 1) + '" data-index="' + i + '"></div>';
      galleryLinks +=
        '<a href="' + img + '" data-lightbox="product-gallery" data-title="' + product.name + '"' + (i === 0 ? '' : ' style="display:none"') + '></a>';
    });
    $('#pd-thumbs').html(thumbs);
    $('#pd-lightbox-links').html(galleryLinks);

    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    if (breadcrumbName) breadcrumbName.textContent = product.name;

    injectProductSchema(product);
  }

  function loadRelatedProducts(product) {
    ProductLoader.fetch().done(function (products) {
      const related = products
        .filter(function (p) {
          return p.category === product.category && p.id !== product.id;
        })
        .slice(0, 8);

      if (related.length < 4) {
        const extra = products.filter(function (p) {
          return p.id !== product.id && p.category !== product.category;
        });
        related.push.apply(related, extra.slice(0, 8 - related.length));
      }

      let html = '';
      related.slice(0, 8).forEach(function (p) {
        html +=
          '<div class="product-slide">' +
            '<article class="product-card">' +
              '<div class="product-img-wrap">' +
                '<a href="product-details.html?id=' + p.id + '">' +
                  '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
                '</a>' +
              '</div>' +
              '<div class="product-body">' +
                '<span class="product-series">' + p.series + '</span>' +
                '<h3 class="product-name"><a href="product-details.html?id=' + p.id + '">' + p.name + '</a></h3>' +
                '<p class="product-price">' + p.price + '</p>' +
              '</div>' +
            '</article>' +
          '</div>';
      });

      const $slider = $('#related-products-slider');
      $slider.html(html);

      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
      $slider.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        dots: false,
        responsive: [
          { breakpoint: 992, settings: { slidesToShow: 3 } },
          { breakpoint: 768, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      });
    });
  }

  function injectProductSchema(product) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.series,
      description: product.description,
      image: product.image,
      brand: { '@type': 'Brand', name: 'Vistech' },
      mpn: product.series,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.priceValue,
        availability: 'https://schema.org/InStock'
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function initFeaturedSlider() {
    const $slider = $('#featured-products-slider');
    if (!$slider.length) return;

    const featured =
      window.FEATURED_PRODUCTS && window.FEATURED_PRODUCTS.length
        ? window.FEATURED_PRODUCTS
        : null;

    function buildSlider(products) {
      let html = '';
      products.forEach(function (p) {
        const detailUrl = 'product-details.html?id=' + p.id;
        html +=
          '<div class="product-slide">' +
            '<article class="product-card">' +
              '<div class="product-img-wrap">' +
                '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
                '<div class="product-overlay"><a href="' + detailUrl + '" class="btn-luxury btn-sm">View Details</a></div>' +
              '</div>' +
              '<div class="product-body">' +
                '<div class="product-collection">' + (p.collection || '') + '</div>' +
                '<span class="product-series">Series: ' + p.series + '</span>' +
                '<h3 class="product-name"><a href="' + detailUrl + '">' + p.name + '</a></h3>' +
                '<p class="product-price">' + p.price + '</p>' +
              '</div>' +
            '</article>' +
          '</div>';
      });
      $slider.html(html);
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
      $slider.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        autoplaySpeed: 4000,
        arrows: true,
        dots: true,
        lazyLoad: 'ondemand',
        pauseOnHover: true,
        responsive: [
          { breakpoint: 1200, settings: { slidesToShow: 3 } },
          { breakpoint: 992, settings: { slidesToShow: 2 } },
          { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
      });
    }

    if (featured) {
      buildSlider(featured);
      return;
    }

    if (typeof ProductLoader === 'undefined') return;
    ProductLoader.fetch().done(function (products) {
      buildSlider(products.slice(0, 8));
    });
  }

  $(document).ready(function () {
    initProductsPage();
    initProductDetails();
    initFeaturedSlider();

    $(document).on('click', '.product-thumb', function () {
      const src = $(this).attr('src');
      $('#pd-main-img').attr('src', src);
      $('.product-thumb').removeClass('active');
      $(this).addClass('active');
    });

    $('#pd-main-img').on('click', function () {
      $('a[data-lightbox="product-gallery"]').first().trigger('click');
    });
  });
})(jQuery);
