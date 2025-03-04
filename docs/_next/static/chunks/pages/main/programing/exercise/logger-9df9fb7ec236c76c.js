(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7511],{502:function(n,e,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/main/programing/exercise/logger",function(){return s(1833)}])},1833:function(n,e,s){"use strict";s.r(e),s.d(e,{__toc:function(){return r},default:function(){return c}});var i=s(5893),o=s(2673),t=s(2643),a={src:"/platon/docs//_next/static/media/platon_log.c70e8af2.png",height:726,width:676,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAICAIAAAC6ZnJRAAAAk0lEQVR42h1LSw6CUBB780FIhKVbJV7S6GHkOLiQuHOv8QSY+B4wzDjQNG3atND3X2ZizogwBEAEVYVxHCGYBQjBCBEJvWRRGNIEyPnG1GadVGdjkcl8ZpIGd3CCGX/er5gigOdFfF9VFTfN9da2IhLjj7Ps0XWn84WLIt+WZUoJiZh5Xx9d4d4968MOkZb/CjP7A4cpSNZQ5lYVAAAAAElFTkSuQmCC",blurWidth:7,blurHeight:8};let r=[{depth:3,value:"La Fonction platon_log",id:"la-fonction-platon_log"},{depth:4,value:"Syntaxe de base",id:"syntaxe-de-base"}];function l(n){let e=Object.assign({h1:"h1",h3:"h3",code:"code",p:"p",h4:"h4",pre:"pre",span:"span",img:"img"},(0,t.a)(),n.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.h1,{children:"D\xe9bogage d'exercice : logger"}),"\n",(0,i.jsxs)(e.h3,{id:"la-fonction-platon_log",children:["La Fonction ",(0,i.jsx)(e.code,{children:"platon_log"})]}),"\n",(0,i.jsx)(e.p,{children:"La fonction platon_log permet d'afficher des informations dans un terminal\nd\xe9di\xe9 pendant la pr\xe9visualisation d'un exercice. Elle peut \xeatre utilis\xe9e dans le builder et le grader."}),"\n",(0,i.jsx)(e.h4,{id:"syntaxe-de-base",children:"Syntaxe de base"}),"\n",(0,i.jsx)(e.pre,{"data-language":"py","data-theme":"default",children:(0,i.jsx)(e.code,{"data-language":"py","data-theme":"default",children:(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"platon_log"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"(message)"})]})})}),"\n",(0,i.jsx)(e.p,{children:"Par exemple:"}),"\n",(0,i.jsx)(e.pre,{"data-language":"py","data-theme":"default",children:(0,i.jsxs)(e.code,{"data-language":"py","data-theme":"default",children:[(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"builder"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-comment)"},children:"#!lang=python"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"import"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" random"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"a "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" random"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"."}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"randint"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"("}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:", "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"10"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:")"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"b "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" random"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"."}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"randint"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"("}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"1"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:", "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"10"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:")"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"platon_log"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"("}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"f"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"Valeurs g\xe9n\xe9r\xe9es : a='}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"{"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"a"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:", b="}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"{"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"b"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:")"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:"resultat "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"="}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" a "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"+"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-color-text)"},children:" b"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-function)"},children:"platon_log"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"("}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"f"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"""\xc9tat des variables :'})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"- a = "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"{"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"a"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"}"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"- b = "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"{"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"b"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"}"})]}),"\n",(0,i.jsxs)(e.span,{className:"line",children:[(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:"- r\xe9sultat = "}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"{"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:"resultat"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-constant)"},children:"}"}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-string-expression)"},children:'"""'}),(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-punctuation)"},children:")"})]}),"\n",(0,i.jsx)(e.span,{className:"line",children:(0,i.jsx)(e.span,{style:{color:"var(--shiki-token-keyword)"},children:"=="})})]})}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{alt:"R\xe9sultat de l'exercice",placeholder:"blur",src:a})})]})}var c=(0,o.j)({MDXContent:function(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:e}=Object.assign({},(0,t.a)(),n.components);return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(l,{...n})}):l(n)},pageOpts:{filePath:"pages/main/programing/exercise/logger.mdx",route:"/main/programing/exercise/logger",frontMatter:{title:"D\xe9bogage d'exercice",description:"Guide d'utilisation de la fonction platon_log pour le d\xe9bogage des exercices PLaTon, permettant d'afficher des informations dans un terminal d\xe9di\xe9 pendant la pr\xe9visualisation."},timestamp:1740905922e3,title:"D\xe9bogage d'exercice",headings:r},pageNextRoute:"/main/programing/exercise/logger"})}},function(n){n.O(0,[2673,9774,2888,179],function(){return n(n.s=502)}),_N_E=n.O()}]);