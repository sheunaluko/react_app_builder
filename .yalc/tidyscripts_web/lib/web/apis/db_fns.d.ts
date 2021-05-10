interface RetrievalResult {
    [k: string]: any;
}
interface CDIR_OP {
    db_id: string;
    ids: string[];
    ttl_ms: number;
    retrieval_fn: (ids: string[]) => Promise<RetrievalResult>;
}
export declare function cached_db_id_request(ops: CDIR_OP): Promise<RetrievalResult>;
export declare function mesh_retrieval_function(ids: string[]): Promise<RetrievalResult>;
export declare function cached_mesh_id_request(ids: string[]): Promise<RetrievalResult>;
export declare function qid_retrieval_function(ids: string[]): Promise<any>;
export declare function cached_qid_request(ids: string[]): Promise<RetrievalResult>;
export {};
