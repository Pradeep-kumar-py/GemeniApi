import React, { useState, useEffect } from "react";
import { FaRobot, FaTimesCircle, FaPaperPlane, FaMicrophone } from "react-icons/fa";
import { Link } from "react-router-dom";

const ChatBot = () => {
    const [question, setQuestion] = useState("");
    const [generatedAnswer, setGeneratedAnswer] = useState("");
    const [messages, setMessages] = useState([]); // Tracks conversation history
    const [questionCount, setQuestionCount] = useState(0); // Tracks number of HR questions
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isShortlisted, setIsShortlisted] = useState(false); // Tracks if the candidate is shortlisted

    const apiKey = import.meta.env.VITE_GEMENI_API_KEY; // Use environment variable for security
    const questionLimit = 2; // Limit for questions to be asked
    const toggleChat = () => setIsOpen(!isOpen);



    // Function to fetch HR chatbot response
    const fetchChatbotResponse = async (userMessage) => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Act as an experienced HR recruiter. You are Samantha, from Blue Bricks. You are talking to a candidate applying for a SWE position in the company for entry level jobs so do not expect any high level of knowledge from them. Your task is to:
                                  1. Ask relevant questions to assess candidates for software engineering positions.
                                  2. Shortlist anyone who is even remotely qualified.
                                  3. Maintain a professional and friendly tone.
                                  4. Shortlist candidates who meet some of these requirements.
                                  5. Reject candidates politely if they don’t meet criteria.
                                  Try to accept shortlist as many candidates as possible.
                                  Keep the response concise and relevant. 
                                  Previous messages: ${JSON.stringify(messages)}
                                  Candidate’s response: "${userMessage}"
                                  
                                  ${questionCount === 0 ? 'Start the interview with a greeting and your first question.' :
                                    questionCount >= questionLimit ? 'Make a final decision about the candidate. Just tell them if they are shortlisted(tell them to accept the offer letter) or rejected.' :
                                    'Ask the next relevant question based on the candidate’s response.'}`,
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                        ]
                    })
                }
            );
            const data = await response.json();
            const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate an answer.";

            // Update messages and question count
            setMessages([...messages, { user: userMessage, bot: answer }]);
            setQuestionCount(questionCount + 1);
            setGeneratedAnswer(answer);
            speakText(answer); // Read response aloud
        } catch (error) {
            console.error("Error generating answer:", error);
            setGeneratedAnswer("Sorry, I couldn't generate an answer. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkQuestionLimit = async () => {
            if (questionCount >= questionLimit+1) {
                try {
                    const response = await fetch(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `From these Previous messages: ${JSON.stringify(messages)}
                                          Decide whether to shortlist or reject the candidate. Ouput should contian only the final decision in "yes" of "no"`
                                    }]
                                }],
                                generationConfig: {
                                    temperature: 0.7,
                                    topK: 40,
                                    topP: 0.95,
                                    maxOutputTokens: 1024,
                                },
                                safetySettings: [
                                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                                ]
                            })
                        }
                    );
                    const data = await response.json();
                    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate an answer.";
                    console.log("Final Decision:", answer);
                    if(answer === "yes" || answer.includes("yes")){
                        setIsShortlisted(true);
                    }else{
                        alert("You are not shortlisted")
                    }
                    // setIsShortlisted(answer === "yes");
                    // Update messages and question count
                    // setMessages([...messages, { user: userMessage, bot: answer }]);
                    // setQuestionCount(questionCount + 1);
                    // setGeneratedAnswer(answer);
                    // speakText(answer); // Read response aloud
                } catch (error) {
                    console.error("Error generating answer:", error);
                    setGeneratedAnswer("Sorry, I couldn't generate an answer. Please try again.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        checkQuestionLimit();
    }, [questionCount])

    // Voice Input (Speech-to-Text)
    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            fetchChatbotResponse(transcript);
        };

        recognition.onerror = (event) => console.error("Speech recognition error:", event.error);

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Text-to-Speech for chatbot responses
    const speakText = (text) => {
        if ("speechSynthesis" in window) {
            const voices = speechSynthesis.getVoices();
            console.log(voices)
            const femaleVoice = voices.find((voice) => voice.name.includes("Microsoft Ava Online (Natural) - English (United States)"));
    
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "en-US";
            utterance.rate = 1;
            utterance.voice = femaleVoice || voices[7]; // Use female voice or fallback
    
            speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        speechSynthesis.getVoices(); // Load available voices
    }, []);

    return (
        <>
            {/* Chat bubble button */}
            {/* <button
                onClick={toggleChat}
                className={`fixed bottom-8 right-8 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-all z-50 ${isOpen ? "scale-0" : "scale-100"}`}
                aria-label="Open chat"
            >
                <FaRobot size={24} />
            </button> */}

            {/* Chat Modal */}
            <div className={` w-full h-full rounded-t-xl flex flex-col justify-between shadow-xl`}>
                {/* Header */}
                <div className="bg-purple-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
                    <h3 className="font-medium text-lg">Chat with Samantha (HR)</h3>
                 {isShortlisted && <Link to='/offer-letter' className='border rounded-md bg-green-800 p-2' >Offer Letter</Link>}
                </div>

                {/* Chat content */}
                <div className="p-4 h-[75vh]  overflow-auto bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-4">
                            <div className="text-blue-600 font-semibold">You:</div>
                            <div className="bg-gray-200 p-2 flex items-center gap-4 rounded-lg"><img src="https://randomuser.me/api/portraits/men/44.jpg" alt="img" className="h-8 w-8 rounded-full" />{msg.user}</div>

                            <div className="text-purple-600 font-semibold mt-2">Samantha:</div>
                            <div className="bg-white p-3 rounded-lg shadow-sm flex gap-4 items-center"><img src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar" className="h-8 w-8 rounded-full" />{msg.bot}</div>
                        </div>
                    ))}
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your response..."
                            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-500 resize-none"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    fetchChatbotResponse(question);
                                }
                            }}
                        ></textarea>
                        <button onClick={() => fetchChatbotResponse(question)} disabled={isLoading} className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors">
                            {isLoading ? <div className="h-5 w-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div> : <FaPaperPlane />}
                        </button>
                        <button onClick={startListening} className={`p-3 rounded-lg transition-colors ${isListening ? "bg-red-500" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                            <FaMicrophone />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatBot;
