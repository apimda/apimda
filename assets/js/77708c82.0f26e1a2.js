"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[90],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var a=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=a.createContext({}),l=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},c=function(e){var t=l(e.components);return a.createElement(s.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,s=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),m=l(n),d=o,h=m["".concat(s,".").concat(d)]||m[d]||u[d]||r;return n?a.createElement(h,i(i({ref:t},c),{},{components:n})):a.createElement(h,i({ref:t},c))}));function h(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,i=new Array(r);i[0]=d;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[m]="string"==typeof e?e:o,i[1]=p;for(var l=2;l<r;l++)i[l]=n[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},8441:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>m,frontMatter:()=>r,metadata:()=>p,toc:()=>l});var a=n(7462),o=(n(7294),n(3905));const r={sidebar_position:4},i="Open API",p={unversionedId:"openapi",id:"openapi",title:"Open API",description:"Apimda can generate, with some caveats, complete Open API 3.1 documentation.",source:"@site/docs/openapi.md",sourceDirName:".",slug:"/openapi",permalink:"/docs/openapi",draft:!1,editUrl:"https://github.com/joemays/apimda/tree/main/docs/docs/openapi.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"NpmLayerVersion",permalink:"/docs/deployment/layers"},next:{title:"Contributions",permalink:"/docs/contributions"}},s={},l=[{value:"Command Line Tool",id:"command-line-tool",level:2},{value:"Configuration File",id:"configuration-file",level:2},{value:"@Tags",id:"tags",level:2}],c={toc:l};function m(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"open-api"},"Open API"),(0,o.kt)("p",null,"Apimda can generate, with some caveats, complete Open API 3.1 documentation."),(0,o.kt)("p",null,"For the most part, the same information present in the controller and method decorators is exactly what's needed for\nthis documentation. Additional information may be provided via a ",(0,o.kt)("a",{parentName:"p",href:"#configuration-file"},"configuration file"),"."),(0,o.kt)("h2",{id:"command-line-tool"},"Command Line Tool"),(0,o.kt)("p",null,"To generate an Open API v3.1 specification in JSON format, use the ",(0,o.kt)("inlineCode",{parentName:"p"},"api")," command in the ",(0,o.kt)("inlineCode",{parentName:"p"},"apimda")," command line tool, with\nthe path to your ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json")," file:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"apimda api path/to/my/tsconfig.json\n")),(0,o.kt)("p",null,"You can also customize the output path for the JSON document or provide the path to a\nnon-standard ",(0,o.kt)("a",{parentName:"p",href:"#configuration-file"},"configuration file"),". For a description of all parameters and options, use ",(0,o.kt)("inlineCode",{parentName:"p"},"help"),"\ncommand:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sh"},"apimda help api\n")),(0,o.kt)("h2",{id:"configuration-file"},"Configuration File"),(0,o.kt)("p",null,"To provide additional information for Open API generation, create a configuration file called ",(0,o.kt)("inlineCode",{parentName:"p"},"apimda.config.js")," in the\nsame directory as your ",(0,o.kt)("inlineCode",{parentName:"p"},"tsconfig.json"),", and the CLI will pick it up automatically. Alternatively, you can provide the\nfull path to the configuration file as a CLI argument."),(0,o.kt)("p",null,"Currently, the following may be provided in an ",(0,o.kt)("inlineCode",{parentName:"p"},"openApi")," property in the configuration file:"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#info-object"},"Info Object")," to provide API metadata"),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#server-object"},"Server Objects")," to provide endpoints"),(0,o.kt)("li",{parentName:"ol"},"Path-level ",(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#security-requirement-object"},"Security Requirements")," to specify which\nsecurity scheme(s) to use for a specific path/operation (see 'security'\nin ",(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#operation-object"},"Operation Object"),")"),(0,o.kt)("li",{parentName:"ol"},(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#security-scheme-object"},"Security Schemes")," (in components object) to specify\navailable security schemes."),(0,o.kt)("li",{parentName:"ol"},"Top-level ",(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#security-requirement-object"},"Security Requirements")," to declare which\nsecurity mechanisms can be used across the API (see 'security'\nin ",(0,o.kt)("a",{parentName:"li",href:"https://spec.openapis.org/oas/v3.1.0#openapi-object"},"OpenAPI Object"),")")),(0,o.kt)("p",null,"Additionally, if you are using security schemes, apimda needs to know the name of the security scheme to use. You must\nprovide this name in ",(0,o.kt)("inlineCode",{parentName:"p"},"apimdaSecuritySchemeName")," property of the configuration file."),(0,o.kt)("p",null,"A full example is below (notice that it is a partial Open API document):"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"module.exports = {\n  openApi: {\n    info: {\n      title: 'Sample Pet Store App',\n      summary: 'A pet store manager.',\n      description: 'This is a sample server for a pet store.',\n      termsOfService: 'https://example.com/terms/',\n      contact: {\n        name: 'API Support',\n        url: 'https://www.example.com/support',\n        email: 'support@example.com'\n      },\n      license: {\n        name: 'Apache 2.0',\n        url: 'https://www.apache.org/licenses/LICENSE-2.0.html'\n      },\n      version: '1.0.1'\n    },\n    servers: [\n      {\n        url: 'https://development.gigantic-server.com/v1',\n        description: 'Development server'\n      },\n      {\n        url: 'https://staging.gigantic-server.com/v1',\n        description: 'Staging server'\n      }\n    ],\n    paths: {\n      '/pets': {\n        get: {\n          security: [{ petsSecurityScheme: ['read:pets'] }]\n        },\n        post: {\n          security: [{ petsSecurityScheme: ['write:pets'] }]\n        }\n      }\n    },\n    components: {\n      securitySchemes: {\n        petsSecurityScheme: {\n          type: 'oauth2',\n          flows: {\n            implicit: {\n              authorizationUrl: 'https://example.org/api/oauth/dialog',\n              scopes: {\n                'write:pets': 'modify pets in your account',\n                'read:pets': 'read your pets'\n              }\n            }\n          }\n        }\n      }\n    },\n    security: [\n      {\n        petstore_auth: ['write:pets', 'read:pets']\n      }\n    ]\n  }\n};\n")),(0,o.kt)("h2",{id:"tags"},"@Tags"),(0,o.kt)("p",null,"Open API uses tags to help organize (group or search) your API methods. You can provide them directly in your controller\nwith the ",(0,o.kt)("inlineCode",{parentName:"p"},"@Tags")," decorator."),(0,o.kt)("p",null,"It's generally recommended to provide tags for each controller, however you can add additional tags to any method."),(0,o.kt)("p",null,"In the example below, the ",(0,o.kt)("inlineCode",{parentName:"p"},"findById")," method will be tagged only with ",(0,o.kt)("inlineCode",{parentName:"p"},'"pets"')," from the controller. The ",(0,o.kt)("inlineCode",{parentName:"p"},"findAll")," method,\nhowever, will have both ",(0,o.kt)("inlineCode",{parentName:"p"},'"pets"')," and ",(0,o.kt)("inlineCode",{parentName:"p"},'"another_tag"')," associated with it."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"@Tags('pets')\n@Controller('/pets')\nexport class PetController {\n  @Get('/{id}')\n  async findById(@Path() id: string): Promise<Pet> {\n    // findById only has \"pets\" tag\n  }\n\n  @Get()\n  @Tags('another_tag')\n  async findAll(): Promise<Pet[]> {\n    // findAll has two tags: \"pets\" and \"another_tag\"\n  }\n}\n")))}m.isMDXComponent=!0}}]);