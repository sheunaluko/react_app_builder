import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import { ObjectInspector, TableInspector } from "react-inspector";

import Context from "./NccihBrowserContext";


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
  Card, 
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

let herbs = tsw.apis.nccih_herbs
    
    
let debug = tsw.util.common.debug;

declare var window: any;



export default function UI() {
    const theme = useTheme();
    const [state, setState] = React.useState<any>({
       msg : "Hey!" , 
       herb_data : [] , 
  });
    
    React.useEffect(  ()=> {
	
	async function go() { 
	    let data = await herbs.get_all_herb_data() 
	    debug.add("herb_data",data) 
	    setState({...state , herb_data : data}) 
	} 
	
	go() 
	
    }, []) 

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
	       NCCIH Herbal Treatment Browser 
            </Typography>
          </div>
	  
	  <br/> 
	  
	  <Box> 
	      
	      <Grid container spacing={4} > 
		  {
		      state.herb_data.map( function(d:any){
			  return ( 
			      <Grid key={d['name']} item xs={6}> 
				  <HerbCard {...d} /> 
			      </Grid>
			  ) 
		      })
		  } 
	      </Grid>
	      
	  </Box>
	  


        </div>
      </Container>
    </Context.Provider>
    )   
}


function HerbCard(data : any ) { 
    
    let key_order = [ 
	"Common Names", 
	"Latin Names", 
	"Background", 
	"How Much Do We Know?", 
	"What Have We Learned?" , 
	"What Do We Know About Safety?"
    ]

    let img_src = data["img_src"] 
    let name    = data["name"] 
    
    
    return ( 
	<Card style={{padding:"5%"}}> 
	    <Typography variant="h6"> 
		{name}
	    </Typography>
	    
	    <img style={{width : "100%"}} src={img_src}></img> 
	    
	    <Accordion>
		<AccordionSummary
		    expandIcon={<ExpandMoreIcon />}
		>  
		    <Typography variant="subtitle1">
			Information
		    </Typography>
		    
		</AccordionSummary>
		<AccordionDetails> 
		    
		    <Box>
			
			{
			    key_order.map( function(k:string) { 
				return ( <Box key={k}> {AccordionWithTitleAndList(k,data[k])} </Box> ) 
			    })
			}
			
			
		    </Box>
		    
		</AccordionDetails>
		
	    </Accordion>
	    
	</Card> 
    ) 
    
} 


function AccordionWithTitleAndList(title: string, list : any) { 
    return ( 
	<Accordion >
	    <AccordionSummary
		expandIcon={<ExpandMoreIcon />}
	    >  
		<Typography variant="subtitle2">
		    {title}
		</Typography>
	    
	    </AccordionSummary>
	    <AccordionDetails> 
		<ul> 
		    {
			list.map( (l:any)=> {
			    return (<li key={l} style={{margin :"10px"}}>{l}</li>) 
			})
		    }
		</ul>
		
	    </AccordionDetails>
	    
	</Accordion>
    )
} 
