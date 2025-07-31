import Hex from "crypto-js/enc-hex.js";
import HmacSHA256 from "crypto-js/hmac-sha256.js";

export const MAX_GAME_RESULT = 1000000.00;
export const MAX_GAME_RESULT_INT = MAX_GAME_RESULT * 100;

export function gameResult(key, gameHash) {
	const nBits = 52;

	const hash = HmacSHA256(gameHash, key).toString(Hex);

	const seed = hash.slice(0, nBits / 4);
	const r = parseInt(seed, 16);

	let X = r / Math.pow(2, nBits);

	X = 99 / (1 - X);

	const result = Math.floor(X);
	return Math.max(1.00, Math.min(MAX_GAME_RESULT, result / 100));
}

export function gameResultInt(key, gameHash) {
	return Math.floor(gameResult(key, gameHash) * 100);
}

export function gameResultChance(multiplier) {
	if (multiplier <= 1) return 1;
	const nBits = 52;
	const maxR = Math.pow(2, nBits);
	const xTarget = multiplier * 100;
	const r = maxR * (1 - 99 / xTarget);
	return 1 - Math.max(0, Math.min(1, r / maxR));
}

const timeRate = 0.00006;

export function timeToReachMultiplier(value) {
	return Math.log(value) / timeRate;
}

export function multiplierAtTime(time) {
	return Math.exp(timeRate * time);
}

export function calculateScoreInt(totalTON) {
	const t = totalTON / 1e9;
	if (t < 2) return Math.max(Math.floor(t / 2 * 100), 1);
	return Math.floor(Math.log2(t) * 100);
}
