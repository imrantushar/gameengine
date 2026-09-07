/*!
 * GameEngine - generated file, do not edit.
 *
 * Built from src/frontend.js.
 * The complete uncompiled source ships with this plugin in src/ and
 * assets/scss/, and is also at https://github.com/imrantushar/gameengine
 *
 * To rebuild this file, run the following in the plugin directory:
 *   npm install
 *   npm run build
 *
 * License: GPL-2.0-or-later
 */
(()=>{"use strict";const e=()=>{const e=document.querySelectorAll(".gameengine-tab-btn"),t=document.querySelectorAll(".gameengine-tab-content");e.length>0&&e.forEach(n=>{n.addEventListener("click",function(){const n=this.dataset.tab;e.forEach(e=>e.classList.remove("gameengine-active")),t.forEach(e=>e.classList.remove("gameengine-active")),this.classList.add("gameengine-active");const a=document.getElementById(n);a&&a.classList.add("gameengine-active")})})};document.addEventListener("DOMContentLoaded",()=>{e()})})();