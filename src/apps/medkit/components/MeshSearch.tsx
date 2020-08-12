import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import { ObjectInspector, TableInspector } from "react-inspector";
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 

let { Container, 
      Grid, 
      Paper, 
      Link, 
      Typography } = mui 


let fp = tsw.util.common.fp
let apis = tsw.apis 
let log = console.log 

type OptionObject = { 
    label : string 
} 

let default_options : OptionObject[] = [ 
    /* 
       {label : "foo"}, 
       {label : "foo1"}, 
       {label : "foo2"}, 
       {label : "foo3"}, 
       {label : "foo4"},     
       {label : "foo11"}, 
       {label : "foo21"}, 
       {label : "foo31"}, 
       {label : "foo41"}, 
     */ 
    
]


interface ComponentState { 
    options : any[], 

    
} 

interface SelectedState { 
    selected : any[] ,     
} 

function Component() { 

    const theme = useTheme();
    
    let styles = { 
	paper: {
	    padding: theme.spacing(2),
	    textAlign: 'center',
	    color: theme.palette.text.secondary,
	},
    } 

    var [state, setState] = useState<ComponentState>({ 
	options : default_options , 

    });
    
    var [selectedState, setSelectedState ] = useState<SelectedState>({
	selected : [] , 	
    })
	
    
    
    
    let ts_ops = { 
	delay : 800,
	handler : async function(args : any[]) {
	    console.log("Will Mesh Search:: " + args[0]) 
	    
	    let result = await apis.mesh.mesh_contains(args[0])
	    if (!result.error) { 
		setState({ ...state , options : result.result.value }) 		
	    } 

	    
	} , 
	label : "MeSH" 
    }
    
    
    
    let TextSearch = () => util_components.DebouncedTextField(ts_ops) 
    
    let oa_ops = { 
	options : state.options , 
	renderer : function(x :any) {
	    
	    return util_components.ElevatedPaper(x) 
	    
	} , 
	cb : function(x :any) {
	    //when one of the options is selected 
	    console.log("Selected!")
	    console.log(x) 
	    selectedState.selected.push(x) 
	    setSelectedState( {...selectedState , selected : selectedState.selected }) 
	} 
    } 
    
    let OptionsArea = () => util_components.OptionsArea(oa_ops) 
    
    let SelectedEntities = () => util_components.SelectedEntities({ selectedState, 
								  setSelectedState})
    

    return (
	<Container style={{marginTop : "10%" , 
			   
	}}>
	    
	    <div style={{ width : "100%" , 
			  height : "100%" , 
			  backgroundColor : theme.palette.background.paper , 
			  padding : "7px" , 
 	    }}>
		
		<Typography variant="h4" > 
		    MeSH Entity Selector  
		</Typography>
		
		<SelectedEntities /> 
		
		<TextSearch /> 
		
		<br /> 
		
		<OptionsArea  /> 
		
		
		
	    </div>  
	    
	</Container > 
    ) ; 
    

} 


export default Component ; 
