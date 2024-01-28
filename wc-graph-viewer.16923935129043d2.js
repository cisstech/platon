"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[515],{2996:(v,m,e)=>{e.d(m,{H:()=>p});var t=e(4966),u=e(4266),l=e(6733),s=e(9986);const h=["container"];function d(i,C){if(1&i&&(t.ynx(0),t._UZ(1,"nge-monaco-viewer",1),t.ALo(2,"json"),t.BQk()),2&i){const n=t.oxw();t.xp6(1),t.Q6J("code",t.lcZ(2,1,n.state))}}let p=(()=>{class i{constructor(n,a){this.api=n,this.elementRef=a,this.stateChange=new t.vpe}ngOnInit(){const n=this.elementRef.nativeElement,a=n.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(a||""),this.observer=new MutationObserver(o=>{o.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(n.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(n){return n.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(n):n}onChangeAttributes(n){const r=Array.from(this.elementRef.nativeElement.parentElement.attributes),f=r.find(c=>"data-script-id"===c.name);if(f){const c=document.querySelector(`script[id="${f.value}"]`);return void(c&&this.stateChange.emit(this.parseValue(c.textContent||"{}")))}if(r.find(c=>"state"===c.name)&&n)return;const E={},O=this.definition?.schema?.properties||{};let M=!1;for(const c of r)if(c.name in O){M=!0;try{E[c.name]=this.parseValue(c.value)}catch{console.warn(`Invalid value "${c.value}" for ${c.name} attribute`)}}M&&this.stateChange.emit(E)}static#t=this.\u0275fac=function(a){return new(a||i)(t.Y36(u.G),t.Y36(t.SBq))};static#e=this.\u0275cmp=t.Xpm({type:i,selectors:[["wc-base"]],viewQuery:function(a,o){if(1&a&&t.Gf(h,5),2&a){let r;t.iGM(r=t.CRH())&&(o.container=r.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(a,o){1&a&&t.YNc(0,d,3,3,"ng-container",0),2&a&&t.Q6J("ngIf",null==o.state?null:o.state.debug)},dependencies:[l.O5,s.Yu,l.Ts],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return i})()},4104:(v,m,e)=>{e.d(m,{Y:()=>s});var t=e(6733),u=e(9986),l=e(4966);let s=(()=>{class h{static#t=this.\u0275fac=function(i){return new(i||h)};static#e=this.\u0275mod=l.oAB({type:h});static#n=this.\u0275inj=l.cJS({imports:[t.ez,u.vS,t.ez]})}return h})()},672:(v,m,e)=>{e.r(m),e.d(m,{GraphViewerModule:()=>C});var t=e(8934),u=e(4104),l=e(4911),s=e(4966),h=e(5839),d=e(4669),p=e(2996);let i=class g{constructor(a){this.injector=a}static#t=this.\u0275fac=function(o){return new(o||g)(s.Y36(s.zs3))};static#e=this.\u0275cmp=s.Xpm({type:g,selectors:[["wc-graph-viewer"]],inputs:{state:"state"},decls:2,vars:2,consts:[[3,"renderDot"],[3,"state","stateChange"]],template:function(o,r){1&o&&(s._UZ(0,"div",0),s.TgZ(1,"wc-base",1),s.NdJ("stateChange",function(_){return r.state=_}),s.qZA()),2&o&&(s.Q6J("renderDot",r.state.graph),s.xp6(1),s.Q6J("state",r.state))},dependencies:[p.H,t.Y],changeDetection:0})};i=(0,l.gn)([(0,h._s)(d.Y),(0,l.w6)("design:paramtypes",[s.zs3])],i);let C=(()=>{class n{constructor(){this.component=i}static#t=this.\u0275fac=function(r){return new(r||n)};static#e=this.\u0275mod=s.oAB({type:n});static#n=this.\u0275inj=s.cJS({imports:[u.Y,t.a]})}return n})()}}]);