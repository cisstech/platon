(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2775],{8191:function(e,n,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/main/programing/exercise/metadata",function(){return s(6322)}])},6322:function(e,n,s){"use strict";s.r(n),s.d(n,{__toc:function(){return d}});var i=s(5893),t=s(2673),a=s(2643),r=s(9013);let d=[{depth:2,value:"Nombre total de tentatives",id:"nombre-total-de-tentatives"},{depth:2,value:"La liste des notes obtenues",id:"la-liste-des-notes-obtenues"},{depth:2,value:"Savoir si des aides ont \xe9t\xe9 demand\xe9es",id:"savoir-si-des-aides-ont-\xe9t\xe9-demand\xe9es"},{depth:2,value:"Savoir si la solution a \xe9t\xe9 affich\xe9e",id:"savoir-si-la-solution-a-\xe9t\xe9-affich\xe9e"},{depth:2,value:"Savoir si l'exercice est la premi\xe8re question de la s\xe9ance",id:"savoir-si-lexercice-est-la-premi\xe8re-question-de-la-s\xe9ance"},{depth:2,value:"Cas d'usage",id:"cas-dusage"}];function l(e){let n=Object.assign({h1:"h1",p:"p",code:"code",h2:"h2",ul:"ul",li:"li"},(0,a.a)(),e.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{children:"M\xe9ta-Donn\xe9es d'un Exercice"}),"\n",(0,i.jsxs)(n.p,{children:["Durant le cycle de vie d'un exercice, la plateforme va g\xe9n\xe9rer des m\xe9ta-donn\xe9es pour tracer l'activit\xe9 de l'apprenant et vous fournir des informations sur l'exercice.\nCes m\xe9ta-donn\xe9es sont utilisables \xe0 l'int\xe9rieur de tous les scripts de la sandbox (",(0,i.jsx)(n.code,{children:"builder"}),", ",(0,i.jsx)(n.code,{children:"grader"}),", ",(0,i.jsx)(n.code,{children:"hint.next"})," etc.) et sont accessibles via la variable ",(0,i.jsx)(n.code,{children:"meta"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"nombre-total-de-tentatives",children:"Nombre total de tentatives"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.attemps"})," : Le nombre de fois que l'apprenant a essay\xe9 de r\xe9soudre l'exercice. Seulement les tentatives valides (grade >= 0) sont comptabilis\xe9es. Cette valeur est remise \xe0 0 \xe0 chaque fois que l'\xe9l\xe8ve choisit de changer la question."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.totalAttemps"})," : La somme de toutes les tentatives valides. Cette valeur n'est pas remise \xe0 0 \xe0 chaque fois que l'\xe9l\xe8ve choisit de changer la question."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"la-liste-des-notes-obtenues",children:"La liste des notes obtenues"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.grades"})," : La liste des notes obtenues par l'apprenant de la premi\xe8re \xe0 la derni\xe8re tentative."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.grades[0]"})," : La note de la premi\xe8re tentative."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.grades[meta.grades.length - 1]"})," : La note de la derni\xe8re tentative."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"savoir-si-des-aides-ont-\xe9t\xe9-demand\xe9es",children:"Savoir si des aides ont \xe9t\xe9 demand\xe9es"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.consumedHints"})," : Le nombre d'aides demand\xe9es par l'apprenant. Cette valeur est remise \xe0 0 \xe0 chaque fois que l'\xe9l\xe8ve choisit de changer la question."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"savoir-si-la-solution-a-\xe9t\xe9-affich\xe9e",children:"Savoir si la solution a \xe9t\xe9 affich\xe9e"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.showSolution"})," : Un bool\xe9en qui indique si l'apprenant a affich\xe9 la solution ou non. Cette valeur est remise \xe0 ",(0,i.jsx)(n.code,{children:"false"})," \xe0 chaque fois que l'\xe9l\xe8ve choisit de changer la question."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"savoir-si-lexercice-est-la-premi\xe8re-question-de-la-s\xe9ance",children:"Savoir si l'exercice est la premi\xe8re question de la s\xe9ance"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"meta.isInitialBuild"})," : Un bool\xe9en \xe0 ",(0,i.jsx)(n.code,{children:"true"})," au lancement de l'exercice et d\xe9fini \xe0 ",(0,i.jsx)(n.code,{children:"false"})," \xe0 partir du moment o\xf9 l'apprenant change de question."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"cas-dusage",children:"Cas d'usage"}),"\n",(0,i.jsx)(n.p,{children:"En utilisant ces m\xe9ta-donn\xe9es, vous pouvez par exemple afficher un message d'encouragement \xe0 l'apprenant lorsqu'il r\xe9ussit l'exercice du premier coup, faire des exercices de plus en plus difficiles en fonctions des derni\xe8res notes..."}),"\n",(0,i.jsx)(r.UW,{type:"info",children:(0,i.jsxs)(n.p,{children:["Pour afficher le contenu des m\xe9tadonn\xe9es, vous pouvez utiliser le filtre ",(0,i.jsx)(n.code,{children:"dump"})," de nunjucks \xe0 l'int\xe9rieur de l'une des cl\xe9s d'affichage (",(0,i.jsx)(n.code,{children:"form"}),", ",(0,i.jsx)(n.code,{children:"statement"})," etc.). Par exemple : ",(0,i.jsx)(n.code,{children:"{{ meta | dump(2) }}"})]})}),"\n",(0,i.jsx)(r.UW,{type:"warning",children:(0,i.jsx)(n.p,{children:"Les m\xe9ta-donn\xe9es sont utilisables uniquement en lecture, toute modification de ces donn\xe9es sera ignor\xe9e par la\nplateforme."})})]})}n.default=(0,t.j)({MDXContent:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:n}=Object.assign({},(0,a.a)(),e.components);return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(l,{...e})}):l(e)},pageOpts:{filePath:"pages/main/programing/exercise/metadata.mdx",route:"/main/programing/exercise/metadata",frontMatter:{title:"M\xe9ta-Donn\xe9es d'un Exercice"},timestamp:1740846203e3,title:"M\xe9ta-Donn\xe9es d'un Exercice",headings:d},pageNextRoute:"/main/programing/exercise/metadata"})}},function(e){e.O(0,[2673,9774,2888,179],function(){return e(e.s=8191)}),_N_E=e.O()}]);