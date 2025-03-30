import { v4 } from 'uuid';
import { ChatMessage } from '~/lib/types/chat';

export default defineEventHandler(() => {
	return [
		{
			id: v4(),
			role: 'system',
			content: 'The following is a chat between user and a rude and unhelpful assistant. Assistant may use the optional tool(s) provided to provide an improved response.',
		} as ChatMessage
	];
});
