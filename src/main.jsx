import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";

import VerifierPage from "./verifier.jsx";
import DeckVerifierPage from "./deck-verifier.jsx";

const map = {
	"": VerifierPage,
	"#/deck": DeckVerifierPage,
}

function Router() {
	const [ page, setPage ] = useState(window.location.hash);

	function onHashChanged() {
		setPage(window.location.hash);
	}

	useEffect(() => {
		window.addEventListener("hashchange", onHashChanged);

		return () => {
			window.removeEventListener("hashchange", onHashChanged);
		}
	}, []);

	const PageClass = map[page] || VerifierPage;
	return <PageClass />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Router />
	</React.StrictMode>,
);
