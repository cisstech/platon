"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[188],{6498:(j,d,s)=>{s.r(d),s.d(d,{default:()=>T});var t=s(7788),p=s(5361),f=s(8875),u=s(6394),g=s(5566),l=s(4691),w=s(5804),v=s(6610),C=s(4047);function y(e,m){if(1&e&&(t.qex(0),t.nrm(1,"json-editor",10),t.bVm()),2&e){const o=t.XpG();t.R7$(),t.Y8G("options",o.options)("data",o.component.state)}}let x=(()=>{class e{constructor(){this.elementRef=(0,t.WQX)(t.aKT),this.resourceLoader=(0,t.WQX)(g.xU),this.options=new l.UN,this.showEditor=!1}ngOnInit(){var o=this;return(0,u.A)(function*(){yield(0,w._)(o.resourceLoader.loadAllAsync([["style","assets/vendors/jsoneditor/jsoneditor.min.css"]]));const n=o.elementRef.nativeElement.firstElementChild;o.component=document.createElement(o.definition.selector);const{showcase:i,schema:c}=o.definition;i&&(o.component.state={...i,...Object.keys(o.definition.schema.properties).filter(r=>!(r in i)).reduce((r,a)=>(a in i||(r[a]=c.properties[a].default),r),{})}),n?.appendChild(o.component),o.options.modes=["tree"],o.options.language="fr-FR",o.options.schema=c,o.options.mainMenuBar=!1,o.options.sortObjectKeys=!1,o.options.onEditable=r=>!("cid"===r.field||"selector"===r.field),o.options.onBlur=()=>{const r=o.editor?.jsonEditorContainer.nativeElement;r&&r.querySelectorAll('[class="jsoneditor-value jsoneditor-string"]').forEach(h=>{h.innerHTML=h.textContent?.replace(/\\n/g,"<br/>")||""})}})()}editorToComponent(){try{const o=this.editor?.get();o&&this.component&&(this.component.state=o)}catch(o){console.error(o)}}componentToEditor(){this.editor?.set(this.component.state)}static#t=this.\u0275fac=function(n){return new(n||e)};static#o=this.\u0275cmp=t.VBU({type:e,selectors:[["wc-showcase"]],viewQuery:function(n,i){if(1&n&&t.GBs(l.$p,5),2&n){let c;t.mGM(c=t.lsd())&&(i.editor=c.first)}},inputs:{definition:"definition"},decls:10,vars:1,consts:[[1,"showcase-demo"],[1,"showcase-meta"],[1,"showcase-actions"],["aria-label","toggle editor","nz-tooltip","Afficher/Cacher l'\xe9diteur",1,"showcase-action",3,"click"],["src","https://icongr.am/octicons/code.svg?size=24&color=currentColor"],["aria-label","Copy component state to the editor","nz-tooltip","Copier l'\xe9tat du composant dans l'\xe9diteur",1,"showcase-action",3,"click"],["src","https://icongr.am/octicons/arrow-down.svg?size=24&color=currentColor"],["aria-label","Copy editor content to the component","nz-tooltip","Copier le contenu de l'\xe9diteur dans le composant",1,"showcase-action",3,"click"],["src","https://icongr.am/octicons/arrow-up.svg?size=24&color=currentColor"],[4,"ngIf"],[3,"options","data"]],template:function(n,i){1&n&&(t.nrm(0,"section",0),t.j41(1,"section",1)(2,"div",2)(3,"div",3),t.bIt("click",function(){return i.showEditor=!i.showEditor}),t.nrm(4,"img",4),t.k0s(),t.j41(5,"div",5),t.bIt("click",function(){return i.componentToEditor()}),t.nrm(6,"img",6),t.k0s(),t.j41(7,"div",7),t.bIt("click",function(){return i.editorToComponent()}),t.nrm(8,"img",8),t.k0s()(),t.DNE(9,y,2,2,"ng-container",9),t.k0s()),2&n&&(t.R7$(9),t.Y8G("ngIf",i.showEditor))},dependencies:[v.bT,C.LH,l.$p],styles:["[_nghost-%COMP%]{position:relative;display:inline-block;width:100%;margin:0 0 16px;border:1px solid #f0f0f0;border-radius:2px;transition:all .2s}.showcase-demo[_ngcontent-%COMP%]{padding:1.3rem;color:#000000d9;border-bottom:1px solid #f0f0f0}.showcase-meta[_ngcontent-%COMP%]{position:relative;width:100%;padding-right:25px;font-size:14px;word-break:break-word}.showcase-meta[_ngcontent-%COMP%]   .showcase-actions[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:flex-start;padding:12px 24px;text-align:center;opacity:.7;transition:opacity .3s;border-top:1px dashed #f0f0f0}.showcase-meta[_ngcontent-%COMP%]   .showcase-action[_ngcontent-%COMP%]{cursor:pointer;margin:0 4px}"]})}return e})();function E(e,m){if(1&e&&t.nrm(0,"wc-showcase",0),2&e){const o=t.XpG();t.Y8G("definition",o.definition)}}function P(e,m){1&e&&t.nrm(0,"ui-error-404")}const T=[{path:"components/:selector",component:(()=>{class e{constructor(){this.api=(0,t.WQX)(p.hr)}ngOnInit(){this.selector&&(this.definition=this.api.findBySelector(this.selector))}static#t=this.\u0275fac=function(n){return new(n||e)};static#o=this.\u0275cmp=t.VBU({type:e,selectors:[["app-wc-plaground"]],inputs:{selector:"selector"},standalone:!0,features:[t.aNF],decls:2,vars:1,consts:[[3,"definition"]],template:function(n,i){1&n&&t.DNE(0,E,1,1,"wc-showcase",0)(1,P,1,0,"ui-error-404"),2&n&&t.vxM(i.definition?0:1)},dependencies:[p.ky,x,f.wT]})}return e})()}]}}]);