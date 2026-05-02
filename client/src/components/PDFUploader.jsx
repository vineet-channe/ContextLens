import { useCallback, useState } from 'react'

export default function PDFUploader({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = useCallback((file) => {
    setError('')
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    onUpload(file)
  }, [onUpload])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    handleFile(e.target.files[0])
  }, [handleFile])

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold text-gray-100">
        Upload a PDF to get started
      </h1>
      <p className="text-gray-400 text-center text-sm">
        Highlight any word or phrase in the document to get its contextual meaning powered by Claude.
      </p>

      <label
        htmlFor="pdf-input"
        className={`
          w-full mt-2 rounded-2xl border-2 border-dashed transition-all cursor-pointer
          flex flex-col items-center justify-center gap-3 py-14 px-8
          ${isDragging
            ? 'border-indigo-400 bg-indigo-950/40'
            : 'border-gray-700 bg-gray-900/60 hover:border-indigo-500 hover:bg-indigo-950/20'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <svg
          className={`w-12 h-12 ${isDragging ? 'text-indigo-400' : 'text-gray-600'} transition-colors`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div className="text-center">
          <p className="text-gray-300 font-medium">
            Drag &amp; drop your PDF here
          </p>
          <p className="text-gray-500 text-sm mt-1">or click to browse</p>
        </div>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}
