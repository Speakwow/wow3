'use server'
import { Button } from "@/components/ui/button"
// import Chat from "./chat"
import Link from "next/link"
import { ChevronLeft, Edit2Icon, MoreVerticalIcon, OptionIcon } from "lucide-react"
import { kv } from "@vercel/kv"
import { nanoid } from "ai"
import Initial from "./start"
import { createScenarioRecord, getCharacterById, getScenarioById, getScenarioByName } from "@/lib/action/mongoIO"
import { auth } from "@clerk/nextjs/server"
import { Card } from "@/components/ui/card"
import { connect } from "@/lib/mongo"
import { DB } from "@/lib/constant"


// export async function generateStaticParams() {
//   const mongo = await connect()
//   const [sceanrios, ] = await Promise.all([
//     mongo.db(DB).collection('scenarios').find().toArray(),

//   ])
//   return sceanrios.map((sceanrio) => (
//       {
//         scenarioId: sceanrio._id.toString(),
//       }
//     ))
// }


export default async function ChatPage({ params }: { params: { scenarioId: string } }) {
  const { userId, orgId, redirectToSignIn } = auth();
  if (!userId) {
    redirectToSignIn()
    return null
  }
  const scenarioDoc = await getScenarioById(params.scenarioId) as any
  let characterId = "6650346b4b838ac30d19694c"
  if (scenarioDoc.character) {
    characterId = scenarioDoc.character
  }

  const characterDoc = await getCharacterById(characterId)
  const scenario = JSON.parse(JSON.stringify(scenarioDoc));
  const character = JSON.parse(JSON.stringify(characterDoc));


  const bgImage =
  {
    // 设置背景图片
    backgroundImage: `url(${character.background})`,
    // 设置背景图片放缩方式为cover，使其自动放缩填充div
    backgroundSize: 'cover'
  }



  const chatid = await createScenarioRecord(userId, params.scenarioId)

  return (
    <div className="h-full bg-muted p-2">
      <Card style={bgImage} className="relative w-full h-full rounded-[20px]" >
        <div className="mx-auto h-full w-full   items-center justify-center">
          <div className="absolute top-2 left-2 z-20">
            <Button asChild size="icon" variant="outline">
              <Link href="/">
                <ChevronLeft />
              </Link>
            </Button>
          </div>
          <div className="absolute items-center justify-center w-full flex p-4 ">
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.10rem] font-mono text-sm font-semibold">
              {scenario.name}
              </code>
          </div>
          {scenario.welcomeMessage ?
            <Initial chatid={chatid} scenarioId={params.scenarioId} characterId={characterId} scenario={scenario} character={character} />
            :
            <div>
              No Scenario
            </div>
          }
        </div>
      </Card>
    </div>
  )
}