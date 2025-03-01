"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[788],{8680:(Rt,T,r)=>{r.r(T),r.d(T,{WordSelectorModule:()=>Ft});var N=r(7222),w=r(2497),A=r(6375),G=r(4587),F=r(1016),h=r(7270),t=r(7788),E=r(5966),R=r(4589),u=r(456),B=r(9205),m=r(6610),C=r(6999),v=r(6104),z=r(6340),f=r(4549),d=r(448);const O=["nzType","avatar"],X=["*"];function P(n,s){if(1&n&&(t.j41(0,"div",1),t.nrm(1,"nz-skeleton-element",4),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Y8G("nzSize",e.avatar.size||"default")("nzShape",e.avatar.shape||"circle")}}function L(n,s){if(1&n&&t.nrm(0,"h3",5),2&n){const e=t.XpG(2);t.xc7("width",e.toCSSUnit(e.title.width))}}function j(n,s){if(1&n&&t.nrm(0,"li"),2&n){const e=s.$index,o=t.XpG(3);t.xc7("width",o.toCSSUnit(o.widthList[e]))}}function I(n,s){if(1&n&&(t.j41(0,"ul",3),t.Z7z(1,j,1,2,"li",6,t.fX1),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Dyx(e.rowsList)}}function V(n,s){if(1&n&&(t.DNE(0,P,2,2,"div",1),t.j41(1,"div",0),t.DNE(2,L,1,2,"h3",2)(3,I,3,0,"ul",3),t.k0s()),2&n){const e=t.XpG();t.vxM(e.nzAvatar?0:-1),t.R7$(2),t.vxM(e.nzTitle?2:-1),t.R7$(),t.vxM(e.nzParagraph?3:-1)}}function U(n,s){1&n&&t.SdG(0)}let H=(()=>{class n{constructor(){this.nzActive=!1,this.nzBlock=!1}static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275dir=t.FsC({type:n,selectors:[["nz-skeleton-element"]],hostAttrs:[1,"ant-skeleton","ant-skeleton-element"],hostVars:4,hostBindings:function(o,i){2&o&&t.AVh("ant-skeleton-active",i.nzActive)("ant-skeleton-block",i.nzBlock)},inputs:{nzActive:[2,"nzActive","nzActive",t.L39],nzType:"nzType",nzBlock:[2,"nzBlock","nzBlock",t.L39]},standalone:!0,features:[t.GFd]})}return n})(),W=(()=>{class n{constructor(){this.nzShape="circle",this.nzSize="default",this.styleMap={}}ngOnChanges(e){if(e.nzSize&&"number"==typeof this.nzSize){const o=`${this.nzSize}px`;this.styleMap={width:o,height:o,"line-height":o}}else this.styleMap={}}static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-skeleton-element","nzType","avatar"]],inputs:{nzShape:"nzShape",nzSize:"nzSize"},standalone:!0,features:[t.OA$,t.aNF],attrs:O,decls:1,vars:9,consts:[[1,"ant-skeleton-avatar",3,"ngStyle"]],template:function(o,i){1&o&&t.nrm(0,"span",0),2&o&&(t.AVh("ant-skeleton-avatar-square","square"===i.nzShape)("ant-skeleton-avatar-circle","circle"===i.nzShape)("ant-skeleton-avatar-lg","large"===i.nzSize)("ant-skeleton-avatar-sm","small"===i.nzSize),t.Y8G("ngStyle",i.styleMap))},dependencies:[m.B3],encapsulation:2,changeDetection:0})}return n})(),Y=(()=>{class n{constructor(e){this.cdr=e,this.nzActive=!1,this.nzLoading=!0,this.nzRound=!1,this.nzTitle=!0,this.nzAvatar=!1,this.nzParagraph=!0,this.rowsList=[],this.widthList=[]}toCSSUnit(e=""){return(0,d.j3)(e)}getTitleProps(){const e=!!this.nzAvatar,o=!!this.nzParagraph;let i="";return!e&&o?i="38%":e&&o&&(i="50%"),{width:i,...this.getProps(this.nzTitle)}}getAvatarProps(){return{shape:this.nzTitle&&!this.nzParagraph?"square":"circle",size:"large",...this.getProps(this.nzAvatar)}}getParagraphProps(){const e=!!this.nzAvatar,o=!!this.nzTitle,i={};return(!e||!o)&&(i.width="61%"),i.rows=!e&&o?3:2,{...i,...this.getProps(this.nzParagraph)}}getProps(e){return e&&"object"==typeof e?e:{}}getWidthList(){const{width:e,rows:o}=this.paragraph;let i=[];return e&&Array.isArray(e)?i=e:e&&!Array.isArray(e)&&(i=[],i[o-1]=e),i}updateProps(){this.title=this.getTitleProps(),this.avatar=this.getAvatarProps(),this.paragraph=this.getParagraphProps(),this.rowsList=[...Array(this.paragraph.rows)],this.widthList=this.getWidthList(),this.cdr.markForCheck()}ngOnInit(){this.updateProps()}ngOnChanges(e){(e.nzTitle||e.nzAvatar||e.nzParagraph)&&this.updateProps()}static#t=this.\u0275fac=function(o){return new(o||n)(t.rXU(t.gRc))};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-skeleton"]],hostAttrs:[1,"ant-skeleton"],hostVars:6,hostBindings:function(o,i){2&o&&t.AVh("ant-skeleton-with-avatar",!!i.nzAvatar)("ant-skeleton-active",i.nzActive)("ant-skeleton-round",!!i.nzRound)},inputs:{nzActive:"nzActive",nzLoading:"nzLoading",nzRound:"nzRound",nzTitle:"nzTitle",nzAvatar:"nzAvatar",nzParagraph:"nzParagraph"},exportAs:["nzSkeleton"],standalone:!0,features:[t.OA$,t.aNF],ngContentSelectors:X,decls:2,vars:1,consts:[[1,"ant-skeleton-content"],[1,"ant-skeleton-header"],[1,"ant-skeleton-title",3,"width"],[1,"ant-skeleton-paragraph"],["nzType","avatar",3,"nzSize","nzShape"],[1,"ant-skeleton-title"],[3,"width"]],template:function(o,i){1&o&&(t.NAR(),t.DNE(0,V,4,3,"div",0)(1,U,1,0)),2&o&&t.vxM(i.nzLoading?0:1)},dependencies:[H,W],encapsulation:2,changeDetection:0})}return n})(),J=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275mod=t.$C({type:n});static#n=this.\u0275inj=t.G2t({})}return n})();var g=r(3126);function Q(n,s){}function Z(n,s){if(1&n&&(t.j41(0,"div",0),t.DNE(1,Q,0,0,"ng-template",2),t.k0s()),2&n){const e=t.XpG();t.R7$(),t.Y8G("ngTemplateOutlet",e.nzAvatar)}}function K(n,s){if(1&n&&(t.qex(0),t.EFF(1),t.bVm()),2&n){const e=t.XpG(3);t.R7$(),t.JRh(e.nzTitle)}}function q(n,s){if(1&n&&(t.j41(0,"div",3),t.DNE(1,K,2,1,"ng-container",5),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Y8G("nzStringTemplateOutlet",e.nzTitle)}}function tt(n,s){if(1&n&&(t.qex(0),t.EFF(1),t.bVm()),2&n){const e=t.XpG(3);t.R7$(),t.JRh(e.nzDescription)}}function et(n,s){if(1&n&&(t.j41(0,"div",4),t.DNE(1,tt,2,1,"ng-container",5),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Y8G("nzStringTemplateOutlet",e.nzDescription)}}function nt(n,s){if(1&n&&(t.j41(0,"div",1),t.DNE(1,q,2,1,"div",3)(2,et,2,1,"div",4),t.k0s()),2&n){const e=t.XpG();t.R7$(),t.vxM(e.nzTitle?1:-1),t.R7$(),t.vxM(e.nzDescription?2:-1)}}const x=["*"];function ot(n,s){1&n&&t.SdG(0)}const it=()=>({rows:4});function st(n,s){if(1&n&&(t.qex(0),t.EFF(1),t.bVm()),2&n){const e=t.XpG(3);t.R7$(),t.JRh(e.nzTitle)}}function at(n,s){if(1&n&&(t.j41(0,"div",6),t.DNE(1,st,2,1,"ng-container",9),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Y8G("nzStringTemplateOutlet",e.nzTitle)}}function rt(n,s){if(1&n&&(t.qex(0),t.EFF(1),t.bVm()),2&n){const e=t.XpG(3);t.R7$(),t.JRh(e.nzExtra)}}function lt(n,s){if(1&n&&(t.j41(0,"div",7),t.DNE(1,rt,2,1,"ng-container",9),t.k0s()),2&n){const e=t.XpG(2);t.R7$(),t.Y8G("nzStringTemplateOutlet",e.nzExtra)}}function ct(n,s){}function dt(n,s){if(1&n&&t.DNE(0,ct,0,0,"ng-template",8),2&n){const e=t.XpG(2);t.Y8G("ngTemplateOutlet",e.listOfNzCardTabComponent.template)}}function pt(n,s){if(1&n&&(t.j41(0,"div",0)(1,"div",5),t.DNE(2,at,2,1,"div",6)(3,lt,2,1,"div",7),t.k0s(),t.DNE(4,dt,1,1,null,8),t.k0s()),2&n){const e=t.XpG();t.R7$(2),t.vxM(e.nzTitle?2:-1),t.R7$(),t.vxM(e.nzExtra?3:-1),t.R7$(),t.vxM(e.listOfNzCardTabComponent?4:-1)}}function zt(n,s){}function ht(n,s){if(1&n&&(t.j41(0,"div",1),t.DNE(1,zt,0,0,"ng-template",8),t.k0s()),2&n){const e=t.XpG();t.R7$(),t.Y8G("ngTemplateOutlet",e.nzCover)}}function ut(n,s){1&n&&t.nrm(0,"nz-skeleton",3),2&n&&t.Y8G("nzActive",!0)("nzTitle",!1)("nzParagraph",t.lJ4(3,it))}function mt(n,s){1&n&&t.SdG(0)}function ft(n,s){}function gt(n,s){if(1&n&&(t.j41(0,"li")(1,"span"),t.DNE(2,ft,0,0,"ng-template",8),t.k0s()()),2&n){const e=s.$implicit,o=t.XpG(2);t.xc7("width",100/o.nzActions.length,"%"),t.R7$(2),t.Y8G("ngTemplateOutlet",e)}}function Ct(n,s){if(1&n&&(t.j41(0,"ul",4),t.Z7z(1,gt,3,3,"li",10,t.Vm6),t.k0s()),2&n){const e=t.XpG();t.R7$(),t.Dyx(e.nzActions)}}let vt=(()=>{class n{constructor(){this.nzHoverable=!0}static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275dir=t.FsC({type:n,selectors:[["","nz-card-grid",""]],hostAttrs:[1,"ant-card-grid"],hostVars:2,hostBindings:function(o,i){2&o&&t.AVh("ant-card-hoverable",i.nzHoverable)},inputs:{nzHoverable:[2,"nzHoverable","nzHoverable",t.L39]},exportAs:["nzCardGrid"],standalone:!0,features:[t.GFd]})}return n})(),_t=(()=>{class n{constructor(){this.nzTitle=null,this.nzDescription=null,this.nzAvatar=null}static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-card-meta"]],hostAttrs:[1,"ant-card-meta"],inputs:{nzTitle:"nzTitle",nzDescription:"nzDescription",nzAvatar:"nzAvatar"},exportAs:["nzCardMeta"],standalone:!0,features:[t.aNF],decls:2,vars:2,consts:[[1,"ant-card-meta-avatar"],[1,"ant-card-meta-detail"],[3,"ngTemplateOutlet"],[1,"ant-card-meta-title"],[1,"ant-card-meta-description"],[4,"nzStringTemplateOutlet"]],template:function(o,i){1&o&&t.DNE(0,Z,2,1,"div",0)(1,nt,3,2,"div",1),2&o&&(t.vxM(i.nzAvatar?0:-1),t.R7$(),t.vxM(i.nzTitle||i.nzDescription?1:-1))},dependencies:[m.T3,C.C,C.m],encapsulation:2,changeDetection:0})}return n})(),yt=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-card-tab"]],viewQuery:function(o,i){if(1&o&&t.GBs(t.C4Q,7),2&o){let a;t.mGM(a=t.lsd())&&(i.template=a.first)}},exportAs:["nzCardTab"],standalone:!0,features:[t.aNF],ngContentSelectors:x,decls:1,vars:0,template:function(o,i){1&o&&(t.NAR(),t.DNE(0,ot,1,0,"ng-template"))},encapsulation:2,changeDetection:0})}return n})();const D="card";let M=(()=>{class n{constructor(e,o,i){this.nzConfigService=e,this.cdr=o,this.directionality=i,this._nzModuleName=D,this.nzBordered=!0,this.nzBorderless=!1,this.nzLoading=!1,this.nzHoverable=!1,this.nzBodyStyle=null,this.nzActions=[],this.nzType=null,this.nzSize="default",this.dir="ltr",this.destroy$=new v.B,this.nzConfigService.getConfigChangeEventForComponent(D).pipe((0,z.Q)(this.destroy$)).subscribe(()=>{this.cdr.markForCheck()})}ngOnInit(){this.directionality.change?.pipe((0,z.Q)(this.destroy$)).subscribe(e=>{this.dir=e,this.cdr.detectChanges()}),this.dir=this.directionality.value}ngOnDestroy(){this.destroy$.next(!0),this.destroy$.complete()}static#t=this.\u0275fac=function(o){return new(o||n)(t.rXU(f.yx),t.rXU(t.gRc),t.rXU(g.dS))};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-card"]],contentQueries:function(o,i,a){if(1&o&&(t.wni(a,yt,5),t.wni(a,vt,4)),2&o){let l;t.mGM(l=t.lsd())&&(i.listOfNzCardTabComponent=l.first),t.mGM(l=t.lsd())&&(i.listOfNzCardGridDirective=l)}},hostAttrs:[1,"ant-card"],hostVars:16,hostBindings:function(o,i){2&o&&t.AVh("ant-card-loading",i.nzLoading)("ant-card-bordered",!1===i.nzBorderless&&i.nzBordered)("ant-card-hoverable",i.nzHoverable)("ant-card-small","small"===i.nzSize)("ant-card-contain-grid",i.listOfNzCardGridDirective&&i.listOfNzCardGridDirective.length)("ant-card-type-inner","inner"===i.nzType)("ant-card-contain-tabs",!!i.listOfNzCardTabComponent)("ant-card-rtl","rtl"===i.dir)},inputs:{nzBordered:[2,"nzBordered","nzBordered",t.L39],nzBorderless:[2,"nzBorderless","nzBorderless",t.L39],nzLoading:[2,"nzLoading","nzLoading",t.L39],nzHoverable:[2,"nzHoverable","nzHoverable",t.L39],nzBodyStyle:"nzBodyStyle",nzCover:"nzCover",nzActions:"nzActions",nzType:"nzType",nzSize:"nzSize",nzTitle:"nzTitle",nzExtra:"nzExtra"},exportAs:["nzCard"],standalone:!0,features:[t.GFd,t.aNF],ngContentSelectors:x,decls:6,vars:5,consts:[[1,"ant-card-head"],[1,"ant-card-cover"],[1,"ant-card-body",3,"ngStyle"],[3,"nzActive","nzTitle","nzParagraph"],[1,"ant-card-actions"],[1,"ant-card-head-wrapper"],[1,"ant-card-head-title"],[1,"ant-card-extra"],[3,"ngTemplateOutlet"],[4,"nzStringTemplateOutlet"],[3,"width"]],template:function(o,i){1&o&&(t.NAR(),t.DNE(0,pt,5,3,"div",0)(1,ht,2,1,"div",1),t.j41(2,"div",2),t.DNE(3,ut,1,4,"nz-skeleton",3)(4,mt,1,0),t.k0s(),t.DNE(5,Ct,3,0,"ul",4)),2&o&&(t.vxM(i.nzTitle||i.nzExtra||i.listOfNzCardTabComponent?0:-1),t.R7$(),t.vxM(i.nzCover?1:-1),t.R7$(),t.Y8G("ngStyle",i.nzBodyStyle),t.R7$(),t.vxM(i.nzLoading?3:4),t.R7$(2),t.vxM(i.nzActions.length?5:-1))},dependencies:[C.C,C.m,m.T3,m.B3,J,Y],encapsulation:2,changeDetection:0})}return(0,h.Cg)([(0,f.H4)()],n.prototype,"nzBordered",void 0),(0,h.Cg)([(0,f.H4)()],n.prototype,"nzBorderless",void 0),(0,h.Cg)([(0,f.H4)()],n.prototype,"nzHoverable",void 0),(0,h.Cg)([(0,f.H4)()],n.prototype,"nzSize",void 0),n})(),St=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275mod=t.$C({type:n});static#n=this.\u0275inj=t.G2t({imports:[M,_t,g.jI]})}return n})();var kt=r(9090),_=r(9416),Tt=r(814),Nt=r(1857);let b=(()=>{class n{getGutter(){const e=[null,null],o=this.nzGutter||0;return(Array.isArray(o)?o:[o,null]).forEach((a,l)=>{"object"==typeof a&&null!==a?(e[l]=null,Object.keys(_.fe).map(p=>{const c=p;this.mediaMatcher.matchMedia(_.fe[c]).matches&&a[c]&&(e[l]=a[c])})):e[l]=Number(a)||null}),e}setGutterStyle(){const[e,o]=this.getGutter();this.actualGutter$.next([e,o]);const i=(a,l)=>{null!==l&&this.renderer.setStyle(this.elementRef.nativeElement,a,`-${l/2}px`)};i("margin-left",e),i("margin-right",e),i("margin-top",o),i("margin-bottom",o)}constructor(e,o,i,a,l,p,c){this.elementRef=e,this.renderer=o,this.mediaMatcher=i,this.ngZone=a,this.platform=l,this.breakpointService=p,this.directionality=c,this.nzAlign=null,this.nzJustify=null,this.nzGutter=null,this.actualGutter$=new kt.m(1),this.dir="ltr",this.destroy$=new v.B}ngOnInit(){this.dir=this.directionality.value,this.directionality.change?.pipe((0,z.Q)(this.destroy$)).subscribe(e=>{this.dir=e}),this.setGutterStyle()}ngOnChanges(e){e.nzGutter&&this.setGutterStyle()}ngAfterViewInit(){this.platform.isBrowser&&this.breakpointService.subscribe(_.fe).pipe((0,z.Q)(this.destroy$)).subscribe(()=>{this.setGutterStyle()})}ngOnDestroy(){this.destroy$.next(!0),this.destroy$.complete()}static#t=this.\u0275fac=function(o){return new(o||n)(t.rXU(t.aKT),t.rXU(t.sFG),t.rXU(Tt.DY),t.rXU(t.SKi),t.rXU(Nt.OD),t.rXU(_.jp),t.rXU(g.dS))};static#e=this.\u0275dir=t.FsC({type:n,selectors:[["","nz-row",""],["nz-row"],["nz-form-item"]],hostAttrs:[1,"ant-row"],hostVars:20,hostBindings:function(o,i){2&o&&t.AVh("ant-row-top","top"===i.nzAlign)("ant-row-middle","middle"===i.nzAlign)("ant-row-bottom","bottom"===i.nzAlign)("ant-row-start","start"===i.nzJustify)("ant-row-end","end"===i.nzJustify)("ant-row-center","center"===i.nzJustify)("ant-row-space-around","space-around"===i.nzJustify)("ant-row-space-between","space-between"===i.nzJustify)("ant-row-space-evenly","space-evenly"===i.nzJustify)("ant-row-rtl","rtl"===i.dir)},inputs:{nzAlign:"nzAlign",nzJustify:"nzJustify",nzGutter:"nzGutter"},exportAs:["nzRow"],standalone:!0,features:[t.OA$]})}return n})(),xt=(()=>{class n{setHostClassMap(){const e={"ant-col":!0,[`ant-col-${this.nzSpan}`]:(0,d.n9)(this.nzSpan),[`ant-col-order-${this.nzOrder}`]:(0,d.n9)(this.nzOrder),[`ant-col-offset-${this.nzOffset}`]:(0,d.n9)(this.nzOffset),[`ant-col-pull-${this.nzPull}`]:(0,d.n9)(this.nzPull),[`ant-col-push-${this.nzPush}`]:(0,d.n9)(this.nzPush),"ant-col-rtl":"rtl"===this.dir,...this.generateClass()};for(const o in this.classMap)this.classMap.hasOwnProperty(o)&&this.renderer.removeClass(this.elementRef.nativeElement,o);this.classMap={...e};for(const o in this.classMap)this.classMap.hasOwnProperty(o)&&this.classMap[o]&&this.renderer.addClass(this.elementRef.nativeElement,o)}setHostFlexStyle(){this.hostFlexStyle=this.parseFlex(this.nzFlex)}parseFlex(e){return"number"==typeof e?`${e} ${e} auto`:"string"==typeof e&&/^\d+(\.\d+)?(px|em|rem|%)$/.test(e)?`0 0 ${e}`:e}generateClass(){const o={};return["nzXs","nzSm","nzMd","nzLg","nzXl","nzXXl"].forEach(i=>{const a=i.replace("nz","").toLowerCase();if((0,d.n9)(this[i]))if("number"==typeof this[i]||"string"==typeof this[i])o[`ant-col-${a}-${this[i]}`]=!0;else{const l=this[i];["span","pull","push","offset","order"].forEach(c=>{o[`ant-col-${a}${"span"===c?"-":`-${c}-`}${l[c]}`]=l&&(0,d.n9)(l[c])})}}),o}constructor(e,o,i){this.elementRef=e,this.renderer=o,this.directionality=i,this.classMap={},this.destroy$=new v.B,this.hostFlexStyle=null,this.dir="ltr",this.nzFlex=null,this.nzSpan=null,this.nzOrder=null,this.nzOffset=null,this.nzPush=null,this.nzPull=null,this.nzXs=null,this.nzSm=null,this.nzMd=null,this.nzLg=null,this.nzXl=null,this.nzXXl=null,this.nzRowDirective=(0,t.WQX)(b,{host:!0,optional:!0})}ngOnInit(){this.dir=this.directionality.value,this.directionality.change?.pipe((0,z.Q)(this.destroy$)).subscribe(e=>{this.dir=e,this.setHostClassMap()}),this.setHostClassMap(),this.setHostFlexStyle()}ngOnChanges(e){this.setHostClassMap();const{nzFlex:o}=e;o&&this.setHostFlexStyle()}ngAfterViewInit(){this.nzRowDirective&&this.nzRowDirective.actualGutter$.pipe((0,z.Q)(this.destroy$)).subscribe(([e,o])=>{const i=(a,l)=>{null!==l&&this.renderer.setStyle(this.elementRef.nativeElement,a,l/2+"px")};i("padding-left",e),i("padding-right",e),i("padding-top",o),i("padding-bottom",o)})}ngOnDestroy(){this.destroy$.next(!0),this.destroy$.complete()}static#t=this.\u0275fac=function(o){return new(o||n)(t.rXU(t.aKT),t.rXU(t.sFG),t.rXU(g.dS))};static#e=this.\u0275dir=t.FsC({type:n,selectors:[["","nz-col",""],["nz-col"],["nz-form-control"],["nz-form-label"]],hostVars:2,hostBindings:function(o,i){2&o&&t.xc7("flex",i.hostFlexStyle)},inputs:{nzFlex:"nzFlex",nzSpan:"nzSpan",nzOrder:"nzOrder",nzOffset:"nzOffset",nzPush:"nzPush",nzPull:"nzPull",nzXs:"nzXs",nzSm:"nzSm",nzMd:"nzMd",nzLg:"nzLg",nzXl:"nzXl",nzXXl:"nzXXl"},exportAs:["nzCol"],standalone:!0,features:[t.OA$]})}return n})(),Dt=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275mod=t.$C({type:n});static#n=this.\u0275inj=t.G2t({})}return n})();function Mt(n,s){if(1&n){const e=t.RV6();t.j41(0,"div",7),t.bIt("click",function(){const i=t.eBV(e).$implicit,a=t.XpG();return t.Njj(a.removeWord(i))}),t.EFF(1),t.k0s()}if(2&n){const e=s.$implicit;t.R7$(),t.SpI(" ",e," ")}}function bt(n,s){if(1&n){const e=t.RV6();t.j41(0,"div",7),t.bIt("click",function(){const i=t.eBV(e).$implicit,a=t.XpG();return t.Njj(a.addWord(i))}),t.EFF(1),t.k0s()}if(2&n){const e=s.$implicit;t.R7$(),t.SpI(" ",e," ")}}let S=class k{constructor(s){this.injector=s}ngOnInit(){this.shuffleArray(),this.state.isFilled=!1}drop(s){(s.previousContainer!==s.container||s.previousIndex!==s.currentIndex)&&(this.state.isFilled=!0),s.previousContainer===s.container?(0,u.HD)(s.container.data,s.previousIndex,s.currentIndex):(0,u.eg)(s.previousContainer.data,s.container.data,s.previousIndex,s.currentIndex)}suppremerUneLettre(s,e){const o=s.indexOf(e);o>-1&&s.splice(o,1)}addWord(s){this.state.selectedWords.push(s),this.suppremerUneLettre(this.state.words,s)}removeWord(s){this.state.words.push(s),this.suppremerUneLettre(this.state.selectedWords,s)}shuffleArray(){for(let s=this.state.words.length-1;s>0;s--){const e=Math.floor(Math.random()*(s+1));[this.state.words[s],this.state.words[e]]=[this.state.words[e],this.state.words[s]]}}static#t=this.\u0275fac=function(e){return new(e||k)(t.rXU(t.zZn))};static#e=this.\u0275cmp=t.VBU({type:k,selectors:[["wc-word-selector"]],inputs:{state:"state"},decls:13,vars:10,consts:[["cdkDropListGroup","",2,"width","100%",3,"nzBordered"],["nz-row","","nzJustify","center"],["nz-col","",3,"nzSpan","nzXs","nzSm"],["cdkDropList","","cdkDropListOrientation","mixed",1,"example-list",3,"cdkDropListDropped","cdkDropListData"],["cdkDrag","",1,"example-box"],[2,"height","20px"],[3,"stateChange","state"],["cdkDrag","",1,"example-box",3,"click"]],template:function(e,o){1&e&&(t.j41(0,"nz-card",0)(1,"div",1)(2,"div",2)(3,"div",3),t.bIt("cdkDropListDropped",function(a){return o.drop(a)}),t.Z7z(4,Mt,2,1,"div",4,t.fX1),t.k0s()()(),t.nrm(6,"div",5),t.j41(7,"div",1)(8,"div",2)(9,"div",3),t.bIt("cdkDropListDropped",function(a){return o.drop(a)}),t.Z7z(10,bt,2,1,"div",4,t.fX1),t.k0s()()()(),t.j41(12,"wc-base",6),t.mxI("stateChange",function(a){return t.DH7(o.state,a)||(o.state=a),a}),t.k0s()),2&e&&(t.Y8G("nzBordered",!0),t.R7$(2),t.Y8G("nzSpan",24)("nzXs",24)("nzSm",12),t.R7$(),t.Y8G("cdkDropListData",o.state.selectedWords),t.R7$(),t.Dyx(o.state.selectedWords),t.R7$(4),t.Y8G("nzSpan",24)("nzXs",24)("nzSm",12),t.R7$(),t.Y8G("cdkDropListData",o.state.words),t.R7$(),t.Dyx(o.state.words),t.R7$(2),t.R50("state",o.state))},dependencies:[B.$,u.O7,u.RK,u.T1,M,xt,b],styles:[".example-list[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:8px;padding:10px;border:2px solid #ccc;border-radius:8px;min-height:60px;overflow:hidden;justify-content:center}.example-box[_ngcontent-%COMP%]{padding:5px 10px;border:solid 1px #ccc;border-radius:4px;color:#000000de;display:inline-block;box-sizing:border-box;cursor:move;background:#fff;text-align:center;font-size:14px;min-width:70px}.cdk-drag-preview[_ngcontent-%COMP%]{box-sizing:border-box;border-radius:4px;box-shadow:0 5px 5px -3px #0003,0 8px 10px 1px #00000024,0 3px 14px 2px #0000001f}.cdk-drag-placeholder[_ngcontent-%COMP%]{opacity:0}.cdk-drag-animating[_ngcontent-%COMP%]{transition:transform .25s cubic-bezier(0,0,.2,1)}.example-list.cdk-drop-list-dragging[_ngcontent-%COMP%]   .example-box[_ngcontent-%COMP%]:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}"],changeDetection:0})};S=(0,h.Cg)([(0,E.Er)(R.C),(0,h.Sn)("design:paramtypes",[t.zZn])],S);var y=r(1837),$=r(9632);const $t=["*"];function wt(n,s){if(1&n){const e=t.RV6();t.j41(0,"span",1),t.bIt("click",function(i){t.eBV(e);const a=t.XpG();return t.Njj(a.closeTag(i))}),t.k0s()}}let At=(()=>{class n{constructor(e,o,i,a){this.cdr=e,this.renderer=o,this.elementRef=i,this.directionality=a,this.isPresetColor=!1,this.nzMode="default",this.nzChecked=!1,this.nzBordered=!0,this.nzOnClose=new t.bkB,this.nzCheckedChange=new t.bkB,this.dir="ltr",this.destroy$=new v.B}updateCheckedStatus(){"checkable"===this.nzMode&&(this.nzChecked=!this.nzChecked,this.nzCheckedChange.emit(this.nzChecked))}closeTag(e){this.nzOnClose.emit(e),e.defaultPrevented||this.renderer.removeChild(this.renderer.parentNode(this.elementRef.nativeElement),this.elementRef.nativeElement)}clearPresetColor(){const e=this.elementRef.nativeElement,o=new RegExp(`(ant-tag-(?:${[...y.un,...y.PA].join("|")}))`,"g"),i=e.classList.toString(),a=[];let l=o.exec(i);for(;null!==l;)a.push(l[1]),l=o.exec(i);e.classList.remove(...a)}setPresetColor(){const e=this.elementRef.nativeElement;this.clearPresetColor(),this.isPresetColor=!!this.nzColor&&((0,y.nP)(this.nzColor)||(0,y.uP)(this.nzColor)),this.isPresetColor&&e.classList.add(`ant-tag-${this.nzColor}`)}ngOnInit(){this.directionality.change?.pipe((0,z.Q)(this.destroy$)).subscribe(e=>{this.dir=e,this.cdr.detectChanges()}),this.dir=this.directionality.value}ngOnChanges(e){const{nzColor:o}=e;o&&this.setPresetColor()}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static#t=this.\u0275fac=function(o){return new(o||n)(t.rXU(t.gRc),t.rXU(t.sFG),t.rXU(t.aKT),t.rXU(g.dS))};static#e=this.\u0275cmp=t.VBU({type:n,selectors:[["nz-tag"]],hostAttrs:[1,"ant-tag"],hostVars:12,hostBindings:function(o,i){1&o&&t.bIt("click",function(){return i.updateCheckedStatus()}),2&o&&(t.xc7("background-color",i.isPresetColor?"":i.nzColor),t.AVh("ant-tag-has-color",i.nzColor&&!i.isPresetColor)("ant-tag-checkable","checkable"===i.nzMode)("ant-tag-checkable-checked",i.nzChecked)("ant-tag-rtl","rtl"===i.dir)("ant-tag-borderless",!i.nzBordered))},inputs:{nzMode:"nzMode",nzColor:"nzColor",nzChecked:[2,"nzChecked","nzChecked",t.L39],nzBordered:[2,"nzBordered","nzBordered",t.L39]},outputs:{nzOnClose:"nzOnClose",nzCheckedChange:"nzCheckedChange"},exportAs:["nzTag"],standalone:!0,features:[t.GFd,t.OA$,t.aNF],ngContentSelectors:$t,decls:2,vars:1,consts:[["nz-icon","","nzType","close","tabindex","-1",1,"ant-tag-close-icon"],["nz-icon","","nzType","close","tabindex","-1",1,"ant-tag-close-icon",3,"click"]],template:function(o,i){1&o&&(t.NAR(),t.SdG(0),t.DNE(1,wt,1,0,"span",0)),2&o&&(t.R7$(),t.vxM("closeable"===i.nzMode?1:-1))},dependencies:[$.Y3,$.Dn],encapsulation:2,changeDetection:0})}return n})(),Gt=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275mod=t.$C({type:n});static#n=this.\u0275inj=t.G2t({imports:[At]})}return n})(),Ft=(()=>{class n{constructor(){this.component=S}static#t=this.\u0275fac=function(o){return new(o||n)};static#e=this.\u0275mod=t.$C({type:n});static#n=this.\u0275inj=t.G2t({imports:[F.W,N.YN,N.X1,G.fS,A.RG,w.jL,u.ad,m.MD,St,m.MD,Gt,Dt]})}return n})()}}]);