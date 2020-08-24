import React from "react";
import { render } from "react-dom";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-github";


import * as  tsw from "tidyscripts_web" 

let debug = tsw.util.common.debug 

function onChange(newValue : any) {
    //console.log("change", newValue);
}


/* 

   TODO: add a function for updating the content of the editor 
   using = > https://github.com/securingsincity/react-ace/blob/master/docs/FAQ.md
   
   
 */ 

function C(props : any) { 
    
    let { state, setState } = props.parentState ; 
    
    return ( 
	<AceEditor
	mode="mysql"
	width="100%"
	theme="github"
	onChange={onChange}
	name="sparql_editor"
	editorProps={{ $blockScrolling: true }}
	/> 
    ) 
} 


//export var editorRef : any = null 


export default function App(props : any) {     
    
    
    let editorRef : any  = React.createRef() 
    debug.add("ace.mount.ref", editorRef) 

    // @ts-ignore 
    let { state :parentState, setState : setParentState } = (props.parentState || {}) ; 
    
    let [state,setState ] = React.useState<any>({})
    
    //need to create a function that can update the sparql text 
    //and attach it to the parent state object 
	
    let updateSparqlText = function(s:string) {
	// set the text of the editor 
	editorRef.current.editor.session.getDocument().setValue(s) 
	debug.log("Attempted to set editor!") 

    } 
    
    React.useEffect( ()=> { 
	parentState.updateSparqlText = updateSparqlText //we add it but we dont cause any re-renders 
	parentState.editorRef = editorRef 
	debug.log("Updating parent state") 
	
    }, []) //only run once 
    
    
    //add the parent state to debug 
    debug.add("parentState.te_editor", parentState)
	
    return (
	<AceEditor
	ref={editorRef}
	debounceChangePeriod={500}
	mode="mysql"
	theme="github"
	name="ace_editor_sparql"
	onChange={(editorValue:string)=> setState({...state,editorValue })}
	editorProps={{ $blockScrolling: true }}
	/>
    ) 
}
    


