import textToSpeech from "@google-cloud/text-to-speech";
import { NextResponse } from "next/server";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/configs/firebaseConfig";


// Initialize the client
const client = new textToSpeech.TextToSpeechClient({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
});

// Voice configuration mapping
const voiceConfigs = {
    // African voices
    af_sarah: { languageCode: 'af-ZA', name: 'af-ZA-Standard-A', ssmlGender: 'FEMALE' },
    af_sky: { languageCode: 'af-ZA', name: 'af-ZA-Standard-B', ssmlGender: 'FEMALE' },
    
    // American voices
    am_adam: { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'MALE' },
    am_echo: { languageCode: 'en-US', name: 'en-US-Standard-B', ssmlGender: 'MALE' },
    am_eric: { languageCode: 'en-US', name: 'en-US-Standard-C', ssmlGender: 'MALE' },
    am_fenrir: { languageCode: 'en-US', name: 'en-US-Standard-D', ssmlGender: 'MALE' },
    am_liam: { languageCode: 'en-US', name: 'en-US-Standard-E', ssmlGender: 'MALE' },
    am_michael: { languageCode: 'en-US', name: 'en-US-Standard-F', ssmlGender: 'MALE' },
    am_onyx: { languageCode: 'en-US', name: 'en-US-Standard-G', ssmlGender: 'MALE' },
    
    // High-fidelity voices
    hf_alpha: { languageCode: 'en-US', name: 'en-US-Studio-M', ssmlGender: 'MALE' },
    hf_beta: { languageCode: 'en-US', name: 'en-US-Studio-O', ssmlGender: 'FEMALE' },
    
    // High-quality male voices
    hm_omega: { languageCode: 'en-US', name: 'en-US-Neural2-J', ssmlGender: 'MALE' },
    hm_psi: { languageCode: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' }
};

export async function POST(req) {
    try {
        const { text, voiceId } = await req.json();
        const storageRef = ref(storage,'ai-short-video-files/'+voiceId+'.mp3')
        // Get voice configuration based on selected voiceId
        const voiceConfig = voiceConfigs[voiceId] || voiceConfigs.am_adam; // Default to am_adam if no voice selected

        const request = {
            input: { text },
            voice: {
                languageCode: voiceConfig.languageCode,
                name: voiceConfig.name,
                ssmlGender: voiceConfig.ssmlGender
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 1.0,
                pitch: 0.0,
                volumeGainDb: 0.0
            }
        };

        // Synthesize speech
        const [response] = await client.synthesizeSpeech(request);

        
        const audioBuffer = Buffer.from(response.audioContent,'binary');

        await uploadBytes(storageRef, audioBuffer,{contentType:'audio/mp3'});

        const downloadUrl = await getDownloadURL(storageRef);
        console.log(downloadUrl);

        return NextResponse.json({Result:downloadUrl});

    } catch (error) {
        console.error('Error in text-to-speech conversion:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}