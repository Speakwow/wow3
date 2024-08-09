import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default function Dashboard() {
  const { userId, orgId,has } = auth();
  const canAccessDashboard = has({ role: "org:admin" });
  if(orgId&&userId&&canAccessDashboard){
  redirect('./dashboard/assignment')
  }else{
    redirect('/404/unauthoried')
  }
}
