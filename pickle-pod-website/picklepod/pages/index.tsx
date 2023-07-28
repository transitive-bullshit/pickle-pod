import React, { useState } from 'react';
import Select from 'react-select';

const podcasters = [
  { value: 'lex-fridman', label: 'Lex Fridman' }
];

let mediaRecorder;
let recordedChunks = [];

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

const startRecording = () => {
  console.log('start recording')
  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
  .then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
  });
};

const stopRecording = () => {
  mediaRecorder.stop();
  console.log(recordedChunks);
};

const IndexPage = () => {
  const [selectedPodcaster, setSelectedPodcaster] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedPodcaster(selectedOption);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col w-full p-8 text-gray-800 bg-white shadow-lg rounded-2xl">
        <div className="flex items-center justify-center">
          <div className="p-3">
            <div className="text-xl font-medium text-gray-700">Select a Podcaster</div>
            <Select
              instanceId={podcasters[0].value}
              options={podcasters}
              value={selectedPodcaster}
              onChange={handleChange}
              isSearchable={true}
              placeholder="Select a podcaster..."
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-6">
        <button 
            onClick={startRecording} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
        >
            Start Recording
        </button>

        <button 
            onClick={stopRecording} 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded m-2"
        >
            Stop Recording
        </button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
