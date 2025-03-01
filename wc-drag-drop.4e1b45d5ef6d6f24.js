"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[402],{3552:(O,_,d)=>{d.r(_),d.d(_,{DragDropModule:()=>h});var c=d(46),C=d(1016),u=d(821),v=d(7270),t=d(7788),l=d(5966),b=d(2181);let y=(()=>{class o{static#t=this.NODE_ID=0;constructor(e,r){this.el=e,this.renderer=r,this.events=[],this.dropped=new t.bkB,this.id="dnd-"+ ++o.NODE_ID}ngAfterContentInit(){const e=this.el.nativeElement;this.setDraggable(e),this.setDroppable(e)}ngOnDestroy(){this.events.forEach(e=>e())}setDraggable(e){this.renderer.setAttribute(e,"id",this.id),this.renderer.setProperty(e,"draggable",!0),e.addEventListener("dragstart",s=>!!s.dataTransfer&&(s.dataTransfer.effectAllowed="move",s.dataTransfer.setDragImage(this.el.nativeElement,this.el.nativeElement.offsetWidth/2,this.el.nativeElement.offsetHeight/2),s.dataTransfer.setData("dnd-id",e.id),this.renderer.addClass(e,"dnd-drag"),!1),!1),e.addEventListener("dragend",()=>(this.renderer.removeClass(e,"dnd-drag"),!1),!1)}setDroppable(e){this.addListener(e,"dragover",f=>(f.dataTransfer&&(f.dataTransfer.dropEffect="move",f.preventDefault(),this.renderer.addClass(e,"dnd-over")),!1)),this.addListener(e,"dragenter",()=>(this.renderer.removeClass(e,"dnd-over"),!1)),this.addListener(e,"dragleave",()=>(this.renderer.removeClass(e,"dnd-over"),!1)),this.addListener(e,"drop",f=>{if(!f.dataTransfer)return!1;f.preventDefault(),f.stopPropagation(),this.renderer.removeClass(e,"dnd-over");const U=f.dataTransfer.getData("dnd-id");return U&&this.dropped.emit({source:U,destination:this.id}),!1})}addListener(e,r,i){this.renderer.listen(e,r,i),this.events.push(()=>{e.removeEventListener(r,i,!1)})}static#e=this.\u0275fac=function(r){return new(r||o)(t.rXU(t.aKT),t.rXU(t.sFG))};static#n=this.\u0275dir=t.FsC({type:o,selectors:[["","dragNdrop",""]],outputs:{dropped:"dropped"}})}return o})(),m=(()=>{class o{constructor(){this.components={}}register(e,r){this.components[e]=r}unregister(e){delete this.components[e]}get(e){if(e)return this.components[e]}static#t=this.\u0275fac=function(r){return new(r||o)};static#e=this.\u0275prov=t.jDH({token:o,factory:o.\u0275fac})}return o})();var E=d(6610),p=d(9205);function n(o,D){if(1&o&&t.nrm(0,"nge-markdown",4),2&o){const e=t.XpG();t.Y8G("data",e.state.content)}}function a(o,D){if(1&o){const e=t.RV6();t.qex(0),t.j41(1,"span",5),t.bIt("click",function(){t.eBV(e);const i=t.XpG();return t.Njj(i.clear())}),t.EFF(2,"\xd7"),t.k0s(),t.bVm()}}let g=class I{constructor(D,e){this.injector=D,this.dragdrop=e,this.stateChange=new t.bkB}ngOnInit(){this.dragdrop.register(this.directive.id,this),this.state.isFilled=!1}ngOnDestroy(){this.directive&&this.dragdrop.unregister(this.directive.id)}dropped(D){const{source:e,destination:r}=D;if(e!==r){const i=this.dragdrop.get(e),s=this.dragdrop.get(r);if(i.state.group!==s.state.group||i===s)return;if(s.state.draggable)return void(!i.state.draggable&&i.state.content===s.state.content&&(i.state.content="",i.state.isFilled=!1));if(!i.state.draggable&&i.state.content&&s.state.content){const M=i.state.content;i.state.content=s.state.content,s.state.content=M}else s.state.content=i.state.content;s.state.isFilled=!!s.state.content}}clear(){this.state.draggable||(this.state.content="",this.state.isFilled=!1)}static#t=this.\u0275fac=function(e){return new(e||I)(t.rXU(t.zZn),t.rXU(m))};static#e=this.\u0275cmp=t.VBU({type:I,selectors:[["wc-drag-drop"]],viewQuery:function(e,r){if(1&e&&t.GBs(y,7),2&e){let i;t.mGM(i=t.lsd())&&(r.directive=i.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:6,vars:17,consts:[["dragNdrop","",1,"drag-drop-component",3,"dropped","ngClass","ngStyle"],[3,"data",4,"ngIf"],[4,"ngIf"],[3,"stateChange","state"],[3,"data"],[1,"btn-clear",3,"click"]],template:function(e,r){1&e&&(t.j41(0,"div",0),t.nI1(1,"css"),t.nI1(2,"css"),t.bIt("dropped",function(s){return r.dropped(s)}),t.DNE(3,n,1,1,"nge-markdown",1),t.k0s(),t.DNE(4,a,3,0,"ng-container",2),t.j41(5,"wc-base",3),t.mxI("stateChange",function(s){return t.DH7(r.state,s)||(r.state=s),s}),t.k0s()),2&e&&(t.AVh("dragzone",r.state.draggable)("dropzone",!r.state.draggable)("disabled",r.state.disabled),t.Y8G("ngClass",t.i5U(1,11,r.state.css,"class"))("ngStyle",t.i5U(2,14,r.state.css,"style")),t.R7$(3),t.Y8G("ngIf",r.state.content),t.R7$(),t.Y8G("ngIf",!r.state.draggable&&r.state.content),t.R7$(),t.R50("state",r.state))},dependencies:[E.YU,E.bT,E.B3,p.$,c.NgeMarkdownComponent,y,u.S],styles:[".drag-drop-component[_ngcontent-%COMP%]{position:relative;cursor:move;display:inline-flex;padding:8px;box-sizing:border-box;min-width:3em;min-height:2em;vertical-align:middle;text-align:center;justify-content:center;align-items:center;border:2px solid transparent;border-radius:6px;margin:8px}.drag-drop-component.dnd-drag[_ngcontent-%COMP%]{opacity:.6}.drag-drop-component.dragzone[_ngcontent-%COMP%]{background-color:#faebd7}.drag-drop-component.dropzone[_ngcontent-%COMP%]{cursor:pointer;border:1px solid black}.drag-drop-component.dropzone[_ngcontent-%COMP%]:hover, .drag-drop-component.dropzone.dnd-over[_ngcontent-%COMP%]{border:2px solid black}.drag-drop-component.disabled[_ngcontent-%COMP%]{border:1px dashed;pointer-events:none;cursor:not-allowed}.drag-drop-component[_ngcontent-%COMP%]   nge-markdown[_ngcontent-%COMP%]{pointer-events:none}.btn-clear[_ngcontent-%COMP%]{font-size:1.5em;cursor:pointer}"],changeDetection:0})};g=(0,v.Cg)([(0,l.Er)(b.G),(0,v.Sn)("design:paramtypes",[t.zZn,m])],g);let h=(()=>{class o{constructor(){this.component=g}static#t=this.\u0275fac=function(r){return new(r||o)};static#e=this.\u0275mod=t.$C({type:o});static#n=this.\u0275inj=t.G2t({providers:[m],imports:[C.W,u.a,c.NgeMarkdownModule]})}return o})()},9205:(O,_,d)=>{d.d(_,{$:()=>y});var c=d(7788),C=d(6359),u=d(5293),v=d(6610),t=d(2919);const l=["container"];function b(m,E){if(1&m&&(c.qex(0),c.nrm(1,"nge-monaco-viewer",1),c.nI1(2,"json"),c.bVm()),2&m){const p=c.XpG();c.R7$(),c.Y8G("code",c.bMT(2,1,p.state))}}let y=(()=>{class m{constructor(p,n){this.api=p,this.elementRef=n,this.stateChange=new c.bkB}ngOnInit(){const p=this.elementRef.nativeElement;p.parentElement?.setAttribute("id",(0,u.A)());const n=p.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(n||""),this.observer=new MutationObserver(a=>{a.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(p.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(p){return p.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(p):p}onChangeAttributes(p){const g=Array.from(this.elementRef.nativeElement.parentElement.attributes),h=g.find(s=>"cid"===s.name);if(h){const s=sessionStorage.getItem("component-"+h.value);if(s)return void this.stateChange.emit(this.parseValue(s))}const o=g.find(s=>"data-script-id"===s.name);if(o){const s=document.querySelector(`script[id="${o.value}"]`);return void(s&&this.stateChange.emit(this.parseValue(s.textContent||"{}")))}if(g.find(s=>"state"===s.name)&&p)return;const e={},r=this.definition?.schema?.properties||{};let i=!1;for(const s of g)if(s.name in r){i=!0;try{e[s.name]=this.parseValue(s.value)}catch{console.warn(`Invalid value "${s.value}" for ${s.name} attribute`)}}i&&this.stateChange.emit(e)}static#t=this.\u0275fac=function(n){return new(n||m)(c.rXU(C.h),c.rXU(c.aKT))};static#e=this.\u0275cmp=c.VBU({type:m,selectors:[["wc-base"]],viewQuery:function(n,a){if(1&n&&c.GBs(l,5),2&n){let g;c.mGM(g=c.lsd())&&(a.container=g.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(n,a){1&n&&c.DNE(0,b,3,3,"ng-container",0),2&n&&c.Y8G("ngIf",null==a.state?null:a.state.debug)},dependencies:[v.bT,t.x1,v.TG],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return m})()},1016:(O,_,d)=>{d.d(_,{W:()=>v});var c=d(6610),C=d(2919),u=d(7788);let v=(()=>{class t{static#t=this.\u0275fac=function(y){return new(y||t)};static#e=this.\u0275mod=u.$C({type:t});static#n=this.\u0275inj=u.G2t({imports:[c.MD,C.OZ,c.MD]})}return t})()},5293:(O,_,d)=>{d.d(_,{A:()=>p});const C={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let u;const v=new Uint8Array(16);function t(){if(!u&&(u=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!u))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return u(v)}const l=[];for(let n=0;n<256;++n)l.push((n+256).toString(16).slice(1));const p=function E(n,a,g){if(C.randomUUID&&!a&&!n)return C.randomUUID();const h=(n=n||{}).random||(n.rng||t)();if(h[6]=15&h[6]|64,h[8]=63&h[8]|128,a){g=g||0;for(let o=0;o<16;++o)a[g+o]=h[o];return a}return function b(n,a=0){return l[n[a+0]]+l[n[a+1]]+l[n[a+2]]+l[n[a+3]]+"-"+l[n[a+4]]+l[n[a+5]]+"-"+l[n[a+6]]+l[n[a+7]]+"-"+l[n[a+8]]+l[n[a+9]]+"-"+l[n[a+10]]+l[n[a+11]]+l[n[a+12]]+l[n[a+13]]+l[n[a+14]]+l[n[a+15]]}(h)}}}]);