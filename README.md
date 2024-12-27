# Improving AI

This is a chat app with a minimal UI meant to assist with having someone to talk to that keeps up with info about the user and motivate them.

Chat threads are ephemeral -- when you close the app, the chat thread is gone and only info learned about the user is saved. The assistant can mark the current thread to be remembered, in which a summary of the chat thread is saved to be recalled later.
	One of the function that AI gets access to is to mark the thread to save it. This can be called contextually if the AI thinks the user wants to save the thread. The AI can also ask the user if they want to save.

During chats, info is extracted from user messages to learn facts about them. This info is used to enrich the AI's context during chats.

## System Prompt

Over the course of a chat session, assistant will write and modify its own system prompt to better guide its own actions based on what the user wants.

After the first message from the user, the message is analyzed to write an initial system prompt. One of the functions available to the AI is to Introspect, which will re-analyze the current chat thread to update the system prompt based on the new context of the chat.

The intent with this is to have an AI that better adapts to whatever the user is trying to do or talk about.

## Helpful Resources

- https://www.reddit.com/r/LocalLLaMA/comments/1das39o/what_memory_systems_do_you_use_for_your_llm/
