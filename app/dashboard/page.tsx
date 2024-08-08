import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs"

export default function Dashboard() {
  const { userId, orgId } = auth();
  if(orgId&&userId){
  redirect('./dashboard/assignment')
  }else{
    return(
      <div className="h-screen w-full flex flex-col items-center justify-center text-center">
        <div>
        😭 抱歉，您无权访问
        </div>
      </div>
    )
  }
}
