(function(){var _namespaces={};var _imported={};var _loading={};var _classPaths={};var _classInfo={};var _classDependencyList=[];var _mixinCount=0;var _mixinDependencies=null;var _evalScript=function(script){var _namespaces=undefined;var _imported=undefined;var _loading=undefined;var _classPaths=undefined;var _classInfo=undefined;var _classDependencyList=undefined;var _mixinCount=undefined;var _mixinDependencies=undefined;var _evalScript=undefined;var _appendConstructor=undefined;arguments=undefined;eval.call(window,script)};var _appendConstructor=function(baseConstructor,mixinConstructor){var constructor=function(){baseConstructor.apply(this,arguments);mixinConstructor.call(this)};return constructor};var jg_namespace=window.jg_namespace=function(path,closure){if(path==null){throw new Error("Parameter path must be non-null.")}if(typeof path!=="string"){throw new Error("Parameter path must be a string.")}if((closure!=null)&&(typeof closure!=="function")){throw new Error("Parameter closure must be a function.")}var ns=_namespaces[path];if(!ns){var subPaths=path?path.split("."):[];var subPath;var scope;ns=window;for(var i=0,l=subPaths.length;i<l;i++){subPath=subPaths[i];scope=ns[subPath];if(!scope){scope=ns[subPath]={}}ns=scope}_namespaces[path]=ns}if(closure){closure.call(ns,ns)}return ns};var jg_import=window.jg_import=function(path){if(path==null){throw new Error("Parameter path must be non-null.")}if(typeof path!=="string"){throw new Error("Parameter path must be a string.")}if(!path){throw new Error("Parameter path must be non-empty.")}var c=_imported[path];if(!c){if(_loading[path]){throw new Error("Recursive dependency on class "+path+".")}var classInfo={};var nsIndex=path.lastIndexOf(".");var nsPath=(nsIndex<0)?"":path.substring(0,nsIndex);var cPath=(nsIndex<0)?path:path.substring(nsIndex+1);var ns=jg_namespace(nsPath);c=ns[cPath];if(!c){try{_loading[path]=true;var filePath=jg_import.getClassPath(path)+".js";var script=null;try{var xhr=window.ActiveXObject?new window.ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();xhr.open("GET",filePath,false);xhr.send(null);if((xhr.status==200)||(xhr.status==0)){script=xhr.responseText}}catch(e){}if(script==null){throw new Error("Failed to load class "+path+".")}_evalScript(script);c=ns[cPath];if(!c){throw new Error("Failed to initialize class "+path+".")}classInfo.src=filePath;classInfo.script=script}finally{delete _loading[path]}}classInfo.path=path;classInfo.reference=c;_classInfo[path]=classInfo;_classDependencyList.push(path);_imported[path]=c}return c};jg_import.setClassPath=function(path,dir){if(path==null){throw new Error("Parameter path must be non-null.")}if(typeof path!=="string"){throw new Error("Parameter path must be a string.")}if(dir==null){throw new Error("Parameter dir must be non-null.")}if(typeof dir!=="string"){throw new Error("Parameter dir must be a string.")}_classPaths[path]=dir};jg_import.getClassPath=function(path){if(path==null){throw new Error("Parameter path must be non-null.")}if(typeof path!=="string"){throw new Error("Parameter path must be a string.")}var classPathList=[];var classPath;for(classPath in _classPaths){if(_classPaths.hasOwnProperty(classPath)){classPathList.push(classPath)}}classPathList.sort();for(var i=classPathList.length-1;i>=0;i--){classPath=classPathList[i];if(path.substring(0,classPath.length)===classPath){return _classPaths[classPath]+path.substring(classPath.length).replace(/\./g,"/")}}return path.replace(/\./g,"/")};jg_import.getClassInfo=function(path){if((path!=null)&&(typeof path!=="string")){throw new Error("Parameter path must be a string.")}if(!path){var classInfoList=[];for(var i=0,l=_classDependencyList.length;i<l;i++){classInfoList.push(jg_import.getClassInfo(_classDependencyList[i]))}return classInfoList}var classInfo=_classInfo[path];if(!classInfo){return null}var classInfo2={};classInfo2.path=classInfo.path;classInfo2.reference=classInfo.reference;if(classInfo.src!=null){classInfo2.src=classInfo.src}if(classInfo.script!=null){classInfo2.script=classInfo.script}return classInfo2};var jg_extend=window.jg_extend=function(baseClass,closure){if(baseClass==null){throw new Error("Parameter baseClass must be non-null.")}if(typeof baseClass!=="function"){throw new Error("Parameter baseClass must be a class.")}if((closure!=null)&&(typeof closure!=="function")){throw new Error("Parameter closure must be a function.")}var constructor=baseClass;var base=baseClass.prototype;baseClass=function(){};baseClass.prototype=base;var c=function(){constructor.apply(this,arguments)};var proto=c.prototype=new baseClass();proto.constructor=c;if(closure){closure.call(proto,c,base,proto);if(c.prototype!==proto){throw new Error('Class member "prototype" cannot be overridden.')}if(proto.constructor!==c){if(typeof proto.constructor!=="function"){throw new Error('Instance member "constructor" must be a function.')}constructor=proto.constructor;proto.constructor=c}}return c};var jg_static=window.jg_static=function(closure){if((closure!=null)&&(typeof closure!=="function")){throw new Error("Parameter closure must be a function.")}var c={};if(closure){closure.call(c,c)}return c};var jg_mixin=window.jg_mixin=function(target,source,base){if(target==null){throw new Error("Parameter target must be non-null.")}if(source==null){throw new Error("Parameter source must be non-null.")}var id=source.__jg_mixin_id;if(!id){id=source.__jg_mixin_id="#"+(++_mixinCount)}id="__jg_mixin_has_"+id;if(target[id]){return base}var baseConstructor=((base!=null)&&base.hasOwnProperty("constructor")&&(typeof base.constructor==="function"))?base.constructor:function(){};var baseClass=function(){};baseClass.prototype=target.__proto__||Object.prototype;base=new baseClass();base.constructor=baseConstructor;var member;var mixin=source.mixin;if((mixin!=null)&&(typeof mixin==="function")){var mixinBase=new baseClass();for(member in target){if(target.hasOwnProperty(member)){mixinBase[member]=target[member]}}mixinBase.constructor=baseConstructor;try{if(!_mixinDependencies){_mixinDependencies=[]}_mixinDependencies.push(base);var constructor=target.constructor;mixin.call(target,mixinBase,target);if(target.constructor!==constructor){throw new Error('Target member "constructor" cannot be overridden.')}}finally{_mixinDependencies.pop();if(_mixinDependencies.length==0){_mixinDependencies=null}}}for(member in source){if(source.hasOwnProperty(member)&&(member!=="mixin")&&(member!=="constructor")&&(member.substring(0,2)!=="__")){target[member]=source[member]}}for(member in target){if(target.hasOwnProperty(member)&&(member!=="constructor")){base[member]=target[member]}}var sourceConstructor=(source.hasOwnProperty("constructor")&&(typeof source.constructor==="function"))?source.constructor:null;if(sourceConstructor){base.constructor=_appendConstructor(base.constructor,sourceConstructor);if(_mixinDependencies){var dependentMixin;for(var i=_mixinDependencies.length-1;i>=0;i--){dependentMixin=_mixinDependencies[i];dependentMixin.constructor=_appendConstructor(dependentMixin.constructor,sourceConstructor)}}}target[id]=true;return base};var jg_has_mixin=window.jg_has_mixin=function(target,source){if(target==null){throw new Error("Parameter target must be non-null.")}if(source==null){throw new Error("Parameter source must be non-null.")}var id=source.__jg_mixin_id;if(!id){return false}id="__jg_mixin_has_"+id;return(target[id]==true)};var jg_delegate=window.jg_delegate=function(scope,method){if(method==null){throw new Error("Parameter method must be non-null.")}var isMethodName=(typeof method==="string");if(isMethodName){if(scope==null){throw new Error("Parameter scope must be non-null.")}}else{if(typeof method!=="function"){throw new Error("Parameter method must be a string or a function.")}}var f=function(){if(!isMethodName){return method.apply(scope,arguments)}var m=scope[method];if(typeof m==="function"){return m.apply(scope,arguments)}return undefined};return f}})();