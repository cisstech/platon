"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[957],{1164:($,y,n)=>{n.r(y),n.d(y,{JsxModule:()=>s});var r,i=n(1016),p=n(6394),u=n(7270),o=n(7788),_=n(5566),c=n(5804),e=n(5966),l=n(6223),g=n(9241),v=n(9205);let t=class E{static#t=r=this;static#e=this.NEXT_ID=0;constructor(a,m,f){this.injector=a,this.resourceLoader=m,this.changeDetector=f,this.boardId="jsx_graph"+ ++r.NEXT_ID,this.stateChange=new o.bkB}ngOnInit(){var a=this;return(0,p.A)(function*(){a.state.isFilled=!1,yield(0,c._)(a.resourceLoader.loadAllSync([["script","assets/vendors/jsxgraph/jsxgraphcore.js"],["style","assets/vendors/jsxgraph/jsxgraph.css"]])),JXG.Options=JXG.merge(JXG.Options,{board:{showCopyright:!1,keepAspectRatio:!0},elements:{highlight:!1,showInfobox:!1},point:{showInfobox:!1}}),a.createBoard()})()}ngOnDestroy(){this.destroyBoard()}onChangeState(){const a=this.changeDetector.changes(this);(a.includes("script")||a.includes("attributes"))&&this.createBoard(),a.includes("points")&&this.writePoints(),this.state.disabled?this.board.removeEventHandlers():this.board.hasPointerHandlers||this.board.addEventHandlers()}createBoard(){this.destroyBoard(),this.board=JXG.JSXGraph.initBoard(this.boardId,{axis:!0,...this.state.attributes||{}}),this.board.on("update",()=>{this.changeDetector.batch(this,()=>{this.state.isFilled=!0,this.readPoints()})});const a=decodeURIComponent(this.state.script);new Function("board",a)(this.board),this.readPoints()}destroyBoard(){this.board&&JXG.JSXGraph.freeBoard(this.board)}readPoints(){if(this.state.points={},this.board.objectsList)for(const a of this.board.objectsList)JXG.isPoint(a)&&a.name&&(this.state.points[a.name]={x:a.X(),y:a.Y()})}writePoints(){let a=!1;const m=Object.keys(this.state.points);for(const f of m){const D=this.board.objectsList.find(C=>JXG.isPoint(C)&&C.name===f);if(D){const C=this.state.points[f];D.setPosition(JXG.COORDS_BY_USER,[C.x,C.y]),a=!0}}a&&this.board.fullUpdate()}static#s=this.\u0275fac=function(m){return new(m||E)(o.rXU(o.zZn),o.rXU(_.xU),o.rXU(l.D))};static#n=this.\u0275cmp=o.VBU({type:E,selectors:[["wc-jsx"]],inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:2,vars:2,consts:[[1,"jsxgraph-component",3,"id"],[3,"stateChange","state"]],template:function(m,f){1&m&&(o.nrm(0,"div",0),o.j41(1,"wc-base",1),o.mxI("stateChange",function(C){return o.DH7(f.state,C)||(f.state=C),C}),o.k0s()),2&m&&(o.Y8G("id",f.boardId),o.R7$(),o.R50("state",f.state))},dependencies:[v.$],styles:[".jsxgraph-component[_ngcontent-%COMP%]{max-width:400px;width:90vw;max-height:400px;height:90vw;margin:0 auto}"],changeDetection:0})};t=r=(0,u.Cg)([(0,e.Er)(g.M),(0,u.Sn)("design:paramtypes",[o.zZn,_.xU,l.D])],t);let s=(()=>{class d{constructor(){this.component=t}static#t=this.\u0275fac=function(m){return new(m||d)};static#e=this.\u0275mod=o.$C({type:d});static#s=this.\u0275inj=o.G2t({imports:[i.W]})}return d})()},9205:($,y,n)=>{n.d(y,{$:()=>l});var i=n(7788),p=n(6359),u=n(5293),o=n(6610),_=n(2919);const c=["container"];function e(g,v){if(1&g&&(i.qex(0),i.nrm(1,"nge-monaco-viewer",1),i.nI1(2,"json"),i.bVm()),2&g){const r=i.XpG();i.R7$(),i.Y8G("code",i.bMT(2,1,r.state))}}let l=(()=>{class g{constructor(r,t){this.api=r,this.elementRef=t,this.stateChange=new i.bkB}ngOnInit(){const r=this.elementRef.nativeElement;r.parentElement?.setAttribute("id",(0,u.A)());const t=r.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(t||""),this.observer=new MutationObserver(s=>{s.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(r.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(r){return r.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(r):r}onChangeAttributes(r){const d=Array.from(this.elementRef.nativeElement.parentElement.attributes),b=d.find(h=>"cid"===h.name);if(b){const h=sessionStorage.getItem("component-"+b.value);if(h)return void this.stateChange.emit(this.parseValue(h))}const a=d.find(h=>"data-script-id"===h.name);if(a){const h=document.querySelector(`script[id="${a.value}"]`);return void(h&&this.stateChange.emit(this.parseValue(h.textContent||"{}")))}if(d.find(h=>"state"===h.name)&&r)return;const f={},D=this.definition?.schema?.properties||{};let C=!1;for(const h of d)if(h.name in D){C=!0;try{f[h.name]=this.parseValue(h.value)}catch{console.warn(`Invalid value "${h.value}" for ${h.name} attribute`)}}C&&this.stateChange.emit(f)}static#t=this.\u0275fac=function(t){return new(t||g)(i.rXU(p.h),i.rXU(i.aKT))};static#e=this.\u0275cmp=i.VBU({type:g,selectors:[["wc-base"]],viewQuery:function(t,s){if(1&t&&i.GBs(c,5),2&t){let d;i.mGM(d=i.lsd())&&(s.container=d.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(t,s){1&t&&i.DNE(0,e,3,3,"ng-container",0),2&t&&i.Y8G("ngIf",null==s.state?null:s.state.debug)},dependencies:[o.bT,_.x1,o.TG],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return g})()},1016:($,y,n)=>{n.d(y,{W:()=>o});var i=n(6610),p=n(2919),u=n(7788);let o=(()=>{class _{static#t=this.\u0275fac=function(l){return new(l||_)};static#e=this.\u0275mod=u.$C({type:_});static#s=this.\u0275inj=u.G2t({imports:[i.MD,p.OZ,i.MD]})}return _})()},6223:($,y,n)=>{n.d(y,{D:()=>o});var i=n(6394),p=n(7788),u=n(5689);let o=(()=>{class _{batch(e,l){const g=e.$__suspendChanges__$;e.$__suspendChanges__$=!0,l(),e.onChangeState&&e.onChangeState(),e.$__changeDetector__$||(e.$__changeDetector__$=e.injector.get(p.gRc)),e.$__changeDetector__$.detectChanges(),e.$__suspendChanges__$=g}ignore(e,l){return(0,i.A)(function*(){const g=e.$__suspendChanges__$;e.$__suspendChanges__$=!0;const v=yield l();return e.$__changeDetector__$||(e.$__changeDetector__$=e.injector.get(p.gRc)),e.$__changeDetector__$.detectChanges(),e.$__suspendChanges__$=g,v})()}changes(e){if(!e.$__stateCopy__$)return e.$__stateCopy__$=(0,u.A4)(e.$__state__$),[];const l=[];return new Set(Object.keys(e.$__state__$).concat(Object.keys(e.$__stateCopy__$))).forEach(v=>{(0,u.bD)(e.$__state__$[v],e.$__stateCopy__$[v])||l.push(v)}),e.$__stateCopy__$=(0,u.A4)(e.$__state__$),l}static#t=this.\u0275fac=function(l){return new(l||_)};static#e=this.\u0275prov=p.jDH({token:_,factory:_.\u0275fac,providedIn:"root"})}return _})()},5293:($,y,n)=>{n.d(y,{A:()=>r});const p={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let u;const o=new Uint8Array(16);function _(){if(!u&&(u=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!u))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return u(o)}const c=[];for(let t=0;t<256;++t)c.push((t+256).toString(16).slice(1));const r=function v(t,s,d){if(p.randomUUID&&!s&&!t)return p.randomUUID();const b=(t=t||{}).random||(t.rng||_)();if(b[6]=15&b[6]|64,b[8]=63&b[8]|128,s){d=d||0;for(let a=0;a<16;++a)s[d+a]=b[a];return s}return function e(t,s=0){return c[t[s+0]]+c[t[s+1]]+c[t[s+2]]+c[t[s+3]]+"-"+c[t[s+4]]+c[t[s+5]]+"-"+c[t[s+6]]+c[t[s+7]]+"-"+c[t[s+8]]+c[t[s+9]]+"-"+c[t[s+10]]+c[t[s+11]]+c[t[s+12]]+c[t[s+13]]+c[t[s+14]]+c[t[s+15]]}(b)}}}]);