import React, { useState } from 'react';
import VideoCall from './VideoCall';
import CodeEditor from './CodeEditor';
import Chat from './Chat';

const CandidateView = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState('// Write your code here');

  const handleSendMessage = (message) => {
    setMessages([...messages, { text: message, isUser: true }]);
    // TODO: Implement sending message to interviewer
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // TODO: Implement syncing code with interviewer
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-screen">
      <div className="space-y-4">
        <VideoCall roomId={roomId} />
        <Chat messages={messages} onSendMessage={handleSendMessage} />
      </div>
      <div className="space-y-4">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language="javascript"
        />
      </div>
    </div>
  );
};

export default CandidateView; 