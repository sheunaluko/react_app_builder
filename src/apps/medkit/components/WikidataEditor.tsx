import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./WikidataEditor_Context";



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
*/

export default function Component() {
    
    const theme = useTheme();
    const [state, setState] = React.useState<any>({

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
			  Entity Editor 
		      </Typography>
		  </div>
		  
		  
		  bleh 

              </div>
	  </Container>
      </Context.Provider>
  );
}


