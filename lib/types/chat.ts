export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	type?: string;
}

export interface UseChatOptions {
	baseUrl?: string;
	initialMessages?: ChatMessage[];
	model?: string;
	body?: Record<string, unknown>;
	onFinish?: (messages: ChatMessage[]) => void;
	onError?: (error: Error) => void;
}

export interface ChatRequest {
	model: string;
	messages: ChatMessage[];
	temperature?: number;
	stream?: boolean;
	[key: string]: unknown;
}
