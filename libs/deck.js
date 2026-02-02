import seedrandom from "seedrandom";

export const CARD_SUIT = {
	hearts: "hearts",
	diamonds: "diamonds",
	clubs: "clubs",
	spades: "spades",
};

export const CARD_RANK = {
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
	ten: 10,
	jack: 11,
	queen: 12,
	king: 13,
	ace: 14,
};

export class Card {
	constructor(suit, rank) {
		this.suit = suit;
		this.rank = rank;
	}
}

export class Deck {
	constructor(cards) {
		this.cards = cards;
		this.drawn = [];
	}

	shuffleByHash(hash) {
		const rng = seedrandom(hash);

		// Fisher–Yates
		for (let i = this.cards.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[ this.cards[i], this.cards[j] ] = [ this.cards[j], this.cards[i] ];
		}

		return this;
	}

	size() {
		return this.cards.length;
	}

	isEmpty() {
		return this.cards.length === 0;
	}

	draw() {
		if (this.isEmpty()) {
			throw new Error("Deck is empty");
		}

		const card = this.cards.pop();
		this.drawn.push(card);
		return card;
	}
}

export function createDefaultDeck52() {
	const cards = [];

	const sortedSuit = Object.values(CARD_SUIT).sort();
	const sortedRank = Object.values(CARD_RANK).sort();

	for (let i = 0; i < sortedSuit.length; ++i) {
		const suit = sortedSuit[i];
		for (let j = 0; j < sortedRank.length; ++j) {
			const rank = sortedRank[j];
			cards.push(new Card(suit, rank));
		}
	}

	return new Deck(cards);
}