"use strict";(self.webpackChunkfusion_doc=self.webpackChunkfusion_doc||[]).push([[325],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=r.createContext({}),l=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=l(e.components);return r.createElement(c.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(n),d=a,f=u["".concat(c,".").concat(d)]||u[d]||m[d]||o;return n?r.createElement(f,i(i({ref:t},p),{},{components:n})):r.createElement(f,i({ref:t},p))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var l=2;l<o;l++)i[l]=n[l];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},5312:(e,t,n)=>{n.r(t),n.d(t,{contentTitle:()=>l,default:()=>f,frontMatter:()=>c,metadata:()=>p,toc:()=>u});var r=n(7462),a=(n(7294),n(3905)),o=n(6010),i=n(9960);const s={heroBanner:"heroBanner_qdFl",buttons:"buttons_AeoN"},c={},l=void 0,p={type:"mdx",permalink:"/fusion-doc/overview",source:"@site/src/pages/overview.mdx",description:"DataMesh Fusion API",frontMatter:{}},u=[],m={toc:u},d="wrapper";function f(e){let{components:t,...c}=e;return(0,a.kt)(d,(0,r.Z)({},m,c,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("header",{className:(0,o.Z)("hero hero--primary",s.heroBanner)},(0,a.kt)("div",{className:"container"},(0,a.kt)("h1",{style:{textAlign:"center"}},"DataMesh Fusion API"))),(0,a.kt)("br",null),(0,a.kt)("p",null,"The DataMesh Fusion API enables a POS (the ",(0,a.kt)("em",{parentName:"p"},"Sale System"),") to take payments using a DataMesh Satellite terminal (the ",(0,a.kt)("em",{parentName:"p"},"POI terminal"),"). "),(0,a.kt)("p",null,"The API is organised around websockets and a JSON message interface which is based on and guided by the open, industry standard Nexo Retailer Sale to POI Protocol V3.1. It is highly recommended that this document is read alongside the official ",(0,a.kt)("a",{parentName:"p",href:"https://www.nexo-standards.org/"},"NEXO Standard documentation"),"."),(0,a.kt)("p",null,"Both POI Terminal and Sale System connect to Unify (the POI System) - a high-performance, resilient, financial switching platform created by DataMesh."),(0,a.kt)("p",null,"Unify orchestrates the message flow between Sale System and terminal, and assists with error recovery and reconciliation. "),(0,a.kt)("p",null,(0,a.kt)("img",{src:n(1032).Z,width:"1031",height:"429"})),(0,a.kt)("br",null),(0,a.kt)("div",{className:s.buttons},(0,a.kt)(i.Z,{className:"button button--secondary button--lg",to:"/docs/getting-started",mdxType:"Link"},"DataMesh Fusion API Documentation \ud83d\udcdd")))}f.isMDXComponent=!0},1032:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/overview-diagram-15aa6b73b1d2a46f9a997f3e3156e04f.png"}}]);