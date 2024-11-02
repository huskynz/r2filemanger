'use client'

import { useState } from 'react'

export default function UploadForm({ uploadObject }: { uploadObject: (formData: FormData) => Promise<void> }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  return (
    <form action={uploadObject} className="flex items-center space-x-4 mb-6">
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        name="file"
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!selectedFile}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload
      </button>
    </form>
  )
}