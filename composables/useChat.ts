import { ref, computed } from 'vue';
import type {
	ChatMessage,
	ChatRequest,
	UseChatOptions,
} from '@/lib/types';
import axios from 'axios';
import { v4 } from 'uuid';

export default function useChat(options: UseChatOptions) {
	const BaseUrl = ref(options.baseUrl || '/api/chat');
	// const BaseUrl = ref(options.baseUrl || 'http://192.168.0.115:11434/v1/chat/completions');
	const model = ref(options.model || 'llama3.1:8b-instruct-q6_K');

	const origMessages = ref([] as ChatMessage[]);

	const messages = ref([] as ChatMessage[]);
	const uiMessages = computed(() => messages.value.filter((m) => m.role !== 'system'));
	const sysMessage = computed(() => messages.value[0]);
	const input = ref('');
	const isLoading = ref(false);
	const isThinking = ref(false);

	let controller = new AbortController();

	const canSend = computed(() => {
		return input.value && !isLoading.value;
	});
	async function handleSubmit(e: Event, reloading = false) {
		origMessages.value = [...messages.value];

		// add the user message if we're not reloading
		if (!reloading) {
			const userMsg = {
				id: v4(),
				role: 'user',
				content: input.value,
			};
			messages.value.push(userMsg as ChatMessage);
		}

		// clear input
		input.value = '';
		e.preventDefault();

		isLoading.value = true;
		// send new messages to server, create assistant message
		let i = 0;
		const msg = ref({
			id: v4(),
			role: 'assistant',
			content: '',
		} as ChatMessage);
		setMessages([
			...messages.value.filter((m) => m.type !== 'thinking'),
			msg.value
		]);
		await axios({
			url: BaseUrl.value,
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
			data: {
				...options.body,
				model: model.value,
				stream: true,
				messages: messages.value.filter((m) => m.id !== msg.value.id), // exclude the assistant message
			} as ChatRequest,
			onDownloadProgress: (progressEvent) => {
				console.log('progressEvent:', progressEvent);
				const xhr = progressEvent.event.target;
				const { responseText } = xhr;
				// responseText contains all chunks so far
				const splitStr = '0:'; // or data:
				const chunks = responseText.split(splitStr).map((c: string) => c.trim());
				let content = '';
				let isLast = false;
				for (let chunkStr of chunks) {
					if (!chunkStr) continue;
					chunkStr = chunkStr.trim();
					if (chunkStr[0] === '"') {
						chunkStr = chunkStr.slice(1);
					}
					if (chunkStr[chunkStr.length - 1] === '"') {
						chunkStr = chunkStr.slice(0, -1);
					}
					if (chunkStr === '[DONE]') {
						isLast = true;
						break;
					}

					if (chunkStr === '-thinking-') {
						isThinking.value = true;
						continue;
					} else if (isThinking.value) {
						isThinking.value = false;
					}

					// const chunk = JSON.parse(chunkStr);
					// content += chunk.choices[0].delta.content || '';

					// // does chunk have `usage` object?
					// if (chunk.usage) {
					// 	isLast = true;
					// }

					content += chunkStr;
					console.log('chunkStr:', chunkStr);
				}
				msg.value.content = content;

				if (isLast) {
					isLoading.value = false;
					if (options.onFinish) {
						options.onFinish(messages.value);
					}
				}

				i++;
			},
		}).catch((err) => {
			const isCanceled = err.message.includes('canceled');
			if (isCanceled) {
				console.log('Request was canceled');
				messages.value = [...origMessages.value];
				origMessages.value = [];
				isLoading.value = false;
				return;
			}
			if (options.onError) {
				options.onError(err);
			}
		});
	}

	function setMessages(newMessages: ChatMessage[]) {
		messages.value = newMessages;
	}

	const canReload = computed(() => {
		return messages.value.length >= 3 && !isLoading.value;
	});
	async function reload() {
		if (isLoading.value) return;
		messages.value.pop();
		await handleSubmit(new Event('reload'), true);
	}


	function stop() {
		controller.abort();
		controller = new AbortController();
	}

	function append(message: ChatMessage) {
		messages.value.push(message);
		handleSubmit(new Event('append'), true);
	}

	if (options.initialMessages) {
		setMessages(options.initialMessages);
	}

	return {
		canSend,
		messages: computed(() => messages.value),
		uiMessages,
		sysMessage,
		input,
		handleSubmit,
		setMessages,
		canReload,
		reload,
		isLoading,
		isThinking,
		stop,
		append,
	};
}
