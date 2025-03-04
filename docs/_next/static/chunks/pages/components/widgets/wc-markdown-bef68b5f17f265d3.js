(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2046],{6427:function(e,s,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/components/widgets/wc-markdown",function(){return n(9238)}])},9238:function(e,s,n){"use strict";n.r(s),n.d(s,{__toc:function(){return c}});var i=n(5893),r=n(2673),l=n(2643),o=n(9013),t=n(9526),a=n(1793);let c=[{depth:2,value:"Documentation",id:"documentation"},{depth:3,value:"Propri\xe9t\xe9s principales",id:"propri\xe9t\xe9s-principales"},{depth:3,value:"Fonctionnalit\xe9s avanc\xe9es",id:"fonctionnalit\xe9s-avanc\xe9es"},{depth:4,value:"Admonitions (notes contextuelles)",id:"admonitions-notes-contextuelles"},{depth:4,value:"Syst\xe8me d'onglets",id:"syst\xe8me-donglets"},{depth:4,value:"Tableaux avanc\xe9s",id:"tableaux-avanc\xe9s"},{depth:3,value:"Applications p\xe9dagogiques",id:"applications-p\xe9dagogiques"},{depth:3,value:"Ressources compl\xe9mentaires",id:"ressources-compl\xe9mentaires"},{depth:2,value:"Exemple interactif",id:"exemple-interactif"},{depth:2,value:"API",id:"api"}];function d(e){let s=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",h3:"h3",ul:"ul",li:"li",strong:"strong",blockquote:"blockquote",h4:"h4",pre:"pre",span:"span",a:"a"},(0,l.a)(),e.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h1,{children:"Markdown"}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.code,{children:"wc-markdown"})}),"\n",(0,i.jsx)(s.p,{children:"Composant de rendu Markdown avec support pour \xe9l\xe9ments avanc\xe9s comme les admonitions, les onglets, et la mise en forme riche. Parfait pour afficher des \xe9nonc\xe9s d'exercices, des explications th\xe9oriques, des guides m\xe9thodologiques ou des ressources documentaires avec une mise en forme \xe9l\xe9gante et structur\xe9e."}),"\n",(0,i.jsx)(s.h2,{id:"documentation",children:"Documentation"}),"\n",(0,i.jsx)(s.p,{children:"Le composant Markdown permet d'afficher du contenu format\xe9 avec une syntaxe simple et lisible. Bas\xe9 sur la biblioth\xe8que nge-markdown, il offre des fonctionnalit\xe9s \xe9tendues au-del\xe0 du Markdown standard, rendant vos contenus p\xe9dagogiques plus riches et structur\xe9s."}),"\n",(0,i.jsx)(s.h3,{id:"propri\xe9t\xe9s-principales",children:"Propri\xe9t\xe9s principales"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.strong,{children:"data"}),": Contenu Markdown \xe0 afficher directement dans le composant"]}),"\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.strong,{children:"file"}),": URL vers un fichier Markdown externe \xe0 charger et afficher"]}),"\n"]}),"\n",(0,i.jsxs)(s.blockquote,{children:["\n",(0,i.jsxs)(s.p,{children:["Si les deux propri\xe9t\xe9s sont d\xe9finies, ",(0,i.jsx)(s.code,{children:"data"})," est prioritaire sur ",(0,i.jsx)(s.code,{children:"file"}),"."]}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"fonctionnalit\xe9s-avanc\xe9es",children:"Fonctionnalit\xe9s avanc\xe9es"}),"\n",(0,i.jsx)(s.h4,{id:"admonitions-notes-contextuelles",children:"Admonitions (notes contextuelles)"}),"\n",(0,i.jsx)(s.p,{children:"Cr\xe9ez des encadr\xe9s color\xe9s pour mettre en \xe9vidence diff\xe9rents types d'informations:"}),"\n",(0,i.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,i.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::+ note Titre de la note"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Contenu de la note avec informations importantes."})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:" "}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::+ warning Attention"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Contenu d'avertissement \xe0 ne pas n\xe9gliger."})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:" "}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::+ tip Astuce"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Conseil utile pour les apprenants."})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:" "}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::+ danger Important"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Information critique ou mise en garde."})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:":::"})})]})}),"\n",(0,i.jsx)(s.h4,{id:"syst\xe8me-donglets",children:"Syst\xe8me d'onglets"}),"\n",(0,i.jsx)(s.p,{children:"Organisez votre contenu en onglets pour \xe9conomiser de l'espace et structurer l'information:"}),"\n",(0,i.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,i.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=== Premier onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Contenu du premier onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:" "}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=== Deuxi\xe8me onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Contenu du deuxi\xe8me onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:" "}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=== Troisi\xe8me onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Contenu du troisi\xe8me onglet"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"==="})})]})}),"\n",(0,i.jsx)(s.h4,{id:"tableaux-avanc\xe9s",children:"Tableaux avanc\xe9s"}),"\n",(0,i.jsx)(s.p,{children:"Cr\xe9ez des tableaux avec fusion de cellules et mise en forme:"}),"\n",(0,i.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,i.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"| En-t\xeate 1                  | En-t\xeate 2  | En-t\xeate 3 |"})}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"| "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":-------------------------"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" | "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":--------:"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" | "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:"--------:"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" |"})]}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"| Gauche                     |   Centr\xe9   |    Droite |"})}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"| Cellule avec "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)",fontWeight:"bold"},children:"**formatage**"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" | "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)",fontStyle:"italic"},children:"_Italique_"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" |    "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string)"},children:"`Code`"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" |"})]})]})}),"\n",(0,i.jsx)(s.h3,{id:"applications-p\xe9dagogiques",children:"Applications p\xe9dagogiques"}),"\n",(0,i.jsx)(s.p,{children:"Le composant Markdown est particuli\xe8rement utile pour:"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"R\xe9diger des \xe9nonc\xe9s d'exercices structur\xe9s"}),"\n",(0,i.jsx)(s.li,{children:"Pr\xe9senter des explications th\xe9oriques"}),"\n",(0,i.jsx)(s.li,{children:"Fournir de la documentation"}),"\n",(0,i.jsx)(s.li,{children:"Cr\xe9er des guides \xe9tape par \xe9tape"}),"\n",(0,i.jsx)(s.li,{children:"Organiser des ressources p\xe9dagogiques"}),"\n"]}),"\n",(0,i.jsx)(s.h3,{id:"ressources-compl\xe9mentaires",children:"Ressources compl\xe9mentaires"}),"\n",(0,i.jsx)(s.p,{children:"Pour explorer toutes les possibilit\xe9s offertes par ce composant:"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:(0,i.jsx)(s.a,{href:"https://cisstech.github.io/nge/docs/nge-markdown/cheatsheet",children:"Guide complet de nge-markdown"})}),"\n",(0,i.jsx)(s.li,{children:(0,i.jsx)(s.a,{href:"https://www.markdownguide.org/basic-syntax/",children:"Syntaxe Markdown standard"})}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"exemple-interactif",children:"Exemple interactif"}),"\n",(0,i.jsx)("iframe",{src:(0,a.o)("playground/components/wc-markdown"),style:{width:"100%",height:"700px",border:"none"}}),"\n",(0,i.jsx)(s.h2,{id:"api",children:"API"}),"\n",(0,i.jsxs)(o.mQ,{items:["Graphique","JSON"],children:[(0,i.jsx)(o.OK,{children:(0,i.jsx)(t.Ay,{schema:{$schema:"http://json-schema.org/draft-07/schema",type:"object",required:[],properties:{data:{type:"string",default:"",description:"Texte en markdown"},file:{type:"string",default:"",description:"Url vers un fichier markdown \xe0 afficher"}}}})}),(0,i.jsx)(o.OK,{children:(0,i.jsx)(s.pre,{"data-language":"json","data-theme":"default",children:(0,i.jsxs)(s.code,{"data-language":"json","data-theme":"default",children:[(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"{"})}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"$schema"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"http://json-schema.org/draft-07/schema"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"object"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"required"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" []"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"properties"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"data"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'""'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Texte en markdown"'})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"file"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" {"})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"type"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"string"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"default"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'""'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:","})]}),"\n",(0,i.jsxs)(s.span,{className:"line",children:[(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:'"description"'}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:":"}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,i.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Url vers un fichier markdown \xe0 afficher"'})]}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,i.jsx)(s.span,{className:"line",children:(0,i.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})})]})})})]})]})}s.default=(0,r.j)({MDXContent:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:s}=Object.assign({},(0,l.a)(),e.components);return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(d,{...e})}):d(e)},pageOpts:{filePath:"pages/components/widgets/wc-markdown.mdx",route:"/components/widgets/wc-markdown",frontMatter:{title:"Markdown",description:"Composant de rendu Markdown avec support pour \xe9l\xe9ments avanc\xe9s comme les admonitions, les onglets, et la mise en forme riche. Parfait pour afficher des \xe9nonc\xe9s d'exercices, des explications th\xe9oriques, des guides m\xe9thodologiques ou des ressources documentaires avec une mise en forme \xe9l\xe9gante et structur\xe9e."},timestamp:1740911023e3,title:"Markdown",headings:c},pageNextRoute:"/components/widgets/wc-markdown"})}},function(e){e.O(0,[2673,9774,2888,179],function(){return e(e.s=6427)}),_N_E=e.O()}]);