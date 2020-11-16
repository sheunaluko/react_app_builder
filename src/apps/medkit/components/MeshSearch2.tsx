import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import { ObjectInspector, TableInspector } from "react-inspector";
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 
import * as mk from "../medkit" 

import {handleMeshQuery} from "./mesh_query" 

import MeshTreeAccordion from "./MeshTreeAccordion" 

interface State { 
    state : any, 
    setState : any 
} 

const MSContext = React.createContext<State>({state: null, setState : null})  ; 


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


let fp = tsw.util.common.fp
let mesh = tsw.apis.mesh 
let wikidata = tsw.apis.wikidata 
let log = console.log 
let debug = tsw.util.common.debug 
let smgr = mk.smgr 


export default function MeshSearch(args? : any) {  
    
    
    let {selectHandler} = (args || {}) ; 

    const theme = useTheme();
    
    const [state, setState] = React.useState<any>({searchValue : null, 
						   options : [], 
						   tools : { 
						       treeState : null, 
						       commonParametersState  : null, 
						   } ,
						   selectedEntities : [], 
						   textFieldText :""}) 
    
    
    let clickHandler = selectHandler || function(x :any){console.log(x)}
    
    smgr.register("mesh2state", state) 
    smgr.register("mesh2setstate", setState)     
    
    let paper_style = { 
	padding : "2%" , 
	margin : "10px" , 
    } 

    return (
	<MSContext.Provider value={{ state , setState }} > 
    	    
	    <Container > 
		
		<div style={{ 

		    backgroundColor : theme.palette.background.paper , 
		    padding : "2%",  
		    borderRadius : "15px",
		    
 		}}>
		    
		    <div style={{display: "flex" ,
				 flexDirection : "row" }} > 
			
			<Typography style={{flexGrow: 1}} variant="h4" > 
			    MeSH Entity Selector  
			</Typography>			
			
			
			
			<Button variant="outlined" 
			    color="primary"
			    onClick={ ()=>clickHandler(state.selectedEntities) } > 
			    SELECT
			</Button>	    
			
			
			<IconButton onClick={async ()=>{
				window.open("https://alukosheun.gitbook.io/medkit/documentation/components/mesh-search")
				
			}}> 
			    <InfoIcon/> 
			</IconButton>
			
		    </div>
		    
		    <br /> 
		    
		    <Box style={{padding : "3%"}}> 
			<Accordion>
			    <AccordionSummary
				expandIcon={<ExpandMoreIcon />}
			    >
				<Typography >Search Tools</Typography>
			    </AccordionSummary>
			    
			    <AccordionDetails> 
				
				<Box> 


				    <Accordion>
					
					<AccordionSummary expandIcon={<ExpandMoreIcon />} >
					    <Typography > Tree Structure Filter </Typography>
					</AccordionSummary>
					<AccordionDetails> 
					    <MeshTreeAccordion parentState={{state,setState}} /> 
					</AccordionDetails>
					
					
				    </Accordion>
				    
				    


				    <Accordion>
					
					<AccordionSummary expandIcon={<ExpandMoreIcon />} >
					    <Typography > Common Parameters  </Typography>
					</AccordionSummary>
					<AccordionDetails> 
					    
					    <CommonParameters parentState={{state,setState}} > </CommonParameters>
					    
					</AccordionDetails>
					
					
				    </Accordion>
				    
				    
				    
				    
				</Box>
				
				
				
			    </AccordionDetails>
			    
			</Accordion>
		    </Box>
		    
		    
		    
		    <SelectedEntities />
		    
		    <br /> 
		    
		    <MTextField /> 
		    
		    <OptionsArea /> 
		    
		</div>  
		
	    </Container > 
	</MSContext.Provider>
    ) ; 
    

} 


function CommonParameters(props : any){ 
    
    let { state: MS_state, setState: set_MS_state } = props.parentState || {};
    
    const [state, setState] = React.useState<any>({
	limit : 15
    });

    React.useEffect(() => {
	//any time the state changes, we will update the parent component
	set_MS_state({ ...MS_state, tools : {...MS_state.tools,
					     commonParametersState: state} })
	log("New limit: " + state.limit)
    }, [state]);
    
    
    return ( 
	<Grid container spacing={3}>
	    
	    {
		([ 
		    [<TextField
			 label="Limit"
		         value={state.limit}
		         onChange={function(e:any){ 
			     setState({...state, limit : e.target.value})
			 }}
			 variant="outlined"
			 size="small"  />, 
		     "Limit"]
		    
		]).map((op:any)=>  (
		    <Grid key={op[1]} item xs={3}>
			{op[0]}
		    </Grid>
		))}
	    
	</Grid>
	
    ) 
}



