import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./WikidataEntityMaker_Context";



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

  return (
      <Context.Provider value={{ state, setState }}>
	  <Container>
              <div
		  style={{
		      backgroundColor: theme.palette.background.paper,
		      padding: "2%",
		      borderRadius: "15px"
		  }}
              >
		  <div style={{ display: "flex", flexDirection: "row" }}>
		      <Typography style={{ flexGrow: 1 }} variant="h4">
			  Wikidata Entity Maker 
		      </Typography>
		  </div>
		  
		  Whoo 

              </div>
	  </Container>
      </Context.Provider>
  );
}
