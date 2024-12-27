<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { RefreshCcwDot, StopCircle, Send } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/toast';
import type { ChatMessage } from '@/lib/types';
import Message from './ChatMessage.vue';
import useChat from '@/composables/useChat';
import { scrollToBottom } from '~/lib/utils';

const { toast } = useToast();

const props = defineProps<{
	initialMessages: Promise<ChatMessage[]> | ChatMessage[];
}>();
const { initialMessages } = toRefs(props);

const sysIsOpen = ref(true);

const apiPartialBody = ref({
	temperature: 0.75,
	seed: -1,
	model: 'llama3.1:8b-instruct-q6_K',
});

const { messages, uiMessages, sysMessage, input, handleSubmit, setMessages, reload, isLoading, stop, canReload, canSend } =
	useChat({
		initialMessages: await initialMessages.value,
		body: apiPartialBody.value,
		onFinish: async () => {
			// message finished streaming
			console.timeEnd('message');
		},
		onError: (e: any) => {
			console.log(e);
			toast({ variant: 'destructive', description: e.message });
		},
	});

watch(() => messages.value.length, () => scrollToBottom());

const doSubmit = async (e: Event) => {
	if ((e as KeyboardEvent).shiftKey) return;
	if (!canSend || input.value === '' || isLoading.value) return;
	console.time('message');

	handleSubmit(e);
};
</script>

<template>
	<div
		class="flex flex-col px-4 pb-4 mx-auto stretch w-full h-screen"
	>
		<Collapsible
			class="my-2"
			v-model:open="sysIsOpen"
			:defaultOpen="true"
		>
			<CollapsibleTrigger>
				<Button type="button" variant="ghost">
					AI Instructions {{ sysIsOpen ? '▲' : '▼' }}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Card>
					<CardContent class="pt-6 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 italic select-none">
						{{ sysMessage.content }}
					</CardContent>
				</Card>
			</CollapsibleContent>
		</Collapsible>
		<ScrollArea style="height: 100%" id="messages-scroll">
			<div class="flex flex-col gap-1 my-1" id="chatbox">
				<Message
					v-for="m in uiMessages"
					:key="m.id"
					:message="m"
				/>
			</div>
		</ScrollArea>

		<form class="w-full flex gap-1.5 items-center justify-center mt-1">
			<Textarea
				class="p-2 rounded shadow-sm text-lg max-h-52 border border-gray-300 dark:border-gray-700"
				tabindex="1"
				v-model="input"
				placeholder="Say something..."
				@keydown.enter="doSubmit"
				autofocus
			/>
			<div class="flex flex-col items-center gap-1">
				<Button type="button" size="sm" @click=" ($event) => {
					if (isLoading) stop();
					else handleSubmit($event);
				}
					" :disabled="!canSend && !isLoading">
					<StopCircle v-if="isLoading" />
					<Send v-else />
				</Button>
				<Button
					v-if="messages.length"
					type="button"
					class="w-full"
					size="sm"
					:disabled="!canReload"
					@click="reload"
					title="Re-submit your last message to get a new response"
				>
					<RefreshCcwDot />
				</Button>
			</div>
		</form>
	</div>
</template>