export function MTextField() {
    
    
    let debouncer = fp.make_debouncer(600, async function(args :any[]) {
	let [val,state,setState] = args
	console.log("Debouncer activating")
	if (val ==""){console.log("ignoring empy");return} 	
	// here we should actually conduct the search and THEN set the state
	
	
	// need to modify this because it is the heart of the MeSH Query 
	// in fact this function will read the entire widget state in order 
	// to issue the correct sparql query and retrieve results 
	// because this funcitonality is so imporant and compartmentalized
	// I will separate it into a separate file 
	
	//let result = await mesh.mesh_contains(args[0])
	let results = await handleMeshQuery({  val , state })
	
	setState({...state, searchValue : val, options : (results || [])})
	
	log("Storing state to tsw debug") 
	debug.add("searchState", state) 
    })

    
    const theme = useTheme();     
    
    return ( 
	<MSContext.Consumer >
	    {({state,setState}) => ( 
		
		//can get access to the search tools information here because it is also 
		// in the context ? 
		
		
		<div style={{width : "100%" }}>
		    <FormControl fullWidth variant="outlined">
			<InputLabel htmlFor="outlined-adornment-amount">MeSH</InputLabel>
			<OutlinedInput
			    id="outlined-adornment-amount"
			    onChange={ function(e:any) {
				    
			            let val = e.target.value
				    //setState({...state,textFieldText : val})
			            debouncer([val, state,setState]) 
				    
				}}
			    startAdornment={<InputAdornment position="start">></InputAdornment>}
			    labelWidth={60}
			/>
		    </FormControl>

		</div>
	    )}
	</MSContext.Consumer> 
    )

}

export function OptionsArea() { 

    return (
	<MSContext.Consumer > 
	    {
		function({state,setState}) {
		    return (
			<div style={{flexGrow: 1, padding : "1%" }}>
			    <Grid container spacing={3}>
				{ 
				    state.options.map(function(option :any ){ 
					return ( 
					    <Grid key={option.label} item xs={12} >
						<SearchCard option={option}/> 
					    </Grid>
					) 
					
				    })
				} 
			    </Grid>
			</div>
		    )
		}
	    }
	</MSContext.Consumer> 
    );
}


function SearchCard(props : any) {
    
    var {option} = props ; 
    
    const theme = useTheme() 
    

    var [elevation,setElevation] = React.useState(1)    
    const [treeInfo,setTreeInfo] = React.useState<any>([])
    var [wikidataInfo,setWikidataInfo] = React.useState<any>(null)     
    
    let activate = function() {
	setElevation(10) 
	
    } 
    
    let unactivate = function(){
	setElevation(1)
    } 
    
    
    React.useEffect( ()=> { 
	let did = mesh.get_descriptor_id(option.resource)
	mesh.mesh_ancestors(did).then( function(results :any){
	    setTreeInfo(results.map((r:any)=>r.path))
	}) 	
	
    }, [])
    
    React.useEffect( ()=> {
	let did = mesh.get_descriptor_id(option.resource)	
	wikidata.default_props_for_ids([did]).then((d:any)=> {
	    let k = fp.keys(d)[0]
	    setWikidataInfo(d[k])
	})
    }, [] ) 
    

    return ( 
	<MSContext.Consumer> 
	    {
		function({state,setState}) { 
		    
		    //if this option is in the selected entities 
		    let is_selected = (state.selectedEntities.map((k:any)=>k.option.resource).indexOf(option.resource) > -1)
		    
		    return   (
			<Paper
			    onMouseOver={()=> activate()}
			    onMouseOut={()=> unactivate() }
			    style={{padding: "2%" ,
				    backgroundColor : (is_selected ? theme.palette.primary.light : theme.palette.background.paper) 
			    }}
			    elevation={elevation}
			    square={false}

			    > 
			    <div style={{display: "flex" ,
					 flexDirection : "row" }} > 
				
				<Typography style={{flexGrow: 1}} variant="h6" >
				    {option.label}
				</Typography>
				
				<IconButton onClick={ 
				    
				    function(){
					//need to add this option to the global state 
					console.log(option) 
					state.selectedEntities.push({option, wikidataInfo, treeInfo})
					setState({...state, selectedEntities : state.selectedEntities})
				    } 
				    
				    
				} >
				    <AddCircleOutlineIcon /> 
				</IconButton>	    
				
			    </div>
			    

			    
			    <Typography variant="subtitle1"> 
				{ wikidataInfo ? wikidataInfo['description'] : null } 
			    </Typography>
			    
			    <br/>

			    <Link href={option.resource} > 
				{option.resource} 
			    </Link>		
			    
			    { 
				treeInfo.map( (i:any)=> TreeRow(i) ) 
			    } 	    
			    

			    <br /> 
			    
			    {
				wikidataInfo ? WikidataDisplay(wikidataInfo) : null 
			    } 			    
			    
			</Paper>
		    )
		}
	    }
	</MSContext.Consumer>
    )
}



export function TreeRow(ss : string[]){
    return ( 
	<Breadcrumbs key={ss.join("")} maxItems={4} aria-label="breadcrumb">
	    {
		ss.map((s:any)=> 
		    <Link  key={s} color="inherit" href="#" >
			{s}
		    </Link>
		)
	    }
	</Breadcrumbs>	
    ) 
} 




export function SelectedEntities() {
    
    return (
	<MSContext.Consumer> 
	    {
		function({state,setState}){ 
		    return ( 
			<div style={{ display: 'flex',
				      justifyContent: 'center',
				      flexWrap: 'wrap' }}>
			    { 
				state.selectedEntities.map( function(y : any){
				    
				    let {option : x} = y
				    
				    return (
					<Chip key={x.resource}
					      label={x.label} 
					      onDelete={ 
						  function() {
						      setState({...state, selectedEntities : state.selectedEntities.filter((y:any)=>(y.resource!=x.resource))})
						  } 
					      }
				              style={{margin : "10px"}}
					      color="primary" 
					      variant="outlined" />
				    )
				})
			    }
			</div>
		    )
		}
	    }
	</MSContext.Consumer> 	
    )
}


function WikidataDisplay(info : any ) {
    return ( 
	<div style={{fontSize : "20px"}}>
	<ObjectInspector data={info} /> 
	</div> 
    ) 
} 











