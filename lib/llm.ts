import axios from 'axios';
import { v4 } from 'uuid';
import type { ChatMessage } from './types';

interface CompleteOptions {
	model?: string;
  temperature?: number;
  max_tokens?: number;
  systemMessage?: string;
}

export async function complete(
  prompt: string | ChatMessage[],
  {
		model = 'llama3.1:8b-instruct-q6_K',
    temperature = 0.5,
    max_tokens = 512,
    systemMessage,
  }: CompleteOptions = {}
) {
  let messages: ChatMessage[];

  if (typeof prompt === 'string') {
    messages = [];

    if (systemMessage) {
      messages.push({
        id: v4(),
        role: 'system',
        content: systemMessage
      });
    }

    prompt && messages.push({
      id: v4(),
      role: 'user',
      content: prompt
    });
  } else {
    messages = prompt;

    // If systemMessage is provided and first message isn't a system message, prepend it
    if (systemMessage && (messages.length === 0 || messages[0].role !== 'system')) {
      messages = [
        {
          id: v4(),
          role: 'system',
          content: systemMessage
        },
        ...messages
      ];
    }
  }

  try {
    const response = await axios({
      url: 'http://192.168.0.115:11434/v1/chat/completions',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
				model,
        temperature,
        max_tokens,
        stream: false,
        messages
      }
    });

    return response.data.choices[0].message.content as string;
  } catch (error) {
    throw error;
  }
}
