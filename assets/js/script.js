/// ---------------------------
//  Fakee-shop backend logic.
/// ---------------------------

import * as App from "./modules/products.js";

(function (window, FakeeShop) {

  const VERSION = "0.1.0";

  let settings = {
    show_nav_promo: true,
    promo: {
      label: "Valentine's Day",
      href: "#hero-banner"
    }
  };

  FakeeShop.init(settings);
  FakeeShop.run();

  // Make FakeeShop's public API available in the global scope.
  window.FakeeShop = {
    VERSION,
    init: FakeeShop.init,
    settings: FakeeShop.getSettings,
    run: FakeeShop.run
  };

})(window, App);
