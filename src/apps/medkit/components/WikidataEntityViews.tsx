import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import { ObjectInspector, TableInspector } from "react-inspector";

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


type single_renderer = (o : any) => any 
type key_renderer    = (os : any[]) => any 

export var single_element_renderer : {[k:string] : single_renderer}  = { 
    /*
       These are renderer functions which should be used for sub elements within the 
       key of the returned wikidataInfo object  
       
     */ 
    
    'symptoms' : function (x : any) { 
	
	let {match_id, match_label, prop_id} = x  
	
	return { 
	    key : match_id , 
	    Element : ( 
		<Typography variant="body2"> 
		    <Link href={fp.format("https://www.wikidata.org/wiki/{}", [match_id])}>
			{match_label}
		    </Link>
		</Typography> 
	    ) 
	}
	
    }  , 
    
    
    
} 


export var key_element_renderer : {[k:string] : key_renderer}  = { 
    
} 


export function single_element_renderer_to_key_renderer(ser : any) {
    //just produce a grid of items basically 
    return function(o_array : any) { 
	return ( 
	    <Box>
		<Grid container spacing={3}>
		    {
			o_array.map( (o : any)=> {
			    
			    let {key,Element} = ser(o) 
			    
			    return ( 
				<Grid item xs={3} key={key}>
				    {Element}
				</Grid>
			    ) 
			}) 
		    } 
		</Grid>
	    </Box> 
	) 
    } 
} 

export function  get_renderer(k : string) { 
    
    if (key_element_renderer[k]) {
	return key_element_renderer[k]
    }  
    
    if (single_element_renderer[k]) {
	return single_element_renderer_to_key_renderer(single_element_renderer[k])
    }
    
    // if we are here then there is no known way to render this key 
    return  function(o_array : any) { 
	
	return ( 
	    <Box>
		<Typography variant="body2"> 
		    Raw Data: 
		</Typography> 
		
		<ObjectInspector data={o_array} expandLevel={3} /> 
		
	    </Box>
	) 
    } 
    
} 

