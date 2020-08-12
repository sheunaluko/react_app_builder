import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import { ObjectInspector, TableInspector } from "react-inspector";
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 

import MSContext from "./MeshSearchContext" 

let { Container, 
      Grid, 
      Paper, 
      AddCircleOutlineIcon,      
      Link, 
      TextField, 
      FormControl,
      FormHelperText, 
      Breadcrumbs, 
      Chip,
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
      Typography } = mui 


let fp = tsw.util.common.fp
let mesh = tsw.apis.mesh 
let wikidata = tsw.apis.wikidata 
let log = console.log 




export default function MeshSearch() { 

    const theme = useTheme();
    
    const [state, setState] = React.useState<any>({searchValue : null, 
						   options : [], 
						   selectedEntities : [], 
						   textFieldText :""}) 
    

    return (
	<MSContext.Provider value={{ state , setState }} > 
    	    
	    <Container > 
		
		<div style={{ 
		    marginTop  : "10%" , 
		    backgroundColor : theme.palette.background.paper , 
		    padding : "2%",  
		    
		    
 		}}>
		    
		    <div style={{display: "flex" ,
				 flexDirection : "row" }} > 
			
			<Typography style={{flexGrow: 1}} variant="h4" > 
			    MeSH Entity Selector  
			</Typography>			
			
			<Button variant="outlined" 
				color="primary"
				onClick={ 
				    function(){
					//need to add this option to the global state 
					console.log(state.selectedEntities) 
				    } 
				}> 
			    SELECT
			</Button>	    
			
		    </div>
		    
		    <br /> 
		    
		    <SelectedEntities />
		    
		    <br /> 
		    
		    <MTextField /> 
		    
		    <OptionsArea /> 
		    
		</div>  
		
	    </Container > 
	</MSContext.Provider>
    ) ; 
    

} 



export function MTextField() {
    
    
    let debouncer = fp.make_debouncer(600, async function(args :any[]) {
	let [val,state,setState] = args
	console.log("Debouncer activating")
	if (val ==""){console.log("ignoring empy");return} 	
	// here we should actually conduct the search and THEN set the state
	let result = await mesh.mesh_contains(args[0])
	setState({...state, searchValue : val, options : result.result.value})
    })

    
    const theme = useTheme();     
    
    return ( 
	<MSContext.Consumer >
	    {({state,setState}) => ( 
		<div style={{width : "100%" }}>
		    <FormControl fullWidth variant="outlined">
			<InputLabel htmlFor="outlined-adornment-amount">MeSH</InputLabel>
			<OutlinedInput
			    id="outlined-adornment-amount"
			//value={state.textFieldText}
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
		    let is_selected = (state.selectedEntities.map((k:any)=>k.resource).indexOf(option.resource) > -1)
		    
		    return   (
			<Paper
			    onMouseOver={()=> activate()}
			    onMouseOut={()=> unactivate() }
			    style={{padding: "2%" ,
				    backgroundColor : (is_selected ? theme.palette.primary.light : theme.palette.background.paper) 
			    }}
			    elevation={elevation}

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
					state.selectedEntities.push(option)
					setState({...state, selectedEntities : state.selectedEntities})
				    } 
				    
				    
				} >
				    <AddCircleOutlineIcon /> 
				</IconButton>	    
				
			    </div>
			    
			    <br /> 

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
				state.selectedEntities.map( function(x : any){
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











