"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[69],{2996:(V,w,o)=>{o.d(w,{H:()=>b});var s=o(4966),a=o(4266),S=o(6733),R=o(9986);const C=["container"];function x(_,E){if(1&_&&(s.ynx(0),s._UZ(1,"nge-monaco-viewer",1),s.ALo(2,"json"),s.BQk()),2&_){const d=s.oxw();s.xp6(1),s.Q6J("code",s.lcZ(2,1,d.state))}}let b=(()=>{class _{constructor(d,h){this.api=d,this.elementRef=h,this.stateChange=new s.vpe}ngOnInit(){const d=this.elementRef.nativeElement,h=d.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(h||""),this.observer=new MutationObserver(p=>{p.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(d.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(d){return d.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(d):d}onChangeAttributes(d){const v=Array.from(this.elementRef.nativeElement.parentElement.attributes),D=v.find(f=>"data-script-id"===f.name);if(D){const f=document.querySelector(`script[id="${D.value}"]`);return void(f&&this.stateChange.emit(this.parseValue(f.textContent||"{}")))}if(v.find(f=>"state"===f.name)&&d)return;const O={},L=this.definition?.schema?.properties||{};let k=!1;for(const f of v)if(f.name in L){k=!0;try{O[f.name]=this.parseValue(f.value)}catch{console.warn(`Invalid value "${f.value}" for ${f.name} attribute`)}}k&&this.stateChange.emit(O)}static#e=this.\u0275fac=function(h){return new(h||_)(s.Y36(a.G),s.Y36(s.SBq))};static#t=this.\u0275cmp=s.Xpm({type:_,selectors:[["wc-base"]],viewQuery:function(h,p){if(1&h&&s.Gf(C,5),2&h){let v;s.iGM(v=s.CRH())&&(p.container=v.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(h,p){1&h&&s.YNc(0,x,3,3,"ng-container",0),2&h&&s.Q6J("ngIf",null==p.state?null:p.state.debug)},dependencies:[S.O5,R.Yu,S.Ts],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return _})()},4104:(V,w,o)=>{o.d(w,{Y:()=>R});var s=o(6733),a=o(9986),S=o(4966);let R=(()=>{class C{static#e=this.\u0275fac=function(_){return new(_||C)};static#t=this.\u0275mod=S.oAB({type:C});static#i=this.\u0275inj=S.cJS({imports:[s.ez,a.vS,s.ez]})}return C})()},9735:(V,w,o)=>{o.d(w,{Cl:()=>M,ZD:()=>y,mF:()=>I,rL:()=>B});var s=o(2561),a=o(4966),S=o(8748),R=o(1209),C=o(8132),x=o(409),E=(o(7925),o(5407),o(9977)),d=o(5333),h=o(8491),p=o(6733),v=o(5667);let I=(()=>{class r{constructor(e,t,i){this._ngZone=e,this._platform=t,this._scrolled=new S.x,this._globalSubscription=null,this._scrolledCount=0,this.scrollContainers=new Map,this._document=i}register(e){this.scrollContainers.has(e)||this.scrollContainers.set(e,e.elementScrolled().subscribe(()=>this._scrolled.next(e)))}deregister(e){const t=this.scrollContainers.get(e);t&&(t.unsubscribe(),this.scrollContainers.delete(e))}scrolled(e=20){return this._platform.isBrowser?new C.y(t=>{this._globalSubscription||this._addGlobalListener();const i=e>0?this._scrolled.pipe((0,E.e)(e)).subscribe(t):this._scrolled.subscribe(t);return this._scrolledCount++,()=>{i.unsubscribe(),this._scrolledCount--,this._scrolledCount||this._removeGlobalListener()}}):(0,R.of)()}ngOnDestroy(){this._removeGlobalListener(),this.scrollContainers.forEach((e,t)=>this.deregister(t)),this._scrolled.complete()}ancestorScrolled(e,t){const i=this.getAncestorScrollContainers(e);return this.scrolled(t).pipe((0,d.h)(n=>!n||i.indexOf(n)>-1))}getAncestorScrollContainers(e){const t=[];return this.scrollContainers.forEach((i,n)=>{this._scrollableContainsElement(n,e)&&t.push(n)}),t}_getWindow(){return this._document.defaultView||window}_scrollableContainsElement(e,t){let i=(0,s.fI)(t),n=e.getElementRef().nativeElement;do{if(i==n)return!0}while(i=i.parentElement);return!1}_addGlobalListener(){this._globalSubscription=this._ngZone.runOutsideAngular(()=>{const e=this._getWindow();return(0,x.R)(e.document,"scroll").subscribe(()=>this._scrolled.next())})}_removeGlobalListener(){this._globalSubscription&&(this._globalSubscription.unsubscribe(),this._globalSubscription=null)}static#e=this.\u0275fac=function(t){return new(t||r)(a.LFG(a.R0b),a.LFG(h.t4),a.LFG(p.K0,8))};static#t=this.\u0275prov=a.Yz7({token:r,factory:r.\u0275fac,providedIn:"root"})}return r})(),B=(()=>{class r{constructor(e,t,i){this._platform=e,this._change=new S.x,this._changeListener=n=>{this._change.next(n)},this._document=i,t.runOutsideAngular(()=>{if(e.isBrowser){const n=this._getWindow();n.addEventListener("resize",this._changeListener),n.addEventListener("orientationchange",this._changeListener)}this.change().subscribe(()=>this._viewportSize=null)})}ngOnDestroy(){if(this._platform.isBrowser){const e=this._getWindow();e.removeEventListener("resize",this._changeListener),e.removeEventListener("orientationchange",this._changeListener)}this._change.complete()}getViewportSize(){this._viewportSize||this._updateViewportSize();const e={width:this._viewportSize.width,height:this._viewportSize.height};return this._platform.isBrowser||(this._viewportSize=null),e}getViewportRect(){const e=this.getViewportScrollPosition(),{width:t,height:i}=this.getViewportSize();return{top:e.top,left:e.left,bottom:e.top+i,right:e.left+t,height:i,width:t}}getViewportScrollPosition(){if(!this._platform.isBrowser)return{top:0,left:0};const e=this._document,t=this._getWindow(),i=e.documentElement,n=i.getBoundingClientRect();return{top:-n.top||e.body.scrollTop||t.scrollY||i.scrollTop||0,left:-n.left||e.body.scrollLeft||t.scrollX||i.scrollLeft||0}}change(e=20){return e>0?this._change.pipe((0,E.e)(e)):this._change}_getWindow(){return this._document.defaultView||window}_updateViewportSize(){const e=this._getWindow();this._viewportSize=this._platform.isBrowser?{width:e.innerWidth,height:e.innerHeight}:{width:0,height:0}}static#e=this.\u0275fac=function(t){return new(t||r)(a.LFG(h.t4),a.LFG(a.R0b),a.LFG(p.K0,8))};static#t=this.\u0275prov=a.Yz7({token:r,factory:r.\u0275fac,providedIn:"root"})}return r})(),y=(()=>{class r{static#e=this.\u0275fac=function(t){return new(t||r)};static#t=this.\u0275mod=a.oAB({type:r});static#i=this.\u0275inj=a.cJS({})}return r})(),M=(()=>{class r{static#e=this.\u0275fac=function(t){return new(t||r)};static#t=this.\u0275mod=a.oAB({type:r});static#i=this.\u0275inj=a.cJS({imports:[v.vT,y,v.vT,y]})}return r})()}}]);