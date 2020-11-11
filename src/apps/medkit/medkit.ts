import * as tsw from "tidyscripts_web";
import  * as _smgr from "./state_manager" 

export var  smgr  = _smgr 


let hlm = tsw.hyperloop.main;
let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let debug = tsw.util.common.debug;
declare var window: any;



// --- 


export function log(msg : string) { 
    console.log("[mk]:: " + msg) 
} 



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
