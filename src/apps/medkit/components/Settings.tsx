import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./Settings_Context";



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
  ExpandMoreIcon,
  FaceIcon,
  IconButton,
  Icon,
  InputLabel,
  OutlinedInput,
    FormLabel, 
    RadioGroup, 
    FormControlLabel,
    Radio, 
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

let smgr = window.state_manager  ; 


/*
   COMPONENT STARTS HERE -- >
   
   Note that this template renders a widget which displays "Medkit Template Tool" , 
   and then has two tabs, Tab1 and Tab2 
   
   This is just for demo purposes and should be modified 
   
   
*/

export default function Component() {
    
    const theme = useTheme();
    const [state, setState] = React.useState<any>({
	tabValue: 1,
	elevations: {}
  });

  let TabPanel = function(props: any) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  };

  return (
      <Context.Provider value={{ state, setState }}>
	  <Container style={{height : "100%" }}>
              <div
		  style={{
		      backgroundColor: theme.palette.background.paper,
		      padding: "2%",
		      boxSizing : "border-box", 		      
		      borderRadius: "15px" , 
		      height : "98%" , 
		  }}
              >
		  
		  <Accordion>
		      <AccordionSummary
			  expandIcon={<ExpandMoreIcon />}
		      >  
			  <Typography variant="subtitle1">
			      Color Themes
			  </Typography>
			  
		      </AccordionSummary>
		      <AccordionDetails> 
			  
			  <Box>
			      
			      {
				  <ThemeSelection /> 
			      }
			      
			      
			  </Box>
			  
		      </AccordionDetails>
		      
		  </Accordion>
		  
		  
		  
		  
              </div>
	  </Container>
      </Context.Provider>
  );
}



function ThemeSelection() {

    const [value, setValue] = React.useState(smgr.theme_str);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	let val = (event.target as HTMLInputElement).value
	setValue(val);
	smgr.set_theme(val) 
    };
    
    let theme_names = [ 
	'Default' , 
	'Fireplace' , 
	'Purple' , 
	'Stars' , 
	'Earth' , 
	'Stone' , 
	'Wood' 
    ] 

    return (
	<FormControl component="fieldset">
	    <FormLabel component="legend">Select Theme</FormLabel>
	    <RadioGroup  value={value} onChange={handleChange}>
		{ 
		    theme_names.map( (t:string) => (
			<FormControlLabel value={t} control={<Radio />} label={t} />
		    ))
		} 
	    </RadioGroup>
	</FormControl>
    );

} 
