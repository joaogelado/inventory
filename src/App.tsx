"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { init } from "@paralleldrive/cuid2";

import { z } from "zod";

const cuid = init({
	length: 5,
});

const list = z.array(
	z.object({
		thing: z.string(),
		location: z.string(),
		id: z.string(),
	}),
);

type List = z.infer<typeof list>;

const config = z.object({
	list: list,
});

const configInit: z.infer<typeof config> = {
	list: [],
};

export default function Home() {
	const ls = localStorage;

	const [list, setList] = useState<List>([]);
	const [location, setLocation] = useState("");
	const [thing, setThing] = useState("");

	useEffect(() => {
		let configstr = ls.getItem("config");

		console.log(configstr);

		if (configstr === null) {
			ls.setItem("config", JSON.stringify(configInit));
			configstr = ls.getItem("config")!;
		}

		const configobj = config.parse(JSON.parse(configstr));

		setList(configobj.list);
	}, []);

	useEffect(() => {
		if (list.length <= 0) return;

		const configstr = ls.getItem("config")!;
		const configobj = config.parse(JSON.parse(configstr));

		const newconfig = {
			...configobj,
			list,
		};

		ls.setItem("config", JSON.stringify(newconfig));
	}, [list]);

	function addToList(e: SubmitEvent<HTMLFormElement>) {
		e.preventDefault();

		setList((old) => [
			...old,
			{
				location,
				thing,
				id: cuid(),
			},
		]);

		setLocation("");
		setThing("");
	}

	return (
		<main>
			<form
				onSubmit={addToList}
				className="flex flex-col gap-3 p-4 bg-emerald-300"
			>
				<label htmlFor="thing">coisa pro inventário</label>
				<input
					type="text"
					id="thing"
					value={thing}
					onChange={(e) => setThing(e.target.value)}
					placeholder="apostila, prova..."
				/>
				<label htmlFor="location">onde tá</label>
				<input
					type="text"
					id="location"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					placeholder="caixa 1, guarda roupa largado em algum lugar ala salvem-se quem puder..."
				/>

				<button type="submit">adicionar</button>
			</form>

			<div className="flex flex-col">
				{list.map((a) => {
					return (
						<div key={a.id} className="flex flex-col">
							<span>{a.thing}</span>
							<span>{a.location}</span>
							<span>{a.id.toUpperCase()}</span>
						</div>
					);
				})}
			</div>
		</main>
	);
}
