


### MEDKIT 

A collection of tools for building clinical decision support and medical education systems. 

### Architecture  

Medkit  components utilize well-established ontologies for their queries, including: 
1) Medical Subject Headings (MeSH)  [NIH]
2) Wikidata [Global]

Medkit was written as a web application to optimize development iteration time and ease of application distribution. Because http requests from web applications are limited by the cross origin resources sharing policy (CORS), when making http get requests Medkit utilizes a "hyperloop" service hosted in Google Cloud at the following public IP: 35.227.177.177. This choice has other benefits as well, the main one being that there is a configurable endpoint through which all web application queries will come through, thus leaving the door open for many future possibilities such as: 
1) authentication of the api prior to servicing requests 
2) by setting up a load balancer at this endpoint the application can quickly scale horizontally 
   - for high loads can develop request caching strategies at the server or client side 
   

3) The hyperloop service is provided by a public "sattsys" node, the code which is available open source here: https://github.com/sheunaluko/tidyscripts/blob/master/src/deno/bin/hyperloop_init.ts. This allows for more system modularity - the cloud code can be upgraded independently of the client code. 





