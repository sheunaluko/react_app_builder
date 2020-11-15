import * as tsw from "tidyscripts_web";
import  * as _smgr from "./state_manager" 


//probably a slightly better way to do these exports 
export var  smgr  = _smgr 

let hlm = tsw.hyperloop.main;
let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let debug = tsw.util.common.debug;
declare var window: any;



// --- 

wikidata.all_predicates() 

export function log(msg : string) { 
    console.log("[mk]:: " + msg) 
} 


/*
  
  Hijack the console.log function and route things 
  Nevermind wont do that now. .. 
  
 */





export async function get_http(url : string,args : any = {}) {
    return (await hlm.http(url,args)) 
} 


const documentation_base = "https://alukosheun.gitbook.io/medkit/documentation/components/" 


export async function get_documentation(name : string) { 
    let url = documentation_base + name 
    return get_http(url)
} 


export async function define(vname : string, f : any ) {
    let result = await f  
    window[vname] = result 
    log("Defined: " + vname) 
} 

export function create_iframe(id:string) {
    let i =  document.createElement('iframe') 
    return i 
} 


export function set_html_of_iframe(fr : any, html : string) { 
    fr.src = "data:text/html;charset=utf-8," + escape(html);  
    return fr 
} 
