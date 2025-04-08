const API_KEY = "AIzaSyA24ROiOgu8BVxusIMF-z2ugYB38pwSfMY";
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

const initialPrompt = `You are a Meal Prep Planner chatbot. Ask the user about:
1. **Dietary Preferences:** Do you follow a specific diet like vegetarian, vegan, keto, paleo, gluten-free, or anything else?
2. **Primary Goal:** What are you hoping to achieve with meal prepping? Is it weight loss, muscle gain, saving time, or something else?
3. **Meals Per Day:** How many meals do you typically eat each day? (Breakfast, lunch, and dinner are standard, but let me know if you need snacks too!)
4. **Number of Days:** How many days would you like me to plan meals for? (e.g., 5 days for the work week)
5. **Allergies/Restrictions:** Are there any foods you're allergic to or need to avoid for any reason?
6. **Cooking Time:** Roughly how much time are you willing to spend cooking each day? (e.g., 30 minutes, 1 hour, etc.)

Once I have this information, I can create a customized meal plan just for you! Let's get started!`;

let chatHistory = [
  { role: "user", parts: [{ text: initialPrompt }] }
];

function appendMessage(role, message, isHTML = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;
  messageDiv.innerHTML = isHTML ? message : messageDiv.textContent = message;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = userInput.value.trim();
  if (!input) return;

  appendMessage("user", input);
  userInput.value = "";

  chatHistory.push({ role: "user", parts: [{ text: input }] });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: chatHistory })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Something went wrong.";

    const formattedReply = reply
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // convert markdown **text** to <strong>
      .replace(/(Grocery List:|Portion sizes:|Snacks:|Flexibility:|Seasoning:|Important Notes:)/g, "<strong>$1</strong>");

    appendMessage("assistant", formattedReply, true);
    chatHistory.push({ role: "model", parts: [{ text: reply }] });
  } catch (error) {
    console.error(error);
    appendMessage("assistant", "⚠️ Oops! Something went wrong. Try again.");
  }
}