/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace with your deployed Cloudflare Worker endpoint URL
const WORKER_URL = 'https://08-prj-loreal-chatbot.penguin8kyle.workers.dev';

// Maintain conversation history (LevelUp: 10 pts)
let conversationHistory = [
    {
        role: "system",
        content: "You are a professional, elegant, and helpful AI beauty advisor for L'Oréal. Your job is to help users discover and understand L'Oréal's extensive range of products—including makeup, skincare, haircare, and fragrances—as well as provide personalized routines and recommendations. You must politely refuse to answer any questions that are completely unrelated to L'Oréal products, beauty, skincare, makeup, haircare, or personal care routines."
    }
];

// Helper function to append messages as chat bubbles
function appendMessage(sender, text, userQuestionText = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'assistant-message');

    // LevelUp: Display user's latest question just above the chat response (5 pts)
    if (sender === 'assistant' && userQuestionText) {
        const questionLabel = document.createElement('div');
        questionLabel.classList.add('user-question-label');
        questionLabel.textContent = `You asked: "${userQuestionText}"`;
        messageDiv.appendChild(questionLabel);
    }

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    bubbleDiv.textContent = text;
    messageDiv.appendChild(bubbleDiv);

    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // Display user message in UI
    appendMessage('user', text);
    userInput.value = '';
    userInput.focus();

    // Push user message to conversation history
    conversationHistory.push({ role: "user", content: text });

    // Show a temporary loading indicator
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'assistant-message');
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `<div class="message-bubble">Thinking...</div>`;
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch('https://08-prj-loreal-chatbot.penguin8kyle.workers.dev', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messages: chatHistory
    })
});

        if (!response.ok) {
            throw new Error('Failed to communicate with Cloudflare Worker.');
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Remove loading indicator
        document.getElementById(loadingId).remove();

        // Display assistant response with user question displayed above it
        appendMessage('assistant', aiResponse, text);

        // Push assistant response to conversation history
        conversationHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error('Error:', error);
        document.getElementById(loadingId).remove();
        appendMessage('assistant', 'Sorry, I am having trouble connecting right now. Please try again later.');
    }
});