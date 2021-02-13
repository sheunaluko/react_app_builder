import React from 'react';
import {useState} from 'react' ; 
import { useTheme } from '@material-ui/core/styles';
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 

import EntityViewer from "./WikidataEntityViewer" 

let { Container, 
      Grid, 
      Paper, 
      AddCircleOutlineIcon,      
      Link, 
      TextField, 
      FormControl,
      Box, 
      FormHelperText, 
      Breadcrumbs, 
      Chip,
      FaceIcon, 
      IconButton, 
      Accordion,
      AccordionSummary, 
      AccordionDetails,
      ExpandMoreIcon, 
      CircularProgress, 
      Icon, 
      InfoIcon, 
      InputLabel,
      OutlinedInput, 
      InputAdornment, 
      DoneIcon,
      Avatar,
      Button, 
      Visibility, 
      VisibilityOff, 
      Typography } = mui 



const fp = tsw.util.common.fp
const apis = tsw.apis 
const log = console.log 
const debug = tsw.util.common.debug 

type OptionObject = { 
    label : string 
} 

let default_options : OptionObject[] =  []

/* 
 APIS 
*/ 

declare var Object : any ; 
declare var window : any ;

const wiki_search_id = "wiki-search-input" 

function automate_wiki_search(q : string) { 
    
    /* 
       Interesting discussion here about programmatically triggering onChange for react input elements 
       https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04
     */ 
    let input = (document.getElementById(wiki_search_id) as any) 
    if (input) { 
	var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
	nativeInputValueSetter.call(input, q);
	var inputEvent = new Event('input', { bubbles: true});
	input.dispatchEvent(inputEvent);
    } 
    
} 

debug.add("fn.wiki_search" , automate_wiki_search) 

function Component() { 

    const theme = useTheme();

    let init_state : any = { 
	options : default_options, 
	selected : false , 
    }
    
    var [state, setState] = useState(init_state);
    
    let inputChanged = fp.make_debouncer(500, async function(args : any[]) {
	// --  
	// should search the endpoint to get a list of options objects 
	log("Input changed!")  
	log(args[0]) 
	
	log("Querying wikidata..")
	
	if (fp.is_empty(args[0])) { 
	    log("Ignoring empty")
	    return 
	} 
	
	let result = await apis.wikidata.WikidataSearchAsList(args[0]) 
	
	debug.add("wiki_query" , result) 
	
	setState( { ...state, 
		    options :  result  ,
		    selected : false, 
	}) 
	
    }) 
    
    
    let setSelected = function(s : any) {
	setState( { ...state, 
		    selected : s } ) 
    } 
    
    let SearchResults = () => ( 

	<Grid container spacing={3}>
	    { 
		state.options.map(function(option :any ){ 
		    return ( 
			<Grid key={option.id} item xs={12} >
			    <SearchCard option={option} setSelected={setSelected}  /> 
			</Grid>
		    ) 
		    
		})
	    } 
	</Grid>


    ) 
    
    return (
	<Container style={{marginTop : "1%" , height: "100%" 
	    
	}}>
	    
	    <div style={{ width : "100%" , 
			  height : "100%" , 
			  backgroundColor : theme.palette.grey[100] , 
			  padding : "1%" , 
			  borderRadius : "15px"  , 
			  display : "flex" , 
			  flexDirection : "column" 
		
 	    }}>
		
	        <br/> 
		
		<Box style={{display:"flex" , flexDirection : "row"}}>
		    <Box>
			<FormControl fullWidth variant="outlined">
			    <InputLabel htmlFor="outlined-adornment-amount">Search</InputLabel>
			    <OutlinedInput
			    id={wiki_search_id}
			    onChange={ function(e:any) {
				    
				    let val = e.target.value
				    //setState({...state,textFieldText : val})
				    inputChanged([val])
				    
				}}
			    startAdornment={<InputAdornment position="start">></InputAdornment>}
			    labelWidth={60}
			    />
			</FormControl>
		    </Box>
		    <Box style={{marginLeft : "4%" }}> 
			<Box style={{height : "100%" , display :'flex' , flexDirection : "column", justifyContent : 'center'}}> 
			<CircularProgress /> 
			</Box>
		    </Box>
		</Box>
		
		<br/> 
		
		<div style={{ flexGrow: 1 , padding : "2%", overflow : "auto",    }}>		
		    { 

			state.selected ? <EntityViewer qid={state.selected} /> : <SearchResults /> 
		    } 
		</div>			    
		
		
		
	    </div>  
	    
	</Container > 
    ) ; 
    

} 

export default Component ; 


function SearchCard(props : any) {
    
    var {option, setSelected} = props ; 

    let { 
	concepturi , 
	description, 
	id, 
	label, 
	url , 
	match,  //this and below not very interesting 
	pageid, 
	repository, 
	title
    }  = option  
    
    const theme = useTheme() 
    

    var [elevation,setElevation] = React.useState(1)    
    
    let activate = function() {
	setElevation(10) 
	
    } 
    
    let unactivate = function(){
	setElevation(1)
    } 
    
    return ( 
	<Paper
	    onMouseOver={()=> activate()}
	    onMouseOut={()=> unactivate() }
	    style={{padding: "2%" ,
		    backgroundColor : theme.palette.background.paper 
	    }}
	    elevation={elevation}
	    square={false}
	    onClick={
		function() {
		    log("Setting selected:  " + option.id) 
		    setSelected(option.id) 
		} 
	    } 

	> 
	    <div style={{display: "flex" ,
			 flexDirection : "row" }} > 
		
		<Typography style={{flexGrow: 1}} variant="h6" >
		    {option.label}
		</Typography>
		
	    </div>
	    
	    <Typography variant="subtitle1"> 
		{ option.description  }  
	    </Typography>
	    
	    
	    <br/>

	    <Link href={option.concepturi} > 
		{option.concepturi} 
	    </Link>		
	    
	    
	    

	    
	</Paper>
	
    ) 
    
} 
