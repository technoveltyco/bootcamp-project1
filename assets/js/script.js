/// ---------------------------
//  Fakee-shop backend logic.
/// ---------------------------

import * as App from "./modules/products.js";

(function (global, FakeeShop) {

  const VERSION = "0.1.0";

  let settings = {
    debug: true,
    show_nav_promo: true,
    promo: {
      label: "Valentine's Day",
      href: "#valentines-promo",
    },
  };

  FakeeShop.init(settings);
  FakeeShop.run();

  // Make FakeeShop's public API available in the global scope.
  global.FakeeShop = {
    VERSION,
    DEBUG: FakeeShop.DEBUG,
    init: FakeeShop.init,
    settings: FakeeShop.getSettings,
    run: FakeeShop.run
  };

})(window, App);
