import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 
import { ObjectInspector, TableInspector } from "react-inspector"; 

import PLContext from "./PLContext" 

import MeshSearch from "./MeshSearch2" 

let { Container, 
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
      ExpandMoreIcon, 
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


declare var window : any ; 


export default function PL(){
    
    const theme = useTheme();
    
    let old_selection = localStorage['problem_list.selection']
    
    const [state, setState] = React.useState<any>({
	tabValue : 1, 
	selected : old_selection ? JSON.parse(old_selection)  : [] ,
	elevations : {} , 
    }) 
    
    
    let TabPanel = function(props : any) {
	const { children, value, index, ...other } = props;

	return (
	    <div
		role="tabpanel"
		hidden={value !== index}
		id={`vertical-tabpanel-${index}`}
		aria-labelledby={`vertical-tab-${index}`}
		{...other}
	    >
		{value === index && (
		     <Box p={3}>
			 {children}
		     </Box>
		)}
	    </div>
	);
    }

    
    return ( 
	<PLContext.Provider value={{ state , setState }}> 
	    
	    <Container > 
		
		<div style={{ 

		    backgroundColor : theme.palette.background.paper , 
		    padding : "2%",  
		    borderRadius : "15px",
		    
 		}}>
		    
		    <div style={{display: "flex" ,
				 flexDirection : "row" }} > 
			
			<Typography style={{flexGrow: 1}} variant="h4" > 
			    Problem List
			</Typography>			
			
			
		    </div>  
		    
		    
		    
		    <Tabs
			//orientation="vertical"
			value={state.tabValue}
			onChange={(event :any, newValue:any) => {  setState({...state,tabValue : newValue})}}
		    >
			<Tab label="Display"  />
			<Tab label="Edit" />
			
		    </Tabs>
		    <TabPanel value={state.tabValue} index={0}>
			<PLDisplay/>	    
		    </TabPanel>
		    <TabPanel value={state.tabValue} index={1}>
			<PLEdit/>
		    </TabPanel>
		    
		</div>
		
	    </Container > 
	</PLContext.Provider>
    ) 
}






function PLDisplay() {
    return ( 
	<PLContext.Consumer > 
	    {
		function({state,setState}) {
		    
		    return ( 
			<PLDisplayPapers selected={state.selected} />
		    ) 
		}
	    }
	</PLContext.Consumer> 
    )
} 


function PLDisplayPapers(props : any) { 
    
    let {selected} = props 
    
    var [elevations,setElevations] = React.useState<any>({})
    
    let deactivate = function( res : string){ 
	elevations[res] = 3
	setElevations({...elevations}) 
    }

    let activate = function( res : string){ 
	elevations[res] = 10 
	setElevations({...elevations}) 
    }

    return (
	<div style={{flexGrow: 1, padding : "1%" }}>
	    { 
		selected.map(function(x :any) {
		    
		    let {option,wikidataInfo,treeInfo}  = x 
		    
		    return ( 
			<Box style={{
			    marginBottom : "15px"
			}} 
			     key={option.resource}> 
			    <Paper elevation={elevations[option.resource] || 3}
				   onMouseOut={()=>deactivate(option.resource) }
				   onMouseOver={()=>activate(option.resource) }
				   style={{padding : "3%"}}
			    > 
				
				
				<Typography variant="h5"> 
				    {option.label}
				</Typography>
				
				
				
				<Typography variant="subtitle1"> 
				    { wikidataInfo ? wikidataInfo['description'] : null } 
				</Typography>
				
				
				<br/>
				
				<Link href={option.resource} > 
				    {option.resource} 
				</Link>		
				
				
				<br/>

				{ 
				    treeInfo.map( (i:any)=> TreeRow(i) ) 
				} 	 				
				
				<br /> 
				{
				    WikidataDisplay(wikidataInfo) 
				}
			    </Paper>
			</Box>
		    ) 
		    
		    
		})
	    } 
	</div>
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



function WikidataDisplay(info : any ) {
    return ( 
	<div style={{fontSize : "20px"}}>
	    <ObjectInspector data={info} /> 
	</div> 
    ) 
} 




function PLEdit() {
    return ( 
	<PLContext.Consumer > 
	    {
		function({state,setState}) {
		    
		    //define callbacks for meshsearch
		    
		    
		    return (
			<div style={{flexGrow: 1, padding : "1%" }}>
			    <MeshSearch selectHandler={function(e:any){
				    log("Received selection")
				    log(e)
				    window.selection = e 
				    setState({...state, 
					      selected : e 
				    })
				    localStorage['problem_list.selection'] = JSON.stringify(e) 
				}} />
			</div>
		    )
		}
	    }
	</PLContext.Consumer> 
    )
} 
