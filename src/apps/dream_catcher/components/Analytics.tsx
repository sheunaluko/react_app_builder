import React from 'react';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import Box from '@material-ui/core/Box';
import MenuIcon from '@material-ui/icons/Menu';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';

import ReactWordcloud from "react-wordcloud";
import * as mfb from "./Firebase" 


import AnalyticsDrawer from "./AnalyticsDrawer" ; 
import * as AU from "./AnalyticsUtils" ; 

let log = console.log ; 
declare var window :any  ; 


/* UTILITY FUNCTIONS  */ 
async function get_dreams() { return  fp.values( ( await mfb.get_decrypted_dreams() ).value )  }  

async function get_dream_descriptions() {
    let dreams = await get_dreams()   
    return fp.map_get(dreams,'description')
} 


async function filter_with_name(tokens :any , name : string) {
    console.log("Filtering: " + name) ; 
    let to_filter = fp.map_get( (await AU.load_word_set(name)) , 'word') 
    console.log(`${to_filter.length} items to filter out`) 
    tokens = tokens.filter( w => !to_filter.includes(w) )    
    return tokens 
} 

async function get_word_cloud_stats() {
    let des = await get_dream_descriptions() 
    //concatenate into one string ... 
    let all_des = des.join(" ") //concat with a space 
    //tokenize
    let tokens = all_des.split(new RegExp("[ \n]")).map(x=>x.toLowerCase().trim()).filter( x=> !fp.is_empty(x)) 
    
    //filter the "Simple" words 
    if (true) {
	

	//tokens = await filter_with_name(tokens, "Pronouns")
	tokens = await filter_with_name(tokens, "User")	
	tokens = tokens.filter( w => !AU.pronouns.includes(w) )    	
	tokens = tokens.filter( w => !AU.aux_filter.includes(w) )    		
	
    } 
    
    let stats = {} 
    for (var token of tokens) {
	let val = stats[token]
	if (val) {
	    stats[token] = val + 1 
	} else { 
	    stats[token] = 1 
	} 
    } 
    return { 
	des, all_des, tokens, stats 
    } 
} 


async function build_word_cloud_ops() {
    let {
	stats 
    } = await get_word_cloud_stats() 
    
    let words = fp.keys(stats) 
    let ops = words.map( (w:string) => ({ text : w , value : stats[w] }) ) 
    
    return ops 
} 

window.wc = {
    get_dream_descriptions, get_word_cloud_stats, build_word_cloud_ops , get_dreams 
} 


/* ----- */ 

function Analytics() {
    
    let [words,setWords] = React.useState([]) 
    let [refresh_id,set_refresh_id] = React.useState(0)     
    
    const options = {
	rotations: 1,
	rotationAngles: [0],
	fontSizes : [20,100]  ,
    }
    
    React.useEffect( ()=> {
	
	(async function build_cloud() {
	    let ops = await build_word_cloud_ops() 
	    log("Setting words") 
	    console.log(ops) 
	    setWords(ops) 
	})()
	
	
	
    }, []) 
    
    let toggle = ()=> smgr.get("AdrawerToggle")()     
    let refresh = () => set_refresh_id( id => id + 1 ) 
    
    return (
	<Container style={{ marginTop : "20px" , }}  id={refresh_id}>
	    
	    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
		<MenuIcon />
	    </IconButton>

	    
	    <Card> 
		<CardContent>
		    <Box style={{display:"flex", flexDirection:"row"}}>
			<Typography> 
			    Dream Cloud
			</Typography>
			<Box style={{flexGrow :1}}/> 
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={refresh} >
			    <RefreshIcon />
			</IconButton>

		    </Box>
		    <div style={{ marginTop : "10px" , width: "100%", height: "100%" }}>
			<ReactWordcloud words={words} maxWords={200} options={options} />
		    </div>	
		</CardContent>
	    </Card>
	    
	    <AnalyticsDrawer /> 
	</Container>
    );
}


export default Analytics ; 


//TODO 
// BAR CHART of the words and their frequencies  (there are over 1000 and not all showing obviously) 
// For word cloud can try subtracting out some items 
// create user settings option for words that will be filtered from analyses 
// bar chart of dream times 

// trajectory of certain words 
