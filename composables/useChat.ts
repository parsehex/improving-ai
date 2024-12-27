import { ref, computed } from 'vue';
import type {
	ChatMessage,
} from '@/lib/types';
import axios from 'axios';
import { v4 } from 'uuid';

interface UseChatOptions {
	initialMessages?: ChatMessage[];
	body?: Record<string, unknown>;
	onFinish?: (messages: ChatMessage[]) => void;
	onError?: (error: Error) => void;
}

export default function useChat(options: UseChatOptions) {
	const BaseUrl = ref('');

	const origMessages = ref([] as ChatMessage[]);

	const messages = ref([] as ChatMessage[]);
	const uiMessages = computed(() => messages.value.filter((m) => m.role !== 'system'));
	const sysMessage = computed(() => messages.value[0]);
	const input = ref('');
	const isLoading = ref(false);

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
		messages.value.push(msg.value);
		await axios({
			url: BaseUrl.value,
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: controller.signal,
			data: {
				...options.body,
				stream: true,
				messages: messages.value.filter((m) => m.id !== msg.value.id), // exclude the assistant message
			},
			onDownloadProgress: (progressEvent) => {
				const xhr = progressEvent.event.target;
				const { responseText } = xhr;
				// responseText contains all chunks so far
				const chunks = responseText.split('data:').map((c: string) => c.trim());
				let content = '';
				let isLast = false;
				for (const chunkStr of chunks) {
					if (!chunkStr) continue;
					if (chunkStr.trim() === '[DONE]') {
						isLast = true;
						break;
					}

					const chunk = JSON.parse(chunkStr);
					content += chunk.choices[0].delta.content || '';

					// does chunk have `usage` object?
					if (chunk.usage) {
						isLast = true;
					}
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
	(async () => {
		BaseUrl.value = 'http://192.168.0.115:11434/v1/chat/completions';
	})();

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
		stop,
		append,
	};
}
