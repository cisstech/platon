(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2990],{5900:function(s,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/components/forms/wc-drag-drop",function(){return n(2927)}])},2927:function(s,e,n){"use strict";n.r(e),n.d(e,{__toc:function(){return c}});var i=n(5893),r=n(2673),o=n(2643),l=n(9013),t=n(9526),a=n(1793);let c=[{depth:2,value:"Documentation",id:"documentation"},{depth:3,value:"Fonctionnement",id:"fonctionnement"},{depth:3,value:"Regroupement et restrictions",id:"regroupement-et-restrictions"},{depth:3,value:"R\xe9initialisation des zones",id:"r\xe9initialisation-des-zones"},{depth:3,value:"Applications p\xe9dagogiques",id:"applications-p\xe9dagogiques"},{depth:2,value:"Exemple interactif",id:"exemple-interactif"},{depth:2,value:"API",id:"api"}];function d(s){let e=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",h3:"h3",ul:"ul",li:"li",strong:"strong",pre:"pre",span:"span"},(0,o.a)(),s.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{children:"DragDrop"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.code,{children:"wc-drag-drop"})}),"\n",(0,i.jsx)(e.p,{children:"Composant permettant de cr\xe9er des \xe9l\xe9ments d\xe9pla\xe7ables par glisser-d\xe9poser. Parfait pour les exercices de tri et classement, reconstitution de s\xe9quences, placement d'\xe9l\xe9ments sur une carte ou un sch\xe9ma, ordonner des phrases, ou organiser des concepts dans un diagramme."}),"\n",(0,i.jsx)(e.h2,{id:"documentation",children:"Documentation"}),"\n",(0,i.jsx)(e.p,{children:"Ce composant vous permet de cr\xe9er des interactions de type glisser-d\xe9poser dans vos exercices. C'est un outil particuli\xe8rement puissant pour concevoir des activit\xe9s o\xf9 les apprenants doivent associer, classer ou positionner des \xe9l\xe9ments."}),"\n",(0,i.jsx)(e.h3,{id:"fonctionnement",children:"Fonctionnement"}),"\n",(0,i.jsx)(e.p,{children:"Le composant fonctionne avec deux types d'\xe9l\xe9ments:"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\xc9l\xe9ments d\xe9pla\xe7ables"})," (",(0,i.jsx)(e.code,{children:"draggable=true"}),"): Ces \xe9l\xe9ments peuvent \xeatre saisis et d\xe9plac\xe9s."]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"Zones de d\xe9p\xf4t"})," (",(0,i.jsx)(e.code,{children:"draggable=false"}),"): Ces zones peuvent recevoir des \xe9l\xe9ments d\xe9pla\xe7ables."]}),"\n"]}),"\n",(0,i.jsxs)(e.p,{children:["Lorsqu'un \xe9l\xe9ment d\xe9pla\xe7able est d\xe9pos\xe9 dans une zone de d\xe9p\xf4t, le contenu (",(0,i.jsx)(e.code,{children:"content"}),") de l'\xe9l\xe9ment d\xe9pla\xe7able est automatiquement copi\xe9 dans la zone de d\xe9p\xf4t. Un m\xeame \xe9l\xe9ment d\xe9pla\xe7able peut \xeatre utilis\xe9 plusieurs fois dans diff\xe9rentes zones."]}),"\n",(0,i.jsx)(e.h3,{id:"regroupement-et-restrictions",children:"Regroupement et restrictions"}),"\n",(0,i.jsxs)(e.p,{children:["Pour limiter quels \xe9l\xe9ments peuvent \xeatre d\xe9pos\xe9s dans quelles zones, utilisez la propri\xe9t\xe9 ",(0,i.jsx)(e.code,{children:"group"}),". Les \xe9l\xe9ments ne peuvent \xeatre d\xe9pos\xe9s que dans les zones ayant le m\xeame identifiant de groupe."]}),"\n",(0,i.jsx)(e.h3,{id:"r\xe9initialisation-des-zones",children:"R\xe9initialisation des zones"}),"\n",(0,i.jsx)(e.p,{children:"Pour vider une zone de d\xe9p\xf4t, deux m\xe9thodes sont possibles:"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"Glissez son contenu vers l'\xe9l\xe9ment d\xe9pla\xe7able d'origine"}),"\n",(0,i.jsx)(e.li,{children:"Cliquez sur le bouton de suppression qui appara\xeet dans la zone"}),"\n"]}),"\n",(0,i.jsx)(e.h3,{id:"applications-p\xe9dagogiques",children:"Applications p\xe9dagogiques"}),"\n",(0,i.jsx)(e.p,{children:"Ce composant est id\xe9al pour cr\xe9er des exercices comme:"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"Associations de termes avec leurs d\xe9finitions"}),"\n",(0,i.jsx)(e.li,{children:"Classification d'\xe9l\xe9ments dans diverses cat\xe9gories"}),"\n",(0,i.jsx)(e.li,{children:"Placement d'\xe9tiquettes sur un sch\xe9ma ou une image"}),"\n",(0,i.jsx)(e.li,{children:"Reconstitution de s\xe9quences ou d'ordres logiques"}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"exemple-interactif",children:"Exemple interactif"}),"\n",(0,i.jsx)("iframe",{src:(0,a.o)("playground/components/wc-drag-drop"),style:{width:"100%",height:"700px",border:"none"}}),"\n",(0,i.jsx)(e.h2,{id:"api",children:"API"}),"\n",(0,i.jsxs)(l.mQ,{items:["Graphique","JSON"],children:[(0,i.jsx)(l.OK,{children:(0,i.jsx)(t.Ay,{schema:{$schema:"http://json-schema.org/draft-07/schema",type:"object",properties:{css:{type:"string",default:"",description:"Voir API CSS."},group:{type:"string",default:"",description:"Le groupe auquel appartient la zone."},content:{type:"string",default:"",description:"Le contenu en markdown de la zone."},disabled:{type:"boolean",default:!1,description:"Une valeur indiquant si l'\xe9l\xe9ment est d\xe9sactiv\xe9."},draggable:{type:"boolean",default:!1,description:"Une valeur indiquant si le composant est une draggable."}}}})}),(0,i.jsx)(l.OK,{children:(0,i.jsx)(e.pre,{"data-language":"json","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"json","data-theme":"default",children:[(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"$schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"http://json-schema.org/draft-07/schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"css"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'""'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Voir API CSS."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"group"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'""'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Le groupe auquel appartient la zone."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"content"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'""'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Le contenu en markdown de la zone."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"disabled"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"boolean"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Une valeur indiquant si l\'\xe9l\xe9ment est d\xe9sactiv\xe9."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"draggable"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"boolean"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Une valeur indiquant si le composant est une draggable."'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})})})]})]})}e.default=(0,r.j)({MDXContent:function(){let s=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:e}=Object.assign({},(0,o.a)(),s.components);return e?(0,i.jsx)(e,{...s,children:(0,i.jsx)(d,{...s})}):d(s)},pageOpts:{filePath:"pages/components/forms/wc-drag-drop.mdx",route:"/components/forms/wc-drag-drop",frontMatter:{title:"DragDrop",description:"Composant permettant de cr\xe9er des \xe9l\xe9ments d\xe9pla\xe7ables par glisser-d\xe9poser. Parfait pour les exercices de tri et classement, reconstitution de s\xe9quences, placement d'\xe9l\xe9ments sur une carte ou un sch\xe9ma, ordonner des phrases, ou organiser des concepts dans un diagramme."},timestamp:1740911023e3,title:"DragDrop",headings:c},pageNextRoute:"/components/forms/wc-drag-drop"})}},function(s){s.O(0,[2673,9774,2888,179],function(){return s(s.s=5900)}),_N_E=s.O()}]);