import { Telegraf, session, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './modules/ogg.js'
import { openai } from './modules/openai.js'
import { getErrorMessage } from './modules/utils.js'
import { ChatCompletionRequestMessage } from 'openai'

interface SessionData {
	messages: ChatCompletionRequestMessage[]
}

interface IBotContext extends Context {
	session: SessionData
}

const INITIAL_SESSION = {
	messages: [],
}

const bot = new Telegraf<IBotContext>(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async ctx => {
	ctx.session = INITIAL_SESSION
	await ctx.reply('Waiting your voice or text message')
})

bot.command('start', async ctx => {
	ctx.session = INITIAL_SESSION
	await ctx.reply('Waiting your voice or text message')
})

bot.on(message('voice'), async ctx => {
	ctx.session ??= INITIAL_SESSION

	try {
		await ctx.reply(code('Waiting for server response...'))
		const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
		const userId = String(ctx.message.from.id)
		const oggPath = await ogg.create(link.href, userId)
		const mp3Path = await ogg.toMp3(String(oggPath), userId)
		const text = await openai.transcription(String(mp3Path))
		await ctx.reply(code(`Your request: ${text}`))

		ctx.session.messages.push({
			role: openai.roles.User,
			content: text ?? '',
		})

		const response = await openai.chat(ctx.session.messages)

		ctx.session.messages.push({
			role: openai.roles.Assistant,
			content: response?.content ?? 'Error while content message',
		})

		await ctx.reply(response?.content ?? 'Error while content message')
	} catch (error) {
		console.log(`Error while voice message`, getErrorMessage(error))
	}
})

bot.on(message('text'), async ctx => {
	ctx.session ??= INITIAL_SESSION

	try {
		await ctx.reply(code('Waiting for server response...'))

		ctx.session.messages.push({
			role: openai.roles.User,
			content: ctx.message.text,
		})

		const response = await openai.chat(ctx.session.messages)

		ctx.session.messages.push({
			role: openai.roles.Assistant,
			content: response?.content ?? 'Error while content message',
		})

		await ctx.reply(response?.content ?? 'Error while content message')
	} catch (error) {
		console.log(`Error while text message`, getErrorMessage(error))
	}
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
