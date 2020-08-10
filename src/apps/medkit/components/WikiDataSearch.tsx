import React from 'react';
import {useState} from 'react' ; 


import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';




import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { useTheme } from '@material-ui/core/styles';


import * as tsw from "tidyscripts_web" 

let fp = tsw.util.common.fp
let apis = tsw.apis 

let log = console.log 

type OptionObject = { 
    label : string 
} 

let default_options : OptionObject[] =  []

function Component() { 

    const theme = useTheme();

    
    var [state, setState] = useState({ 
	options : default_options, 
	loading : false ,  
    });
    
    let inputChanged = fp.make_debouncer(500, async function(args : any[]) {
	// --  
	// should search the endpoint to get a list of options objects 
	log("Input changed!")  
	log(args[0]) 
	
	
	let result = await apis.mesh.mesh_contains(args[0]) 
	
	let options = result.result.value 
	
	setState( { ...state, 
		    options :  options  ,
	}) 
	
    }) 
    
    
    return (
	<Container style={{marginTop : "10%" , height: "20%",
			   
	}}>
	    
	    <div style={{ width : "100%" , 
			  height : "100%" , 
			  backgroundColor : theme.palette.background.paper , 
			  padding : "7px" , 
 	    }}>
		
		<Typography variant="h4" > 
		    Wikidata Entity Selector  
		</Typography>
		
		<Autocomplete
		    id="combo-box-demo"
		    options={state.options}
		    getOptionLabel={(option) => option.label}
		    fullWidth={true}
		    onInputChange={
			function(e : object , value : string) { 
			    //console.log(value) 
			    inputChanged([value])
			} 
			//
		    }

		    renderInput={(params) => <TextField {...params} label="Search Wikidata..." variant="outlined" />}
		/>	
		
		
	    </div>  
	    
	</Container > 
    ) ; 
    

} 


export default Component ; 
