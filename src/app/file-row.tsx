'use client'

import { useState } from 'react'

interface FileRowProps {
  file: {
    key: string
    lastModified: string
    size: number
  }
  onDelete: (key: string) => Promise<void>
  onRename: (oldKey: string, newKey: string) => Promise<{ success: boolean; message: string }>
}

export default function FileRow({ file, onDelete, onRename }: FileRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(file.key)
  const [error, setError] = useState<string | null>(null)

  const handleRename = async () => {
    if (newName !== file.key) {
      const result = await onRename(file.key, newName)
      if (result.success) {
        setIsEditing(false)
        setError(null)
      } else {
        setError(result.message)
      }
    } else {
      setIsEditing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB'
    else return (bytes / 1073741824).toFixed(2) + ' GB'
  }

  return (
    <tr className="bg-white border-b hover:bg-gray-50">
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border rounded px-2 py-1"
          />
        ) : (
          file.key
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </td>
      <td className="px-6 py-4">{new Date(file.lastModified).toLocaleString()}</td>
      <td className="px-6 py-4">{formatFileSize(file.size)}</td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleRename}
                className="text-blue-600 hover:text-blue-900"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setNewName(file.key)
                  setError(null)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-900"
            >
              Rename
            </button>
          )}
          <button
            onClick={() => onDelete(file.key)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}