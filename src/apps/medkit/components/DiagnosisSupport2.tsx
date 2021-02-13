import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./DiagnosisSupport2_Context";
//import WikiSearch from "./WikiDataSearch" ; 

//import { ObjectInspector, TableInspector } from "react-inspector";

let {
  Container,
  Grid,
  Paper,
  AddCircleOutlineIcon,
  Link,
  TextField,
  Box,
  FormControl,
  FormHelperText,
  Breadcrumbs,
  Tabs,
  Tab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress, 
  ExpandMoreIcon,
  CancelIcon, 
  FaceIcon,
  IconButton,
  Icon,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  DoneIcon,
  Avatar,
  Button,
  Visibility,
  VisibilityOff,
  Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = console.log;
let debug = tsw.util.common.debug;
const apis = tsw.apis 

declare var window: any;



/*
   COMPONENT STARTS HERE -- >
   
   Note that this template renders a widget which displays "Medkit Template Tool" , 
   and then has two tabs, Tab1 and Tab2 
   
   This is just for demo purposes and should be modified 
   
   
*/

export default function Component() {
    
    const theme = useTheme();
    
    
    let light = theme.palette.primary.light 
    
    type OptionObject = { 
	label : string 
    } 

    type SelectedObject = { 
	label : string , 
	description  : string , 
	concepturi  :string  , 
	id : string, 
    } 
    
    let default_options : OptionObject[] =  []
    let default_selected : SelectedObject[] = [] 

    
    const [state, setState] = React.useState<any>({
	
	wiki_search : { 
	    options : default_options , 
	    progress : false , 
	} , 
	
	selected : default_selected , 
	
    });
    
    const PanelStyle = { 
	backgroundColor: theme.palette.background.paper,
	borderRadius: "7px", 
	width : "45%" , 
	padding : "2%" , 
	overflow : "hidden" , 
    } 

    return (
	<Context.Provider value={{ state, setState }}>

	    <div
		style={{
		    //backgroundColor: theme.palette.background.paper,
		    //borderRadius: "15px", 
		    flexGrow : 1 , 
		    overflow : "hidden" , 
		    padding : "1%", 
		    
		}}
	    >
		
		<div style={{display: "flex" ,
			     flexDirection : "column" , 
			     height : "100%" , 
		}}> 
		    
		    <div style={{flexGrow : 0}}> 
			<Typography variant="h4">
			    Diagnosis Support Tool
			</Typography>
		    </div>
		    
		    <br/> 
		    
		    <div style={{flexGrow : 1  , overflow : "hidden"  }}>
			
			<div style={{display : "flex" , 
				     paddingLeft  : "2%" , 
				     paddingRight  : "2%" , 				 
				     height  : "100%" , 
				     flexDirection : "row" , 
				     justifyContent : "space-between"}}>	
			    
			    <Box style={PanelStyle} > 
				<ClinicalFeatures /> 
			    </Box>				    
			    
			    <Box style={PanelStyle} > 
				<Results />
			    </Box>	
			    
			    
			</div>
		    </div>
		</div>
	    </div>
	</Context.Provider>
    );
}


export function ClinicalFeatures() { 
    
    const theme = useTheme();    
    
    const PanelStyle = { 
	backgroundColor: theme.palette.grey[50],
	borderRadius: "2px", 
	width : "45%" , 
	padding : "1%" , 
	height : "100%", 
    } 

    
    return ( 
	<Context.Consumer> 
	    {
		function({state,setState}) { 
		    return ( 
			<Box style={{height : "100%" ,display : "flex" , flexDirection  : "column" ,  }}> 
			    
			    <Box> 
				<Typography variant="h4">
				    Clinical Features 
				</Typography>	
			    </Box>
			    
			    <br/> 
			    
			    
			    <Box style={{flexGrow : 1 ,  overflow : "hidden" }}>
				
				<div style={{display : "flex" , 
					     paddingLeft  : "2%" , 
					     paddingRight  : "2%" , 				 
					     height  : "100%" , 
					     flexDirection : "row" , 
					     justifyContent : "space-between"}}>		    

				    <Box style={PanelStyle}> 
					<WikiSearch /> 
				    </Box>
				    
				    <Box style={PanelStyle}>
					<SelectedItems /> 
				    </Box>
				    
				</div>
				
			    </Box>	

			    
			</Box>
			
		    ) 
		}
	    }
	</Context.Consumer> 
    ) 
} 

export function Results() { 
    return ( 
	<Context.Consumer> 
	    {
		function({state,setState}) { 
		    return ( 
			<Box style={{height : "100%" ,display : "flex" , flexDirection  : "column" ,  }}> 
			    
			    <Box> 
				<Typography variant="h4">
				    Results 
				</Typography>	
			    </Box>
			    
			</Box>

		    ) 
		}
	    } 
	</Context.Consumer> 
    ) 
} 



const wiki_search_id = "wiki-search-input"   




function SelectedItems() {
    
    const theme = useTheme();
    
    return ( 
	<Context.Consumer> 
	{
	    function({state,setState}) {  
		
	
		return ( 
		    
		    <Box style={{height :"100%", display :"flex" , flexDirection : "column"}}>		    
			<Box style={{flexGrow : 0}}> 
			    <Typography variant="subtitle1">
				Selected
			    </Typography>
			</Box>
			
			<br/>
			
			<Box style={{flexGrow : 1 , overflow : "auto"  }}> 
			    <Grid container spacing={3}>				
				{
				    state.selected.map( function(option :any) {
					return ( 
					    <Grid key={option.id} item xs={12} >
						<SelectedCard option={option} key={option.concepturi} setState={setState} />						
					    </Grid>
					) 
				    })
				}
			    </Grid>
			</Box>
			
			
		    </Box> 
		    
		)

	    }
	}
	</Context.Consumer>
    )
}


function WikiSearch() {
    
    
    const theme = useTheme();
    
    return ( 
	<Context.Consumer> 
	    {
		function({state,setState}) { 
		    
		    
		    let WikiInputChanged = fp.make_debouncer(500, async function(args : any[]) {
			// --  
			// should search the endpoint to get a list of options objects 
			log("Input changed!")  
			log(args[0]) 
			
			log("Querying wikidata..")
			
			if (fp.is_empty(args[0])) { 
			    log("Ignoring empty")
			    setState( { ...state, 
					wiki_search : {options : [] , progress : false}   }) 
			    return 
			} 
			
			setState({...state,wiki_search : fp.merge_dictionary(state.wiki_search, {progress : true } )}) 			
			
			let result = await apis.wikidata.WikidataSearchAsList(args[0]) 
			
			debug.add("wiki_query" , result) 
			
			setState( { ...state, 
				    wiki_search : fp.merge_dictionary( state.wiki_search , { options :  result , progress :false    }) }) 
			
		    }) 
		    
		    let setSelected = function(option :any) {
			console.log(option) 
			console.log(state)
			setState( {...state, 
				   selected : state.selected.concat(option)  }) 
			console.log(state)			
		    }
		    
		    let SearchResults = () => ( 

			<Grid container spacing={3}>
			    { 
				state.wiki_search.options.map(function(option :any ){ 
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
					  padding : "1%" , 
					  borderRadius : "15px"  , 
					  display : "flex" , 
					  flexDirection : "column" 
				
 			    }}>
				
				<Box> 
				    <Typography variant="subtitle1">
					Search
				    </Typography>
				</Box>
				
				<br/> 
				
				<Box style={{display:"flex" , flexDirection : "row" }}>
				    <Box>
					<FormControl fullWidth variant="outlined">
					    <InputLabel htmlFor="outlined-adornment-amount">Wikidata</InputLabel>
					    <OutlinedInput
						id={wiki_search_id}
						onChange={ function(e:any) {
							
							let val = e.target.value

							WikiInputChanged([val])
							
						    }}
						startAdornment={<InputAdornment position="start">></InputAdornment>}
						labelWidth={60}
					    />
					</FormControl>
				    </Box>
				    { 
					state.wiki_search.progress ?  
					( <Box style={{marginLeft : "4%" }}> 
					    <Box style={{height : "100%" , display :'flex' , flexDirection : "column", justifyContent : 'center'}}> 
						<CircularProgress /> 
					    </Box>
					</Box>  
					)  :  null 
					
				    } 
				</Box>
				
				<br/> 
				
				<div style={{ flexGrow: 1 , padding : "2%",  overflow : "auto"   }}>		
				    { 

					<SearchResults /> 
				    } 
				</div>			    
				
				
				
			    </div>  
			    
			</Container > 			
			
			
			
			
			
		    ) 
		    
		    
		}
	    } 
	</Context.Consumer> 
    )     
    
}


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
		    setSelected(option) 
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


function SelectedCard(props : any) {
    
    var {option, setState} = props ; 
    
    
    let deleteMe = function() {
	setState( (prevState : any) => ( {...prevState, 
					  selected : prevState.selected.filter( (s:any)=> s.id != option.id ) } ) ) 
    } 


    let { 
	concepturi , 
	description, 
	id, 
	label, 
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
		    log("Clicking selected:  " + option.id) 
		} 
	    } 

	> 
	    <div style={{display: "flex" ,
			 justifyContent : "space-between" ,
			 flexDirection : "row" }} > 
		
		<Typography style={{flexGrow: 1}} variant="h6" >
		    {option.label}
		</Typography>
		
		<IconButton onClick={deleteMe}> 
		    <CancelIcon />
		</IconButton>
		
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
