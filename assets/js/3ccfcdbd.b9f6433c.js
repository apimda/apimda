"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[318],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=n.createContext({}),c=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=c(e.components);return n.createElement(s.Provider,{value:t},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,s=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),m=c(r),u=a,f=m["".concat(s,".").concat(u)]||m[u]||d[u]||o;return r?n.createElement(f,l(l({ref:t},p),{},{components:r})):n.createElement(f,l({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,l=new Array(o);l[0]=u;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[m]="string"==typeof e?e:a,l[1]=i;for(var c=2;c<o;c++)l[c]=r[c];return n.createElement.apply(null,l)}return n.createElement.apply(null,r)}u.displayName="MDXCreateElement"},5669:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>m,frontMatter:()=>o,metadata:()=>i,toc:()=>c});var n=r(7462),a=(r(7294),r(3905));const o={},l="Controllers",i={unversionedId:"controllers/index",id:"controllers/index",title:"Controllers",description:"Controllers are typescript classes that are decorated with @Controller(). Instance methods on a controller class can",source:"@site/docs/controllers/index.md",sourceDirName:"controllers",slug:"/controllers/",permalink:"/apimda/docs/controllers/",draft:!1,editUrl:"https://github.com/joemays/apimda/tree/main/docs/docs/controllers/index.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Quick Start",permalink:"/apimda/docs/introduction/quick-start"},next:{title:"Routes",permalink:"/apimda/docs/controllers/routes"}},s={},c=[],p={toc:c};function m(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"controllers"},"Controllers"),(0,a.kt)("p",null,"Controllers are typescript classes that are decorated with ",(0,a.kt)("inlineCode",{parentName:"p"},"@Controller()"),". Instance methods on a controller class can\nhandle incoming requests. For example, the ",(0,a.kt)("inlineCode",{parentName:"p"},"hello")," method below will handle requests to ",(0,a.kt)("inlineCode",{parentName:"p"},"GET /sample/hello"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"@Controller('/sample')\nclass SampleController {\n  @Get('/hello')\n  async hello(): Promise<string> {\n    return 'hi from apimda!';\n  }\n}\n")),(0,a.kt)("p",null,"It's pretty much that simple. The rest of this section will describe in detail how apimda handles requests and\nresponses."),(0,a.kt)("admonition",{title:"Declarative REST APIs",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Creating REST APIs from code-based metadata is a well-established pattern that's been implemented in many languages\nand libraries, for example:"),(0,a.kt)("ul",{parentName:"admonition"},(0,a.kt)("li",{parentName:"ul"},"Java (",(0,a.kt)("a",{parentName:"li",href:"https://www.dropwizard.io/"},"Dropwizard"),"\n, ",(0,a.kt)("a",{parentName:"li",href:"https://docs.spring.io/spring-framework/docs/current/reference/html/web.html"},"Spring MVC"),", ...)"),(0,a.kt)("li",{parentName:"ul"},"Python (",(0,a.kt)("a",{parentName:"li",href:"https://palletsprojects.com/p/flask/"},"Flask"),", ",(0,a.kt)("a",{parentName:"li",href:"https://fastapi.tiangolo.com/"},"FastAPI"),", ...)"),(0,a.kt)("li",{parentName:"ul"},"C# (",(0,a.kt)("a",{parentName:"li",href:"https://docs.microsoft.com/aspnet/mvc/"},"ASP.NET MVC"),", ...)"),(0,a.kt)("li",{parentName:"ul"},"Node (",(0,a.kt)("a",{parentName:"li",href:"https://docs.nestjs.com/"},"NestJS"),", ...)"),(0,a.kt)("li",{parentName:"ul"},"...and plenty more")),(0,a.kt)("p",{parentName:"admonition"},"While this might not be the right paradigm for all web requests, it handles a large subset of them rather elegantly. We\nfind it an especially nice fit for the kind of APIs that are well-suited to be deployed as serverless functions."),(0,a.kt)("p",{parentName:"admonition"},"Developers that are familiar with any one of these other libraries should find apimda straightforward and simple to work\nwith. As always, if you notice a discrepancy or missing feature, we welcome ",(0,a.kt)("a",{parentName:"p",href:"/docs/contributions"},"contributions"),"!")))}m.isMDXComponent=!0}}]);