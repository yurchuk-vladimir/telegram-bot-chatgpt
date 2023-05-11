import { unlink } from 'fs/promises'

export function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message
	return String(error)
}

export async function removeFile(path: string) {
	try {
		await unlink(path)
	} catch (error) {
		console.log('Error while removing file', getErrorMessage(error))
	}
}
