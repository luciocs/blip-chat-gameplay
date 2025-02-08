# Blip Chat Gameplay 🤖 💬

## Detailed Description
Blip Chat Gameplay is a web-based demo that integrates the **Blip Chat Widget** with **OpenAI's GPT-4 API** to simulate an interactive, real-time conversation between a consumer and a Intelligent Contact. This project allows users to customize the conversation context by providing their own API keys and a system prompt.

Key features include:
- **Customizable Inputs:**  
  - Blip Chat AppKey  
  - OpenAI API Key (no default for security)  
  - System Prompt to set the conversation context  
- **Interactive Multi-turn Conversation:**  
  - Initiates with a system prompt  
  - Uses GPT-4 to generate responses  
  - Simulates message exchanges with a Blip Chat agent  
- **Modern, Responsive UI:**  
  - Clean design with Blip's blue color scheme  
  - Real-time conversation log display

## How It Works
1. **Initialization:**
   - The user inputs the Blip Chat AppKey, OpenAI API Key, and a system prompt.
   - The Blip Chat widget is initialized using the provided AppKey.
2. **Conversation Flow:**
   - The system prompt is used to generate the first GPT-4 message via the OpenAI API.
   - This message is sent to the Blip Chat widget to simulate a conversation.
   - The demo then waits for the Blip agent's response, aggregates it, and sends it back to GPT-4 for subsequent responses.
   - The cycle repeats for a set number of iterations (default is 10 cycles).
3. **Display:**
   - All exchanged messages are displayed in a conversation log within a modern, responsive interface.

## How to Use
1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
2.	**Open the Demo:**
   - Open the index.html file in your web browser.
3.	**Enter the Required Inputs:**
	 - Blip Chat AppKey: The key used to initialize the Blip Chat widget. Determs the Intelligent Contact to be used. A default value is provided.
	 - OpenAI API Key: Your personal API key for OpenAI’s GPT-4 API. This field is intentionally blank by default for security.
	 - System Prompt: The conversation context (e.g., simulating a consumer chatting with a support agent). You can edit the default text if needed.
4.	**Start the Chat:**
	 - Click the “Start Chat” button to begin the conversation simulation.
	 - Watch the conversation unfold in the log area as messages are exchanged.

## Credits
	 - Code Creation: This code was created by ChatGPT.
