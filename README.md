###Explain.angular

> angular Js brings a lot of new concepts ( or at-least for me ) into the javascript world but as cool as they look without knowing internal working of them it become increasingly frustrating to reason with them. this project is an attempt to decipher major component of angular and implement their simpler version for better developer understanding

> a lot of code in this project is inspired by Tero Parviainen http://teropa.info/build-your-own-angular book. which is simply an outstanding resource for any javascipt developer.

###Dependencies Injectection Framework: 

>angular's DI framework is defiantly an interesting take on dependencies management in javascript projects. as DI is arguably most important and confusing aspect of angular, expalin.angular re-implement pretty much the whole thing. 

>relevant code can be found in loader.js and injector.js

###Scope/2way-binding/Digest-cycle

> Digest cycle (2 way binding) is surely most mystic and performance sensitive feature of angular. as a result it can seriously cut down number of lines of code we need to write but if not approached carefully can cause serious performance penalty as well.

>explain.angular implements crux of dirty checking, watcher, digest and scope inheritance while leaving several performance optimization that angular uses. relevant code can be found in scope.js

###expression
	
>angular expression is pretty much a language in itself. Explain.angualr implements a smaller version of it.relevant code can be found in parse.js 

###Directives 

>angular directive is again one of those magical and opinionated feature which separate it from the rest of the framework  but under the hood it is a compiler in itself and simpler version of the same could be found in complie.js



