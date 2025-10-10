export default async function VideoComponent() {
  const src = "https://hue-line.s3.us-east-1.amazonaws.com/f-vid-audio.mp4"
 
  return <iframe src={src} allowFullScreen />
}