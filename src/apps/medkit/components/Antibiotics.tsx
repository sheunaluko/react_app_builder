import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./Antibiotics_Context";
import SelectionPanel from "./SelectionPanel" 

import {sanford}  from "../dev/index" 


let {
    Container,
    FormControlLabel,
    FormLabel, 
    RadioGroup, 
    Radio, 
    Divider, 
    Checkbox,
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
    Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = console.log;
let debug = tsw.util.common.debug;
declare var window: any;



/*
   abx
 */

export default function Component() {
    
    const theme = useTheme();
    const [state, setState] = React.useState<any>({
	classes : { 
	    'Aerobic' : true, 
	    'Gram Positive' : true, 
	    'Cocci' : true, 
	    'Fluoroquinolones' : true, 
	} , 
    });
    
    const [curr_abx,set_abx] = React.useState<any>([])
    const [curr_orgs,set_orgs] = React.useState<any>([])    
   
    
    let change_fn  = function(type : string) {
	return  (cdata : any) => { 
	    console.log(`Detected ${type} change... recomputing...`)
	    console.log(cdata) 
	    let {selections,mode} = cdata
	    if ( type == "abx") { 
		var list = sanford.get_abx_list(selections,mode)
		set_abx(list)
	    } else if ( type == "orgs") { 
		var list = sanford.get_org_list(selections,mode)
		set_orgs(list)
	    } 
	    console.log(`Set ${type}: ${list.join(" ")}`)
	} 
    } 
    
    let {abx_classes,
	 orgs_classes,
	 all_orgs, 
	 all_abx } = sanford ; 
    

    return (
	<Context.Provider value={{ state, setState }}>
	    
	    <Box style={{display :"flex", 
			 flexDirection :"row"  , 
			 padding : "10px" , 
			 boxSizing: 'border-box' , 
			 overflow :"hidden"  }}>
		
		<Box
		    style={{
			backgroundColor: theme.palette.background.paper,
			padding: "2%",
			borderRadius: "15px" ,
			width: "16%", 
			overflow : "auto" 
		    }}
		>
		    
		    <SelectionPanel
		    init_classes={{
			Anaerobic : true , 
		    }}
		    all_classes={orgs_classes} 
		    title="Organisms"
		    on_change={change_fn("orgs")}
		    />
		    
		    <br/>
		    
		    <SelectionPanel
		    init_classes={{
			Carbapenems : true , 
		    }}
		    all_classes={abx_classes} 
		    title="Antimicrobials"
		    on_change={change_fn("abx")}
		    />		    
		    
		    
		</Box>
		
		<Box style={{ 
		    display: "flex", 
		    flexDirection: "column" , 
		    minWidth  : "1%" ,
		}}>	    
		</Box>
		
		
		<Box
		    style={{
			backgroundColor: theme.palette.background.paper,
			padding: "2%",
			borderRadius: "15px" , 
			width : "83%" , 
			overflow : "auto" 			
		    }}
		>
		    
		    
		    <Box style={{ 
			display: "flex", 
			flexDirection: "row" , 
			width : "100%" , 
		    }}>

			<Box style={{ 
			    display: "flex", 
			    flexDirection: "column" , 
			    minWidth  : "15%" 
			}}>
			    
			    {ABX_LEGEND_COLUMN("", '100px', curr_orgs  ) } 
			    
			</Box> 
			
			<Box style={{ 
			    display: "flex", 
			    flexDirection: "column" , 
			    minWidth  : "3%" 
			}}>	    
			</Box>
			
			<Box style={{ 
			    display: "flex", 
			    flexDirection: "column" , 
			    overflow: "auto" 
			}}>
			    
			    
			    <Box style={{ 
				display: "flex", 
				flexDirection: "row" , 
			    }}>
				
				{
				    
				    curr_abx.map( abx => ABX_SELECT_COLUMN(abx, '100px' , curr_orgs  ) ) 
				    
				} 
				

				
			    </Box>
			    
			</Box>
		    </Box> 
		    


		    
		</Box>
	    </Box>
	</Context.Provider>
    );
}

function ABX_LEGEND_COLUMN(abx : string , ht : number , rnames : string[]) { 
    
    return (
	<Box  style={{ 
	    display:"flex", 
	    flexDirection :"column" ,
	}}>
	    <Box style={{  
		height  : ht, 
		overflow : "auto"  
	    }}> 
		<p 
		style={{
		    //transform: "rotate(180deg)" , 			  
		    writingMode :   "vertical-rl" , 			  
		}} >
		    {abx} 
		</p>		
	    </Box>
	    
	    {  LEGEND_COLUMN(rnames) } 
	    
	    
	</Box>
    ) 
    
} 

function ABX_SELECT_COLUMN(abx : string , ht : number , rnames : string[]) { 
    
    return (
	<Box key={abx + "select" }  style={{ 
	    display:"flex", 
	    flexDirection :"column" ,
	}}>
	    <Box style={{  
		height  : ht, 
		overflow : "auto"  
		
	    }}> 
		<p 
		style={{
		    //transform: "rotate(180deg)" , 			  
		    writingMode :   "vertical-rl" , 			  
		}} >
		    {abx} 
		</p>		
	    </Box>
	    
	    {  SELECT_COLUMN(fp.range(10) ) } 	    
	    
	</Box>
    ) 
    
} 

function LEGEND_COLUMN(rnames : string[] ){
    return ( 
	<Box> 
	    { 
		
		rnames.map(i=>  <React.Fragment key={i + "_fragment_legend"}> {LEGEND_BLOCK(i)} </React.Fragment>  ) 
		
	    } 
	</Box> 
    ) 
} 

function SELECT_COLUMN(rnames : string[] ){
    return ( 
	<Box> 
	    { 
		rnames.map(i=>   <React.Fragment key={i + "_fragment_select"} > {SELECT_BLOCK(i)} </React.Fragment>  ) 		
	    } 
	</Box> 
    ) 
} 


let block_ht = "50px" ; 

function LEGEND_BLOCK(i :string) {
    return (
	<Box style={{ 
	    height : block_ht , 
	    display: "flex" , 
	    alignItems : "center" , 
	}}> 
	<Box>
	  {i}
	</Box>
	</Box> 
    ) 
} 

function SELECT_BLOCK(i :string) {
    return (
	<Box style={{ 
	    height : block_ht , 
	    display: "flex" , 
	    alignItems : "center" , 
	}}> 
	    <Box style={{ boxSizing : "border-box", padding : "2px"   }}>
		<Button variant="outlined"> 
		    !
		</Button>
	    </Box>
	</Box> 
    ) 
} 
