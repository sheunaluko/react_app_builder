import React, {useState, useEffect} from 'react' 
import { useTheme } from '@material-ui/core/styles';
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 


let { 
    Container , 
    MicIcon, 
    MicOffIcon, 
    IconButton, 
    CircularProgress,
    LinearProgress, 
    Divider, 
    Grid, 
    TextField, 
    List, 
    ListItem, 
    Button , 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    ExpandMoreIcon,
    
} = mui  


let vi = tsw.util.voice_interface

/* 
   
   [ ]  TTS -> allow user to select the voice and save this to database (use tsw api) 
   
   [ ] move the voice panel compoenent into TSW lib 
   
   [ ] disable power update when componenet not mounted  ? 
   
   [ [ initialize enabled / disabled state by reading tsw instead of defaulting to disabled ? 


 */ 


declare var speechSynthesis : any ;
let tts_test_input_id = "voice_panel_test" 




export default function Component() { 
    
    const theme = useTheme();    
    
    const [micState, setMicState] = useState(0) 
    const [txtState, setTxtState] = useState("...")     
    const [enabledState, setEnabledState] = useState(false) 
    const [speechState, setSpeechState] = useState(false) 
    const [voicesState, setVoicesState] = useState([]) 
    
    
    
    useEffect( () => { 
	window.addEventListener('tidyscripts_web_speech_recognition_result' , async function(e :any) {
	    console.log("Got recognition result!") 
	    let text = e.detail.trim().toLowerCase()
	    console.log(text) 
	    setTxtState(text) 
	    setSpeechState(false)
	}) 
    }, [])

    
    var mic_max = 0  ; 
    
    useEffect( () => { 
	window.addEventListener('tidyscripts_web_mic' , async function(e :any) {
	    let power = e.detail
	    mic_max = Math.max(mic_max,power)
	    
	    let val = 100*(power/mic_max) 
	    setMicState(val)
	})
	
	setInterval(
	    function() {
		mic_max = 0 
	    } , 
	    10*1000
	) 

    }, []);     
    
    useEffect( () => { 
	setVoicesState(speechSynthesis.getVoices()) 
    }, []);         
    

    
    return ( 
	
	<Container> 
	<div style={{ 
	    backgroundColor : theme.palette.background.paper , 
	    padding : "2%",  
	    borderRadius : "15px",
	    
 	}}> 
	
	<h3> Voice Interface Panel </h3>
	
	<Divider />
	
	<br/>		
	
	<Grid container spacing={2} > 

	    <Grid item xs={12} sm={6}>
		<div style={{display: "flex", flexDirection :"row"}}> 
		    <p> Speech Recognition   </p>
		    <Button variant="outlined" size="small" color="primary" style={{margin: "8px"}} onClick={
			function(){
			    
			    
			    if (vi.recognition_state == "LISTENING" || vi.recognition_state == "PAUSED" ) {
				console.log("Stopping recog") 
				vi.stop_recognition() 
				setMicState(0) 
				setEnabledState(false) 
				setSpeechState(false) 
			    } else { 
				
				let onSpeechStart = function () {
				    setSpeechState(true)
				}
				
				vi.initialize_recognition({onSpeechStart})
				setEnabledState(true)
			    } 

			}
		    }>
			{ 
			    enabledState ? "Disable" : "Enable" 
			} 
		    </Button>
		</div>
		<br/>			
		<div style={{width : "90%" }}>
		    <LinearProgress variant="determinate" value={micState} />
		</div>
		<br/>
		
		{ 
		    
		    speechState ?  <CircularProgress variant="indeterminate"/>  : (<div>You said: {txtState} </div>) 
		} 
		
	    </Grid>

	    <Grid item xs={12} sm={6}>
		<div style={{display: "flex", flexDirection :"row"}}> 
		    <p> Text to Speech (TTS)    </p>
		</div>
		
		
		<div style={{display : "flex" , flexDirection : "row" , justifyContent : "space-around" }}> 
		    <Button variant="outlined" color="primary" onClick={()=> vi.speak( (document.getElementById(tts_test_input_id)! as any).value) }> 
			Test 
		    </Button>
		    
		    <TextField  id={tts_test_input_id} label="test text" defaultValue="voice panel test" />		
		</div>
		
		<br /> 
		<br /> 			
		
		<Accordion> 
		    
		    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
			Select TTS Voice  
		    </AccordionSummary>

		    <AccordionDetails> 
			
			<div style={{maxHeight : "250px", marginTop: "2px", overflow : "scroll"}}> 
			    

			    <List> 
				{ 
				    voicesState.map( function(v : any) { 
					return ( 
					    <ListItem key={v.voiceURI}> 
						<VoiceItem v={v}/>
					    </ListItem>
					)})
				} 
			    </List>
			    
			</div>
			
		    </AccordionDetails>
		</Accordion>
		
		
	    </Grid>	    
	    
	    
	    
	    </Grid>
	    
	    
	</div> 
	
	</Container> 
    )

}



function VoiceItem(props : any) {
    
    let  v = props.v ;
    
    let buttonStyle = { 
	margin : "8px" 
    } 
    
    return ( 
	<div style={{width: "100%" , display:"flex",  justifyContent :"space-between" }}>
	    <div style={{flexGrow : 1 }}> 
		<p >{v.name} ({v.lang})</p>
	    </div>
	    <Button variant="outlined" 
		    size="small" 
		    color="secondary" 
		    style={buttonStyle} 
		    onClick={()=> vi.speak_with_voice( (document.getElementById(tts_test_input_id)! as any).value, v.voiceURI) }>Test</Button>
	    <Button variant="outlined" size="small" color="primary" style={buttonStyle}>Select</Button>	    
	    
	    
	</div> 
    ) 
} 



