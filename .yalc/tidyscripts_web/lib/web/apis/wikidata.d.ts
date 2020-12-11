interface WikiDataOps {
    action: string;
    sites: string;
    titles: string;
    props: string;
    languages: string;
    format: string;
}
export declare function qwikidata(ops: WikiDataOps): Promise<any>;
interface WikiEntitySearchOps {
    titles: string;
    props: string;
}
export declare function WikiEntities(ops: WikiEntitySearchOps): Promise<any>;
export declare function wikidata_search_meshid(did: string): Promise<void>;
export declare function wikidata_instances_of_id(id: string): Promise<any>;
interface SparqlTemplateOps {
    template: string;
    replacers: string[][];
    url_base: string;
    url_params: any;
    param_key?: string;
}
export declare function sparql_template_fn(ops: SparqlTemplateOps): Promise<any>;
export declare function entity_with_meshid(id: string): Promise<any>;
export declare function diseases_with_symptoms(wikidata_qids: string[]): Promise<any>;
export declare function reverse_findings(wikidata_qids: string[]): Promise<any>;
export declare var ALL_PREDICATES: any;
export declare var PREDICATE_TO_ID: any;
export declare var ID_TO_PREDICATE: any;
export declare var PREDICATES_READY: boolean;
export declare function all_predicates(): Promise<any>;
export declare function default_props_ready(): Promise<void>;
export declare function data_about_entities(entities: string[]): Promise<any>;
export declare function direct(): Promise<unknown>;
export declare function x(): Promise<any>;
export declare function default_props_for_ids(mesh_ids: string[]): Promise<any>;
export declare function default_props_for_qids(qids: string[]): Promise<any>;
export {};
