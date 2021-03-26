import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./DiagnosisSupport2_Context";

import ScrollableTabs from "./ScrollableTabs" ;
import * as cds from "../dev/cds" ; 
import WikidataEntityViewer from "./WikidataEntityViewer" 
import DiagnosisModeSelection from "./DiagnosisModeSelection" 
import * as smgr from "../state_manager" 


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

const ui_log = (s : string) => smgr.get("addConsoleText")(s) 

/*
   COMPONENT STARTS HERE -- >
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
    let default_selected : SelectedObject[] =  [] // tsw.apis.local_storage.get("test_selected")

    
    /*
       DEFINE THE GLOBAL STATE FOR THE DIAGNOSIS WIDGET (will be passed to Context.Provider) 
     */
    const [state, setState] = React.useState<any>({
	
	wiki_search : { 
	    options : default_options , 
	    progress : false , 
	} , 
	
	diagnosis_mode  : "Use Wikidata Only" , 
	
	selected : default_selected ,  //selected user queries 
	
	selected_diagnosis : null,  //when user looks at diagnostic info for given diagnosis 
	
	data_cache : { 
	    //starts null but will be populated as elements are selected 
	}  , 
	
	results_cache : {
	    //will be computed 
	} , 
	
	diagnosis_cache : {
	    //will be computed 
	} , 
	
	rank_cache : [
	    // will be computed 
	    // [ [ mk,  {total_score, qid_scores}]  , ... ]
	] , 
	
	mesh_id_cache : { // will be filled at runtime -- this is an "in memory" cache, there is another indexeddb cache which is requested if data is missing here 
	                  // if it is missing there too then the web request is made and it is stored in both caches 
	}  
	
	
    });
    
    /*
       When state.selected changes we update the data_cache by requesting the data for new 
       selections 
       
       Note that the architecture here is a chain of react hooks 
       state.selected => updates state.data_cache 
       state.data_cache => updates  results,diagnosis,and mesh_id caches 
       state.diagnosis_cache => calculates rankings (also listens to state.diagnosis_mode) 
       
       Theoretically, the diagnosis cache depends on the diagnosis_cache AND mesh_id caches however only 'listens' to changes in diagnosis cache 
       This is because diagnosis and mesh_id caches are both updated atomically in the [state.data_cache] effect hook 
       
     */
    React.useEffect(  ()=>{
	
	(async function update_cache(){
	    
	    let selected = state.selected 
	    log("selected was updated!")
	    log(selected)
	    let new_data_cache = fp.clone(state.data_cache)  
	    
	    //for any item that is NOT already in the data cache we 
	    //will retrieve all properties for it and put them into the data cache 
	    let ids = fp.keys(new_data_cache) 
	    
	    for (var s of selected ) {
		//1. retrieve and update the data cache for each item thats NOT 
		//already there 
		let qid  = s.id
		if (new_data_cache[qid]) { 
		    // it exists already, so we do nothing for this id 
		    log("Skipping existing id: " + qid)
		}  else { 
		    // does not exist yet, so we will retrieve the data 
		    log("Requesting data for id: " + qid)		    
		    ui_log("Retrieving data for item: " + s.label)
		    new_data_cache[qid] = (await cds.get_diagnostic_properties_for_qid(qid,s.label))
		} 
	    } 
	    
	    setState( {...state,
		       data_cache : new_data_cache }) 
	    
	})()
	
    }, [state.selected])

    /*
       When the data_cache is updated we recompute the results_cache, which is ultimately 
       used to render the bottom right results pane. We also compute the diagnosis cache which organizes information by possible diagnosis, 
       and retrieve all available mesh ids 
     */
    React.useEffect( ()=>{
	
	(async function compute_pre_rank(){
	    
	    let dc = state.data_cache 
	    log("data cache was updated!")
	    log(dc)
	    // UPDATE THE results_cache and diagnosis_cache and rank_cache 
	    // ||=-((^.^))-=||
	    let {results_cache, diagnosis_cache}  = cds.compute_diagnostic_data(dc, state.selected)
	    
	    // now we want to get the mesh_ids for all of the user selected items and the ranked diagnoses as well 
	    // to do this intelligently we first check the mesh_id_cache to see if its there, and only request those which are not... 
	    let selected_ids = fp.map_get(state.selected,"id") 
	    //get diagnosis ids from diagnosis_cache 
	    let diagnosis_ids = fp.keys(diagnosis_cache).map( (x : string) => x.split("<->")[0] ) 
	    let all_ids = fp.flat_once( [ selected_ids , diagnosis_ids] ) 
	    
	    let to_request : string[] = []  ; 
	    
	    all_ids.map((qid : string) => {
		
		if (state.mesh_id_cache[qid]) {
		    //already have the id stored 
		} else { 
		    //will need to get it 
		    to_request.push(qid) 
		} 
		
	    }); 
	    
	    let retrieved_ids = await cds.retrieve_mesh_ids(to_request) ; 
	    
	    //and then we cache them here! 
	    let mesh_id_cache = fp.merge_dictionary(state.mesh_id_cache, retrieved_ids)

	    //and then update everything
	    //note the following effect hook which will detect this update and then actually produce the rankings since all the data is loaded now 
	    setState({...state,
		      results_cache, 		  
		      diagnosis_cache,
		      mesh_id_cache})
	    
	})()
	
    }, [state.data_cache])
    
    //COMPUTE RANKINGS BASED ON REFRESHED DATA 
    React.useEffect( ()=> {
	log("Diagnosis cache or diagnosis mode  was updated") 
	
	/* 
	   ACTUALLY COMPUTE THE RANKINGS NOW 
	*/ 
	
	// and then we update the rank_cache 
	let rank_cache = cds.diagnosis_cache_to_rankings(state)  
	
	setState({
	    ...state, 
	    rank_cache, 
	})
	debug.add("cds.state" , state)	
	
    }, [state.diagnosis_cache , state.diagnosis_mode]) //this will re-rendered based on changes to each of these
    
    
    const PanelStyle = { 
	backgroundColor: theme.palette.background.paper,
	borderRadius: "7px", 
	borderStyle : "solid" , 
	borderWidth : "1px" , 
	borderColor : theme.palette.primary.light , 
	width : "45%" , 
	padding : "2%" , 
	//overflow : "hidden" , 
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
	width : "48%" , 
	height : "100%", 
    } 
    
    //put left border on right one 
    //fix bottom border :/ 

    
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
    
    const theme = useTheme();    
    
    const PanelStyle = { 
	backgroundColor: theme.palette.grey[50],
	borderRadius: "2px", 
	width : "100%" , 
	//height : "100%", 
    } 
    
    //put left border on right one 
    //fix bottom border :/ 

    
    return ( 
	<Context.Consumer> 
	    {
		function({state,setState}) { 
	    
	            let setDiagnosisMode = function(m : string) {
	                setState({
	                   ...state , diagnosis_mode : m 
	                })
	            } 
	             
	    
	    
		    return ( 
			<Box style={{height : "100%" ,display : "flex" , flexDirection  : "column"}}> 
			    
			    <Box style={{ display :"flex", 
					  justifyContent :"space-between", 
					  flexDirection: "row"}} > 
				<Box >
				    <Typography variant="h4" >
					Results
				    </Typography>	
				</Box>
				<Box> 
				    <DiagnosisModeSelection setDiagnosisMode={setDiagnosisMode} /> 
				</Box>
				
			    </Box>
			    <br/> 
			    
			    <Box style={{flexGrow : 1 ,  overflow : "hidden" }}>
				
				<div style={{display : "flex" , 
					     height  : "100%" , 
					     overflow : "hidden" , 
					     flexDirection : "column" , 
					     justifyContent : "space-between"}}>		    

				    <Box style={{...PanelStyle , 
						 padding : "3%", 
						 boxSizing : "border-box" , 
						 borderStyle : "solid" , 
						 borderRadius : "5px" , 
						 borderWidth : "1px", 
						 borderColor : theme.palette.primary.light,   						 
						 height : "44%"}}> 
					
					<DxList/> 
					
				    </Box>
				    
				    <Box borderTop={1}
					 style={ {...PanelStyle , 
						  flexGrow : 1 , 
						  borderWidth : "5px" , 
						  borderColor : theme.palette.secondary.light , 
						  maxHeight  : "54%"}}>
					<ScrollableTabs parentState={{state,setState}} />	
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

/* 
   type SelectedObject = { 
   label : string , 
   description  : string , 
   concepturi  :string  , 
   id : string, 
   } 
 */

function DxList() {
    return ( 
	<Context.Consumer> 
	    {
	    function({state,setState}) {  
	    
	    let ranks = (state.rank_cache || [] )  //  [ [ mk,  {total_score, qid_scores, ?metadata}]  , ... ]	    
	    
	    return ( 
	    <Box style={{ height  : "100%" ,
		flexDirection : 'row' ,
		display :'flex' ,   }}>  
		<Box style={{ 
		    width : "50%" , 
		    overflow : 'auto' , 	
		    boxSizing : "border-box",
		    padding : "1%"
		    }}> 
		    <Grid container spacing={2}>
			{
			fp.enumerate(ranks.slice(0,40)).map( (e:any)=> {
			let [ index, y ] = e 
			let [mk, score_info] = y 
			let {total_score} = score_info 			    
			let [did ,dlabel ] = mk.split("<->")
			return ( 
			<Grid  key={index} item xs={12}>
			    <Chip 
			    onClick={function(){ 
				    let selected_diagnosis = {
					mk , 
					score_info 
				    }
				    log("Selected_dx: " + mk) 
				    setState({...state, selected_diagnosis})
				}}
			    avatar={<Avatar>{index + 1}</Avatar>} 
			    label={`${dlabel} [${total_score}]`}  />
			</Grid>
			) 

			})
			}
		    </Grid>
		</Box>
		
		<Box style={{
		    width : "50%",
		    boxSizing : "border-box",
		    padding : "1%"
		    }}> 
		    <SelectedDiagnosisDisplay/>
		</Box>
	    </Box>	
	    )
		} 
		}
	    </Context.Consumer> 
    )
}
	



function SelectedDiagnosisDisplay() { 
    
    return ( 
	<Context.Consumer> 
	    {
		function({state,setState}) {  
		    
		    let selected_diagnosis = state.selected_diagnosis 
		    if (!selected_diagnosis) {return null} 
		    
		    let {mk,score_info} = selected_diagnosis
		    
		    let [did,dlabel] = mk.split("<->")
		    let qid_labels  = fp.map_get(fp.values(state.diagnosis_cache[mk]), 'label').join(", ")
		    
		    
		    return (
			<Box style={{height : "100%" , display : 'flex' , flexDirection : 'column'}}> 
			    <Box>
				<Typography variant="h5"> 
				    {dlabel}
				</Typography>
				<Typography variant="subtitle1"> 
				    {`Matches: ${qid_labels}`}
				</Typography>
				
				{ 
				    (state.diagnosis_mode != "Use Wikidata Only") ? (
					<Typography variant="subtitle1"> 
					    {`${score_info.metadata.msg}`}
					</Typography>
				    ) : null 
				} 
				
			    </Box>

			    <Box style={{overflow : "auto"}}>
				<WikidataEntityViewer qid={did} />
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
			
			<Box
			    borderLeft={1}
			    style={{height :"100%", 
				    boxSizing : "border-box", 
				    padding : "3%", 
				    borderWidth : "5px" , 				 
				    borderColor : theme.palette.secondary.light , 				 
				    display :"flex" , 
				    flexDirection : "column"}}>		    
			    
			    
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
						    <Box borderLeft={1}
							style={{
							    borderColor : theme.palette.primary.light
							}}
						    > 
							<SelectedCard option={option} key={option.concepturi} setState={setState} />						
						    </Box>
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
			
			let uris = fp.map_get(state.selected, "concepturi")
			if (uris.includes(option.concepturi)){
			    //has already been added 
			    log("Already added!")
			    ui_log("Already selected: " + option.label)
			    return 
			}
			
			
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
			
			<Box style={{ height: "100%" , 
				      width : "100%",  
				      
			}}>
			    
			    <div style={{ 
				
				width : "100%" , 
				height : "100%" ,
				boxSizing : "border-box", 
				padding : "3%" , 
				borderRadius : "7px"  , 
				borderStyle : "solid" , 
				borderWidth : "1px" , 
				borderColor : theme.palette.primary.light , 
				display : "flex" , 
				flexDirection : "column" , 
				
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
			    
			</Box > 			
			
			
			
			
			
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
