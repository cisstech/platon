"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[32],{327:(v,E,a)=>{a.r(E),a.d(E,{TextSelectModule:()=>u});var i=a(1016),g=a(821),p=a(7270),r=a(7788),C=a(5966),c=a(413),_=a(9205);const m="data-select-index",f="highlight-state";let M=class T{get container(){const t=this.el.nativeElement;let e=t.firstElementChild;return"DIV"!==e.tagName&&(e=document.createElement("div"),t.insertBefore(e,t.firstElementChild)),e.className="cursor-pointer","free"===this.state.mode&&(e.className="cursor-text"),e.className+=this.state.disabled?" disabled":"",e}constructor(t,e,s){this.injector=t,this.el=e,this.cssPipe=s,this.stateChange=new r.bkB}onChangeState(){switch(this.state.mode){case"units":this.renderModeUnits();break;case"free":this.renderModeFree();break;default:this.renderModeRegex()}this.highlightSelections()}onMouseUp(t){"free"===this.state.mode?this.createSelectionFromMouse():this.createSelectionFromEvent(t)}createSelectionFromMouse(){const t=(window.getSelection||document.getSelection)(),e=t?.anchorNode?.parentElement,s=t?.focusNode?.parentElement,o=Number.parseInt(e?.getAttribute(m)||"",10),l=Number.parseInt(s?.getAttribute(m)||"",10);if(Number.isNaN(o)||Number.isNaN(l))return;const d=Math.min(o,l),b=Math.max(o,l),h=this.state.selections;for(let x=0;x<h.length;x++){const I=h[x];if("object"==typeof I.position){const y=I.position;if(d>=y[0]&&d<=y[1]||b>=y[0]&&d<=y[1])return void h.splice(x,1)}}this.state.selections.push({position:[d,b]})}createSelectionFromEvent(t){if(!(t.target instanceof HTMLElement))return;const e=this.container;let s=t.target;if(e.isSameNode(s)||!e.contains(s))return;for(;null==s.getAttribute(m);)if(s=s.parentElement,null==s||s.isSameNode(e))return;const o=Number.parseInt(s.getAttribute(m)||"",10);if(!Number.isNaN(o)){let l=0;for(const d of this.state.selections){if(d.position===o)return void this.state.selections.splice(l,1);l++}this.state.selections.push({position:o})}}renderModeFree(){this.container.innerHTML=this.state.text.trim();let t=0;const e=s=>{if(s.nodeType!==Node.TEXT_NODE)Array.from(s.childNodes).forEach(o=>e(o));else{const o=document.createElement("span");for(const l of s.textContent){if("\n"===l)continue;const d=document.createElement("span");d.innerText=l,d.setAttribute(m,(t++).toString()),o.appendChild(d)}s.parentElement?.replaceChild(o,s)}};e(this.container)}renderModeUnits(){let t=0;this.container.innerHTML=this.state.text.replace(/\{([^}]+?)\}/gm,(e,s)=>`<span ${m}="${t++}">${s}</span>`)}renderModeRegex(){let t=0;this.container.innerHTML=this.state.text.trim().replace(new RegExp(this.state.regex||"","gm"),e=>`<span ${m}="${t++}">${e}</span>`)}highlightRange(t,e,s){const o=this.container,l=[];for(let d=t;d<=e;d++){const b=o.querySelector(`[${m}="${d}"]`);b&&(b.className=s||f,l.push(b.innerHTML))}return l.join("")}highlightSelections(){const t=this.container;t.querySelectorAll(`[${m}]`).forEach(e=>{e.className=""}),this.state.selections.forEach(e=>{const s=this.cssPipe.transform(e.css,"class");if("number"==typeof e.position){const o=t.querySelector(`[${m}="${e.position}"]`);o&&(o.className=s||f,e.content!==o.textContent&&(e.content=o.textContent))}else{const o=this.highlightRange(e.position[0],e.position[1],s);e.content!==o&&(e.content=o)}})}static#t=this.\u0275fac=function(e){return new(e||T)(r.rXU(r.zZn),r.rXU(r.aKT),r.rXU(g.S))};static#e=this.\u0275cmp=r.VBU({type:T,selectors:[["wc-text-select"]],hostBindings:function(e,s){1&e&&r.bIt("mouseup",function(l){return s.onMouseUp(l)})},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[3,"stateChange","state"]],template:function(e,s){1&e&&(r.j41(0,"wc-base",0),r.mxI("stateChange",function(l){return r.DH7(s.state,l)||(s.state=l),l}),r.k0s()),2&e&&r.R50("state",s.state)},dependencies:[_.$],styles:["[_nghost-%COMP%]  .cursor-pointer{cursor:pointer}[_nghost-%COMP%]  .cursor-text{cursor:text}[_nghost-%COMP%]  .highlight-state{border-top:1px solid transparent;border-bottom:1px solid transparent;color:var(--brand-color-primary);background-color:#cce5ff;border-color:#b8daff}[_nghost-%COMP%]  .error-state, [_nghost-%COMP%]  .warning-state, [_nghost-%COMP%]  .success-state{border:unset;border-radius:unset}[_nghost-%COMP%]  .error-state{text-decoration:line-through}[_nghost-%COMP%]  .disabled, [_nghost-%COMP%]  .disabled *{color:gray;-webkit-user-select:none;user-select:none;pointer-events:none}"],changeDetection:0})};M=(0,p.Cg)([(0,C.Er)(c.w),(0,p.Sn)("design:paramtypes",[r.zZn,r.aKT,g.S])],M);let u=(()=>{class n{constructor(){this.component=M}static#t=this.\u0275fac=function(s){return new(s||n)};static#e=this.\u0275mod=r.$C({type:n});static#n=this.\u0275inj=r.G2t({providers:[g.S],imports:[i.W,g.a]})}return n})()},9205:(v,E,a)=>{a.d(E,{$:()=>m});var i=a(7788),g=a(6359),p=a(5293),r=a(6610),C=a(2919);const c=["container"];function _(f,M){if(1&f&&(i.qex(0),i.nrm(1,"nge-monaco-viewer",1),i.nI1(2,"json"),i.bVm()),2&f){const u=i.XpG();i.R7$(),i.Y8G("code",i.bMT(2,1,u.state))}}let m=(()=>{class f{constructor(u,n){this.api=u,this.elementRef=n,this.stateChange=new i.bkB}ngOnInit(){const u=this.elementRef.nativeElement;u.parentElement?.setAttribute("id",(0,p.A)());const n=u.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(n||""),this.observer=new MutationObserver(t=>{t.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(u.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(u){return u.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(u):u}onChangeAttributes(u){const e=Array.from(this.elementRef.nativeElement.parentElement.attributes),s=e.find(h=>"data-script-id"===h.name);if(s){const h=document.querySelector(`script[id="${s.value}"]`);return void(h&&this.stateChange.emit(this.parseValue(h.textContent||"{}")))}if(e.find(h=>"state"===h.name)&&u)return;const l={},d=this.definition?.schema?.properties||{};let b=!1;for(const h of e)if(h.name in d){b=!0;try{l[h.name]=this.parseValue(h.value)}catch{console.warn(`Invalid value "${h.value}" for ${h.name} attribute`)}}b&&this.stateChange.emit(l)}static#t=this.\u0275fac=function(n){return new(n||f)(i.rXU(g.h),i.rXU(i.aKT))};static#e=this.\u0275cmp=i.VBU({type:f,selectors:[["wc-base"]],viewQuery:function(n,t){if(1&n&&i.GBs(c,5),2&n){let e;i.mGM(e=i.lsd())&&(t.container=e.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(n,t){1&n&&i.DNE(0,_,3,3,"ng-container",0),2&n&&i.Y8G("ngIf",null==t.state?null:t.state.debug)},dependencies:[r.bT,C.x1,r.TG],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return f})()},1016:(v,E,a)=>{a.d(E,{W:()=>r});var i=a(6610),g=a(2919),p=a(7788);let r=(()=>{class C{static#t=this.\u0275fac=function(m){return new(m||C)};static#e=this.\u0275mod=p.$C({type:C});static#n=this.\u0275inj=p.G2t({imports:[i.MD,g.OZ,i.MD]})}return C})()},5293:(v,E,a)=>{a.d(E,{A:()=>u});const g={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let p;const r=new Uint8Array(16);function C(){if(!p&&(p=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!p))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return p(r)}const c=[];for(let n=0;n<256;++n)c.push((n+256).toString(16).slice(1));const u=function M(n,t,e){if(g.randomUUID&&!t&&!n)return g.randomUUID();const s=(n=n||{}).random||(n.rng||C)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,t){e=e||0;for(let o=0;o<16;++o)t[e+o]=s[o];return t}return function _(n,t=0){return c[n[t+0]]+c[n[t+1]]+c[n[t+2]]+c[n[t+3]]+"-"+c[n[t+4]]+c[n[t+5]]+"-"+c[n[t+6]]+c[n[t+7]]+"-"+c[n[t+8]]+c[n[t+9]]+"-"+c[n[t+10]]+c[n[t+11]]+c[n[t+12]]+c[n[t+13]]+c[n[t+14]]+c[n[t+15]]}(s)}}}]);