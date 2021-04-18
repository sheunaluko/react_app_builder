

import * as tsw from "tidyscripts_web" 

let fp = tsw.util.common.fp 



export async function load_word_set(name : string) {
    /* load words from localStorage */ 
    let words =  tsw.apis.local_storage.get(name)
    if (words) {
	console.log(`Getting ${name} words`)
	console.log(words) 
	return words
    } else {
	console.log(`No ${name} words found`) 
	return [] 
    } 
} 

export async function set_word_set(name : string ,value : any) {
    /* set words from localStorage */ 
    console.log("Setting word set for name: " + name) 
    console.log(value) 
    tsw.apis.local_storage.store(value,name) 
} 


export var articles = [ "a", "an" , "the" ] 
export var pronouns = [ "me" ,"my", "mine" , "myself", 
			"we","us","our","ours","ourselves",
			"your","your","yours","yourself","yourselves", 
			"him","his","himself",
			"her","hers","herself",
			"it","its","itself" , 
			"they","them","their","theirs"] 
export var aux_filter = [ 
    "and" ,"to", "was","a", "in","this","there","at",
    "of" ,"the", "that", "then", "an" , "but", 
    "on" ,"with" ,"from", "or", "back" , "were", 
    "did" ,"wasn't" ,"that's" , "for" , "is" , "not","would" ,
]

export var default_filter = ([articles,pronouns,aux_filter]).reduce( fp.concat, [])
default_filter.sort()


declare var window : any;
window.au = {
    articles, pronouns, aux_filter, default_filter 
} 
