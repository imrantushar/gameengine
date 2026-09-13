/*!
 * GameEngine - generated file, do not edit.
 *
 * Built from dev_gameengine/frontend.js.
 * dev_gameengine/ is this plugin's source directory. The complete
 * uncompiled source ships with the plugin, in dev_gameengine/ and
 * assets/scss/, and is also at https://github.com/imrantushar/gameengine
 *
 * To rebuild this file, run the following in the plugin directory:
 *   npm install
 *   npm run build
 *
 * License: GPL-2.0-or-later
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/scss/frontend.scss":
/*!***********************************!*\
  !*** ./assets/scss/frontend.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./dev_gameengine/frontend/i18n.js":
/*!*****************************************!*\
  !*** ./dev_gameengine/frontend/i18n.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fill: () => (/* binding */ fill),
/* harmony export */   formatNumber: () => (/* binding */ formatNumber),
/* harmony export */   getGlobal: () => (/* binding */ getGlobal),
/* harmony export */   getText: () => (/* binding */ getText)
/* harmony export */ });
/**
 * Data and strings the server localizes for the frontend script
 * (GameEngineGlobal, see includes/assets.php).
 */
const getGlobal = () => window.GameEngineGlobal || {};

/**
 * A localized string, or the fallback when the page did not provide it.
 *
 * @param {string} key      Key in GameEngineGlobal.i18n.
 * @param {string} fallback English text.
 * @return {string} The string.
 */
const getText = (key, fallback) => {
  const strings = getGlobal().i18n || {};
  return strings[key] || fallback;
};

/**
 * Put a value into a translated "%s"/"%d" template.
 *
 * @param {string}        template Template with one placeholder.
 * @param {string|number} value    Value to insert.
 * @return {string} The filled string.
 */
const fill = (template, value) => String(template).replace(/%(?:\d+\$)?[sd]/, String(value));

/**
 * Format a number for the page's language.
 *
 * @param {number|string} value Number.
 * @return {string} Formatted number.
 */
const formatNumber = value => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return String(value);
  }
  try {
    return number.toLocaleString(document.documentElement.lang || undefined);
  } catch (error) {
    return number.toLocaleString();
  }
};

/***/ }),

/***/ "./dev_gameengine/frontend/rewards.js":
/*!********************************************!*\
  !*** ./dev_gameengine/frontend/rewards.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initRewards: () => (/* binding */ initRewards)
/* harmony export */ });
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./i18n */ "./dev_gameengine/frontend/i18n.js");


/**
 * Redeem buttons in the rewards catalogue ([gameengine_rewards]).
 *
 * The server decides everything (stock, per-member limits, balance); the
 * script only posts the redemption and shows the answer on the card it came
 * from.
 */
const initRewards = () => {
  if (document.documentElement.dataset.gameengineRewardsReady) {
    return;
  }
  document.documentElement.dataset.gameengineRewardsReady = '1';
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-gameengine-rewards] button[data-reward-id]');
    if (!button || button.disabled) {
      return;
    }
    const catalog = button.closest('[data-gameengine-rewards]');
    const card = button.closest('[data-reward-card]');
    const notice = catalog.querySelector('[data-gameengine-notice]');
    const label = button.textContent.trim();
    const {
      rest_url: restUrl = '',
      namespace = '',
      nonce = ''
    } = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getGlobal)();
    const showNotice = (message, ok) => {
      if (!notice) {
        return;
      }
      notice.className = `gameengine-notice gameengine-notice--${ok ? 'success' : 'error'}`;
      notice.textContent = message;
      notice.hidden = !message;
    };
    button.disabled = true;
    button.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('redeeming', 'Redeeming…');
    window.fetch(`${restUrl}${namespace}rewards/${encodeURIComponent(button.dataset.rewardId)}/redeem`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      }
    }).then(response => response.json().then(body => ({
      ok: response.ok,
      body: body || {}
    }))).then(({
      ok,
      body
    }) => {
      showNotice(body.message || '', ok);
      if (!ok) {
        button.disabled = false;
        button.textContent = label;
        return;
      }

      // Stays disabled: the page reloads with the member's new standing.
      button.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('redeemed', 'Redeemed');
      const balance = catalog.querySelector('[data-gameengine-balance]');
      if (balance && typeof body.remaining_points !== 'undefined') {
        balance.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.fill)((0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('points', '%s points'), (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.formatNumber)(body.remaining_points));
      }
      const stock = card && card.querySelector('[data-stock-label]');
      if (stock && typeof body.remaining_stock !== 'undefined' && Number(body.remaining_stock) >= 0) {
        if (0 === Number(body.remaining_stock)) {
          stock.remove();
          button.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('outOfStock', 'Out of Stock');
        } else {
          stock.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.fill)((0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('stockLeft', '%d left'), body.remaining_stock);
        }
      }
    }).catch(() => {
      button.disabled = false;
      button.textContent = label;
      showNotice((0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('error', 'Something went wrong. Please try again.'), false);
    });
  });
};

