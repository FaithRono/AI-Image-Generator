import { useState } from 'react';

const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      (window.SpeechRecognition || window.webkitSpeechRecognition).stop();
    }
    setIsListening(false);
  };

  return { transcript, isListening, startListening, stopListening };
};

export default useSpeechRecognition;
