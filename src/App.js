// eslint-disable-next-line
import * as Types from './types.js'

import './App.css'

import { useState, useEffect } from 'react';

const all_cards = Array(300).fill("Lightning bolt")

export default function App() {
  /** @type {[Types.Card[][], (Types.Card[][])=>void]} */
  const [cards, setCards] = useState([])

  const splitIntoChunks = (arr, size) => {
    let chunks = [[]]
    arr.forEach(itm => {
      if (chunks[chunks.length - 1].length >= size) chunks.push([])
      chunks[chunks.length - 1].push(itm)
    })
    return chunks
  }

  /** @returns {Types.Card[]} */
  const get_cards = async (cards) => {
    if (cards.length > 75) {
      let chunks = splitIntoChunks(cards, 75)
      let results = await Promise.all(chunks.map(async c=>{
        return await get_cards(c)
      }))
      return results.flat(1)
    }
    let res = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST",
      body: JSON.stringify({ identifiers: cards.map(card => ({ name: card })) }),
      headers: { "Content-Type": "application/json" }
    }).then(r => r.json())
    return res.data
  }

  useEffect(() => {
    (async () => {
      let recieved = await get_cards(all_cards)
      setCards(splitIntoChunks(recieved, Math.floor(Math.sqrt(recieved.length))))
    })()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {cards.map((group, gidx) => <div key={gidx}>
          {group.map((card, idx) => <div
            // The PNG images are 745x1040, and we're scaling them to be ???x200
            style={{ position: 'absolute', top: `calc(var(--baseline) * ${gidx})`, left: `calc(var(--baseline) * 745 / 1040 * ${idx})` }}
            key={idx}
          >
            <img
              src={card.image_uris.png}
              alt={card.name}
              id={idx}
              className='card-img'
            />
          </div>)}
        </div>)}
      </header>
    </div>
  );
}