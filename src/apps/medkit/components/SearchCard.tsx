import React from "react";
import { useTheme } from "@material-ui/core/styles";
import * as mui from "./list";
import * as tsw from "tidyscripts_web" 


let log = tsw.util.common.Logger("search_card")

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
  Popover, 
  AddCircle, 
  CircularProgress, 
  Visibility,
  VisibilityOff,
  Typography
} = mui;


export default function SearchCard(props : any) {
    
    var {option, set_selected} = props ; 

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
		    log("Running selection handler:  " + option.id) 
		    set_selected(option) 
		} 
	    } 

	> 
		<Link href={option.concepturi} > 
		    {option.label} 
		</Link>		
		
	    
	    <Typography > 
		{ option.description  }  
	    </Typography>
	    
	    


	    
	</Paper>
	
    ) 
    
} 
