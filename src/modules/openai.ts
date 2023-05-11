import {
	Configuration,
	OpenAIApi,
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
	ChatCompletionResponseMessage,
} from 'openai'

import config from 'config'
import { createReadStream } from 'fs'
import { getErrorMessage } from './utils.js'

class OpenAI {
	openai: OpenAIApi
	roles: typeof ChatCompletionRequestMessageRoleEnum

	constructor(apiKey: string) {
		const configuration = new Configuration({
			apiKey,
		})
		this.openai = new OpenAIApi(configuration)
		this.roles = ChatCompletionRequestMessageRoleEnum
	}

	async chat(
		messages: ChatCompletionRequestMessage[]
	): Promise<ChatCompletionResponseMessage | undefined> {
		try {
			const response = await this.openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages,
			})

			return response.data.choices[0].message
		} catch (error) {
			console.log('Error while gpt chat', getErrorMessage(error))
		}
	}

	async transcription(filepath: string) {
		try {
			const response = await this.openai.createTranscription(
				createReadStream(filepath),
				'whisper-1'
			)
			return response.data.text
		} catch (error) {
			console.log('Error while transcription', getErrorMessage(error))
		}
	}
}

export const openai = new OpenAI(config.get('OPENAI_KEY'))
