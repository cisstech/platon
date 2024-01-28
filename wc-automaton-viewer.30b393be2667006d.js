"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[157],{2996:(_,h,e)=>{e.d(h,{H:()=>p});var t=e(4966),d=e(4266),u=e(6733),n=e(9986);const m=["container"];function g(c,f){if(1&c&&(t.ynx(0),t._UZ(1,"nge-monaco-viewer",1),t.ALo(2,"json"),t.BQk()),2&c){const s=t.oxw();t.xp6(1),t.Q6J("code",t.lcZ(2,1,s.state))}}let p=(()=>{class c{constructor(s,a){this.api=s,this.elementRef=a,this.stateChange=new t.vpe}ngOnInit(){const s=this.elementRef.nativeElement,a=s.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(a||""),this.observer=new MutationObserver(o=>{o.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(s.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(s){return s.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(s):s}onChangeAttributes(s){const i=Array.from(this.elementRef.nativeElement.parentElement.attributes),l=i.find(r=>"data-script-id"===r.name);if(l){const r=document.querySelector(`script[id="${l.value}"]`);return void(r&&this.stateChange.emit(this.parseValue(r.textContent||"{}")))}if(i.find(r=>"state"===r.name)&&s)return;const v={},M=this.definition?.schema?.properties||{};let E=!1;for(const r of i)if(r.name in M){E=!0;try{v[r.name]=this.parseValue(r.value)}catch{console.warn(`Invalid value "${r.value}" for ${r.name} attribute`)}}E&&this.stateChange.emit(v)}static#t=this.\u0275fac=function(a){return new(a||c)(t.Y36(d.G),t.Y36(t.SBq))};static#e=this.\u0275cmp=t.Xpm({type:c,selectors:[["wc-base"]],viewQuery:function(a,o){if(1&a&&t.Gf(m,5),2&a){let i;t.iGM(i=t.CRH())&&(o.container=i.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(a,o){1&a&&t.YNc(0,g,3,3,"ng-container",0),2&a&&t.Q6J("ngIf",null==o.state?null:o.state.debug)},dependencies:[u.O5,n.Yu,u.Ts],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return c})()},4104:(_,h,e)=>{e.d(h,{Y:()=>n});var t=e(6733),d=e(9986),u=e(4966);let n=(()=>{class m{static#t=this.\u0275fac=function(c){return new(c||m)};static#e=this.\u0275mod=u.oAB({type:m});static#n=this.\u0275inj=u.cJS({imports:[t.ez,d.vS,t.ez]})}return m})()},9042:(_,h,e)=>{e.r(h),e.d(h,{AutomatonViewerModule:()=>s});var t=e(8934),d=e(4104),u=e(4911),n=e(4966),m=e(6276),g=e(5839),p=e(3596),c=e(2996);let f=class C{constructor(o){this.injector=o}onChangeState(){this.dot=(0,m.jU)((0,m.Jc)(this.state.automaton))}static#t=this.\u0275fac=function(i){return new(i||C)(n.Y36(n.zs3))};static#e=this.\u0275cmp=n.Xpm({type:C,selectors:[["wc-automaton-viewer"]],inputs:{state:"state"},decls:2,vars:2,consts:[[3,"renderDot"],[3,"state","stateChange"]],template:function(i,l){1&i&&(n._UZ(0,"div",0),n.TgZ(1,"wc-base",1),n.NdJ("stateChange",function(v){return l.state=v}),n.qZA()),2&i&&(n.Q6J("renderDot",l.dot),n.xp6(1),n.Q6J("state",l.state))},dependencies:[c.H,t.Y],styles:["div[_ngcontent-%COMP%]{width:100%;overflow:auto}"],changeDetection:0})};f=(0,u.gn)([(0,g._s)(p.G),(0,u.w6)("design:paramtypes",[n.zs3])],f);let s=(()=>{class a{constructor(){this.component=f}static#t=this.\u0275fac=function(l){return new(l||a)};static#e=this.\u0275mod=n.oAB({type:a});static#n=this.\u0275inj=n.cJS({imports:[d.Y,t.a]})}return a})()}}]);