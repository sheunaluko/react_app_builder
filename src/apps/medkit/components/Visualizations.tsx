import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import Context from "./Visualizations_Context";

import Plot from 'react-plotly.js';
import * as evaluation from "../dev/evaluation" 


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


export class Viz2 extends React.Component {
    
    /* thank u  -- https://medium.com/@jmmccota/plotly-react-and-dynamic-data-d40c7292dbfb  */ 
    
    state = {
	line1: {
	    x: [-3, -2, -1],
	    y: [1, 2, 3],
	    name: 'Line 1'
	},
	line2: {
	    x: [1, 2, 3],
	    y: [-3, -2, -1],
	    name: 'Line 2'
	}, 
	layout: {
	    datarevision: 0,
	},
	revision: 0,
    }
    
    constructor(props :any) { 
	
    } 
    
    rand = () => parseInt(Math.random() * 10, 10);
    
    increaseGraphic = () => { 
	console.log("Increasing!") 
	const { line1, line2, layout } = this.state;
	line1.x.push(line1.x.slice(-1)[0]+1);
	line1.y.push(this.rand());
	line2.x.push(line1.x.slice(-1)[0]+1);
	line2.y.push(this.rand());
	this.setState({ revision: this.state.revision + 1 });
	layout.datarevision = this.state.revision + 1;
    }
    
    componentDidMount() {
	//setInterval(this.increaseGraphic, 50);
	
	
    }
    
    render() {
	return (
	    <div>
		<Plot
		    data={[
			this.state.line1,
			this.state.line2,
		    ]}
		    layout={this.state.layout}
		    revision={this.state.revision}
		    graphDiv="graph"
		/>
	    </div>
	);
    }
}

export class BarViz extends React.Component {
    
    /* thank you  -- https://medium.com/@jmmccota/plotly-react-and-dynamic-data-d40c7292dbfb  */ 
    
    state = {
	x: [], 
	y: [] , 
	name: 'Tmp', 
	layout: {
	    datarevision: 0,
	    title : 'Bar Graph' , 
	    autosize : true, 
	    xaxis : { 
		title : 'X' , 
	    } ,
	    yaxis : { 
		title : 'Y' , 
	    } , 
	    margin : {} , 
	    
	},
	revision: 0,
    }
    
    constructor(props :any) { 
	super(props); 
	let {init_data} = props 
	let { 
	    x, y, series_name, title, xlabel, ylabel, color , margin , 
	}  = init_data 
	
	console.log(init_data) 
	
	this.state.x = x ; 
	this.state.y = y ; 
	this.state.name = series_name || 'test' ; 
	
	this.state.layout.title = title ; 
	this.state.layout.xaxis.title = xlabel ; 	
	this.state.layout.yaxis.title = ylabel ; 
	this.state.layout.margin = margin || {} 	
	
	this.state.revision = 1  ; 
	this.state.layout.datarevision = 1 ; 
	this.state.color = color ; 

	
	
    } 
    
    
    update() {
	this.setState({ revision: this.state.revision + 1 });
	this.state.layout.datarevision = this.state.revision + 1;	
    } 
    
    
    
    componentDidMount() {
	//setInterval(this.increaseGraphic, 50);
	//console.log("setting data..") 
    }
    
    render() {
	return (
	    <div>
		<Plot
		    style={{width : "100%"  , height : "100%" }}
		    data={[{ 
			    x : this.state.x , 
			    y : this.state.y , 
			    name : this.state.name , 
			    marker : { 
				color : this.state.color 
			    } ,
			    type: 'bar',
		    }]}
		    color={this.state.color} 
		    layout={this.state.layout}
		    revision={this.state.revision}
		    useResizeHandler={true}
		    graphDiv="BarGraph"
		/>
	    </div>
	);
    }
}



export class GenericViz extends React.Component {
    
    /* thank you  -- https://medium.com/@jmmccota/plotly-react-and-dynamic-data-d40c7292dbfb  */ 
    
    state = {
	data : [] , 
	layout: {
	    datarevision: 0,
	    title : 'Line Graph' , 
	    autosize : true, 
	    xaxis : { 
		title : 'X' , 
	    } ,
	    yaxis : { 
		title : 'Y' , 
	    } , 
	    margin : {} , 
	    
	},
	revision: 0,
    }
    
    constructor(props :any) { 
	super(props); 
	let {init_data} = props 
	let { 
	    data ,  series_name, title, xlabel, ylabel, color , margin , 
	}  = init_data 
	
	console.log(init_data) 
	
	this.state.data = data ; 
	this.state.layout.title = title ; 
	this.state.layout.xaxis.title = xlabel ; 	
	this.state.layout.yaxis.title = ylabel ; 
	this.state.layout.margin = margin || {} 	
	
	this.state.revision = 1  ; 
	this.state.layout.datarevision = 1 ; 
	
    } 
    
    render() {
	return (
	    <div>
		<Plot
		    style={{width : "100%"  , height : "100%" }}
		    data={this.state.data}
		    layout={this.state.layout}
		    revision={this.state.revision}
		    useResizeHandler={true}
		    graphDiv="GenericGraph"
		/>
	    </div>
	);
    }
}




/* 

   Helper function for getting stuff 
   
 */ 


export default function Component() {
    
    const theme = useTheme();
    const [graphs, setGraphs] = React.useState<any>({
	
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

    
    React.useEffect( () => {
	//update the graphs state with an async function 
	
	(async function gupdate() {
	    let { 
		eval_input_data, 
		eval_prop_data , 
	    }  = await evaluation.get_test_set_graph_data() 
	    setGraphs( graphs => ({...graphs,  
				   'g1' : eval_input_data , 
				   'g3' : eval_prop_data ,
	    }))
	})() ; 
	
	(async function gupdate2() {
	    let d = await evaluation.get_evaluation_graph_data() 
	    let df = await evaluation.get_filtered_evaluation_graph_data() 
	    setGraphs( graphs => ({...graphs,  
				   'g2' : d , 
				   'g4' : df , 
	    }))
	})() ; 	
	
	/* 
	(async function gupdate3() {
	    let d = await evaluation.boost_parameter_graph_data() 
	    setGraphs( graphs => ({...graphs,  
				   'g5' : d  , 

	    }))
	})() ; 		
	*/ 
	
	
    } , [])
    
    
    let gkeys = fp.keys(graphs) ;
    gkeys.sort() 
    
    return (
	<Box style={{padding : "2%" , 
		     boxSizing : 'border-box'}}>
	    <Grid container spacing={3}>
		{ 
		    gkeys.map( function(gk) {
			return ( 
			    <Grid item xs={6} key={gk} >
				<GenericViz init_data={graphs[gk]} />  
			    </Grid> 
			)
		    })
		}
	    </Grid> 
	</Box>
    );
}
