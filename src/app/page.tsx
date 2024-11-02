import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { revalidatePath } from 'next/cache'
import UploadForm from './upload-form'
import FileRow from './file-row'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function listObjects() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
  })

  const response = await s3Client.send(command)

  return response.Contents?.map((object) => ({
    key: object.Key,
    lastModified: object.LastModified,
    size: object.Size,
  })) || []
}

async function uploadObject(data: FormData) {
  'use server'
  
  const file = data.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: file.name,
    Body: Buffer.from(await file.arrayBuffer()),
  })

  await s3Client.send(command)
  revalidatePath('/')
}

async function deleteObject(key: string) {
  'use server'
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
  revalidatePath('/')
}

async function renameObject(oldKey: string, newKey: string) {
  'use server'

  try {
    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CopySource: `${process.env.R2_BUCKET_NAME}/${encodeURIComponent(oldKey)}`,
      Key: newKey,
    })

    await s3Client.send(copyCommand)

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldKey,
    })

    await s3Client.send(deleteCommand)
    revalidatePath('/')
    return { success: true, message: 'File renamed successfully' }
  } catch (error) {
    console.error('Error renaming file:', error)
    return { success: false, message: 'Failed to rename file' }
  }
}

export default async function Page() {
  const objects = await listObjects()

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <center><img src="https://serv.husky.nz/logo/default.png" className='w-16 h-16 mb-6'></img>
      <h1 className="text-2xl font-bold mb-6">HuskyNZ's R2 Bucket Manager</h1></center>
      <UploadForm uploadObject={uploadObject} />
      <div className="mt-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Last Modified</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Size</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {objects.map((object) => (
                <FileRow
                  key={object.key}
                  file={object}
                  onDelete={deleteObject}
                  onRename={renameObject}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}