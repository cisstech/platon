(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8566],{3470:function(s,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/components/forms/wc-sort-list",function(){return n(3832)}])},3832:function(s,e,n){"use strict";n.r(e),n.d(e,{__toc:function(){return c}});var i=n(5893),r=n(2673),l=n(2643),o=n(9013),t=n(9526),a=n(1793);let c=[{depth:2,value:"Documentation",id:"documentation"},{depth:3,value:"D\xe9finition des \xe9l\xe9ments de la liste",id:"d\xe9finition-des-\xe9l\xe9ments-de-la-liste"},{depth:3,value:"Personnalisation de l'affichage",id:"personnalisation-de-laffichage"},{depth:3,value:"Comportement interactif",id:"comportement-interactif"},{depth:3,value:"Applications p\xe9dagogiques",id:"applications-p\xe9dagogiques"},{depth:2,value:"Exemple interactif",id:"exemple-interactif"},{depth:2,value:"API",id:"api"}];function h(s){let e=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",h3:"h3",ol:"ol",li:"li",strong:"strong",pre:"pre",span:"span",ul:"ul"},(0,l.a)(),s.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{children:"SortList"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.code,{children:"wc-sort-list"})}),"\n",(0,i.jsx)(e.p,{children:"Liste interactive d'\xe9l\xe9ments r\xe9organisables par glisser-d\xe9poser. Parfait pour les exercices de s\xe9quen\xe7age, de tri logique, d'ordonnancement d'instructions ou d'\xe9v\xe9nements, de classement chronologique, d'algorithmes de tri, ou toute activit\xe9 p\xe9dagogique o\xf9 l'ordre des \xe9l\xe9ments est significatif."}),"\n",(0,i.jsx)(e.h2,{id:"documentation",children:"Documentation"}),"\n",(0,i.jsx)(e.p,{children:"Le composant SortList vous permet de cr\xe9er des listes d'\xe9l\xe9ments que les apprenants peuvent r\xe9organiser par glisser-d\xe9poser. C'est un outil id\xe9al pour tester la capacit\xe9 des \xe9tudiants \xe0 \xe9tablir un ordre logique, chronologique ou hi\xe9rarchique."}),"\n",(0,i.jsx)(e.h3,{id:"d\xe9finition-des-\xe9l\xe9ments-de-la-liste",children:"D\xe9finition des \xe9l\xe9ments de la liste"}),"\n",(0,i.jsx)(e.p,{children:"Vous pouvez d\xe9finir les \xe9l\xe9ments de votre liste de deux fa\xe7ons :"}),"\n",(0,i.jsxs)(e.ol,{children:["\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.strong,{children:"Format simplifi\xe9"})," : pour les \xe9l\xe9ments simples, utilisez directement des cha\xeenes de caract\xe8res"]}),"\n",(0,i.jsx)(e.pre,{"data-language":"js","data-theme":"default",children:(0,i.jsx)(e.code,{"data-language":"js","data-theme":"default",children:(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"items"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'Premi\xe8re \xe9tape'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'Deuxi\xe8me \xe9tape'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'Troisi\xe8me \xe9tape'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"]"})]})})}),"\n"]}),"\n",(0,i.jsxs)(e.li,{children:["\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.strong,{children:"Format d\xe9taill\xe9"})," : pour personnaliser davantage chaque \xe9l\xe9ment"]}),"\n",(0,i.jsx)(e.pre,{"data-language":"js","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"js","data-theme":"default",children:[(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"items"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  {"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    content"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'\xc9tape avec *mise en forme* markdown'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    css"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'highlight important-item'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  {"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    content"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"'\xc9tape avec une formule $E=mc^2$'"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"]"})})]})}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:"Le contenu de chaque \xe9l\xe9ment peut inclure du texte format\xe9 en markdown, des formules math\xe9matiques et m\xeame des images."}),"\n",(0,i.jsx)(e.h3,{id:"personnalisation-de-laffichage",children:"Personnalisation de l'affichage"}),"\n",(0,i.jsxs)(e.p,{children:["Par d\xe9faut, les \xe9l\xe9ments sont centr\xe9s dans la liste, mais vous pouvez les aligner \xe0 gauche en d\xe9finissant ",(0,i.jsx)(e.code,{children:'alignment: "left"'}),". Cette option est particuli\xe8rement utile pour les listes comportant des \xe9l\xe9ments de longueurs variables ou du texte structur\xe9."]}),"\n",(0,i.jsx)(e.h3,{id:"comportement-interactif",children:"Comportement interactif"}),"\n",(0,i.jsxs)(e.p,{children:["Les \xe9tudiants peuvent facilement r\xe9organiser les \xe9l\xe9ments en les faisant glisser dans un nouvel ordre. Une animation fluide accompagne le d\xe9placement, rendant l'interaction intuitive. Si vous avez besoin d'afficher une liste statique (par exemple pour montrer la solution), utilisez l'option ",(0,i.jsx)(e.code,{children:"disabled: true"}),"."]}),"\n",(0,i.jsx)(e.h3,{id:"applications-p\xe9dagogiques",children:"Applications p\xe9dagogiques"}),"\n",(0,i.jsx)(e.p,{children:"Le composant SortList est particuli\xe8rement efficace pour :"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"Reconstruire une s\xe9quence d'\xe9v\xe9nements historiques"}),"\n",(0,i.jsx)(e.li,{children:"Ordonner les \xe9tapes d'un processus ou d'un algorithme"}),"\n",(0,i.jsx)(e.li,{children:"Classer des \xe9l\xe9ments par ordre de priorit\xe9 ou d'importance"}),"\n",(0,i.jsx)(e.li,{children:"Reconstituer des phrases ou paragraphes dans le bon ordre"}),"\n",(0,i.jsx)(e.li,{children:"Visualiser les \xe9tapes d'une d\xe9monstration math\xe9matique"}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:"L'ordre final des \xe9l\xe9ments est automatiquement enregistr\xe9, ce qui facilite l'\xe9valuation de la r\xe9ponse dans votre script d'\xe9valuation (grader)."}),"\n",(0,i.jsx)(e.h2,{id:"exemple-interactif",children:"Exemple interactif"}),"\n",(0,i.jsx)("iframe",{src:(0,a.o)("playground/components/wc-sort-list"),style:{width:"100%",height:"700px",border:"none"}}),"\n",(0,i.jsx)(e.h2,{id:"api",children:"API"}),"\n",(0,i.jsxs)(o.mQ,{items:["Graphique","JSON"],children:[(0,i.jsx)(o.OK,{children:(0,i.jsx)(t.Ay,{schema:{$schema:"http://json-schema.org/draft-07/schema",type:"object",title:"SortList",required:["items"],properties:{items:{type:"array",default:[],description:"La liste des \xe9l\xe9ments \xe0 ordonner.",items:{type:["string","object"],required:["content"],additionalProperties:!1,properties:{css:{type:"string",description:"Voir API CSS"},content:{type:"string",description:"Contenu en markdown."}}}},alignment:{type:"string",default:"center",description:"Alignement des items du SortList",enum:["center","left"]},disabled:{type:"boolean",default:!1,description:"D\xe9sactiver le composant?"}}}})}),(0,i.jsx)(o.OK,{children:(0,i.jsx)(e.pre,{"data-language":"json","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"json","data-theme":"default",children:[(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"$schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"http://json-schema.org/draft-07/schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"title"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"SortList"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"required"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"items"'})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"items"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"array"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" []"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"La liste des \xe9l\xe9ments \xe0 ordonner."'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"items"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    ]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"required"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"content"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    ]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"additionalProperties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"css"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Voir API CSS"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"content"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Contenu en markdown."'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  }"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"alignment"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"center"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Alignement des items du SortList"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"enum"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"center"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"left"'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  ]"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"disabled"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"boolean"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"D\xe9sactiver le composant?"'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})})})]})]})}e.default=(0,r.j)({MDXContent:function(){let s=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:e}=Object.assign({},(0,l.a)(),s.components);return e?(0,i.jsx)(e,{...s,children:(0,i.jsx)(h,{...s})}):h(s)},pageOpts:{filePath:"pages/components/forms/wc-sort-list.mdx",route:"/components/forms/wc-sort-list",frontMatter:{title:"SortList",description:"Liste interactive d'\xe9l\xe9ments r\xe9organisables par glisser-d\xe9poser. Parfait pour les exercices de s\xe9quen\xe7age, de tri logique, d'ordonnancement d'instructions ou d'\xe9v\xe9nements, de classement chronologique, d'algorithmes de tri, ou toute activit\xe9 p\xe9dagogique o\xf9 l'ordre des \xe9l\xe9ments est significatif."},timestamp:1740911023e3,title:"SortList",headings:c},pageNextRoute:"/components/forms/wc-sort-list"})}},function(s){s.O(0,[2673,9774,2888,179],function(){return s(s.s=3470)}),_N_E=s.O()}]);