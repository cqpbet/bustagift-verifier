import { useEffect, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import SHA256 from "crypto-js/sha256";
import { DefaultHeader } from "./header.jsx";
import { createDefaultDeck52 } from "../libs/deck.js";

function isValid(value) {
	return value !== undefined && value !== null;
}

function isEmpty(value) {
	if (isValid(value)) {
		return (value.toString() + "").length === 0;
	}
	return true;
}

const rankSymbolMap = {
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
	7: "7",
	8: "8",
	9: "9",
	10: "10",
	11: "J",
	12: "Q",
	13: "K",
	14: "A",
}

const suitSymbolMap = {
	"hearts": "♥",
	"diamonds": "♦",
	"spades": "♠",
	"clubs": "♣",
}

const suitColorMap = {
	"hearts": "#FF0000",
	"diamonds": "#FF0000",
	"spades": "#000000",
	"clubs": "#000000",
}

function Card({ card }) {
	const color = suitColorMap[card.suit];
	const suit = suitSymbolMap[card.suit];
	const rank = rankSymbolMap[card.rank];

	return <div style={{ margin: 5, color: color, background: "#fcfcfc", borderRadius: 10, border: "1px solid #000000", position: "relative", width: 65, height: 90 }}>
		<div style={{ position: "absolute", left: 10, top: 10, fontSize: 30, lineHeight: 1, fontWeight: "bold" }}>
			{rank}
		</div>
		<div style={{ position: "absolute", right: 10, bottom: 5, fontSize: 50, lineHeight: 1 }}>
			{suit}
		</div>
	</div>;
}

function ValidationResult({ values }) {
	const [ wrongCommitment, setWrongCommitment ] = useState(false);
	const [ deck, setDeck ] = useState([]);

	useEffect(() => {
		let wrongCommitment = false;
		const list = [];

		if (!isEmpty(values.hash)) {
			const commitment = SHA256(values.hash).toString();
			wrongCommitment = commitment !== values.commitment;
		}

		if (!wrongCommitment && !isEmpty(values.hash)) {
			const deck = createDefaultDeck52();
			deck.shuffleByHash(values.hash);

			const array = [];
			while (!deck.isEmpty()) {
				array.push(deck.draw());
			}
			setDeck(array);
		}

		setWrongCommitment(wrongCommitment);
	}, [ values ]);

	if (wrongCommitment) {
		return <>
			<Row className="mt-3 mb-2 fw-bold">
				<Col>
					❌ Wrong commitment
				</Col>
			</Row>
		</>;
	}

	if (isEmpty(values.hash)) {
		return <Row className="mt-4 fw-bold">
			<Col>
				❌ Unknown hash
			</Col>
		</Row>
	}

	return <>
		<Row className="mt-4 fw-bold">
			<Col>
				✅ Correct
			</Col>
		</Row>
		<Row className="mt-2">
			<Col>
				<div className={"d-flex flex-wrap"}>
					{ deck.map((card, index) => <Card key={index} card={card} />) }
				</div>
			</Col>
		</Row>
	</>;
}

export default function Verifier() {
	const {
		formState: { isValid: isFormValid },
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			num: 50,
		},
	});

	const [ values, setValues ] = useState(null);

	const onSubmit = (values) => {
		setValues(values);
	};

	return <Container fluid className="p-4">
		<Row className="mb-0">
			<Col>
				<DefaultHeader />
			</Col>
		</Row>
		<Row className="mt-3 mb-2">
			<Col>
				<p>Bust’a Gift is provably fair, meaning that every player can independently verify the results of any round.</p>
				<ol>
					<li>Open the game information page for the round you want to check.</li>
					<li>Copy <b>Commitment</b>, and <b>Hash</b> from the round details and paste them into the form below.</li>
					<li>Make sure the round results match the data from the game.</li>
				</ol>
			</Col>
		</Row>
		<Row>
			<Col>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Form.Group className="mb-3">
						<InputGroup>
							<InputGroup.Text style={{ width: 150 }}>Commitment</InputGroup.Text>
							<Form.Control
								{...register("commitment", {
									required: true,
									minLength: 64,
									maxLength: 64,
								})}
							/>
						</InputGroup>
					</Form.Group>
					<Form.Group className="mb-3">
						<InputGroup>
							<InputGroup.Text style={{ width: 150 }}>Hash</InputGroup.Text>
							<Form.Control
								{...register("hash", {
									required: false,
									minLength: 64,
									maxLength: 64,
								})}
							/>
						</InputGroup>
					</Form.Group>
					<Button disabled={!isFormValid} type="submit">
						Verify games
					</Button>
				</Form>
			</Col>
		</Row>
		{ isValid(values) ? <ValidationResult values={values} /> : null }
	</Container>;
}
