import React from 'react' 
import {useState} from 'react'
import { useTheme } from "@material-ui/core/styles";


import * as tsw from 'tidyscripts_web' 


import {
    Container, 
    Box 
} from "./list" 


export default function Widget() { 
    
    const theme = useTheme();

    
    return ( 
	<Container >  
	    <div
		style={{
		    backgroundColor: theme.palette.background.paper,
		    padding: "2%",
		    borderRadius: "15px"
		}}
            >

		
		<Box> 
		    <h1> 
			Hello! 
		    </h1>
		</Box>
	    </div>
	    
	</Container> 
	
    )
    
} 
