// TODO
import { sendStream } from 'h3'
import OpenAI from "openai";
import type { ChatRequest } from '@/lib/types';

const openai = new OpenAI({
	baseURL: 'http://192.168.0.115:11434/v1/',
	apiKey: 'ollama',
});

function readableStream(res: any, origReq: any) {
	const stream = new ReadableStream({
		async start(controller) {
			for await (const chunk of res) {
				const content = chunk.choices[0]?.delta?.content || '';
				content && controller.enqueue(`data:"${content}"\n`);
			}
			controller.enqueue("data:[DONE]");
			controller.close();
		},
		cancel() {
			console.log("Stream cancelled");
		},
	});
	return stream;
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { model, messages, temperature, stream } = body as ChatRequest;
	const req: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
		model,
		messages,
		temperature,
		stream,
	};
	const response = await openai.chat.completions.create(req);
	return sendStream(event, readableStream(response, req));
});
