!function(){"use strict";var e,t,n,r,o,c,a,s={},f={};function i(e){var t=f[e];if(void 0!==t)return t.exports;var n=f[e]={exports:{}};return s[e].call(n.exports,n,n.exports,i),n.exports}i.m=s,e=[],i.O=function(t,n,r,o){if(!n){var c=1/0;for(f=0;f<e.length;f++){n=e[f][0],r=e[f][1],o=e[f][2];for(var a=!0,s=0;s<n.length;s++)(!1&o||c>=o)&&Object.keys(i.O).every((function(e){return i.O[e](n[s])}))?n.splice(s--,1):(a=!1,o<c&&(c=o));a&&(e.splice(f--,1),t=r())}return t}o=o||0;for(var f=e.length;f>0&&e[f-1][2]>o;f--)e[f]=e[f-1];e[f]=[n,r,o]},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,{a:t}),t},n=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__},i.t=function(e,r){if(1&r&&(e=this(e)),8&r)return e;if("object"==typeof e&&e){if(4&r&&e.__esModule)return e;if(16&r&&"function"==typeof e.then)return e}var o=Object.create(null);i.r(o);var c={};t=t||[null,n({}),n([]),n(n)];for(var a=2&r&&e;"object"==typeof a&&!~t.indexOf(a);a=n(a))Object.getOwnPropertyNames(a).forEach((function(t){c[t]=function(){return e[t]}}));return c.default=function(){return e},i.d(o,c),o},i.d=function(e,t){for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.f={},i.e=function(e){return Promise.all(Object.keys(i.f).reduce((function(t,n){return i.f[n](e,t),t}),[]))},i.u=function(e){return{56:"component---src-templates-pages-index-tsx",73:"component---src-templates-pages-tools-tsx",82:"component---src-templates-tsconfig-option-one-page-tsx",175:"component---src-templates-pages-docs-handbook-index-tsx",185:"be7b72232f8e7460b2419fb7ab30a05fca7fa063",198:"component---src-templates-playground-handbook-tsx",215:"component---src-templates-pages-dt-search-tsx",248:"component---src-templates-pages-download-tsx",306:"component---src-templates-pages-empty-tsx",346:"component---src-templates-pages-why-create-typescript-tsx",351:"commons",414:"17821066377c4486a980330106160c805ea5b4a9",416:"component---src-pages-branding-tsx",427:"component---src-templates-play-example-tsx",517:"component---src-templates-documentation-tsx",530:"component---src-pages-dev-twoslash-tsx",532:"styles",533:"component---src-templates-pages-community-tsx",556:"component---src-templates-play-tsx",590:"component---src-templates-pages-cheatsheets-tsx",616:"component---src-templates-pages-docs-index-tsx",618:"component---src-pages-dev-bug-workbench-tsx",646:"component---src-pages-dev-sandbox-tsx",690:"component---src-templates-pages-docs-bootstrap-tsx",739:"component---src-templates-tsconfig-reference-tsx",776:"2fd63fb4",790:"eb1d6da484f872bdf1a98f6cd8ea4a7bd6f43523",883:"component---src-pages-dev-typescript-vfs-tsx",925:"component---src-templates-glossary-tsx",930:"component---src-pages-dev-playground-plugins-tsx"}[e]+"-"+{56:"b07b2eeb7e19b67534fc",73:"002a5107b7b68d19c67e",82:"edd501488370e3781f01",175:"8c52922b976e2eac132d",185:"cca3704f3b0456a511d8",198:"5f44ffea7bd72ee9f1f8",215:"179094818be3eb999809",248:"dd5bca8fe345006db91c",306:"a0ba85eab39cc770d463",346:"b0bfbd0ab4f04f17e74d",351:"992216f57a18ea53bddb",414:"ab551397a59c50cfca3e",416:"bc19bb209c439082ca72",427:"8ef4cc1cbca86a4a2478",517:"2611087aeb67737e6494",530:"b9602ecdd17144a971c3",532:"16373979f7978b733ed0",533:"b7b9f30009b24401d79d",556:"37e2d36c3146b47e9679",590:"d685670bdc739b0b8cff",616:"fc9099d09df7aa6599cd",618:"21c55d3ad348915b421e",646:"924ca291a49608609b66",690:"2859b4fd09b8bbe27caa",739:"a59eddb1a468e9b14120",776:"9c245e5f6e38df3ab8b8",790:"5a90449d4e77abdb5afb",883:"802f13aedd83d80f3f95",925:"3a07cbc5eb7496314ec5",930:"e313f2d2c7527ef21442"}[e]+".js"},i.miniCssF=function(e){return"styles.13ab5d1cadc484780229.css"},i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r={},o="typescriptlang-org:",i.l=function(e,t,n,c){if(r[e])r[e].push(t);else{var a,s;if(void 0!==n)for(var f=document.getElementsByTagName("script"),u=0;u<f.length;u++){var p=f[u];if(p.getAttribute("src")==e||p.getAttribute("data-webpack")==o+n){a=p;break}}a||(s=!0,(a=document.createElement("script")).charset="utf-8",a.timeout=120,i.nc&&a.setAttribute("nonce",i.nc),a.setAttribute("data-webpack",o+n),a.src=e),r[e]=[t];var d=function(t,n){a.onerror=a.onload=null,clearTimeout(l);var o=r[e];if(delete r[e],a.parentNode&&a.parentNode.removeChild(a),o&&o.forEach((function(e){return e(n)})),t)return t(n)},l=setTimeout(d.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=d.bind(null,a.onerror),a.onload=d.bind(null,a.onload),s&&document.head.appendChild(a)}},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.p="/",c=function(e){return new Promise((function(t,n){var r=i.miniCssF(e),o=i.p+r;if(function(e,t){for(var n=document.getElementsByTagName("link"),r=0;r<n.length;r++){var o=(a=n[r]).getAttribute("data-href")||a.getAttribute("href");if("stylesheet"===a.rel&&(o===e||o===t))return a}var c=document.getElementsByTagName("style");for(r=0;r<c.length;r++){var a;if((o=(a=c[r]).getAttribute("data-href"))===e||o===t)return a}}(r,o))return t();!function(e,t,n,r){var o=document.createElement("link");o.rel="stylesheet",o.type="text/css",o.onerror=o.onload=function(c){if(o.onerror=o.onload=null,"load"===c.type)n();else{var a=c&&("load"===c.type?"missing":c.type),s=c&&c.target&&c.target.href||t,f=new Error("Loading CSS chunk "+e+" failed.\n("+s+")");f.code="CSS_CHUNK_LOAD_FAILED",f.type=a,f.request=s,o.parentNode.removeChild(o),r(f)}},o.href=t,document.head.appendChild(o)}(e,o,t,n)}))},a={658:0},i.f.miniCss=function(e,t){a[e]?t.push(a[e]):0!==a[e]&&{532:1}[e]&&t.push(a[e]=c(e).then((function(){a[e]=0}),(function(t){throw delete a[e],t})))},function(){var e={658:0};i.f.j=function(t,n){var r=i.o(e,t)?e[t]:void 0;if(0!==r)if(r)n.push(r[2]);else if(/^(532|658)$/.test(t))e[t]=0;else{var o=new Promise((function(n,o){r=e[t]=[n,o]}));n.push(r[2]=o);var c=i.p+i.u(t),a=new Error;i.l(c,(function(n){if(i.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var o=n&&("load"===n.type?"missing":n.type),c=n&&n.target&&n.target.src;a.message="Loading chunk "+t+" failed.\n("+o+": "+c+")",a.name="ChunkLoadError",a.type=o,a.request=c,r[1](a)}}),"chunk-"+t,t)}},i.O.j=function(t){return 0===e[t]};var t=function(t,n){var r,o,c=n[0],a=n[1],s=n[2],f=0;for(r in a)i.o(a,r)&&(i.m[r]=a[r]);if(s)var u=s(i);for(t&&t(n);f<c.length;f++)o=c[f],i.o(e,o)&&e[o]&&e[o][0](),e[c[f]]=0;return i.O(u)},n=self.webpackChunktypescriptlang_org=self.webpackChunktypescriptlang_org||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}()}();
//# sourceMappingURL=webpack-runtime-e09517ec52ba6f84bdc5.js.map