import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import { ObjectInspector, TableInspector } from "react-inspector";

import PLContext from "./PLContext";

import MeshSearch from "./MeshSearch2";
import EntityViewer from "./WikidataEntityViewer";

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

function load_selected() {
    
    let dta = localStorage["diagnoser.selection"]
    
    if (dta) { 
	
	var tmp = JSON.parse(dta) 
	//ensure that wikidataInfo exists for all of them 
	return tmp.map( (x:any)=> {
	    if (!x.wikidataInfo) {
		x.wikidataInfo = {} 
	    }
	    return x 
	})
	
    } else { 
	
	// client oes not have any cache 
	
	return []
    } 
     
    
	
} 



export default function PL() {
    const theme = useTheme();
    const [state, setState] = React.useState<any>({
	tabValue: 1,
	selected: load_selected() , 
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
    <PLContext.Provider value={{ state, setState }}>
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
              Diagnosis Support Tool
            </Typography>
          </div>

          <Tabs
            //orientation="vertical"
            value={state.tabValue}
            onChange={(event: any, newValue: any) => {
              setState({ ...state, tabValue: newValue });
            }}
          >
            <Tab label="Analyze" />
            <Tab label="Select Clinical Features" />
          </Tabs>
          <TabPanel value={state.tabValue} index={0}>
            <PLDisplay />
          </TabPanel>
          <TabPanel value={state.tabValue} index={1}>
            <PLEdit />
          </TabPanel>
        </div>
      </Container>
    </PLContext.Provider>
  );
}

function PLDisplay() {
  return (
    <PLContext.Consumer>
      {function({ state, setState }) {
        return <PLDisplayPapers selected={state.selected} />;
      }}
    </PLContext.Consumer>
  );
}

interface wdobj {
  type: string;
  value: string;
  itemLabel: string;
}

interface dsd {
  item: wdobj;
  itemLabel: wdobj;
  symptom: wdobj;
  symptomLabel: wdobj;
}

interface tdsd {
  itemId: string;
  itemLabel: string;
  symptomId: string;
  symptomLabel: string;
}

export function transform_dsd(d: dsd): tdsd {
  return {
    itemId: fp.last(d.item.value.split("/")),
    itemLabel: d.itemLabel.value,
    symptomId: fp.last(d.symptom.value.split("/")),
    symptomLabel: d.symptomLabel.value
  };
}

export function get_dsd_summary(d: tdsd[]) {
  var summary: any = {};

  for (var i of d) {
    debug.log("Processing: " + i.itemLabel);

    if (summary[i.itemId]) {
      //already had a match so we will append
      summary[i.itemId].matches.push(i);
    } else {
      //no match yet so we create the data structure
      summary[i.itemId] = {
        itemLabel: i.itemLabel,
        itemId: i.itemId,
        matches: [i]
      };
    }

    //update the count (i know... not the most efficient but for now its ok)
    summary[i.itemId].count = summary[i.itemId].matches.length;
  }

  debug.log("done");

  return summary;
}

export function get_dsd_rankings(d: tdsd[]) {
  let sum = get_dsd_summary(d);
  let cts = fp.values(sum).map(x => [x.count, x.itemLabel, x.itemId]);

  cts.sort(function(a: any, b: any) {
    return b[0] - a[0];
  });

  return cts;
}

export function print_dsd_rankings(dsd: any) {
  let cts = get_dsd_rankings(dsd);
  cts.map((x: any) => console.log(fp.format("{}, {}", x)));
}

function PLDisplayPapers(props: any) {
  let { selected } = props;

  var [elevations, setElevations] = React.useState<any>({});

  let deactivate = function(res: string) {
    elevations[res] = 3;
    setElevations({ ...elevations });
  };

  let activate = function(res: string) {
    elevations[res] = 10;
    setElevations({ ...elevations });
  };

  let [dsd, setDsd] = React.useState<any>([]);
  let [dsd_summary, set_dsd_summary] = React.useState<any>([]);
  let [dsd_rankings, set_dsd_rankings] = React.useState<any>([]);

  React.useEffect(() => {
    const qids = selected.map((x: any) => x.wikidataInfo.itemId);
    debug.add("qids", qids);
    //debug.log("Retrieved the following qids: " + qids)
    const disease_symptom_data = wikidata.diseases_with_symptoms(
      qids.map((s: string) => "wd:" + s)
    );
    disease_symptom_data.then((dsd: any) => {
      debug.log("Adding disease symptom data to debugger with key 'dsd'");
      debug.add("dsd", dsd);
      setDsd(dsd);

      debug.log("computing dsd summary");
      let summary = get_dsd_summary(dsd.map(transform_dsd));
      set_dsd_summary(summary);

      debug.log(
        "Adding disease symptom data SUMMARY to debugger with key 'dsd_summary'"
      );
      debug.add("dsd_summary", summary);

      debug.log("computing dsd rankings");
      let cts = get_dsd_rankings(dsd.map(transform_dsd));
      set_dsd_rankings(cts);

      debug.log(
        "Adding disease symptom data RANKINGS to debugger with key 'dsd_cts'"
      );
      debug.add("dsd_cts", cts);
    });

    /* 
	   
	   Make a pie chart based on 
	   1) the frequency of the disease (take top N diseases) with N a configurable parameter 
	   
	 */
  }, []);

  let paper_style = {
    padding: "2%",
    margin: "10px"
  };

  let DSDRenderUnit = function(e: any) {
    let { itemId, itemLabel, symptomId, symptomLabel } = transform_dsd(e);

    return (
      <Paper key={itemId + symptomId} style={paper_style}>
        <Typography variant="h6">{itemLabel}</Typography>

        <Typography>{symptomLabel}</Typography>
      </Paper>
    );
  };

  let DSDInfo = function() {
    return <div>{dsd.map(DSDRenderUnit)}</div>;
  };

  let RankingsRenderUnit = function(e: any) {
    let [count, label, itemId] = e;

    React.useEffect(() => {
      //
    }, []);

    return (
      <Paper key={label} style={paper_style}>
        <Typography variant="h5">
          <Link href={fp.format("https://www.wikidata.org/wiki/{}", [itemId])}>
            {label}
          </Link>
        </Typography>

        <Typography>
          Symptom Matches: {count} <br />
        </Typography>

        <Box>
          {dsd_summary[itemId].matches.map(function(e: any) {
            let { itemId, itemLabel, symptomId, symptomLabel } = e;
            return (
              <Chip
                key={symptomId}
                label={symptomLabel}
                onClick={() =>
                  window.open(
                    fp.format("https://www.wikidata.org/wiki/{}", [symptomId])
                  )
                }
              />
            );
          })}
        </Box>

        <Box>
          <EntityViewer qid={itemId} nolabel={true} />
        </Box>
      </Paper>
    );
  };

  let RankingsInfo = function() {
    return <div>{dsd_rankings.slice(0, 15).map(RankingsRenderUnit)}</div>;
  };

  return (
    <div style={{ flexGrow: 1, padding: "1%" }}>
      <Typography variant="h6">Selected Features:</Typography>

      <Container>
        <br />
        <br />
        <Grid container spacing={3}>
          {selected.map(function(x: any) {
            let { option, wikidataInfo, treeInfo } = x;

            return (
              <Grid item xs={2} key={wikidataInfo.itemId}>
                <Chip
                  variant="outlined"
                  color="primary"
                  label={option.label}
                  onClick={() => window.open(option.resource)}
                />
              </Grid>
            );
          })}
        </Grid>
        <br />
        <br />
      </Container>

      <Typography variant="h6">Ranked Diagnoses:</Typography>

     
      <RankingsInfo />
    </div>
  );
}

/*
   // TODO - can have: 
   // high yield diagnostic steps 
   // high yield additional symptoms / features   
   //    - and how they impact suggestions 
   // high yield treatments  
 */ 

export function TreeRow(ss: string[]) {
  return (
    <Breadcrumbs key={ss.join("")} maxItems={4} aria-label="breadcrumb">
      {ss.map((s: any) => (
        <Link key={s} color="inherit" href="#">
          {s}
        </Link>
      ))}
    </Breadcrumbs>
  );
}

function WikidataDisplay(info: any) {
  return (
    <div style={{ fontSize: "20px" }}>
      <ObjectInspector data={info} />
    </div>
  );
}

function PLEdit() {
  return (
    <PLContext.Consumer>
      {function({ state, setState }) {
        //define callbacks for meshsearch

        return (
          <div style={{ flexGrow: 1, padding: "1%" }}>
            <MeshSearch
              selectHandler={function(e: any) {
                log("Received selection");
                log(e);
                window.selection = e;
                setState({ ...state, selected: e });

                //overwrite the local storage
                localStorage["diagnoser.selection"] = JSON.stringify(e);
              }}
            />
          </div>
        );
      }}
    </PLContext.Consumer>
  );
}

/* 

   has immediate cause 
   drug used for treatment 
   
   symptoms 

*/
