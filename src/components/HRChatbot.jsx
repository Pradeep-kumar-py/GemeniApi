import React, { useState, useEffect, useRef } from 'react';
import { FaceDetection } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import ChatBot from './chatBot';

const HRChatbot = () => {
  const [isUserInFrame, setIsUserInFrame] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // Timer in seconds (10 minutes)
  const [isCheating, setIsCheating] = useState(false);
  const [deceptionAttempts, setDeceptionAttempts] = useState(0); // Counter for cheating attempts
  const [cheatingCheckEnabled, setCheatingCheckEnabled] = useState(true); // State to enable/disable cheating check
  const [messages, setMessages] = useState([]); // Chat messages
  const [userInput, setUserInput] = useState(''); // User's input
  const [questionCount, setQuestionCount] = useState(0); // Number of questions asked
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognition = useRef(null);
  const synthesis = useRef(window.speechSynthesis);

  const width = 500;
  const height = 500;

  const webcamRef = useRef(null);

  // Initialize face detection
  useEffect(() => {
    const faceDetection = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      setFacesDetected(results.detections.length);
    });

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceDetection.send({ image: webcamRef.current.video });
        },
        width,
        height,
      });
      camera.start();
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        handleSendMessage(transcript);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, []);

  // Update face detection state
  useEffect(() => {
    if (facesDetected === 1) {
      setIsUserInFrame(true);
      setMultipleFacesDetected(false);
    } else {
      setIsUserInFrame(false);
      setMultipleFacesDetected(facesDetected > 1);
      setDeceptionAttempts((prev) => prev + 1); // Increment deception attempts
    }
  }, [facesDetected]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          alert('Time is up! The interview has ended.');
          window.close(); // Close the window when time is up
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cheating checker with updated logic
  // useEffect(() => {
  //   if (!cheatingCheckEnabled) return; // Disable cheating check if not enabled

  //   const handleFocus = () => setIsCheating(false);
  //   const handleBlur = () => {
  //     setIsCheating(true);
  //     setDeceptionAttempts((prev) => prev + 1); // Increment deception attempts
  //     alert('Focus lost! Please stay on the interview page.');
  //   };

  //   const handleDevToolsOpen = () => {
  //     setIsCheating(true);
  //     setDeceptionAttempts((prev) => prev + 1); // Increment deception attempts
  //     alert('Developer tools are disabled during the interview.');
  //     window.close(); // Close the window if dev tools are opened
  //   };

  //   // Detect focus/blur
  //   window.addEventListener('focus', handleFocus);
  //   window.addEventListener('blur', handleBlur);

  //   // Detect developer tools
  //   const detectDevTools = () => {
  //     let devtoolsOpen = false;
  //     const element = new Image();
  //     Object.defineProperty(element, 'id', {
  //       get: () => {
  //         devtoolsOpen = true;
  //         handleDevToolsOpen();
  //       },
  //     });

  //     const checkDevTools = () => {
  //       devtoolsOpen = false;
  //       console.log(element);
  //       if (devtoolsOpen) {
  //         handleDevToolsOpen();
  //       }
  //     };

  //     const interval = setInterval(checkDevTools, 1000);
  //     return () => clearInterval(interval);
  //   };
  //   const stopDetectDevTools = detectDevTools();

  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //     window.removeEventListener('blur', handleBlur);
  //     stopDetectDevTools();
  //   };
  // }, [cheatingCheckEnabled]);

  // Function to fetch chatbot response from Gemini API


  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
      <div className="lg:w-1/2 p-6 flex flex-col items-center">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full mb-6">
          <h2 className="text-2xl font-bold text-center text-indigo-800 mb-4">Interview Monitor</h2>
          
          {/* Timer and Status Panel */}
          <div className="flex justify-around mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-center bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{facesDetected}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">Faces Detected</div>
            </div>
            
            <div className="text-center">
              <div className={`text-xl font-bold ${deceptionAttempts > 0 ? 'text-red-500' : 'text-green-600'}`}>
                {deceptionAttempts}
              </div>
              <div className="text-sm text-gray-500">Deception Attempts</div>
            </div>
          </div>
        </div>

        {/* Webcam Container */}
        <div className="relative w-full max-w-[500px]">
          <div className={`rounded-xl overflow-hidden shadow-xl border-4 ${
            isUserInFrame ? 'border-green-500' : 'border-red-500'
          }`}>
            <Webcam
              ref={webcamRef}
              forceScreenshotSourceSize
              className="h-full w-full object-cover"
              width={width}
              height={height}
            />
            
            {/* Webcam Status Overlay */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-medium ${
              isUserInFrame ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isUserInFrame ? 'User Detected' : 'No User'}
            </div>
          </div>
          
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col space-y-2">
              {!isUserInFrame && (
                <div className="flex items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">No user detected in the frame!</span>
                </div>
              )}
              {multipleFacesDetected && (
                <div className="flex items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Multiple faces detected!</span>
                </div>
              )}
              {isUserInFrame && !multipleFacesDetected && (
                <div className="flex items-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">User is in the frame</span>
                </div>
              )}
              {isCheating && cheatingCheckEnabled && (
                <div className="flex items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Cheating detected! Please stay focused.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='mb-10 w-full h-[85vh]'>

            <ChatBot />
      </div>
      
      {/* Chatbot Container */}
      {/* <div className="lg:w-1/2 p-6 mt-6 lg:mt-0">
        <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
          <div className="p-4 h-[calc(100%-4rem)]">
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default HRChatbot;