import React, { useEffect, useRef, useState } from "react";
import Keyboard from "./Keyboard";
import { useStore, GUESS_LENGTH } from "./store";
import { isValidWord, LETTER_LENGTH } from "./word-utils";
import WordRow from "./WordRow";

export default function App() {
  const state = useStore();
  const [guess, setGuess, addGuessLetter] = useGuess();
  const addGuess = useStore((s) => s.addGuess);
  const previousGuess = usePrevious(guess);
  const [showInvalidGuess, setInvalidGuess] = useState(false);

  useEffect(() => {
    let id: any;
    if (showInvalidGuess) {
      id = setTimeout(() => setInvalidGuess(false), 1500);
    }
    return () => clearTimeout(id);
  }, [showInvalidGuess]);

  useEffect(() => {
    if (guess.length === 0 && previousGuess?.length === LETTER_LENGTH) {
      if (isValidWord(previousGuess)) {
        addGuess(previousGuess);
        setInvalidGuess(false);
      } else {
        setInvalidGuess(true);
        setGuess(previousGuess);
      }
    }
  }, [guess]);

  let rows = [...state.rows];

  let curRow = 0;
  if (rows.length < GUESS_LENGTH) {
    curRow = rows.push({ guess }) - 1;
  }

  const numGuessesRemaining = GUESS_LENGTH - rows.length;
  const isGameOver = state.gameState !== "playing";
  const opacityLevel = `${isGameOver ? "opacity-30" : "opacity-100"}`;

  rows = rows.concat(Array(numGuessesRemaining).fill(""));

  return (
    <div>
      <div className="mx-auto w-96 relative">
        <header className="border-b border-gray-300 pb-2 my-2">
          <h1 className="text-4xl text-center tracking-tight">Wordle</h1>
          <div></div>
        </header>

        <main className={`grid grid-rows-6 gap-1.5 mb-4 px-8 ${opacityLevel}`}>
          {rows.map(({ guess, result }, index) => (
            <WordRow
              key={index}
              letters={guess}
              result={result}
              className={
                showInvalidGuess && curRow === index
                  ? "animate-bounce bg-white/75"
                  : ""
              }
            />
          ))}
        </main>

        <div className={opacityLevel}>
          <Keyboard
            onClick={(letter) => {
              addGuessLetter(letter);
            }}
          />
        </div>

        {isGameOver && (
          <div
            role="modal"
            className="absolute bg-white left-0 right-0 top-1/4 p-6 text-center w-3/4 mx-auto rounded shadow-lg"
          >
            <h2 className="text-xl">You {state.gameState}!</h2>
            <h2>The word was:</h2>
            <div>
              <WordRow letters={state.answer} />
            </div>
            <button
              className="play-again-btn block border rounded border-emerald-500 bg-emerald-500 p-2 mt-4 mx-auto shadow text-white hover:shadow-lg"
              onClick={() => {
                state.newGame();
                setGuess("");
              }}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function useGuess(): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  (letter: string) => void
] {
  const [guess, setGuess] = useState("");

  const addGuessLetter = (letter: string) => {
    setGuess((curGuess) => {
      const newGuess = letter.length === 1 ? curGuess + letter : curGuess;
      console.log(letter);
      switch (letter) {
        case "Backspace":
        case "<-":
          return newGuess.slice(0, -1);
        case "Enter":
          if (newGuess.length === LETTER_LENGTH) {
            return "";
          }
      }

      if (curGuess.length === LETTER_LENGTH) {
        return curGuess;
      }

      return newGuess;
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    let letter = e.key;
    addGuessLetter(letter);
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return [guess, setGuess, addGuessLetter];
}

function usePrevious<T>(value: T) {
  const ref: any = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
