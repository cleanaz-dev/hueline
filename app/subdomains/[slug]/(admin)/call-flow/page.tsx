import CallFlowComponent from "@/components/admin/dashboard/call-flow";
import { CallFlowProvider } from "@/context/call-flow-context";


export default async function page() {

  
  return (
    <CallFlowProvider>
      <CallFlowComponent /> 
    </CallFlowProvider>
  )
}