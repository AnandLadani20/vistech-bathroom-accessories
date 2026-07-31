/**
 * Sync finish variant images from assets/images/products into products.json
 * and regenerate products-data.js.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'assets', 'images', 'products');
const jsonPath = path.join(root, 'assets', 'json', 'products.json');
const outPath = path.join(root, 'assets', 'js', 'products-data.js');

const files = fs.readdirSync(productsDir);
const finishMap = {
  GL: { finish: 'Glossy' },
  RG: { finish: 'Rose Gold' },
  BL: { finish: 'Black' },
};
const finishOrder = ['GL', 'RG', 'BL'];

function findFinishImages(series) {
  const result = [];
  for (const suffix of finishOrder) {
    const prefix = series + '-' + suffix;
    const candidates = files.filter(function (f) {
      const base = path.parse(f).name;
      return base === prefix || base.startsWith(prefix + '-');
    });
    const match =
      candidates.find(function (f) {
        return path.parse(f).name === prefix;
      }) ||
      candidates.find(function (f) {
        return f.indexOf('-plastic') === -1 && f.indexOf('-og') === -1;
      }) ||
      candidates[0];
    if (match) {
      result.push({
        finish: finishMap[suffix].finish,
        suffix: suffix,
        image: 'assets/images/products/' + match,
      });
    }
  }
  return result;
}

const catalog = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let updated = 0;

catalog.forEach(function (product) {
  const finishImages = findFinishImages(product.series);
  if (finishImages.length > 1) {
    const images = finishImages.map(function (fi) {
      return fi.image;
    });
    product.image = images[0];
    product.images = images;
    product.finishImages = finishImages;
    updated++;
  } else if (finishImages.length === 1) {
    product.image = finishImages[0].image;
    product.images = [finishImages[0].image];
    delete product.finishImages;
    updated++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(catalog, null, 2) + '\n');
fs.writeFileSync(outPath, 'window.PRODUCTS_CATALOG = ' + JSON.stringify(catalog) + ';\n');

console.log('Updated ' + updated + ' products with finish images');
catalog
  .filter(function (p) {
    return p.finishImages;
  })
  .forEach(function (p) {
    console.log(
      p.series + ': ' +
        p.finishImages
          .map(function (f) {
            return path.basename(f.image);
          })
          .join(', ')
    );
  });
