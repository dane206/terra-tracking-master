(function(){
if(window.__terra_debug_loaded__)return;
window.__terra_debug_loaded__=true;

function log(){console.log('%c[Terra Debug]','background:#1a73e8;color:#fff;padding:2px 4px;border-radius:2px',...arguments)}

function checkItems(params){
var issues=[];
if(!params.items||!Array.isArray(params.items)||params.items.length===0){
issues.push("❌ Missing items[]");
return issues;
}
params.items.forEach(function(item,i){
if(!item.item_id)issues.push("❌ items["+i+"] missing item_id");
if(!item.item_name)issues.push("❌ items["+i+"] missing item_name");
if(item.price==null)issues.push("⚠️ items["+i+"] missing price");
if(item.quantity==null)issues.push("⚠️ items["+i+"] missing quantity");
});
return issues;
}

function summarize(event,params,source){
params=params||{};
var issues=[];
if(params.items)issues=issues.concat(checkItems(params));
if(params.value==null)issues.push("⚠️ Missing value");
if(!params.currency)issues.push("⚠️ Missing currency");

console.groupCollapsed("[Terra] "+event+" ("+source+")");
console.log("params:",params);
if(issues.length){console.warn("Issues:",issues)}
else{console.log("✅ Payload looks valid")}
console.groupEnd();
}

function hookGtag(){
if(window.__terra_gtag_hook__)return;
var old=window.gtag||function(){};
window.gtag=function(){
var args=[].slice.call(arguments);
if(args[0]==='event'){
summarize(args[1],args[2],'gtag');
}
log("gtag()",args);
return old.apply(this,args);
};
window.__terra_gtag_hook__=true;
log("gtag hooked");
}

function hookDL(){
window.dataLayer=window.dataLayer||[];
if(window.__terra_dl_hook__)return;
var oldPush=window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push=function(){
var args=[].slice.call(arguments);
args.forEach(function(obj){
if(typeof obj==='object'&&obj.event){
summarize(obj.event,obj,'dataLayer');
}
});
log("dataLayer.push()",args);
return oldPush.apply(window.dataLayer,args);
};
window.__terra_dl_hook__=true;
log("dataLayer hooked");
}

hookGtag();
hookDL();

log("Terra Event Debugger active");

})();