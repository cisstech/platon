(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4325],{7930:function(e,s,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/main/programing/exercise/workflow",function(){return n(8577)}])},8577:function(e,s,n){"use strict";n.r(s),n.d(s,{__toc:function(){return a}});var l=n(5893),r=n(2673),i=n(2643),o=n(9013);let a=[{depth:2,value:"Environnment d'ex\xe9cution : Sandbox",id:"environnment-dex\xe9cution--sandbox"},{depth:3,value:"Sandbox node",id:"sandbox-node"},{depth:3,value:"Sandbox python",id:"sandbox-python"},{depth:2,value:"Construction: Builder",id:"construction-builder"},{depth:2,value:"Affichage: Title, Statement et Form",id:"affichage-title-statement-et-form"},{depth:3,value:"title",id:"title"},{depth:3,value:"statement",id:"statement"},{depth:3,value:"form",id:"form"},{depth:2,value:"\xc9valuation: Grader",id:"\xe9valuation-grader"},{depth:2,value:"Affichage de la solution : Solution",id:"affichage-de-la-solution--solution"}];function t(e){let s=Object.assign({h1:"h1",p:"p",ul:"ul",li:"li",code:"code",h2:"h2",h3:"h3",strong:"strong",a:"a",pre:"pre",span:"span"},(0,i.a)(),e.components);return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(s.h1,{children:"Construction, Affichage et \xc9valuation"}),"\n",(0,l.jsx)(s.p,{children:"Le d\xe9roulement d'un exercice sous PLaTon se compose de 4 parties:"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:["La Construction, \xe0 l'aide d'une cl\xe9 ",(0,l.jsx)(s.code,{children:"builder"})]}),"\n",(0,l.jsxs)(s.li,{children:["L'Affichage, \xe0 l'aide des cl\xe9s ",(0,l.jsx)(s.code,{children:"title"}),", ",(0,l.jsx)(s.code,{children:"statement"}),", et ",(0,l.jsx)(s.code,{children:"form"})]}),"\n",(0,l.jsxs)(s.li,{children:["L'\xc9valuation, \xe0 l'aide d'une cl\xe9 ",(0,l.jsx)(s.code,{children:"grader"})]}),"\n",(0,l.jsxs)(s.li,{children:["La Solution, \xe0 l'aide d'une cl\xe9 ",(0,l.jsx)(s.code,{children:"solution"})]}),"\n"]}),"\n",(0,l.jsx)(s.h2,{id:"environnment-dex\xe9cution--sandbox",children:"Environnment d'ex\xe9cution : Sandbox"}),"\n",(0,l.jsxs)(s.p,{children:["Les exercices sont execut\xe9s dans un environnement isol\xe9 appel\xe9 sandbox. Il existe plusieurs types de sandbox, chacune ayant ses propres caract\xe9ristiques.\nLe choix de la sandbox se fait \xe0 l'aide de la cl\xe9 ",(0,l.jsx)(s.code,{children:"sandbox"})," dans la configuration de l'exercice."]}),"\n",(0,l.jsx)(s.h3,{id:"sandbox-node",children:"Sandbox node"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Syntaxe"})," : ",(0,l.jsx)(s.code,{children:'sandbox = "node"'})]}),"\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Description"})," : Sandbox permettant d'ex\xe9cuter du code javascript. Cette sandbox est utilis\xe9e par d\xe9faut et utilise l'api de sandboxing de nodejs."]}),"\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Librairies disponibles"})," : Cette sandbox est pratique pour des exercices simples ne n\xe9cessitant pas d'op\xe9rations complexes ou de librairies syst\xe8me.\nVous avez acc\xe8s \xe0 l'API de base de javascript ainsi que quelques ",(0,l.jsx)(s.a,{href:"https://github.com/cisstech/platon/blob/main/libs/feature/player/server/src/lib/sandboxes/node/node-sandbox-api.ts#L22",children:"fonctions utilitaires"}),"."]}),"\n"]}),"\n",(0,l.jsx)(s.h3,{id:"sandbox-python",children:"Sandbox python"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Syntaxe"})," : ",(0,l.jsx)(s.code,{children:'sandbox = "python"'})]}),"\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Description"})," : Sandbox permettant d'ex\xe9cuter du code python. Cette sandbox utilise des containers docker pour ex\xe9cuter du code python."]}),"\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.strong,{children:"Libraries disponibles"})," : Cette sandbox est plus compl\xe8te que la sandbox node, et vous donne acc\xe8s \xe0 un container Linux avec plusieurs librairies et outils pr\xe9-install\xe9s (python, gcc, java, postgresql...).\nVous pouvez consulter la liste des librairies disponibles ",(0,l.jsx)(s.a,{href:"https://github.com/PremierLangage/sandbox/blob/master/docker/Dockerfile",children:"ici"})]}),"\n"]}),"\n",(0,l.jsx)(o.UW,{type:"warning",children:(0,l.jsxs)(s.p,{children:["La sandbox python n'est pas int\xe9gr\xe9e par d\xe9faut \xe0 PLaTon. Pour l'utiliser, vous devez contacter l'\xe9quipe de PLaTon ou\nsuivre les instructions de la ",(0,l.jsx)(s.a,{href:"https://github.com/PremierLangage/sandbox",children:"documentation"})," de la sandbox python."]})}),"\n",(0,l.jsx)(s.h2,{id:"construction-builder",children:"Construction: Builder"}),"\n",(0,l.jsx)(s.p,{children:"Afin de construire des exercices ayant une part d'al\xe9atoire, ou de faciliter la cr\xe9ation de type d'exercices r\xe9utilisables, il peut \xeatre n\xe9cessaire de passer par un script de construction de l'exercice."}),"\n",(0,l.jsxs)(s.p,{children:["Pour cela, il est possible de d\xe9clarer un script python/node (en fonction de la sandbox) dans une cl\xe9 ",(0,l.jsx)(s.code,{children:"builder"}),"."]}),"\n",(0,l.jsx)(s.p,{children:"Par exemple :"}),"\n",(0,l.jsx)(s.pre,{"data-language":"js","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"js","data-theme":"default",children:[(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"builder "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" #"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"!"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"lang"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"js"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"max "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"10"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"op1 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".round"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".random"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"() "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"*"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" max)"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"op2 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".round"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".random"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"() "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"*"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" max)"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})})]})}),"\n",(0,l.jsxs)(s.p,{children:["Pour utiliser de l'al\xe9atoire sur les sandboxes python, vous devez utiliser la fonction ",(0,l.jsx)(s.code,{children:"random"})," en l'initialisant avec une graine (seed) automatiquement disponible dans les variables globales du builder."]}),"\n",(0,l.jsx)(s.p,{children:"Par exemple:"}),"\n",(0,l.jsx)(s.pre,{"data-language":"python","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"python","data-theme":"default",children:[(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" random"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"random"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:"."}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:"seed"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-punctuation)"},children:"(seed)"})]})]})}),"\n",(0,l.jsx)(s.h2,{id:"affichage-title-statement-et-form",children:"Affichage: Title, Statement et Form"}),"\n",(0,l.jsxs)(s.p,{children:["Pour afficher un exercice, il est n\xe9cessaire de d\xe9clarer 3 cl\xe9s dans la configuration de l'exercice. La valeur de ces cl\xe9s peut \xeatre du HTML et/ou du ",(0,l.jsx)(s.a,{href:"https://fr.wikipedia.org/wiki/Markdown",children:"Markdown"}),"."]}),"\n",(0,l.jsxs)(s.p,{children:["Il est possible d'afficher n'importe quelle variable de l'exercice \xe0 l'aide de la syntaxe ",(0,l.jsx)(s.code,{children:"{{ nomvariable }}"})," dans le contenu de ces 3 cl\xe9s.\nSi la variable affich\xe9e est un texte contenant d'autres affichage de variables, le processus de remplacement des variables s'appliquera r\xe9cursivement."]}),"\n",(0,l.jsxs)(s.p,{children:["La plateforme utilise en interne la librairie ",(0,l.jsx)(s.a,{href:"https://mozilla.github.io/nunjucks/",children:"nunjunks"})," pour le rendu des variables. Il vous est donc possible d'utiliser les fonctionnalit\xe9s de cette librairie dans vos exercices\ncomme par exemple les ",(0,l.jsx)(s.a,{href:"https://mozilla.github.io/nunjucks/templating.html#filters",children:"filtres"})," ou les ",(0,l.jsx)(s.a,{href:"https://mozilla.github.io/nunjucks/templating.html#if-expression",children:"expressions"}),"."]}),"\n",(0,l.jsxs)(s.p,{children:["Pour le rendu du markdown, la plateforme utilise la librairie ",(0,l.jsx)(s.a,{href:"https://cisstech.github.io/nge/docs/nge-markdown/cheatsheet",children:"nge-markdown"})," qui contient quelques extensions suppl\xe9mentaires par rapport au markdown de base comme le support du latex et des onglets."]}),"\n",(0,l.jsx)(s.h3,{id:"title",children:"title"}),"\n",(0,l.jsxs)(s.p,{children:["La cl\xe9 ",(0,l.jsx)(s.code,{children:"title"})," contient le titre de l'exercice. Par exemple :"]}),"\n",(0,l.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"title =="})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Addition al\xe9atoire"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=="})})]})}),"\n",(0,l.jsx)(o.UW,{type:"warning",children:(0,l.jsxs)(s.p,{children:["Vous ne pouvez pas utiliser la syntaxe ",(0,l.jsx)(s.code,{children:"{{ nomvariable }}"})," dans la cl\xe9 ",(0,l.jsx)(s.code,{children:"title"}),"."]})}),"\n",(0,l.jsx)(s.h3,{id:"statement",children:"statement"}),"\n",(0,l.jsxs)(s.p,{children:["La cl\xe9 ",(0,l.jsx)(s.code,{children:"statement"})," contient l'\xe9nonc\xe9 de l'exercice. Par exemple :"]}),"\n",(0,l.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"text =="})}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"Quel est le "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)",fontWeight:"bold"},children:"**r\xe9sultat**"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" de: "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)",fontWeight:"bold"},children:"**{{ op1 }}**"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" + "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)",fontWeight:"bold"},children:"**{{ op2 }}**"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" ?"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=="})})]})}),"\n",(0,l.jsxs)(s.p,{children:["A l'affichage, apr\xe8s traitement du markdown, du HTML et des variables, en supposant que ",(0,l.jsx)(s.code,{children:"op1"})," contient ",(0,l.jsx)(s.code,{children:"10"})," et ",(0,l.jsx)(s.code,{children:"op2"})," ",(0,l.jsx)(s.code,{children:"20"}),", le texte suivant sera affich\xe9:"]}),"\n",(0,l.jsxs)(s.p,{children:["Quel est le ",(0,l.jsx)(s.strong,{children:"r\xe9sultat"})," de: ",(0,l.jsx)(s.strong,{children:"10"})," + ",(0,l.jsx)(s.strong,{children:"20"})," ?"]}),"\n",(0,l.jsx)(s.h3,{id:"form",children:"form"}),"\n",(0,l.jsxs)(s.p,{children:["La cl\xe9 ",(0,l.jsx)(s.code,{children:"form"})," contient le formulaire de l'exercice. Par exemple :"]}),"\n",(0,l.jsx)(s.pre,{"data-language":"markdown","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"markdown","data-theme":"default",children:[(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"input = :wc-input-box"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:'input.type = "number"'})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:'input.placeholder = "Entrez votre r\xe9ponse ici"'})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"form =="})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"{{ input }}"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"=="})})]})}),"\n",(0,l.jsx)(o.UW,{type:"info",children:(0,l.jsx)(s.p,{children:"La r\xe9cup\xe9ration de la r\xe9ponse de l'apprenant se fait \xe0 l'aide de variables de types composants dont la documentation\nest disponible sur la barre de menu haut."})}),"\n",(0,l.jsx)(s.h2,{id:"\xe9valuation-grader",children:"\xc9valuation: Grader"}),"\n",(0,l.jsxs)(s.p,{children:["Le grader est le script qui va \xe9valuer la r\xe9ponse de l'apprenant. Il est possible de d\xe9clarer un script python/node (en fonction de la sandbox) dans une cl\xe9 ",(0,l.jsx)(s.code,{children:"grader"}),"."]}),"\n",(0,l.jsxs)(s.p,{children:["Ce script \xe0 acc\xe8s \xe0 l'ensemble des variables de l'exercice: celles d\xe9clar\xe9es dans le ",(0,l.jsx)(s.code,{children:"ple"}),", celles cr\xe9\xe9s par le script de construction, celles modifi\xe9es par l'apprenant dans le formulaire (les composants)."]}),"\n",(0,l.jsx)(s.p,{children:"En plus de vos variables, 2 variables sp\xe9ciales sont disponibles :"}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.code,{children:"grade"})," : La note de l'apprenant, entre 0 et 100 (-1 si l'exercice est en erreur)"]}),"\n"]}),"\n",(0,l.jsxs)(s.li,{children:["\n",(0,l.jsxs)(s.p,{children:[(0,l.jsx)(s.code,{children:"feedback"})," : Un objet permettant de renvoyer un feedback \xe0 l'apprenant. Les cl\xe9s de cet objet sont :"]}),"\n",(0,l.jsxs)(s.ul,{children:["\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.code,{children:"type"})," : Le type de feedback \xe0 renvoyer \xe0 l'apprenant. Les valeurs possibles sont ",(0,l.jsx)(s.code,{children:"warning"}),", ",(0,l.jsx)(s.code,{children:"error"})," et ",(0,l.jsx)(s.code,{children:"success"})]}),"\n",(0,l.jsxs)(s.li,{children:[(0,l.jsx)(s.code,{children:"content"})," : Le message \xe0 afficher \xe0 l'apprenant (markdown|html)"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,l.jsx)(s.p,{children:"Vous devez modifier la valeur de ces cl\xe9s pour renvoyer un feedback \xe0 l'apprenant et lui attribuer une note en fonction de sa r\xe9ponse."}),"\n",(0,l.jsx)(s.p,{children:"Par exemple:"}),"\n",(0,l.jsx)(s.pre,{"data-language":"js","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"js","data-theme":"default",children:[(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"grader "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" #"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"!"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"lang"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"js"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"grade "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"0"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"feedback"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".type "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"error"'})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"feedback"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".content "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Mauvaise r\xe9ponse"'})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-comment)"},children:"// input.value contient la r\xe9ponse de l'apprenant"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"if"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" ("}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"input"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".value "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"==="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" op1 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"+"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" op2) {"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  grade "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"100"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"feedback"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".type "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"success"'})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"  "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"feedback"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".content "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Bonne r\xe9ponse"'})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"}"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-comment)"},children:"// A cet endroit vous pouvez modifer toutes les variables de l'exercice avant de les renvoyer \xe0 l'apprenant."})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-comment)"},children:"// Par exemple, vous pouvez afficher la bonne r\xe9ponse dans input.value"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "})]})}),"\n",(0,l.jsx)(o.UW,{type:"info",children:(0,l.jsxs)(s.p,{children:["Par d\xe9faut, le type de feedback est un objet, mais il est possible d'afficher plusieurs feedbacks \xe0 l'apprenant en\nutilisant un tableau d'objets de feedback. Pour cela, il suffit de d\xe9clarer la variable ",(0,l.jsx)(s.code,{children:"feedback"})," comme un tableau au\nd\xe9but du grader et d'ajouter des objets de feedback \xe0 l'int\xe9rieur."]})}),"\n",(0,l.jsx)(s.h2,{id:"affichage-de-la-solution--solution",children:"Affichage de la solution : Solution"}),"\n",(0,l.jsxs)(s.p,{children:["Il est possible d'afficher la solution d'un exercice \xe0 l'aide de la cl\xe9 ",(0,l.jsx)(s.code,{children:"solution"}),". Cette cl\xe9 suit la m\xeame logique que la cl\xe9 ",(0,l.jsx)(s.code,{children:"form"}),", sauf qu'elle contient le HTML/Markdown \xe0 afficher \xe0 l'apprenant lorsqu'il demande la solution."]}),"\n",(0,l.jsx)(s.p,{children:"Par exemple:"}),"\n",(0,l.jsx)(s.pre,{"data-language":"js","data-theme":"default",children:(0,l.jsxs)(s.code,{"data-language":"js","data-theme":"default",children:[(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"inputSolution "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" :wc"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"-"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"input"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"-"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"box"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"inputSolution"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".type "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"number"'})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"inputSolution"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".disabled "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"true"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"inputSolution"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".placeholder "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Solution"'})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"builder "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" #"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"!"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"lang"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"js"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"max "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"10"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"op1 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".round"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".random"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"() "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"*"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" max)"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"op2 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".round"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"("}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"Math"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-function)"},children:".random"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"() "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"*"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" max)"})]}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-constant)"},children:"inputSolution"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:".value "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" op1 "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"+"}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:" op2"})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})}),"\n",(0,l.jsx)(s.span,{className:"line",children:" "}),"\n",(0,l.jsxs)(s.span,{className:"line",children:[(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"solution "}),(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})]}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-color-text)"},children:"{{ inputSolution }}"})}),"\n",(0,l.jsx)(s.span,{className:"line",children:(0,l.jsx)(s.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})})]})})]})}s.default=(0,r.j)({MDXContent:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:s}=Object.assign({},(0,i.a)(),e.components);return s?(0,l.jsx)(s,{...e,children:(0,l.jsx)(t,{...e})}):t(e)},pageOpts:{filePath:"pages/main/programing/exercise/workflow.mdx",route:"/main/programing/exercise/workflow",frontMatter:{title:"Construction, Affichage et \xc9valuation"},timestamp:1740846203e3,title:"Construction, Affichage et \xc9valuation",headings:a},pageNextRoute:"/main/programing/exercise/workflow"})}},function(e){e.O(0,[2673,9774,2888,179],function(){return e(e.s=7930)}),_N_E=e.O()}]);