/***/ }),

/***/ "./dev_gameengine/frontend/share.js":
/*!******************************************!*\
  !*** ./dev_gameengine/frontend/share.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initShare: () => (/* binding */ initShare)
/* harmony export */ });
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./i18n */ "./dev_gameengine/frontend/i18n.js");


/**
 * Share buttons on unlocked achievements (`a[data-gameengine-share]`).
 *
 * Opens the device's share sheet where there is one, and copies the link
 * otherwise. Without either, the link opens as a normal link.
 */
const initShare = () => {
  if (document.documentElement.dataset.gameengineShareReady) {
    return;
  }
  document.documentElement.dataset.gameengineShareReady = '1';
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-gameengine-share]');
    if (!link || !navigator.share && !navigator.clipboard) {
      return;
    }
    event.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: link.dataset.gameengineShare,
        url: link.href
      }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(link.href).then(() => {
      const label = link.querySelector('[data-gameengine-share-label]');
      if (!label || label.dataset.gameengineOriginal) {
        return;
      }
      label.dataset.gameengineOriginal = label.textContent;
      label.textContent = (0,_i18n__WEBPACK_IMPORTED_MODULE_0__.getText)('linkCopied', 'Link copied');
      window.setTimeout(() => {
        label.textContent = label.dataset.gameengineOriginal;
        delete label.dataset.gameengineOriginal;
      }, 2000);
    }).catch(() => {});
  });
};

/***/ }),

/***/ "./dev_gameengine/frontend/tabs.js":
/*!*****************************************!*\
  !*** ./dev_gameengine/frontend/tabs.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initTabs: () => (/* binding */ initTabs)
/* harmony export */ });
/**
 * Tabs for `[data-gameengine-tabs]` blocks, such as the member profile.
 *
 * Follows the ARIA tabs pattern: the arrow keys, Home and End move between
 * tabs, and only the selected tab is in the tab order. The server renders the
 * first panel visible and the others `hidden`.
 */
const initTabs = () => {
  document.querySelectorAll('[data-gameengine-tabs]').forEach(root => {
    const tabs = [...root.querySelectorAll(':scope > [role="tablist"] > [role="tab"]')];
    if (!tabs.length || root.dataset.gameengineTabsReady) {
      return;
    }
    root.dataset.gameengineTabsReady = '1';
    const select = (tab, moveFocus) => {
      tabs.forEach(item => {
        const selected = item === tab;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
        item.tabIndex = selected ? 0 : -1;
        if (panel) {
          panel.hidden = !selected;
        }
      });
      if (moveFocus) {
        tab.focus();
      }
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', event => {
        const rtl = 'rtl' === window.getComputedStyle(root).direction;
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        let next;
        if (event.key === forward) {
          next = tabs[(index + 1) % tabs.length];
        } else if (event.key === back) {
          next = tabs[(index - 1 + tabs.length) % tabs.length];
        } else if (event.key === 'Home') {
          next = tabs[0];
        } else if (event.key === 'End') {
          next = tabs[tabs.length - 1];
        } else {
          return;
        }
        event.preventDefault();
        select(next, true);
      });
    });
  });
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./dev_gameengine/frontend.js ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _assets_scss_frontend_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../assets/scss/frontend.scss */ "./assets/scss/frontend.scss");
/* harmony import */ var _frontend_tabs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./frontend/tabs */ "./dev_gameengine/frontend/tabs.js");
/* harmony import */ var _frontend_rewards__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./frontend/rewards */ "./dev_gameengine/frontend/rewards.js");
/* harmony import */ var _frontend_share__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./frontend/share */ "./dev_gameengine/frontend/share.js");




const init = () => {
  (0,_frontend_tabs__WEBPACK_IMPORTED_MODULE_1__.initTabs)();
  (0,_frontend_rewards__WEBPACK_IMPORTED_MODULE_2__.initRewards)();
  (0,_frontend_share__WEBPACK_IMPORTED_MODULE_3__.initShare)();
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map