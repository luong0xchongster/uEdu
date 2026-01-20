'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, RotateCcw, Upload } from 'lucide-react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  duration?: number
  autoSubmit?: boolean
}

export default function AudioRecorder({
  onRecordingComplete,
  duration = 60,
  autoSubmit = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && isRecording) {
      stopRecording()
    }
  }, [isRecording, timeLeft])

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setRecordedAudio(url)
        setAudioUrl(url)
        onRecordingComplete(audioBlob)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setTimeLeft(duration)
    } catch (err) {
      setError('Failed to access microphone. Please grant microphone permissions.')
      console.error('Error accessing microphone:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleRerecord = () => {
    setRecordedAudio(null)
    setAudioUrl(null)
    setTimeLeft(duration)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file)
      setRecordedAudio(url)
      setAudioUrl(url)
      onRecordingComplete(file)
      setError(null)
    } else {
      setError('Please select a valid audio file.')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 font-medium">Recording</span>
                </div>
              ) : recordedAudio ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">Recorded</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-gray-600 font-medium">Ready</span>
                </div>
              )}
            </div>

            <div className="text-2xl font-bold text-gray-900 font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>

          {recordedAudio && (
            <audio
              ref={audioRef}
              src={recordedAudio}
              className="hidden"
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!recordedAudio && (
          <button
            onClick={handleRecordingToggle}
            disabled={isRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={20} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Recording
              </>
            )}
          </button>
        )}

        {recordedAudio && (
          <>
            <button
              onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

            <button
              onClick={handleRerecord}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={18} />
              Re-record
            </button>
          </>
        )}

        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload size={18} />
          Upload Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <p className="text-xs text-gray-500">
        You can record your answer using the microphone or upload an audio file.
        Maximum recording time: {formatTime(duration)}.
      </p>
    </div>
  )
}
