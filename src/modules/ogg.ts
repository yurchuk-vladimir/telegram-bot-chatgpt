import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { getErrorMessage, removeFile } from './utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConvertor {
	constructor() {
		ffmpeg.setFfmpegPath(installer.path)
	}

	toMp3(input: string, output: string) {
		try {
			const outputPath = resolve(dirname(input), `${output}.mp3`)
			return new Promise((resolve, reject) => {
				ffmpeg(input)
					.inputOption('-t 30')
					.output(outputPath)
					.on('end', () => {
						removeFile(input)
						resolve(outputPath)
					})
					.on('error', err => reject(err.message))
					.run()
			})
		} catch (error) {
			console.log(`Error while creating mp3`, getErrorMessage(error))
		}
	}

	async create(url: string, filename: string) {
		try {
			const oggPath = resolve(
				__dirname,
				'../../voices',
				`${filename}.ogg`
			)
			const response = await axios({
				method: 'get',
				url,
				responseType: 'stream',
			})
			return new Promise(resolve => {
				const stream = createWriteStream(oggPath)
				response.data.pipe(stream)
				stream.on('finish', () => resolve(oggPath))
			})
		} catch (error) {
			console.log(`Error while creating ogg`, getErrorMessage(error))
		}
	}
}

export const ogg = new OggConvertor()
