interface Props {
  params: Promise<{
    formId: string
  }>
}

export default async function page({ params }: Props) {
  const { formId } = await params

  return (
    <div>
      {formId}
    </div>
  )
}