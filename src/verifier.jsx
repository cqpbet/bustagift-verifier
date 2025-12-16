import { useEffect, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { CHAIN_LENGTH, PUBLIC_SECRET } from "../libs/config.js";
import SHA256 from "crypto-js/sha256";
import { gameResultInt } from "../libs/utils.js";

function isValid(value) {
	return value !== undefined && value !== null;
}

function isEmpty(value) {
	if (isValid(value)) {
		return (value.toString() + "").length === 0;
	}
	return true;
}

function RoundResult({ values }) {
  return <tr className={values.current ? "fw-bold" : null}>
    <td>#{values.gameId}</td>
    <td>{isValid(values.hash) ? "x" + (gameResultInt(PUBLIC_SECRET, values.hash) / 100).toFixed(2) : "?"}</td>
  </tr>;
}

function ValidationResult({ values }) {
	const [ wrongCommitment, setWrongCommitment ] = useState(false);
	const [ list, setList ] = useState([]);

	useEffect(() => {
		let wrongCommitment = false;
		const list = [];

		if (!isEmpty(values.hash)) {
			const commitment = SHA256(values.gameId + ":" + values.hash).toString();
			wrongCommitment = commitment !== values.commitment;
		}

		if (!wrongCommitment) {
			if (isEmpty(values.hash)) {
				list.push({
					gameId: values.gameId,
					hash: null,
					current: true,
				});
			} else {
				list.push({
					gameId: values.gameId,
					hash: values.hash,
					current: true,
				});
			}

			let gameId = values.gameId - 1;
			let hash = values.commitment;
			const length = Math.min(values.num - 1, gameId % CHAIN_LENGTH);

			for (let i = 0; i < length; ++i) {
				list.push({
					gameId: gameId,
					hash: hash,
					current: false,
				});

				hash = SHA256(gameId + ":" + hash).toString();
				gameId -= 1;
			}
		}

		setWrongCommitment(wrongCommitment);
		setList(list);

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

	return <>
		<Row className="mt-4 fw-bold">
			<Col>
				{isEmpty(values.hash) ? "Unknown hash" : "✅ Correct commitment"}
			</Col>
		</Row>
		<Row className="mt-2">
			<Col>
				<table className="table table-borderless">
					<thead>
						<tr>
							<th scope="col">Game Number</th>
							<th scope="col">Multiplier</th>
						</tr>
					</thead>
					<tbody>
						{list.map((item) => <RoundResult key={item.gameId} values={item}/>)}
					</tbody>
				</table>
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
				<h1 className="mb-0">Bust`a Gift verifier</h1>
				<small>
					<a href="https://github.com/cqpbet/bustagift-verifier" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>source code</a>
				</small>
			</Col>
		</Row>
		<Row className="mt-3 mb-2">
			<Col>
				<p>Bust’a Gift is provably fair, meaning that every player can independently verify the results of any round.</p>
				<ol>
					<li>Open the game information page for the round you want to check.</li>
					<li>Copy <b>Game Number</b>, <b>Commitment</b>, and <b>Hash</b> (optional) from the round details and paste them into the form below.</li>
					<li>Make sure the round results match the data from the game.</li>
				</ol>
			</Col>
		</Row>
		<Row>
			<Col>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Form.Group className="mb-3">
						<InputGroup>
							<InputGroup.Text style={{ width: 150 }}>Game Number</InputGroup.Text>
							<Form.Control type="number"
								{...register("gameId", {
									required: true,
									min: 1,
									valueAsNumber: true,
								})}
							/>
						</InputGroup>
					</Form.Group>
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
					<Form.Group className="mb-3">
						<InputGroup>
							<InputGroup.Text style={{ width: 150 }}>Rounds</InputGroup.Text>
							<Form.Control type="number"
								{...register("num", {
									required: true,
									min: 1,
									max: 1000000,
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
