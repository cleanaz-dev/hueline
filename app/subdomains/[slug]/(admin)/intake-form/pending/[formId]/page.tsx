import ClientFormPage from "@/components/admin/form/client-form-page"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{
    formId: string
  }>
}

export default async function page({ params }: Props) {
  const { formId } = await params
  const client = await prisma.client.findFirst({
    where: {
      formData: {id: formId}
    }
  }) ?? undefined
  
  return (
    <div>
      <ClientFormPage client={client}/>
    </div>
  )
}