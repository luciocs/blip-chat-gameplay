    function ChatManager() {
      this.blipChat = null;
      // Accepts an appKey parameter.
      this.init = function(appKey) {
        this.blipChat = new BlipChat();
        this.blipChat
          .withAppKey(appKey)
          .withButton({"color":"#009ee0","icon":""})
          .withCustomCommonUrl('https://take.chat.blip.ai/')
          .build();
      };
      this.sendChat = function(action) {
        if (this.blipChat && typeof this.blipChat.sendMessage === "function") {
          // Send as a text/plain message.
          this.blipChat.sendMessage({ type: 'text/plain', content: action });
        } else {
          console.error("BlipChat is not initialized or sendMessage() is unavailable.");
        }
      };
      this.closeBubble = function() {
        var bubble = document.getElementById('blip-chat-bubble');
        if (bubble) {
          bubble.style.display = 'none';
        }
      };
    }

    let chatManager = new ChatManager();

    /********** GPT & Conversation Logic **********/
    let conversationHistory = [];
    const conversationDiv = document.getElementById("conversation");

    // Append a message to the UI.
    function appendMessage(sender, text) {
      const msgDiv = document.createElement("div");
      msgDiv.className = "message";
      msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
      conversationDiv.appendChild(msgDiv);
      conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    // Call OpenAI API (GPT‑4) to generate a message.
    async function getGPTResponse(history, apiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: history
        })
      });
      if (!response.ok) {
        let errorText = "";
        try {
          const errData = await response.json();
          errorText = errData.error && errData.error.message ? errData.error.message : JSON.stringify(errData);
        } catch {
          errorText = response.statusText;
        }
        throw new Error(`OpenAI API error: ${errorText}`);
      }
      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Unexpected response from OpenAI API");
      }
      return data.choices[0].message.content.trim();
    }

    // Send a message to Blip Chat via ChatManager.
    function sendToBlipChat(message) {
      chatManager.sendChat(message);
      appendMessage("GPT", message);
    }

    // Wait for the Blip Agent’s response and aggregate multiple messages.
    function waitForBlipResponse() {
      return new Promise((resolve) => {
        let messages = [];
        let resolved = false;
        let aggregationTimer = null;

        function finalize() {
          if (!resolved) {
            resolved = true;
            window.removeEventListener("message", messageHandler);
            const aggregatedMessage = messages.join(" ");
            appendMessage("Blip Agent", aggregatedMessage);
            resolve(aggregatedMessage);
          }
        }

        function messageHandler(event) {
          console.log("Received event from origin:", event.origin, "data:", event.data);
          // Accept events only from the expected origin.
          if (event.origin !== "https://take.chat.blip.ai") return;

          let data = event.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (err) {
              console.error("Error parsing event data:", err);
              return;
            }
          }

          // Check for the expected payload structure.
          if (data && data.code === "NewBotMessage" && data.messageData && data.messageData.message) {
            messages.push(data.messageData.message);
            // Reset the timer with each new message.
            if (aggregationTimer) {
              clearTimeout(aggregationTimer);
            }
            aggregationTimer = setTimeout(finalize, 1500); // 1.5 seconds after last message, finalize.
          }
        }

        window.addEventListener("message", messageHandler);

        // Overall timeout after 60 seconds.
        setTimeout(() => {
          if (!resolved) {
            if (aggregationTimer) clearTimeout(aggregationTimer);
            finalize();
          }
        }, 60000);
      });
    }

    // Main flow: loop through conversation cycles.
    async function startChatFlow() {
      // 🔑 **Initialize Blip Chat with the provided AppKey**
      const appKey = document.getElementById("app-key-input").value.trim();
      if (!appKey) {
        alert("Please enter a Blip Chat AppKey.");
        return;
      }
      chatManager.init(appKey);

      // 🔑 **Get the OpenAI API Key**
      const openAiApiKey = document.getElementById("openai-api-key").value.trim();
      if (!openAiApiKey) {
        alert("Please enter an OpenAI API Key.");
        return;
      }

      // ✍️ **Set system prompt and generate first GPT message**
      const systemPrompt = document.getElementById("system-prompt").value.trim();
      if (!systemPrompt) {
        alert("Please enter a system prompt.");
        return;
      }
      conversationHistory.push({ role: "system", content: systemPrompt });
      try {
        let gptMessage = await getGPTResponse(conversationHistory, openAiApiKey);
        conversationHistory.push({ role: "assistant", content: gptMessage });
        // Send GPT message to Blip Chat.
        sendToBlipChat(gptMessage);

        // 🔄 **Loop for subsequent cycles (10 cycles ≈ 20 messages exchanged)**
        const maxCycles = 10;
        for (let i = 1; i < maxCycles; i++) {
          const blipResponse = await waitForBlipResponse();
          conversationHistory.push({ role: "user", content: blipResponse });
          gptMessage = await getGPTResponse(conversationHistory, openAiApiKey);
          conversationHistory.push({ role: "assistant", content: gptMessage });
          sendToBlipChat(gptMessage);
        }
      } catch (err) {
        alert(err.message);
      }
    }

    // Start the conversation flow when the button is clicked.
    document.getElementById("start-chat").addEventListener("click", function() {
      // Disable the button after starting to prevent multiple initializations.
      this.disabled = true;
      startChatFlow();
    });
