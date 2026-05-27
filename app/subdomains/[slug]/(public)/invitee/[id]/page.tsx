interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function page({ params }: Params) {
  const { id: inviteeId } = await params;

  console.log("Invitee ID:", inviteeId);

  //  run redis on data

  return (
    // component would get here if using dynamic routes..pass data from redis to component if no data render page expired or invite no longeer wtv..
    <div>Hello</div>
  );
}
