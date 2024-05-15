import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        return NextResponse.json({ status: 400, error: 'You forgot to add your speech key or region to the .env file.' });
    } else {
        const fetchOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey as string,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const tokenResponse = await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, fetchOptions);
            
            if (tokenResponse.ok) {
                const tokenData = await tokenResponse.text(); // Assuming the token is returned as plain text
                return NextResponse.json({ status: 200, token: tokenData, region: speechRegion });
            } else {
                throw new Error('Failed to fetch token');
            }
        } catch (err) {
            return NextResponse.json({ status: 401, error: 'There was an error authorizing your speech key.' });
        }
    }

}