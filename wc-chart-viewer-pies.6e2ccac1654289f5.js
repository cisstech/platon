"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[639],{9205:(f,u,n)=>{n.d(u,{$:()=>v});var s=n(7788),i=n(6359),m=n(5293),p=n(6610),d=n(2919);const a=["container"];function g(h,O){if(1&h&&(s.qex(0),s.nrm(1,"nge-monaco-viewer",1),s.nI1(2,"json"),s.bVm()),2&h){const r=s.XpG();s.R7$(),s.Y8G("code",s.bMT(2,1,r.state))}}let v=(()=>{class h{constructor(r,t){this.api=r,this.elementRef=t,this.stateChange=new s.bkB}ngOnInit(){const r=this.elementRef.nativeElement;r.parentElement?.setAttribute("id",(0,m.A)());const t=r.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(t||""),this.observer=new MutationObserver(e=>{e.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(r.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(r){return r.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(r):r}onChangeAttributes(r){const o=Array.from(this.elementRef.nativeElement.parentElement.attributes),c=o.find(l=>"data-script-id"===l.name);if(c){const l=document.querySelector(`script[id="${c.value}"]`);return void(l&&this.stateChange.emit(this.parseValue(l.textContent||"{}")))}if(o.find(l=>"state"===l.name)&&r)return;const y={},A=this.definition?.schema?.properties||{};let _=!1;for(const l of o)if(l.name in A){_=!0;try{y[l.name]=this.parseValue(l.value)}catch{console.warn(`Invalid value "${l.value}" for ${l.name} attribute`)}}_&&this.stateChange.emit(y)}static#t=this.\u0275fac=function(t){return new(t||h)(s.rXU(i.h),s.rXU(s.aKT))};static#e=this.\u0275cmp=s.VBU({type:h,selectors:[["wc-base"]],viewQuery:function(t,e){if(1&t&&s.GBs(a,5),2&t){let o;s.mGM(o=s.lsd())&&(e.container=o.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(t,e){1&t&&s.DNE(0,g,3,3,"ng-container",0),2&t&&s.Y8G("ngIf",null==e.state?null:e.state.debug)},dependencies:[p.bT,d.x1,p.TG],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return h})()},1016:(f,u,n)=>{n.d(u,{W:()=>p});var s=n(6610),i=n(2919),m=n(7788);let p=(()=>{class d{static#t=this.\u0275fac=function(v){return new(v||d)};static#e=this.\u0275mod=m.$C({type:d});static#n=this.\u0275inj=m.G2t({imports:[s.MD,i.OZ,s.MD]})}return d})()},7576:(f,u,n)=>{n.r(u),n.d(u,{ChartViewerPiesModule:()=>r});var s=n(7270),i=n(7788),m=n(6847),p=n(5966),d=n(3479),a=n(9205),g=n(9688);let v=class E{constructor(){this.injector=(0,i.WQX)(i.zZn),this.changeDetectorRef=(0,i.WQX)(i.gRc),this.commonOption=d.Ng,this.mergedOption={}}onChangeState(){this.state.mode=this.state.mode??"simple",this.mergedOption={donut:(0,m.A4)(d.Vs),simple:(0,m.A4)(d.Ng),nightingale:(0,m.A4)(d.He),"half-donut":(0,m.A4)(d.E8)}[this.state.mode],Array.isArray(this.mergedOption.series)&&(this.mergedOption.series[0].data=(0,m.A4)(this.state.data),"half-donut"==this.state.mode&&(Array.isArray(this.mergedOption.series)&&Array.isArray(this.mergedOption.series[0]?.data)?this.mergedOption.series[0].data=[...this.mergedOption.series[0].data,{value:this.state.data.map(e=>e.value).reduce((e,o)=>e+o,0),itemStyle:{color:"none",decal:{symbol:"none"}},label:{show:!1}}]:console.log("error")),this.mergedOption.series[0].name=this.state.dataTitle),this.mergedOption={...this.mergedOption,title:this.state.title,legend:this.state.legend,tooltip:this.state.tooltip}}static#t=this.\u0275fac=function(o){return new(o||E)};static#e=this.\u0275cmp=i.VBU({type:E,selectors:[["wc-chart-viewer-pies"],["wc-cv-pies"]],inputs:{state:"state"},decls:2,vars:3,consts:[["echarts","",1,"demo-chart",3,"options","merge"],[3,"stateChange","state"]],template:function(o,c){1&o&&(i.nrm(0,"div",0),i.j41(1,"wc-base",1),i.mxI("stateChange",function(y){return i.DH7(c.state,y)||(c.state=y),y}),i.k0s()),2&o&&(i.Y8G("options",c.commonOption)("merge",c.mergedOption),i.R7$(),i.R50("state",c.state))},dependencies:[a.$,g.$P],changeDetection:0})};v=(0,s.Cg)([(0,p.Er)(d.Wm)],v);var h=n(2919),O=n(1016);let r=(()=>{class t{constructor(){this.component=v}static#t=this.\u0275fac=function(c){return new(c||t)};static#e=this.\u0275mod=i.$C({type:t});static#n=this.\u0275inj=i.G2t({imports:[O.W,h.OZ,g.sN]})}return t})()},5293:(f,u,n)=>{n.d(u,{A:()=>r});const i={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let m;const p=new Uint8Array(16);function d(){if(!m&&(m=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!m))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return m(p)}const a=[];for(let t=0;t<256;++t)a.push((t+256).toString(16).slice(1));const r=function O(t,e,o){if(i.randomUUID&&!e&&!t)return i.randomUUID();const c=(t=t||{}).random||(t.rng||d)();if(c[6]=15&c[6]|64,c[8]=63&c[8]|128,e){o=o||0;for(let C=0;C<16;++C)e[o+C]=c[C];return e}return function g(t,e=0){return a[t[e+0]]+a[t[e+1]]+a[t[e+2]]+a[t[e+3]]+"-"+a[t[e+4]]+a[t[e+5]]+"-"+a[t[e+6]]+a[t[e+7]]+"-"+a[t[e+8]]+a[t[e+9]]+"-"+a[t[e+10]]+a[t[e+11]]+a[t[e+12]]+a[t[e+13]]+a[t[e+14]]+a[t[e+15]]}(c)}}}]);