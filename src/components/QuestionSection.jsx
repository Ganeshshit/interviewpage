import React from "react";

const QuestionSection = ({ questions, currentQuestion, onQuestionSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(question)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              currentQuestion?.id === question.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Question {index + 1}
          </button>
        ))}
      </div>

      {currentQuestion ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.title}</h3>
          <div className="prose max-w-none">
            <p>{currentQuestion.description}</p>
          </div>
          {currentQuestion.examples && (
            <div className="space-y-2">
              <h4 className="font-medium">Examples:</h4>
              {currentQuestion.examples.map((example, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded">
                  <p className="font-mono">{example.input}</p>
                  <p className="font-mono">{example.output}</p>
                </div>
              ))}
            </div>
          )}
          {currentQuestion.constraints && (
            <div className="space-y-2">
              <h4 className="font-medium">Constraints:</h4>
              <ul className="list-disc list-inside">
                {currentQuestion.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Select a question to begin
        </div>
      )}
    </div>
  );
};

export default QuestionSection; 