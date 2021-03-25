import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./Visualizations_Context";

import Plot from 'react-plotly.js';


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




class Viz extends React.Component {
    render() {
	return (
	    <Plot
		data={[
		    {
			x: [1, 2, 3],
			y: [2, 6, 3],
			type: 'scatter',
			mode: 'lines+markers',
			marker: {color: 'red'},
		    },
		    {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
		]}
		layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
	    />
	);
    }
}


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
	  <Container>
	      <Viz/> 
	  </Container>
      </Context.Provider>
  );
}
