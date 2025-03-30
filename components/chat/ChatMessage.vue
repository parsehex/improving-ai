<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import type { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { isDevMode, copyToClipboard } from '~/lib/utils';

const props = defineProps<{
	message: ChatMessage;
	isThinking?: boolean;
}>();
const { message } = toRefs(props);

const emit = defineEmits<{
	(e: 'edit', id: string): void;
	(e: 'delete', id: string): void;
	(e: 'clearThread'): void;
}>();

const isUser = computed(() => message.value.role === 'user');

const editingMessageTitle = ref('');
const editingMessage = ref('');
const modalOpen = ref(false);

const userName = computed(() => {
	if (isUser.value) return 'User';
	return '';
});

const triggerEdit = async () => {
	editingMessageTitle.value = `Editing Message`;
	editingMessage.value = message.value.content;
	modalOpen.value = true;
};
const handleEdit = async (e: KeyboardEvent | null, confirm = false) => {
	if (!confirm) return;
	if (e?.key !== 'Enter' && !confirm) return;
	if (!e?.ctrlKey && !confirm) return;

	// TODO edit message
	editingMessage.value = '';
	emit('edit', message.value.id);
	modalOpen.value = false;
};
const handleCancel = () => {
	editingMessage.value = '';
	modalOpen.value = false;
};

const doDelete = async () => {
	// TODO
	emit('delete', message.value.id);
};
const doCopyMessage = () => {
	if (!message.value.content || !copyToClipboard) return;
	copyToClipboard(message.value.content);
};
const doClearThread = async () => {
	// TODO
};
</script>

<template>
	<Dialog :modal="true" :open="modalOpen" @update:open="modalOpen = $event">
		<ContextMenu>
			<ContextMenuTrigger>
				<Card
					class="chat-message whitespace-pre-wrap"
					:id="'message-' + message.id"
				>
					<CardHeader
						class="p-3 flex flex-row items-center space-x-2 pt-1 pb-2"
					>
						{{ message.role === 'user' ? userName : 'AI' }}
					</CardHeader>
					<CardContent class="p-3 pl-6 pt-0 flex items-center justify-between gap-2">
						<div class="grow flex items-center gap-2">
							<Spinner v-if="isThinking" />
							<span v-if="isThinking" class="italic text-gray-500"
							>Thinking...</span>
							<span>{{ message.content }}</span>
						</div>
					</CardContent>
				</Card>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem @click="doCopyMessage">Copy</ContextMenuItem>
				<DialogTrigger asChild>
					<ContextMenuItem
						@click="triggerEdit"
						v-if="isUser"
					>
						Edit
					</ContextMenuItem>
				</DialogTrigger>
				<ContextMenuItem @click="doDelete">Delete</ContextMenuItem>

				<!-- TODO confirm (reuse same dialog) -->
				<ContextMenuSeparator v-if="isDevMode()" />
				<ContextMenuItem v-if="isDevMode()" @click="doClearThread">
					Delete All Messages
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{{ editingMessageTitle }}</DialogTitle>
			</DialogHeader>
			<DialogDescription>
				<Textarea
					v-model="editingMessage"
					@keydown.enter="handleEdit"
					placeholder="Message content..."
					class="w-full min-h-48"
				/>
			</DialogDescription>
			<DialogFooter>
				<DialogClose as-child>
					<Button @click="handleCancel" type="button" variant="outline"
						>Cancel</Button
					>
					<Button @click="handleEdit(null, true)" type="button">Confirm</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
