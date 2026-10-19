import React, {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, {translate} from '@docusaurus/Translate';
import {useAdventure} from '@site/src/data/useAdventure';
import styles from './GameCard.module.css';

function useCardSides(adventure, card) {
  const {cards, cardFolder} = useAdventure(adventure);
  const base = useBaseUrl(`/cards/${adventure}/${cardFolder}`);
  const data = cards.find((c) => c.id === card);
  if (!data) {
    throw new Error(`Unknown card "${card}" in adventure "${adventure}"`);
  }
  // A card printed with the same face on both sides has nothing to flip to.
  const twoFaced = data.back && data.back.file !== data.front.file;
  return [data.front, twoFaced && data.back]
    .filter(Boolean)
    .map((side) => ({name: side.name, src: base + side.file}));
}

// Thumbnail of a card; click to enlarge, and flip it if it is double-sided.
// `side` picks the face shown first: "front" (default) or "back".
export default function GameCard({adventure, card, side = 'front', inline = false}) {
  const sides = useCardSides(adventure, card);
  const initial = side === 'back' && sides.length > 1 ? 1 : 0;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(initial);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const thumb = sides[initial];
  return (
    <>
      <button
        type="button"
        className={inline ? styles.thumbInline : styles.thumb}
        onClick={() => {
          setShown(initial);
          setOpen(true);
        }}
        title={translate({id: 'card.enlarge', message: '{name} (click to enlarge)'}, {name: thumb.name})}>
        <img src={thumb.src} alt={thumb.name} loading="lazy" />
        <span className={styles.caption}>{thumb.name}</span>
      </button>
      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <img src={sides[shown].src} alt={sides[shown].name} />
          <div className={styles.controls} onClick={(event) => event.stopPropagation()}>
            {sides.length > 1 && (
              <button
                type="button"
                className="button button--primary"
                onClick={() => setShown((shown + 1) % sides.length)}>
                <Translate id="card.flip">Flip card</Translate>
              </button>
            )}
            <button type="button" className="button button--secondary" onClick={() => setOpen(false)}>
              <Translate id="card.close">Close</Translate>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Every card of an adventure, both faces side by side.
export function CardGallery({adventure}) {
  const {cards} = useAdventure(adventure);
  return (
    <div className={styles.gallery}>
      {cards.map((card) => (
        <React.Fragment key={card.id}>
          <GameCard adventure={adventure} card={card.id} inline />
          {card.back && card.back.file !== card.front.file && (
            <GameCard adventure={adventure} card={card.id} side="back" inline />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
