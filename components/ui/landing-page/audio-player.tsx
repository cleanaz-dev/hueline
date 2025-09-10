"use client"
import React from 'react'

interface AudioPlayerProps {
  url: string;
  title?: string;
}

export default function AudioPlayer({ url, title = "Audio" }: AudioPlayerProps) {
  return (
    <div className="w-full">
      <p className="text-sm font-medium mb-2">{title}</p>
      <audio controls className="w-full">
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}