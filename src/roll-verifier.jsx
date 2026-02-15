import { useEffect, useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { CHAIN_LENGTH, PUBLIC_SECRET } from "../libs/config.js";
import SHA256 from "crypto-js/sha256";
import { rouletteAngle } from "../libs/utils.js";
import { DefaultHeader } from "./header.jsx";

const CHAIN_LENGTH_PAGE = CHAIN_LENGTH / 200;

function isValid(value) {
	return value !== undefined && value !== null;
}

function isEmpty(value) {
	if (isValid(value)) {
		return (value.toString() + "").length === 0;
	}
	return true;
}

function RouletteAngleSvg({ angle }) {
	const size = 60;
	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 4;

	const markerAngle = (-angle - 90) * (Math.PI / 180);
	const mx = cx + r * Math.cos(markerAngle);
	const my = cy + r * Math.sin(markerAngle);
	const innerR = r - 8;
	const mix = cx + innerR * Math.cos(markerAngle);
	const miy = cy + innerR * Math.sin(markerAngle);

	return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
		<circle cx={cx} cy={cy} r={r} fill="none" stroke="#00000033" strokeWidth="1.5" />
		<line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 8} stroke="#000000CC" strokeWidth="1.5" strokeLinecap="round" />
		<line x1={mix} y1={miy} x2={mx} y2={my} stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
		<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#000000" fontSize="12" fontWeight="bold">{angle.toFixed(1)}°</text>
	</svg>;
}

function RouletteAngleUnknownSvg() {
	const size = 60;
	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 4;

	return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
		<circle cx={cx} cy={cy} r={r} fill="none" stroke="#00000033" strokeWidth="1.5" />
		<line x1={cx} y1={cy - r} x2={cx} y2={cy - r + 8} stroke="#000000CC" strokeWidth="1.5" strokeLinecap="round" />
		<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#00000066" fontSize="14" fontWeight="bold">?</text>
	</svg>;
}

function RoundResult({ values }) {
	if (isValid(values.hash)) {
		const { angle } = rouletteAngle(PUBLIC_SECRET, values.hash);
		return <tr className={values.current ? "fw-bold" : null}>
			<td>#{values.gameId}</td>
			<td>
				<RouletteAngleSvg angle={angle} />
			</td>
		</tr>;
	}

	return <tr className={values.current ? "fw-bold" : null}>
		<td>#{values.gameId}</td>
		<td>
			<RouletteAngleUnknownSvg />
		</td>
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
			const length = Math.min(values.num - 1, gameId % CHAIN_LENGTH_PAGE);

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
							<th scope="col" style={{ width: 150 }}>Game Number</th>
							<th scope="col">Angle</th>
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

export default function RollVerifier({ params = {} }) {
	const {
		formState: { isValid: isFormValid },
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			gameId: params.game_number ? Number(params.game_number) : undefined,
			commitment: params.commitment || "",
			hash: params.hash || "",
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
				<p>Bust'a Gift Rolls is provably fair, meaning that every player can independently verify the results of any round.</p>
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
