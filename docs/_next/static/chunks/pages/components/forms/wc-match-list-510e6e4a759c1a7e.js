(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2336],{1095:function(s,e,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/components/forms/wc-match-list",function(){return n(3009)}])},3009:function(s,e,n){"use strict";n.r(e),n.d(e,{__toc:function(){return a}});var i=n(5893),r=n(2673),l=n(2643),o=n(9013),t=n(9526),c=n(1793);let a=[{depth:2,value:"Documentation",id:"documentation"},{depth:3,value:"Organisation des \xe9l\xe9ments",id:"organisation-des-\xe9l\xe9ments"},{depth:4,value:"\xc9l\xe9ments \xe0 relier (nodes)",id:"\xe9l\xe9ments-\xe0-relier-nodes"},{depth:4,value:"Connexions entre \xe9l\xe9ments (links)",id:"connexions-entre-\xe9l\xe9ments-links"},{depth:3,value:"Fonctionnalit\xe9s interactives",id:"fonctionnalit\xe9s-interactives"},{depth:3,value:"Conseils de conception",id:"conseils-de-conception"},{depth:2,value:"Exemple interactif",id:"exemple-interactif"},{depth:2,value:"API",id:"api"}];function h(s){let e=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",h3:"h3",h4:"h4",pre:"pre",span:"span",ul:"ul",li:"li"},(0,l.a)(),s.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{children:"MatchList"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.code,{children:"wc-match-list"})}),"\n",(0,i.jsx)(e.p,{children:"Composant interactif permettant d'associer des \xe9l\xe9ments entre deux colonnes en tra\xe7ant des lignes. Parfait pour les exercices d'appariement comme associer des termes \xe0 leurs d\xe9finitions, des mots \xe0 leurs traductions, des formules \xe0 leurs applications, ou encore des images \xe0 leurs descriptions."}),"\n",(0,i.jsx)(e.h2,{id:"documentation",children:"Documentation"}),"\n",(0,i.jsx)(e.p,{children:"Le composant MatchList permet de cr\xe9er des exercices interactifs d'appariement o\xf9 les apprenants doivent \xe9tablir des correspondances entre des \xe9l\xe9ments dispos\xe9s dans deux colonnes distinctes. Il s'utilise typiquement en cr\xe9ant un ensemble d'\xe9l\xe9ments sources (colonne de gauche) et cibles (colonne de droite) que l'apprenant relie par des traits."}),"\n",(0,i.jsx)(e.h3,{id:"organisation-des-\xe9l\xe9ments",children:"Organisation des \xe9l\xe9ments"}),"\n",(0,i.jsx)(e.p,{children:"Le composant s'articule autour de deux collections principales:"}),"\n",(0,i.jsxs)(e.h4,{id:"\xe9l\xe9ments-\xe0-relier-nodes",children:["\xc9l\xe9ments \xe0 relier (",(0,i.jsx)(e.code,{children:"nodes"}),")"]}),"\n",(0,i.jsx)(e.p,{children:"Chaque \xe9l\xe9ment est d\xe9fini par un objet avec trois propri\xe9t\xe9s essentielles:"}),"\n",(0,i.jsx)(e.pre,{"data-language":"typescript","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"typescript","data-theme":"default",children:[(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"id"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:": string"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// Identifiant du noeud."})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:": "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"source"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"|"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"target"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// Type du noeud."})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"content"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:": string"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// Contenu en markdown."})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})}),"\n",(0,i.jsxs)(e.h4,{id:"connexions-entre-\xe9l\xe9ments-links",children:["Connexions entre \xe9l\xe9ments (",(0,i.jsx)(e.code,{children:"links"}),")"]}),"\n",(0,i.jsx)(e.pre,{"data-language":"typescript","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"typescript","data-theme":"default",children:[(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"source"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:": string"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// Identifiant du noeud source."})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"target"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:": string"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// identifiand du noeud cible."})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"css"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"?:"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" string"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"// Voir API CSS."})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})}),"\n",(0,i.jsx)(e.p,{children:"Les \xe9l\xe9ments de type source apparaissent dans la colonne gauche, tandis que les \xe9l\xe9ments de type target sont plac\xe9s dans la colonne droite."}),"\n",(0,i.jsx)(e.h3,{id:"fonctionnalit\xe9s-interactives",children:"Fonctionnalit\xe9s interactives"}),"\n",(0,i.jsx)(e.p,{children:"Par d\xe9faut, l'apprenant peut:"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"Cr\xe9er des liens en cliquant successivement sur un \xe9l\xe9ment source puis un \xe9l\xe9ment cible"}),"\n",(0,i.jsx)(e.li,{children:"Supprimer un lien existant en cliquant dessus"}),"\n",(0,i.jsx)(e.li,{children:"\xc9tablir plusieurs connexions pour un m\xeame \xe9l\xe9ment source ou cible"}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:"Pour d\xe9sactiver cette interactivit\xe9 (par exemple pour afficher une solution), utilisez la propri\xe9t\xe9 disabled: true."}),"\n",(0,i.jsx)(e.h3,{id:"conseils-de-conception",children:"Conseils de conception"}),"\n",(0,i.jsx)(e.p,{children:"Pour cr\xe9er des exercices d'association efficaces:"}),"\n",(0,i.jsx)(e.p,{children:"Assurez-vous que les identifiants (id) sont uniques\n\xc9quilibrez le nombre d'\xe9l\xe9ments entre les colonnes source et cible\nUtilisez le markdown dans la propri\xe9t\xe9 content pour int\xe9grer des formules, images ou mise en forme"}),"\n",(0,i.jsx)(e.h2,{id:"exemple-interactif",children:"Exemple interactif"}),"\n",(0,i.jsx)("iframe",{src:(0,c.o)("playground/components/wc-match-list"),style:{width:"100%",height:"700px",border:"none"}}),"\n",(0,i.jsx)(e.h2,{id:"api",children:"API"}),"\n",(0,i.jsxs)(o.mQ,{items:["Graphique","JSON"],children:[(0,i.jsx)(o.OK,{children:(0,i.jsx)(t.Ay,{schema:{$schema:"http://json-schema.org/draft-07/schema",type:"object",title:"MatchList",properties:{disabled:{type:"boolean",default:!1,description:"D\xe9sactiver l'interaction avec le composant?"},links:{type:"array",default:[],description:"La liste des associations.",additionalProperties:!1,required:["source","target"],items:{type:"object",properties:{source:{type:"string",description:"Identifiant du noeud source."},target:{type:"string",description:"Identifiant du noeud cible."},css:{type:"string",description:"Voir la page API CSS."}}}},nodes:{type:"array",default:[],description:"La liste des noeuds.",minItems:2,additionalProperties:!1,required:["id","content","type"],items:{type:"object",properties:{id:{type:"string",description:"Identifiant unique du noeud."},content:{type:"string",description:"Contenu du noeud en markdown."},type:{type:"string",enum:["source","target"],description:"Type du noeud."}}}}}}})}),(0,i.jsx)(o.OK,{children:(0,i.jsx)(e.pre,{"data-language":"json","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"json","data-theme":"default",children:[(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"$schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"http://json-schema.org/draft-07/schema"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"title"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"MatchList"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"disabled"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"boolean"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"D\xe9sactiver l\'interaction avec le composant?"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"links"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"array"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" []"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"La liste des associations."'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"additionalProperties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"required"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"source"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"target"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  ]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"items"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"source"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Identifiant du noeud source."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"target"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Identifiant du noeud cible."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"css"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Voir la page API CSS."'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  }"})}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"nodes"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"array"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" []"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"La liste des noeuds."'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"minItems"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"2"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"additionalProperties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"false"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"required"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"id"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"content"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"type"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  ]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"items"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"id"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Identifiant unique du noeud."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"content"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Contenu du noeud en markdown."'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"enum"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" ["})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"          "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"source"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"          "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"target"'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        ]"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"        "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Type du noeud."'})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"      }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"    }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"  }"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})})})]})]})}e.default=(0,r.j)({MDXContent:function(){let s=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:e}=Object.assign({},(0,l.a)(),s.components);return e?(0,i.jsx)(e,{...s,children:(0,i.jsx)(h,{...s})}):h(s)},pageOpts:{filePath:"pages/components/forms/wc-match-list.mdx",route:"/components/forms/wc-match-list",frontMatter:{title:"MatchList",description:"Composant interactif permettant d'associer des \xe9l\xe9ments entre deux colonnes en tra\xe7ant des lignes. Parfait pour les exercices d'appariement comme associer des termes \xe0 leurs d\xe9finitions, des mots \xe0 leurs traductions, des formules \xe0 leurs applications, ou encore des images \xe0 leurs descriptions."},timestamp:1740911023e3,title:"MatchList",headings:a},pageNextRoute:"/components/forms/wc-match-list"})}},function(s){s.O(0,[2673,9774,2888,179],function(){return s(s.s=1095)}),_N_E=s.O()}]);