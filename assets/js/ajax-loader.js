/**
 * Vistech - Product catalog (static JS only, no AJAX)
 * Requires products-data.js loaded first: window.PRODUCTS_CATALOG
 */
var ProductLoader = (function () {
  'use strict';

  function getCatalog() {
    if (window.PRODUCTS_CATALOG && Array.isArray(window.PRODUCTS_CATALOG)) {
      return window.PRODUCTS_CATALOG;
    }
    console.error('PRODUCTS_CATALOG missing. Load assets/js/products-data.js before ajax-loader.js');
    return [];
  }

  function fetchProducts() {
  if (typeof jQuery !== 'undefined') {
      return jQuery.Deferred().resolve(getCatalog()).promise();
    }
    return Promise.resolve(getCatalog());
  }

  function getById(id) {
    var products = getCatalog();
    var found = null;
    for (var i = 0; i < products.length; i++) {
      if (String(products[i].id) === String(id)) {
        found = products[i];
        break;
      }
    }
    if (typeof jQuery !== 'undefined') {
      return jQuery.Deferred().resolve(found).promise();
    }
    return Promise.resolve(found);
  }

  function getCategories() {
    var cats = {};
    getCatalog().forEach(function (p) {
      cats[p.category] = true;
    });
    var list = Object.keys(cats).sort();
    if (typeof jQuery !== 'undefined') {
      return jQuery.Deferred().resolve(list).promise();
    }
    return Promise.resolve(list);
  }

  function getSeriesList() {
    var prefixes = {};
    getCatalog().forEach(function (p) {
      var prefix = p.series.split('-')[0];
      if (/^\d/.test(p.series) && p.series.indexOf('KT') !== 0) {
        prefix = '5xx';
      } else if (p.series.indexOf('KT') === 0) {
        prefix = 'KT';
      }
      prefixes[prefix] = true;
    });
    var list = Object.keys(prefixes).sort();
    if (typeof jQuery !== 'undefined') {
      return jQuery.Deferred().resolve(list).promise();
    }
    return Promise.resolve(list);
  }

  return {
    fetch: fetchProducts,
    getById: getById,
    getByCategory: function (cat) {
      var products = getCatalog();
      if (!cat || cat === 'all') {
        return fetchProducts();
      }
      var filtered = products.filter(function (p) {
        return p.category.toLowerCase() === cat.toLowerCase();
      });
      if (typeof jQuery !== 'undefined') {
        return jQuery.Deferred().resolve(filtered).promise();
      }
      return Promise.resolve(filtered);
    },
    getCategories: getCategories,
    getSeriesList: getSeriesList,
    getAll: getCatalog
  };
})();
