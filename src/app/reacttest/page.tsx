"use client";

const Reacttest = () => {
	// Using a regular variable if no re-renders needed
	let count = 0;

	function handleClick() {
		count++;
		console.log(count);
	}

	return (
		<div>
			<button onClick={handleClick}>Click me</button>
		</div>
	);
};

export default Reacttest;
