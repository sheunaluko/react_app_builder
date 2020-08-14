import React from 'react';
import {useState} from 'react' ; 
import * as util_components from "./utils" 
import { useTheme } from '@material-ui/core/styles';
import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 

import PLContext from "./PLContext" 

let { Container, 
      Grid, 
      Paper, 
      AddCircleOutlineIcon,      
      Link, 
      TextField, 
      FormControl,
      FormHelperText, 
      Breadcrumbs, 
      Chip,
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
      Typography } = mui 


let fp = tsw.util.common.fp
let mesh = tsw.apis.mesh 
let wikidata = tsw.apis.wikidata 
let log = console.log 


// element with 
// PROBLEM LIST 
// { TABS (Display | Edit )  }  
// { Display=> PLDispalyer | Edit=> WrappedMeshSearch   } 

