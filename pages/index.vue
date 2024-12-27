<script setup lang="ts">
import { Chatbox } from '@/components/chat';
import type { ChatMessage } from '~/lib/types';

const getInitialMessages = () => {
	return [{
		id: '1',
		role: 'system',
		content: 'The following is a chat between user and an assistant.',
	} as ChatMessage];
};
</script>

<template>
	<Chatbox :initialMessages="getInitialMessages()" />
</template>
