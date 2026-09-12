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
(()=>{"use strict";const e=()=>{const e=document.querySelectorAll(".gameengine-tab-btn"),t=document.querySelectorAll(".gameengine-tab-content");e.length>0&&e.forEach(n=>{n.addEventListener("click",function(){const n=this.dataset.tab;e.forEach(e=>e.classList.remove("gameengine-active")),t.forEach(e=>e.classList.remove("gameengine-active")),this.classList.add("gameengine-active");const a=document.getElementById(n);a&&a.classList.add("gameengine-active")})})};document.addEventListener("DOMContentLoaded",()=>{e()})})();