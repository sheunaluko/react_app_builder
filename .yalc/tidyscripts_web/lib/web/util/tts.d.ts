export declare var tts: any;
export declare var speech_que: SpeechOps[];
export declare function finished_utterance(): Promise<void>;
export declare function finished_speaking(): Promise<void>;
export declare function is_speaking(): boolean;
interface SpeechOps {
    text: string;
    voiceURI?: string | null;
    rate?: number;
}
export declare function get_voice(vuri: string): any;
export declare function _speak(ops: SpeechOps): Promise<void>;
export declare function speak(ops: SpeechOps): void;
export {};
