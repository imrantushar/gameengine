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

/***/ "./dev_gameengine/frontend/tabs.js":
/*!*****************************************!*\
  !*** ./dev_gameengine/frontend/tabs.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initGameEngineTabs: () => (/* binding */ initGameEngineTabs)
/* harmony export */ });
/**
 * Handles Tab Switching for GameEngine Frontend Dashboard
 */
const initGameEngineTabs = () => {
  const tabButtons = document.querySelectorAll('.gameengine-tab-btn');
  const tabContents = document.querySelectorAll('.gameengine-tab-content');
  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetTab = this.dataset.tab;

        // Fix: Class name changed to gameengine-active to match CSS
        tabButtons.forEach(b => b.classList.remove('gameengine-active'));
        tabContents.forEach(c => c.classList.remove('gameengine-active'));

        // Add active class
        this.classList.add('gameengine-active');
        const contentElement = document.getElementById(targetTab);
        if (contentElement) {
          contentElement.classList.add('gameengine-active');
        }
      });
    });
  }
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


document.addEventListener('DOMContentLoaded', () => {
  (0,_frontend_tabs__WEBPACK_IMPORTED_MODULE_1__.initGameEngineTabs)();
});
})();

/******/ })()
;
//# sourceMappingURL=frontend.1.0.0.js.map