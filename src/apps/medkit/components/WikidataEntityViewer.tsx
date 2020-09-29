import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";
import { ObjectInspector, TableInspector } from "react-inspector";
import * as wdev from "./WikidataEntityViews";

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

interface State {
  state: any;
  setState: any;
}

const Context = React.createContext<State>({ state: null, setState: null });

async function get_data_for_qid(qid: string) {
  let d = await wikidata.default_props_for_qids([qid]);
  return d[qid];
}

export default function EntityViewer(props: any) {
  let { qid = "Q164727", nolabel } = props || {};

  const theme = useTheme();
  const [state, setState] = React.useState<any>({
    selected: 20,
    qid: qid,
    wikidataInfo: null
  });

  React.useEffect(() => {
    /*
        TODO -- add an async handler to check if the websocket is connected 
	     -- after its connected then run the below function 
       
       */

    get_data_for_qid(qid).then((qid_data: any) => {
      debug.add("qid_data", qid_data);
      debug.log("Saved retrieved 'qid_data'");
      setState({ ...state, wikidataInfo: qid_data });
    });
  }, []);

  /* 
    Architecture: 
    each key becomes an expandable row 
    each key is its own widget 
    the program takes the keys then renders each item in that row using the widget for that key
    and creates a whole row and saves it 
    all the rows get turned into dropdown components (expandable) and are rendered in a col
    
    
    */

  let WikiWidget = () => (
    <Box>
      {nolabel ? null : (
        <Typography variant="body1">
          <b>Label: </b>
          <Link
            href={fp.format("https://www.wikidata.org/wiki/{}", [state.qid])}
          >
            {state.wikidataInfo["itemLabel"]}
          </Link>
        </Typography>
      )}

      <Typography variant="body1">
        <b>Description: </b>
        {state.wikidataInfo["description"]}
      </Typography>

      <Typography style={{ flexGrow: 1 }} variant="body1">
        <b>Wikidata ID: </b>
        <Link href={fp.format("https://www.wikidata.org/wiki/{}", [state.qid])}>
          {state.qid}
        </Link>
      </Typography>

      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="body1">
            <b>Medical Properties</b>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {fp.keys(state.wikidataInfo).map((k: string) => {
              let renderer = wdev.get_renderer(k);

              return (
                <Accordion key={k}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography variant="subtitle2">{k}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderer(state.wikidataInfo[k])}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  let LoadingWidget = () => <Typography>Loading...</Typography>;

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
          {state.wikidataInfo ? <WikiWidget /> : <LoadingWidget />}
        </div>
      </Container>
    </Context.Provider>
  );
}
