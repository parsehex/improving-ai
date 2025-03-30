<script setup lang="ts">
import { Chatbox } from '@/components/chat';

const { data, status, error, refresh, clear } = await useFetch('/api/initial-messages');
// console.log(data);
</script>

<template>
	<Chatbox :initialMessages="data || []" />
</template>
