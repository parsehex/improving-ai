import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isDevMode() {
	return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
}

export function copyToClipboard(text: string) {
	const el = document.createElement('textarea');
	el.value = text;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}

export function scrollToBottom(selector = 'div#chatbox > span:last-child') {
	const lastMessage = document.querySelector(selector);
	if (lastMessage) {
		lastMessage.scrollIntoView();
	}
};
