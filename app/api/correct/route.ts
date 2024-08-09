import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { NextRequest,NextResponse } from "next/server";


const template = `
#Overall Rules to follow 
1. Please compare the difference between the <Reference> and <Result> . 
2. Use <w>[mistake or missed word]</w> syntax to hight the mistaked or missed word in the reference. 
3. Ignore the punctuation. 
4. If there are multiple mistakes, hightlight every mistake with <w>[mistake or missed word]</w> syntax. 
5. If the <Result> is completely irrelevant to <Reference>,hightlight the whole <Reference>. 
#Output Format 
Examplar: You are <w>the</w> best friend. 
Return the reference text with syntax. 
If no syntax, return the original reference text. 
#Reference 
{ReferenceText} 
#Result 
{ResultText}
`

export async function POST(req: NextRequest) {
    const data = await req.json()
    console.log('Ref : '+data.reference)
    console.log('Res : '+data.result)
    // const template = await kv.get('prompt@correct') as string
    const model = new ChatOpenAI({model: 'gpt-4o'});
    const promptTemplate = PromptTemplate.fromTemplate(template);
    const chain = promptTemplate.pipe(model);
    const result = await chain.invoke({ 
        ReferenceText: data.reference,
        ResultText:data.result
    })
    console.log('Invoke Correct Successfully:'+result.content)
    return NextResponse.json({message:result.content})
}