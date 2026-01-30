import { PRODUCTS, CATEGORIES, STORE_LIST } from "./data";
import { normalizeAisle } from "./normalize";

export function validateData() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const productIds = new Set<string>();

  let totalProducts = PRODUCTS.length;
  let totalStores = STORE_LIST.length;
  let missingLocationCount = 0;

  PRODUCTS.forEach((product) => {
    if (productIds.has(product.id)) {
      errors.push(`Duplicate product ID: ${product.id}`);
    }
    productIds.add(product.id);

    const category = CATEGORIES.find(
      (c) => c.en === product.category_en || c.zh === product.category_zh
    );
    if (!category) {
      errors.push(`Product ${product.id}: Category "${product.category_en}/${product.category_zh}" does not exist in CATEGORIES`);
    } else {
      const subcategory = category.subCategories.find(
        (s) => s.en === product.sub_category_en || s.zh === product.sub_category_zh
      );
      if (!subcategory) {
        errors.push(`Product ${product.id}: Subcategory "${product.sub_category_en}/${product.sub_category_zh}" does not exist under category "${category.en}"`);
      }
    }

    const storeIds = Object.keys(product.locationsByStore);
    if (storeIds.length === 0) {
      errors.push(`Product ${product.id}: No store locations defined in locationsByStore`);
      missingLocationCount++;
    }

    storeIds.forEach(storeId => {
      if (!STORE_LIST.find(s => s.id === storeId)) {
        errors.push(`Product ${product.id}: References invalid store ID "${storeId}"`);
      } else {
        const loc = product.locationsByStore[storeId];
        
        if (!loc.aisle) {
          warnings.push(`Product ${product.id} [${storeId}]: Missing aisle value`);
        } else {
          const normalized = normalizeAisle(loc.aisle);
          if (normalized === null) {
            warnings.push(`Product ${product.id} [${storeId}]: Invalid aisle format "${loc.aisle}" (no numeric value found)`);
          }
        }

        if (!loc.shelf) {
          warnings.push(`Product ${product.id} [${storeId}]: Missing shelf value`);
        }
      }
    });
  });

  if (errors.length > 0) {
    console.group("%c PX Mart Data Validation Errors", "color: white; background: red; font-weight: bold; padding: 2px 4px; border-radius: 2px;");
    errors.forEach(err => console.error(err));
    console.groupEnd();
  }
  
  if (warnings.length > 0) {
    console.group("%c PX Mart Data Warnings", "color: black; background: orange; font-weight: bold; padding: 2px 4px; border-radius: 2px;");
    warnings.forEach(warn => console.warn(warn));
    console.groupEnd();
  }
  
  if (errors.length === 0) {
    console.log("%c PX Mart Data Validated Successfully", "color: white; background: green; font-weight: bold; padding: 2px 4px; border-radius: 2px;");
  }

  console.log(`%c📊 Data Stats: ${totalProducts} products, ${totalStores} stores, ${missingLocationCount} products missing locations`, 
    "color: #666; font-style: italic;");
}
