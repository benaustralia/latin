"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const CerberusGame = () => {
  const centralColumn = 7;
  
  // Answer data with direct specification of letter positions
  const answerData = [
    { action: 'father', answer: 'pater', letters: [{char: 'P', column: 7, isKey: true}, {char: 'A', column: 8}, {char: 'T', column: 9}, {char: 'E', column: 10}, {char: 'R', column: 11}]},
    { action: 'goes out', answer: 'exit', letters: [{char: 'E', column: 7, isKey: true}, {char: 'X', column: 8}, {char: 'I', column: 9}, {char: 'T', column: 10}]},
    { action: 'on the table', answer: 'in mensa', letters: [{char: 'I', column: 1}, {char: 'N', column: 2}, {char: ' ', column: 3, isSpace: true}, {char: 'M', column: 4}, {char: 'E', column: 5}, {char: 'N', column: 6}, {char: 'S', column: 7, isKey: true}, {char: 'A', column: 8}]},
    { action: 'in the study', answer: 'in tablino', letters: [{char: 'I', column: 4}, {char: 'N', column: 5}, {char: ' ', column: 6, isSpace: true}, {char: 'T', column: 7, isKey: true}, {char: 'A', column: 8}, {char: 'B', column: 9}, {char: 'L', column: 10}, {char: 'I', column: 11}, {char: 'N', column: 12}, {char: 'O', column: 13}]},
    { action: 'son', answer: 'filius', letters: [{char: 'F', column: 6}, {char: 'I', column: 7, isKey: true}, {char: 'L', column: 8}, {char: 'I', column: 9}, {char: 'U', column: 10}, {char: 'S', column: 11}]},
    { action: 'writes', answer: 'scribit', letters: [{char: 'S', column: 7, isKey: true}, {char: 'C', column: 8}, {char: 'R', column: 9}, {char: 'I', column: 10}, {char: 'B', column: 11}, {char: 'I', column: 12}, {char: 'T', column: 13}]}
  ];

  // Main game state
  const [gameState, setGameState] = useState({
    rows: answerData.map(data => ({
      ...data,
      values: Array(13).fill(''),
      completed: false
    })),
    score: 0,
    gameCompleted: false,
    showSuccess: false,
    showHint: false
  });
  
  const inputRefs = useRef([]);
  
  useEffect(() => {
    // Initialize refs
    inputRefs.current = document.querySelectorAll('.letter-input');
  }, []);

  const handleLetterInput = (rowIndex, colIndex, letter) => {
    setGameState(prev => {
      const newState = {...prev};
      newState.rows = [...prev.rows];
      newState.rows[rowIndex] = {...prev.rows[rowIndex]};
      newState.rows[rowIndex].values = [...prev.rows[rowIndex].values];
      newState.rows[rowIndex].values[colIndex] = letter.toUpperCase();
      
      // Auto-advance to next input
      if (letter) {
        setTimeout(() => {
          const inputs = document.querySelectorAll(`.row-${rowIndex} .letter-input`);
          const currentIndex = Array.from(inputs).findIndex(input => input.dataset.col == colIndex);
          if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          }
        }, 0);
      }
      
      // Check if row is completed
      const row = newState.rows[rowIndex];
      const isComplete = checkRowCompletion(row);
      
      if (isComplete && !row.completed) {
        row.completed = true;
        newState.score++;
        newState.showSuccess = true;
        
        // Check if all rows completed
        if (newState.rows.every(r => r.completed)) {
          newState.gameCompleted = true;
        }
        
        setTimeout(() => {
          setGameState(s => ({...s, showSuccess: false}));
        }, 2000);
      }
      
      return newState;
    });
  };
  
  const checkRowCompletion = (row) => {
    const letterBoxes = row.letters.filter(l => !l.isSpace);
    return letterBoxes.every(letter => 
      row.values[letter.column - 1]?.toUpperCase() === letter.char.toUpperCase()
    );
  };
  
  const handleKeyDown = (rowIndex, colIndex, e) => {
    if (e.key === 'Backspace' && !gameState.rows[rowIndex].values[colIndex]) {
      const inputs = document.querySelectorAll(`.row-${rowIndex} .letter-input`);
      const currentIndex = Array.from(inputs).findIndex(input => input.dataset.col == colIndex);
      if (currentIndex > 0) {
        inputs[currentIndex - 1].focus();
      }
    }
  };

  const showHint = (rowIndex) => {
    // Show hint
    setGameState(prev => {
      const newState = {...prev};
      newState.rows = [...prev.rows];
      newState.rows[rowIndex] = {...prev.rows[rowIndex]};
      
      // Fill with correct values temporarily
      const tempValues = [...newState.rows[rowIndex].values];
      newState.rows[rowIndex].letters.forEach(letter => {
        if (!letter.isSpace) {
          tempValues[letter.column - 1] = letter.char;
        }
      });
      newState.rows[rowIndex].values = tempValues;
      
      return newState;
    });
    
    // Clear after 500ms
    setTimeout(() => {
      setGameState(prev => {
        if (prev.rows[rowIndex].completed) return prev;
        
        const newState = {...prev};
        newState.rows = [...prev.rows];
        newState.rows[rowIndex] = {...prev.rows[rowIndex]};
        newState.rows[rowIndex].values = Array(13).fill('');
        return newState;
      });
    }, 500);
  };
  
  const resetGame = () => {
    setGameState({
      rows: answerData.map(data => ({
        ...data,
        values: Array(13).fill(''),
        completed: false
      })),
      score: 0,
      gameCompleted: false,
      showSuccess: false,
      showHint: false
    });
  };
  
  const getVerticalWord = () => {
    return gameState.rows.map(row => {
      const keyLetter = row.letters.find(l => l.isKey);
      return row.values[keyLetter.column - 1] || '_';
    }).join('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <motion.h1 className="text-2xl font-bold mb-6 text-center text-purple-800"
        initial={{y: -50, opacity: 0}} animate={{y: 0, opacity: 1}}>
        What does Cerberus do? - Latin Vocabulary
      </motion.h1>
      
      <motion.div className={`mb-6 p-4 rounded-lg ${gameState.gameCompleted ? 'bg-green-50' : 'bg-purple-50'}`}
        animate={{scale: gameState.gameCompleted ? [1, 1.05, 1] : 1}}>
        
        <div className="flex justify-between mb-4">
          <span className="font-semibold">Score: {gameState.score}/{gameState.rows.length}</span>
          <div>
            <button onClick={() => setGameState(s => ({...s, showHint: !s.showHint}))}
              className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
              Hint
            </button>
            <button onClick={resetGame}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
              Reset
            </button>
          </div>
        </div>
        
        {gameState.showHint && (
          <motion.div className="mb-4 p-3 bg-yellow-100 text-sm rounded"
            initial={{opacity: 0}} animate={{opacity: 1}}>
            <p>Hint: Match the English words to their Latin equivalents.</p>
            <ul className="list-disc ml-5 mt-1">
              <li>father = "pater"</li>
              <li>goes out = "exit"</li>
              <li>on the table = "in mensa"</li>
              <li>in the study = "in tablino"</li>
              <li>son = "filius"</li>
              <li>writes = "scribit"</li>
            </ul>
          </motion.div>
        )}
        
        {gameState.showSuccess && (
          <motion.div className="mb-4 p-3 bg-green-100 text-green-800 rounded"
            initial={{opacity: 0}} animate={{opacity: 1}}>
            Correct! ✓
          </motion.div>
        )}
        
        {gameState.gameCompleted && (
          <motion.div className="mb-4 p-3 bg-green-100 text-green-800 rounded"
            initial={{opacity: 0}} animate={{opacity: 1}}>
            <p>Congratulations! You've completed the crossword! 🎉</p>
            <p className="mt-2 font-bold">The central column spells: {getVerticalWord()}</p>
          </motion.div>
        )}
      </motion.div>

      <div className="space-y-4">
        {gameState.rows.map((row, rowIndex) => (
          <motion.div key={rowIndex} className="flex items-center"
            initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} 
            transition={{delay: rowIndex * 0.1}}>
            
            <div className="w-32 font-medium text-right pr-4">{row.action}</div>
            
            <div className={`flex row-${rowIndex}`}>
              {[...Array(13)].map((_, colIndex) => {
                const letter = row.letters.find(l => l.column === colIndex + 1);
                
                if (!letter) return <div key={colIndex} className="w-8 h-8 mx-0.5"></div>;
                
                if (letter.isSpace) {
                  return (
                    <div key={colIndex} className="w-8 h-8 flex items-center justify-center mx-0.5">
                      &nbsp;
                    </div>
                  );
                }
                
                return (
                  <motion.div key={colIndex}
                    className={`relative w-8 h-8 border-2 mx-0.5 ${
                      letter.isKey ? 'border-purple-600 bg-purple-50' : 
                      row.completed ? 'border-green-500 bg-green-50' : 'border-gray-400'
                    }`}
                    animate={{
                      scale: row.completed && row.values[colIndex] ? [1, 1.1, 1] : 1,
                      borderColor: letter.isKey ? '#9333EA' : row.completed ? '#10B981' : '#9CA3AF'
                    }}>
                    <input
                      className="letter-input w-full h-full text-center text-sm uppercase font-bold focus:outline-none"
                      data-col={colIndex}
                      type="text"
                      maxLength="1"
                      value={row.values[colIndex] || ''}
                      onChange={(e) => handleLetterInput(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                      disabled={row.completed}
                      style={{
                        backgroundColor: letter.isKey ? '#F3E8FF' : row.completed ? '#E6FFEA' : 'white',
                        color: letter.isKey ? '#6B21A8' : row.completed ? '#047857' : '#1F2937'
                      }}
                    />
                  </motion.div>
                );
              })}
              
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => showHint(rowIndex)}
                className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                disabled={row.completed}>
                {row.completed ? "✓" : "Hint"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div className="mt-6 text-sm text-gray-600 italic text-center"
        initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1}}>
        <p>Type each letter into the boxes. The game will automatically move to the next box as you type.</p>
        <p className="mt-1">Click "Hint" to flash the answer for half a second if you get stuck.</p>
        <p className="mt-1">The central column (highlighted in purple) will spell "PESTIS" when complete!</p>
      </motion.div>
    </div>
  );
};

export default CerberusGame;