export interface RecognitionOps {
    continuous?: boolean;
    interimResults?: boolean;
    onStart?: () => void;
    onSoundStart?: () => void;
    onSoundEnd?: () => void;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onResult?: () => void;
    onError?: () => void;
    onEnd?: () => void;
    lang?: string;
    result_dispatch?: string;
}
export declare function get_recognition_object(ops?: RecognitionOps): any;
