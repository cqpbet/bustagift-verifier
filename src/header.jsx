import {Col, Row} from "react-bootstrap";

export function DefaultHeader() {
	return <>
		<h1 className="mb-0">Bust`a Gift verifier</h1>
		<Row className="container">
			<Col>
				<small>
					<a href="https://github.com/cqpbet/bustagift-verifier" target="_blank" rel="noopener noreferrer">source code</a>
				</small>
			</Col>
			<Col>
				<small>
					<a href="/bustagift-verifier/">multiplier verifier</a>
				</small>
			</Col>
			<Col>
				<small>
					<a href="/bustagift-verifier/#/deck">deck verifier</a>
				</small>
			</Col>
			<Col>
				<small>
					<a href="/bustagift-verifier/#/roll">roll verifier</a>
				</small>
			</Col>
		</Row>
	</>;
}
