// Data Schema

export interface Character{
    name:string,
    avatar:string,
    background:string,
    voice:string,
    persona:string,
}

export interface Scenario{
    name:string,
    character:string,
    prompt:string,
    welcomeMessage:string
}

export interface ClassPrompt{
    name:string,
    flow:string,
    target:string,
    level:string,
    keyPoint:string,
}

export interface LearnerProfile{
    name:string,
    age:number,
    nativeLanguage:string,
    userlevel:`A1:elementary` | 'A2:pre-intermediate' | 'B1:intermediate' | 'B2:upper-intermediate'| 'C1:advanced' | 'C2:proficiency',
    purpose:string,
    interest:string,
}