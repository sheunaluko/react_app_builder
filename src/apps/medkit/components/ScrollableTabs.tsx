import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import * as tsw from "tidyscripts_web";
import * as wiki_props from "../dev/wikidata_medical_properties"
import * as mui from "./list" 
import { useTheme } from "@material-ui/core/styles";

let { 
    Accordion, 
    AccordionSummary, 
    AccordionDetails,
    ExpandMoreIcon, 
    Grid,
    Link, 
    Icon 
} = mui 


let fp = tsw.util.common.fp;
let log = console.log;
let debug = tsw.util.common.debug;

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
	<div
	    hidden={value !== index}
	>
	    {value === index && (
		 <Box style={{padding : "18px" , 
			      height : "100%", 
			      boxSizing : "border-box", 			   
			      overflow : "hidden" 
		 }}>
		     {children}
		 </Box>
	    )}
	</div>
    );
}


export default function ScrollableTabsButtonAuto(props : any) {
    

    let {state,setState} = props.parentState ; //get parent state 
   

    const [value, setValue] = React.useState(0);
    const theme = useTheme(); 

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
	setValue(newValue);
    };
    
    
    let {TabLabels, TabContent} = GetTabUi(state,value) 

    return (
	<div style={{
	    height : "100%", 
	    display  : "flex" ,
	    flexDirection : "column", 
	    backgroundColor  : theme.palette.primary.light
	}}>
	    
	    <Box>
		<AppBar position="static" color="default">
		    <Tabs
			value={value}
			onChange={handleChange}
			indicatorColor="primary"
			textColor="primary"
			variant="scrollable"
			scrollButtons="auto"
			aria-label="scrollable auto tabs example"
		    >
			
			{TabLabels }
			
		    </Tabs>
		</AppBar>
	    </Box>
	    
	    <Box style={{flexGrow : 1 , overflow : "auto"}}>
		{TabContent} 
	    </Box>
	    
	</div>
    );
}



function GetTabUi(state: any, value : any) {
    
    let results = state.results_cache 
    
    /* 
       Given that I added the diagnostic_cache ..  could consider refactoring this to make use of that! 
    */
    
    let tmp =  fp.keys(results).map( function(p:string) {
	// p is a property id here, so we will look up its label 
	let {direction, property} = wiki_props.properties.by_id[p]
	// - 
	let prepend = ( direction == "forward" ) ?  "< " : "> "
	// - also, need to count how many matches there are for this  property 
	let qids = fp.keys(results[p])
	let nums = qids.map( (qid:string)=> results[p][qid].matches.length )
	let all_match_ids = fp.flat_once( 
	    qids.map( 
		(qid:string)=> results[p][qid].matches.map( 
		    (m:any) => m.match_id 
		)
	    )
	)
	
	//debug.add("allmatch."+ p , all_match_ids)
	
	let unique_match_ids = new Set(all_match_ids) 
	let num_unique_matches = unique_match_ids.size
	
	//debug.add("uniquematch."+ p , unique_match_ids)	
	//debug.add("nums." + p , nums)
	
	//sort the qids by the nums 
	let qids_n_nums = fp.zip(qids,nums)
	qids_n_nums.sort( (a:any,b:any) => (b[1] -a[1]))
	
	let tot  = nums.reduce( fp.add, 0 ) 
	
	return {
	    property , 
	    prop_id : p, 
	    num_unique_matches ,
	    tot, 
	    direction, 
	    qids_n_nums,
	    tab_label : `${property} (${num_unique_matches}/${tot})`	    
	    //tab_label : `${prepend} ${property} (${num_unique_matches}/${tot})`
	} 
	

    })    
    
    //sort by total 
    tmp.sort( (a:any,b:any)=> (b.num_unique_matches - a.num_unique_matches) ) 
    
    //then build the UI now 
    let TabLabels = fp.enumerate(tmp).map( function(y : any) {
	let [index,e ] = y
	return ( <Tab key={e.property} label={e.tab_label} /> ) 
    })
    
    
    let TabContent = fp.enumerate(tmp).map( function(y : any) {
	let [index,e ] = y	
	
	let {property,prop_id, num_unique_matches,direction,qids_n_nums} = e 
	
	return (
	    <TabPanel key={e.property} value={value} index={index}>
		<Box style={{width : "100%"}}>
		    <Grid container spacing={2}>
			{
			    qids_n_nums.map( (e : any)=> {
				
				let [qid, num ] = e ; //should be sorted already 
				
				let {label,matches} = results[prop_id][qid]
				
				if (num == 0 ) { return null } //dont display in this case 
				
				
				return ( 
				    
				    <Grid key={label} item xs={6}>
					<Accordion >
					    <AccordionSummary
						expandIcon={<ExpandMoreIcon />}
					    >
						<Typography variant="subtitle1"  >{`${label} (${num})`}</Typography>
					    </AccordionSummary>
					    
					    <AccordionDetails> 
						<Box style={{
						    maxHeight : "16vh", 
						    overflow : "auto", 
						    padding : "3px" , 
						}}>
						    
						    {
							matches.map( (m:any)=> {
							    return (
								
								<Box key={m.match_id}>
								    <Typography variant="subtitle1"> 
									{m.match_label} 
									<Link href={`https://www.wikidata.org/wiki/${m.match_id}`} > 
									    {` (${m.match_id})`} 
									</Link>		
								    </Typography>
								</Box>
								
							    )
							})
						    } 
						    
						</Box>
					    </AccordionDetails>
					</Accordion>
				    </Grid>
				    
				    
				) 
			    })

			} 
		    </Grid>
		</Box>
	    </TabPanel>
	)
    })

    

    return { TabLabels, TabContent } 
    
} 
