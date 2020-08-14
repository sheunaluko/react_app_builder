


### Medkit

Medkit is a collection of tools for building clinical decision support and medical education systems powered by two key knowledge bases: 
1) [Medical Subject Headings, Mesh](https://www.nlm.nih.gov/mesh/meshhome.html) [NIH] 
2) [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page) [Global] 

### Applications  

1. Clinical decision support 
   - Core Medkit components include: 
     - Problem List 
     - The MeSH Entity Selector [an interface to MeSH that facilitates quick building of the Problem List] * 
     - Signs and Symptoms 
     - Signs and Symptoms Selector 
     - Labs, Imaging, and Procedures Components/Selectors 
   - These components are either automatically populated via the FHIR api [Note1] or input by the user. Once the information is populated, the user can select from a wide range of actions (not yet implmented) which include: 
     - Calculate risk scores like ASCVD, MELD, CHADS-VASc 
     - Rank likely diagnoeses based on the available symptoms, labs, and imaging data
     - Show the diseases which this patient has risk factors for  
     - Much more. In the future, Medkit may provide an easy way for anyone in the world to create a Medkit "Widget". 

2. Medical education 
   - By leveraging the ability to query the MeSH and Wikidata ontologies, the application can answer questions such as: 
     - Show me pictures for all diseases that present with maculopapular rash. 
     - What are causes of hypokalemia? 


* Note1: This could be done by making Medkit a SMART on FHIR app which can be directly integrated into the EMR. It is not currently being implemented but the intent is to do this in the future to allow EHR embedding. 

* Asterisk indicates that the software for the feature has been completed 


### MeSH and Wikidata 

##### Mesh
MeSH is a comprehensive ontology of medical terminology that is updated annually by the National Institutes of Health in the United States of America [1]. Before a new article is added to the [MEDLINE](https://www.nlm.nih.gov/bsd/medline.html) database which [PubMed](https://pubmed.ncbi.nlm.nih.gov/) uses, MeSH descriptors are added to its metadata and these descriptors are used by the PubMed search engine to locate the article in the future. In addition, Wikidata medical entities like diseases and symptoms have MeSH identifiers. Thus, by representing a patients problem list using MeSH descriptors, Medkit is easily able to link a disease within the MeSH ontology to the corresponding entity in Wikidata and thus elucidate any associated symptoms, risk factors, possible treatments, etc. 

* [1] https://www.nlm.nih.gov/mesh/meshhome.html

##### Wikidata
Wikidata, launched in 2012, is one of the most recent successful efforts to create a global knowledge graph which is self maintaining [2]. Wikidata also holds much promise as a queryable global database of medical knowledge [3]. The concurrent expansion of networking and computing power, as well as the growing availability of digitized medical data will allow for more complex and useful insight to be gained from knowledge bases such as Wikidata. Projects already exists which aim to populate Wikidata with more high quality medical information, such as WikiProject Medicine [4]. In the future, there may even exist a system which incentivizes users to contribute medical information to Wikidata by rewarding them with a digital token that has an open market value, such as the system employed by Everipedia [5]. 

* [2] https://en.wikipedia.org/wiki/Wikidata
* [3] [Turki et al, 2019. Wikidata: A large-scale collaborative ontological medical database](https://doi.org/10.1016/j.jbi.2019.103292)
* [4] https://en.wikipedia.org/wiki/Wikipedia:WikiProject_Medicine
* [5] https://everipedia.org/


### Architecture  

Medkit components utilize well-established and actively maintained ontologies (MeSH, Wikidata) for their queries. This makes Medkit a future proof interface for building clinical decision support and medical education systems. 

Medkit is written as a web application to optimize development iteration time and ease of application distribution. Specifically, Medkit utilizes [React](https://reactjs.org/) with the user interface framework [Material UI](https://material-ui.com/) for interface development. [Typescript](https://www.typescriptlang.org/) is used rather than javascript. The combination of Typescript, React, and Material-UI achieves a robust harmony between software iteration time, stability, and likelihood of persistent functionality into the future. 

Because http requests from web applications are limited by the cross origin resources sharing policy (CORS), when making http get requests Medkit utilizes a "hyperloop" service hosted in Google Cloud at the following public IP: 35.227.177.177 [note2]. This choice has other benefits as well, the main one being that there is a single configurable endpoint for all web application queries. In the future, this will enable:
1) Authentication of the api prior to servicing requests 
2) Load balancing 
   

* Note2: The hyperloop service is provided by a public [tidyscripts](https://github.com/sheunaluko/tidyscripts) node, the code which is available open source [here](https://github.com/sheunaluko/tidyscripts/blob/master/src/deno/bin/hyperloop_init.ts). [Tidyscripts](https://github.com/sheunaluko/tidyscripts) is also maintained by the maintainer of Medkit. This separation of cloud enpoint and application interface allows for more system modularity - the cloud code can be upgraded independently of the client code and vice versa. 






