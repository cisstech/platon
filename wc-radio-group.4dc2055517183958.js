"use strict";(self.webpackChunkhome=self.webpackChunkhome||[]).push([[849],{6269:(O,k,d)=>{d.r(k),d.d(k,{RadioGroupModule:()=>j});var n=d(7222),y=d(423),p=d(2067),e=d(7788),h=d(8278),c=d(6610);const I=["input"],R=["formField"],g=["*"];let E=0;class m{constructor(b,t){this.source=b,this.value=t}}const o={provide:n.kq,useExisting:(0,e.Rfq)(()=>C),multi:!0},r=new e.nKC("MatRadioGroup"),u=new e.nKC("mat-radio-default-options",{providedIn:"root",factory:function v(){return{color:"accent",disabledInteractive:!1}}});let C=(()=>{class s{get name(){return this._name}set name(t){this._name=t,this._updateRadioButtonNames()}get labelPosition(){return this._labelPosition}set labelPosition(t){this._labelPosition="before"===t?"before":"after",this._markRadiosForCheck()}get value(){return this._value}set value(t){this._value!==t&&(this._value=t,this._updateSelectedRadioFromValue(),this._checkSelectedRadioButton())}_checkSelectedRadioButton(){this._selected&&!this._selected.checked&&(this._selected.checked=!0)}get selected(){return this._selected}set selected(t){this._selected=t,this.value=t?t.value:null,this._checkSelectedRadioButton()}get disabled(){return this._disabled}set disabled(t){this._disabled=t,this._markRadiosForCheck()}get required(){return this._required}set required(t){this._required=t,this._markRadiosForCheck()}get disabledInteractive(){return this._disabledInteractive}set disabledInteractive(t){this._disabledInteractive=t,this._markRadiosForCheck()}constructor(t){this._changeDetector=t,this._value=null,this._name="mat-radio-group-"+E++,this._selected=null,this._isInitialized=!1,this._labelPosition="after",this._disabled=!1,this._required=!1,this._controlValueAccessorChangeFn=()=>{},this.onTouched=()=>{},this.change=new e.bkB,this._disabledInteractive=!1}ngAfterContentInit(){this._isInitialized=!0,this._buttonChanges=this._radios.changes.subscribe(()=>{this.selected&&!this._radios.find(t=>t===this.selected)&&(this._selected=null)})}ngOnDestroy(){this._buttonChanges?.unsubscribe()}_touch(){this.onTouched&&this.onTouched()}_updateRadioButtonNames(){this._radios&&this._radios.forEach(t=>{t.name=this.name,t._markForCheck()})}_updateSelectedRadioFromValue(){this._radios&&(null===this._selected||this._selected.value!==this._value)&&(this._selected=null,this._radios.forEach(i=>{i.checked=this.value===i.value,i.checked&&(this._selected=i)}))}_emitChangeEvent(){this._isInitialized&&this.change.emit(new m(this._selected,this._value))}_markRadiosForCheck(){this._radios&&this._radios.forEach(t=>t._markForCheck())}writeValue(t){this.value=t,this._changeDetector.markForCheck()}registerOnChange(t){this._controlValueAccessorChangeFn=t}registerOnTouched(t){this.onTouched=t}setDisabledState(t){this.disabled=t,this._changeDetector.markForCheck()}static#e=this.\u0275fac=function(i){return new(i||s)(e.rXU(e.gRc))};static#t=this.\u0275dir=e.FsC({type:s,selectors:[["mat-radio-group"]],contentQueries:function(i,a,l){if(1&i&&e.wni(l,M,5),2&i){let f;e.mGM(f=e.lsd())&&(a._radios=f)}},hostAttrs:["role","radiogroup",1,"mat-mdc-radio-group"],inputs:{color:"color",name:"name",labelPosition:"labelPosition",value:"value",selected:"selected",disabled:[2,"disabled","disabled",e.L39],required:[2,"required","required",e.L39],disabledInteractive:[2,"disabledInteractive","disabledInteractive",e.L39]},outputs:{change:"change"},exportAs:["matRadioGroup"],standalone:!0,features:[e.Jv_([o,{provide:r,useExisting:s}]),e.GFd]})}return s})(),M=(()=>{class s{get checked(){return this._checked}set checked(t){this._checked!==t&&(this._checked=t,t&&this.radioGroup&&this.radioGroup.value!==this.value?this.radioGroup.selected=this:!t&&this.radioGroup&&this.radioGroup.value===this.value&&(this.radioGroup.selected=null),t&&this._radioDispatcher.notify(this.id,this.name),this._changeDetector.markForCheck())}get value(){return this._value}set value(t){this._value!==t&&(this._value=t,null!==this.radioGroup&&(this.checked||(this.checked=this.radioGroup.value===t),this.checked&&(this.radioGroup.selected=this)))}get labelPosition(){return this._labelPosition||this.radioGroup&&this.radioGroup.labelPosition||"after"}set labelPosition(t){this._labelPosition=t}get disabled(){return this._disabled||null!==this.radioGroup&&this.radioGroup.disabled}set disabled(t){this._setDisabled(t)}get required(){return this._required||this.radioGroup&&this.radioGroup.required}set required(t){this._required=t}get color(){return this._color||this.radioGroup&&this.radioGroup.color||this._defaultOptions&&this._defaultOptions.color||"accent"}set color(t){this._color=t}get disabledInteractive(){return this._disabledInteractive||null!==this.radioGroup&&this.radioGroup.disabledInteractive}set disabledInteractive(t){this._disabledInteractive=t}get inputId(){return`${this.id||this._uniqueId}-input`}constructor(t,i,a,l,f,D,w,z){this._elementRef=i,this._changeDetector=a,this._focusMonitor=l,this._radioDispatcher=f,this._defaultOptions=w,this._ngZone=(0,e.WQX)(e.SKi),this._uniqueId="mat-radio-"+ ++E,this.id=this._uniqueId,this.disableRipple=!1,this.tabIndex=0,this.change=new e.bkB,this._checked=!1,this._value=null,this._removeUniqueSelectionListener=()=>{},this._injector=(0,e.WQX)(e.zZn),this._onInputClick=$=>{this.disabled&&this.disabledInteractive&&$.preventDefault()},this.radioGroup=t,this._noopAnimations="NoopAnimations"===D,this._disabledInteractive=w?.disabledInteractive??!1,z&&(this.tabIndex=(0,e.Udg)(z,0))}focus(t,i){i?this._focusMonitor.focusVia(this._inputElement,i,t):this._inputElement.nativeElement.focus(t)}_markForCheck(){this._changeDetector.markForCheck()}ngOnInit(){this.radioGroup&&(this.checked=this.radioGroup.value===this._value,this.checked&&(this.radioGroup.selected=this),this.name=this.radioGroup.name),this._removeUniqueSelectionListener=this._radioDispatcher.listen((t,i)=>{t!==this.id&&i===this.name&&(this.checked=!1)})}ngDoCheck(){this._updateTabIndex()}ngAfterViewInit(){this._updateTabIndex(),this._focusMonitor.monitor(this._elementRef,!0).subscribe(t=>{!t&&this.radioGroup&&this.radioGroup._touch()}),this._ngZone.runOutsideAngular(()=>{this._inputElement.nativeElement.addEventListener("click",this._onInputClick)})}ngOnDestroy(){this._inputElement?.nativeElement.removeEventListener("click",this._onInputClick),this._focusMonitor.stopMonitoring(this._elementRef),this._removeUniqueSelectionListener()}_emitChangeEvent(){this.change.emit(new m(this,this._value))}_isRippleDisabled(){return this.disableRipple||this.disabled}_onInputInteraction(t){if(t.stopPropagation(),!this.checked&&!this.disabled){const i=this.radioGroup&&this.value!==this.radioGroup.value;this.checked=!0,this._emitChangeEvent(),this.radioGroup&&(this.radioGroup._controlValueAccessorChangeFn(this.value),i&&this.radioGroup._emitChangeEvent())}}_onTouchTargetClick(t){this._onInputInteraction(t),(!this.disabled||this.disabledInteractive)&&this._inputElement?.nativeElement.focus()}_setDisabled(t){this._disabled!==t&&(this._disabled=t,this._changeDetector.markForCheck())}_updateTabIndex(){const t=this.radioGroup;let i;if(i=t&&t.selected&&!this.disabled?t.selected===this?this.tabIndex:-1:this.tabIndex,i!==this._previousTabIndex){const a=this._inputElement?.nativeElement;a&&(a.setAttribute("tabindex",i+""),this._previousTabIndex=i,(0,e.mal)(()=>{queueMicrotask(()=>{t&&t.selected&&t.selected!==this&&document.activeElement===a&&(t.selected?._inputElement.nativeElement.focus(),document.activeElement===a&&this._inputElement.nativeElement.blur())})},{injector:this._injector}))}}static#e=this.\u0275fac=function(i){return new(i||s)(e.rXU(r,8),e.rXU(e.aKT),e.rXU(e.gRc),e.rXU(y.FN),e.rXU(p.zP),e.rXU(e.bc$,8),e.rXU(u,8),e.kS0("tabindex"))};static#t=this.\u0275cmp=e.VBU({type:s,selectors:[["mat-radio-button"]],viewQuery:function(i,a){if(1&i&&(e.GBs(I,5),e.GBs(R,7,e.aKT)),2&i){let l;e.mGM(l=e.lsd())&&(a._inputElement=l.first),e.mGM(l=e.lsd())&&(a._rippleTrigger=l.first)}},hostAttrs:[1,"mat-mdc-radio-button"],hostVars:19,hostBindings:function(i,a){1&i&&e.bIt("focus",function(){return a._inputElement.nativeElement.focus()}),2&i&&(e.BMQ("id",a.id)("tabindex",null)("aria-label",null)("aria-labelledby",null)("aria-describedby",null),e.AVh("mat-primary","primary"===a.color)("mat-accent","accent"===a.color)("mat-warn","warn"===a.color)("mat-mdc-radio-checked",a.checked)("mat-mdc-radio-disabled",a.disabled)("mat-mdc-radio-disabled-interactive",a.disabledInteractive)("_mat-animation-noopable",a._noopAnimations))},inputs:{id:"id",name:"name",ariaLabel:[0,"aria-label","ariaLabel"],ariaLabelledby:[0,"aria-labelledby","ariaLabelledby"],ariaDescribedby:[0,"aria-describedby","ariaDescribedby"],disableRipple:[2,"disableRipple","disableRipple",e.L39],tabIndex:[2,"tabIndex","tabIndex",t=>null==t?0:(0,e.Udg)(t)],checked:[2,"checked","checked",e.L39],value:"value",labelPosition:"labelPosition",disabled:[2,"disabled","disabled",e.L39],required:[2,"required","required",e.L39],color:"color",disabledInteractive:[2,"disabledInteractive","disabledInteractive",e.L39]},outputs:{change:"change"},exportAs:["matRadioButton"],standalone:!0,features:[e.GFd,e.aNF],ngContentSelectors:g,decls:13,vars:17,consts:[["formField",""],["input",""],["mat-internal-form-field","",3,"labelPosition"],[1,"mdc-radio"],[1,"mat-mdc-radio-touch-target",3,"click"],["type","radio",1,"mdc-radio__native-control",3,"change","id","checked","disabled","required"],[1,"mdc-radio__background"],[1,"mdc-radio__outer-circle"],[1,"mdc-radio__inner-circle"],["mat-ripple","",1,"mat-radio-ripple","mat-mdc-focus-indicator",3,"matRippleTrigger","matRippleDisabled","matRippleCentered"],[1,"mat-ripple-element","mat-radio-persistent-ripple"],[1,"mdc-label",3,"for"]],template:function(i,a){if(1&i){const l=e.RV6();e.NAR(),e.j41(0,"div",2,0)(2,"div",3)(3,"div",4),e.bIt("click",function(D){return e.eBV(l),e.Njj(a._onTouchTargetClick(D))}),e.k0s(),e.j41(4,"input",5,1),e.bIt("change",function(D){return e.eBV(l),e.Njj(a._onInputInteraction(D))}),e.k0s(),e.j41(6,"div",6),e.nrm(7,"div",7)(8,"div",8),e.k0s(),e.j41(9,"div",9),e.nrm(10,"div",10),e.k0s()(),e.j41(11,"label",11),e.SdG(12),e.k0s()()}2&i&&(e.Y8G("labelPosition",a.labelPosition),e.R7$(2),e.AVh("mdc-radio--disabled",a.disabled),e.R7$(2),e.Y8G("id",a.inputId)("checked",a.checked)("disabled",a.disabled&&!a.disabledInteractive)("required",a.required),e.BMQ("name",a.name)("value",a.value)("aria-label",a.ariaLabel)("aria-labelledby",a.ariaLabelledby)("aria-describedby",a.ariaDescribedby)("aria-disabled",a.disabled&&a.disabledInteractive?"true":null),e.R7$(5),e.Y8G("matRippleTrigger",a._rippleTrigger.nativeElement)("matRippleDisabled",a._isRippleDisabled())("matRippleCentered",!0),e.R7$(2),e.Y8G("for",a.inputId))},dependencies:[h.r6,h.tO],styles:['.mat-mdc-radio-button{-webkit-tap-highlight-color:rgba(0,0,0,0)}.mat-mdc-radio-button .mdc-radio{display:inline-block;position:relative;flex:0 0 auto;box-sizing:content-box;width:20px;height:20px;cursor:pointer;will-change:opacity,transform,border-color,color;padding:calc((var(--mdc-radio-state-layer-size) - 20px)/2)}.mat-mdc-radio-button .mdc-radio:hover .mdc-radio__native-control:not([disabled]):not(:focus)~.mdc-radio__background::before{opacity:.04;transform:scale(1)}.mat-mdc-radio-button .mdc-radio:hover .mdc-radio__native-control:not([disabled])~.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unselected-hover-icon-color, var(--mat-app-on-surface))}.mat-mdc-radio-button .mdc-radio:hover .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button .mdc-radio:hover .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__inner-circle{border-color:var(--mdc-radio-selected-hover-icon-color, var(--mat-app-primary))}.mat-mdc-radio-button .mdc-radio:active .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unselected-pressed-icon-color, var(--mat-app-on-surface))}.mat-mdc-radio-button .mdc-radio:active .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button .mdc-radio:active .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__inner-circle{border-color:var(--mdc-radio-selected-pressed-icon-color, var(--mat-app-primary))}.mat-mdc-radio-button .mdc-radio__background{display:inline-block;position:relative;box-sizing:border-box;width:20px;height:20px}.mat-mdc-radio-button .mdc-radio__background::before{position:absolute;transform:scale(0, 0);border-radius:50%;opacity:0;pointer-events:none;content:"";transition:opacity 90ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms cubic-bezier(0.4, 0, 0.6, 1);width:var(--mdc-radio-state-layer-size);height:var(--mdc-radio-state-layer-size);top:calc(-1*(var(--mdc-radio-state-layer-size) - 20px)/2);left:calc(-1*(var(--mdc-radio-state-layer-size) - 20px)/2)}.mat-mdc-radio-button .mdc-radio__outer-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;border-width:2px;border-style:solid;border-radius:50%;transition:border-color 90ms cubic-bezier(0.4, 0, 0.6, 1)}.mat-mdc-radio-button .mdc-radio__inner-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;transform:scale(0, 0);border-width:10px;border-style:solid;border-radius:50%;transition:transform 90ms cubic-bezier(0.4, 0, 0.6, 1),border-color 90ms cubic-bezier(0.4, 0, 0.6, 1)}.mat-mdc-radio-button .mdc-radio__native-control{position:absolute;margin:0;padding:0;opacity:0;top:0;right:0;left:0;cursor:inherit;z-index:1;width:var(--mdc-radio-state-layer-size);height:var(--mdc-radio-state-layer-size)}.mat-mdc-radio-button .mdc-radio__native-control:checked+.mdc-radio__background,.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background{transition:opacity 90ms cubic-bezier(0, 0, 0.2, 1),transform 90ms cubic-bezier(0, 0, 0.2, 1)}.mat-mdc-radio-button .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__outer-circle{transition:border-color 90ms cubic-bezier(0, 0, 0.2, 1)}.mat-mdc-radio-button .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{transition:transform 90ms cubic-bezier(0, 0, 0.2, 1),border-color 90ms cubic-bezier(0, 0, 0.2, 1)}.mat-mdc-radio-button .mdc-radio__native-control:focus+.mdc-radio__background::before{transform:scale(1);opacity:.12;transition:opacity 90ms cubic-bezier(0, 0, 0.2, 1),transform 90ms cubic-bezier(0, 0, 0.2, 1)}.mat-mdc-radio-button .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-unselected-icon-color, var(--mat-app-on-surface));opacity:var(--mdc-radio-disabled-unselected-icon-opacity)}.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background{cursor:default}.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-selected-icon-color, var(--mat-app-on-surface));opacity:var(--mdc-radio-disabled-selected-icon-opacity)}.mat-mdc-radio-button .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unselected-icon-color, var(--mat-app-on-surface-variant))}.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__inner-circle{border-color:var(--mdc-radio-selected-icon-color, var(--mat-app-primary))}.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button .mdc-radio__native-control:enabled:focus:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-selected-focus-icon-color, var(--mat-app-primary))}.mat-mdc-radio-button .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle{transform:scale(0.5);transition:transform 90ms cubic-bezier(0, 0, 0.2, 1),border-color 90ms cubic-bezier(0, 0, 0.2, 1)}.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled{pointer-events:auto}.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-unselected-icon-color, var(--mat-app-on-surface));opacity:var(--mdc-radio-disabled-unselected-icon-opacity)}.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled:hover .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control:checked:focus+.mdc-radio__background .mdc-radio__outer-circle,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__native-control+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-selected-icon-color, var(--mat-app-on-surface));opacity:var(--mdc-radio-disabled-selected-icon-opacity)}.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__background::before,.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__outer-circle,.mat-mdc-radio-button._mat-animation-noopable .mdc-radio__inner-circle{transition:none !important}.mat-mdc-radio-button .mdc-radio__background::before{background-color:var(--mat-radio-ripple-color, var(--mat-app-on-surface))}.mat-mdc-radio-button.mat-mdc-radio-checked .mat-ripple-element,.mat-mdc-radio-button.mat-mdc-radio-checked .mdc-radio__background::before{background-color:var(--mat-radio-checked-ripple-color, var(--mat-app-primary))}.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mat-ripple-element,.mat-mdc-radio-button.mat-mdc-radio-disabled-interactive .mdc-radio--disabled .mdc-radio__background::before{background-color:var(--mat-radio-ripple-color, var(--mat-app-on-surface))}.mat-mdc-radio-button .mat-internal-form-field{color:var(--mat-radio-label-text-color, var(--mat-app-on-surface));font-family:var(--mat-radio-label-text-font, var(--mat-app-body-medium-font));line-height:var(--mat-radio-label-text-line-height, var(--mat-app-body-medium-line-height));font-size:var(--mat-radio-label-text-size, var(--mat-app-body-medium-size));letter-spacing:var(--mat-radio-label-text-tracking, var(--mat-app-body-medium-tracking));font-weight:var(--mat-radio-label-text-weight, var(--mat-app-body-medium-weight))}.mat-mdc-radio-button .mdc-radio--disabled+label{color:var(--mat-radio-disabled-label-color)}.mat-mdc-radio-button .mat-radio-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none;border-radius:50%}.mat-mdc-radio-button .mat-radio-ripple .mat-ripple-element{opacity:.14}.mat-mdc-radio-button .mat-radio-ripple::before{border-radius:50%}.mat-mdc-radio-button .mdc-radio .mdc-radio__native-control:focus:enabled:not(:checked)~.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unselected-focus-icon-color, black)}.mat-mdc-radio-button.cdk-focused .mat-mdc-focus-indicator::before{content:""}.mat-mdc-radio-disabled{cursor:default;pointer-events:none}.mat-mdc-radio-disabled.mat-mdc-radio-disabled-interactive{pointer-events:auto}.mat-mdc-radio-touch-target{position:absolute;top:50%;left:50%;height:48px;width:48px;transform:translate(-50%, -50%);display:var(--mat-radio-touch-target-display)}[dir=rtl] .mat-mdc-radio-touch-target{left:auto;right:50%;transform:translate(50%, -50%)}'],encapsulation:2,changeDetection:0})}return s})(),T=(()=>{class s{static#e=this.\u0275fac=function(i){return new(i||s)};static#t=this.\u0275mod=e.$C({type:s});static#i=this.\u0275inj=e.G2t({imports:[h.yE,c.MD,h.pZ,M,h.yE]})}return s})();var G=d(2427),_=d(1016),P=d(7270),F=d(5966),S=d(6359),V=d(6517),x=d(9205),U=d(821);function L(s,b){if(1&s){const t=e.RV6();e.qex(0),e.j41(1,"div",3),e.nI1(2,"css"),e.nI1(3,"css"),e.bIt("click",function(a){const l=e.eBV(t).$implicit,f=e.XpG();return f.state.selection=l.content,a.stopPropagation(),e.Njj(f.autoValidate())}),e.j41(4,"mat-radio-button",4),e.nrm(5,"nge-markdown",5),e.k0s()(),e.bVm()}if(2&s){const t=b.$implicit,i=e.XpG();e.R7$(),e.AVh("selected",i.state.selection===t.content),e.Y8G("ngClass",e.i5U(2,7,t.css,"class"))("ngStyle",e.i5U(3,10,t.css,"style")),e.R7$(3),e.Y8G("name",t.content)("value",t.content),e.R7$(),e.Y8G("data",t.content)}}let A=class B{constructor(b){this.injector=b,this.stateChange=new e.bkB,this.webComponentService=b.get(S.h)}onChangeState(){Array.isArray(this.state.items)||(this.state.items=[]),this.state.items.forEach((b,t)=>{"string"==typeof b&&(this.state.items[t]={content:b})})}trackBy(b,t){return t.content||b}autoValidate(){this.state.autoValidation&&this.state.selection&&this.webComponentService.submit(this)}static#e=this.\u0275fac=function(t){return new(t||B)(e.rXU(e.zZn))};static#t=this.\u0275cmp=e.VBU({type:B,selectors:[["wc-radio-group"]],inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:3,vars:9,consts:[[3,"ngModelChange","disabled","ngModel"],[4,"ngFor","ngForOf","ngForTrackBy"],[3,"stateChange","state"],[1,"radio-item",3,"click","ngClass","ngStyle"],["color","primary",3,"name","value"],[3,"data"]],template:function(t,i){1&t&&(e.j41(0,"mat-radio-group",0),e.mxI("ngModelChange",function(l){return e.DH7(i.state.selection,l)||(i.state.selection=l),l}),e.DNE(1,L,6,13,"ng-container",1),e.k0s(),e.j41(2,"wc-base",2),e.mxI("stateChange",function(l){return e.DH7(i.state,l)||(i.state=l),l}),e.k0s()),2&t&&(e.AVh("disabled",i.state.disabled)("horizontal",i.state.horizontal),e.Y8G("disabled",i.state.disabled),e.R50("ngModel",i.state.selection),e.R7$(),e.Y8G("ngForOf",i.state.items)("ngForTrackBy",i.trackBy),e.R7$(),e.R50("state",i.state))},dependencies:[c.YU,c.Sq,c.B3,x.$,G.NgeMarkdownComponent,n.BC,n.vS,C,M,U.S],styles:["[_nghost-%COMP%]{display:block}mat-radio-group[_ngcontent-%COMP%]{display:flex;flex-direction:column}mat-radio-group.disabled[_ngcontent-%COMP%]{pointer-events:none}mat-radio-group.horizontal[_ngcontent-%COMP%]{flex-direction:row}mat-radio-group.horizontal[_ngcontent-%COMP%]   .radio-item[_ngcontent-%COMP%]{margin-right:12px;margin-bottom:0}.radio-item[_ngcontent-%COMP%]{cursor:pointer;transition:all .25s ease-in-out;border-radius:7px;border:2px solid #f4f4f4;margin-bottom:12px;padding:12px;transition:border .25s ease-in-out;position:relative}.radio-item[_ngcontent-%COMP%]:hover, .radio-item.selected[_ngcontent-%COMP%]{border:2px solid var(--brand-color-primary)}"],changeDetection:0})};A=(0,P.Cg)([(0,F.Er)(V.H),(0,P.Sn)("design:paramtypes",[e.zZn])],A);let j=(()=>{class s{constructor(){this.component=A}static#e=this.\u0275fac=function(i){return new(i||s)};static#t=this.\u0275mod=e.$C({type:s});static#i=this.\u0275inj=e.G2t({imports:[_.W,U.a,G.NgeMarkdownModule,n.YN,T]})}return s})()},9205:(O,k,d)=>{d.d(k,{$:()=>R});var n=d(7788),y=d(6359),p=d(5293),e=d(6610),h=d(2919);const c=["container"];function I(g,E){if(1&g&&(n.qex(0),n.nrm(1,"nge-monaco-viewer",1),n.nI1(2,"json"),n.bVm()),2&g){const m=n.XpG();n.R7$(),n.Y8G("code",n.bMT(2,1,m.state))}}let R=(()=>{class g{constructor(m,o){this.api=m,this.elementRef=o,this.stateChange=new n.bkB}ngOnInit(){const m=this.elementRef.nativeElement;m.parentElement?.setAttribute("id",(0,p.A)());const o=m.parentElement?.tagName.toLowerCase();this.definition=this.api.findBySelector(o||""),this.observer=new MutationObserver(r=>{r.forEach(this.onChangeAttributes.bind(this,!1))}),this.observer.observe(m.parentElement,{attributes:!0}),this.onChangeAttributes(!0)}ngOnDestroy(){this.observer?.disconnect()}parseValue(m){return m.trim().match(/^(true$|false$|\d+$|\[|\{)/)?JSON.parse(m):m}onChangeAttributes(m){const u=Array.from(this.elementRef.nativeElement.parentElement.attributes),v=u.find(_=>"data-script-id"===_.name);if(v){const _=document.querySelector(`script[id="${v.value}"]`);return void(_&&this.stateChange.emit(this.parseValue(_.textContent||"{}")))}if(u.find(_=>"state"===_.name)&&m)return;const M={},T=this.definition?.schema?.properties||{};let G=!1;for(const _ of u)if(_.name in T){G=!0;try{M[_.name]=this.parseValue(_.value)}catch{console.warn(`Invalid value "${_.value}" for ${_.name} attribute`)}}G&&this.stateChange.emit(M)}static#e=this.\u0275fac=function(o){return new(o||g)(n.rXU(y.h),n.rXU(n.aKT))};static#t=this.\u0275cmp=n.VBU({type:g,selectors:[["wc-base"]],viewQuery:function(o,r){if(1&o&&n.GBs(c,5),2&o){let u;n.mGM(u=n.lsd())&&(r.container=u.first)}},inputs:{state:"state"},outputs:{stateChange:"stateChange"},decls:1,vars:1,consts:[[4,"ngIf"],["language","json",3,"code"]],template:function(o,r){1&o&&n.DNE(0,I,3,3,"ng-container",0),2&o&&n.Y8G("ngIf",null==r.state?null:r.state.debug)},dependencies:[e.bT,h.x1,e.TG],styles:["[_nghost-%COMP%]{display:block;margin:.5rem 0}div[_ngcontent-%COMP%]{display:none}"]})}return g})()},1016:(O,k,d)=>{d.d(k,{W:()=>e});var n=d(6610),y=d(2919),p=d(7788);let e=(()=>{class h{static#e=this.\u0275fac=function(R){return new(R||h)};static#t=this.\u0275mod=p.$C({type:h});static#i=this.\u0275inj=p.G2t({imports:[n.MD,y.OZ,n.MD]})}return h})()},5293:(O,k,d)=>{d.d(k,{A:()=>m});const y={randomUUID:typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto)};let p;const e=new Uint8Array(16);function h(){if(!p&&(p=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!p))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return p(e)}const c=[];for(let o=0;o<256;++o)c.push((o+256).toString(16).slice(1));const m=function E(o,r,u){if(y.randomUUID&&!r&&!o)return y.randomUUID();const v=(o=o||{}).random||(o.rng||h)();if(v[6]=15&v[6]|64,v[8]=63&v[8]|128,r){u=u||0;for(let C=0;C<16;++C)r[u+C]=v[C];return r}return function I(o,r=0){return c[o[r+0]]+c[o[r+1]]+c[o[r+2]]+c[o[r+3]]+"-"+c[o[r+4]]+c[o[r+5]]+"-"+c[o[r+6]]+c[o[r+7]]+"-"+c[o[r+8]]+c[o[r+9]]+"-"+c[o[r+10]]+c[o[r+11]]+c[o[r+12]]+c[o[r+13]]+c[o[r+14]]+c[o[r+15]]}(v)}}}]);