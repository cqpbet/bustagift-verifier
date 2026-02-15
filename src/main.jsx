import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";

import VerifierPage from "./verifier.jsx";
import DeckVerifierPage from "./deck-verifier.jsx";
import RollVerifierPage from "./roll-verifier.jsx";

const map = {
	"": VerifierPage,
	"#/deck": DeckVerifierPage,
	"#/roll": RollVerifierPage,
}

function getRouteAndParams() {
	const hash = window.location.hash;
	const qIdx = hash.indexOf("?");
	const route = qIdx >= 0 ? hash.slice(0, qIdx) : hash;
	const searchStr = qIdx >= 0 ? hash.slice(qIdx + 1) : window.location.search.slice(1);
	const params = Object.fromEntries(new URLSearchParams(searchStr));
	return { route, params };
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

	const { route, params } = getRouteAndParams();
	const PageClass = map[route] || VerifierPage;
	return <PageClass params={params} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<Router />
	</React.StrictMode>,
);
