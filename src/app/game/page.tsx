"use client";

import { useEffect, useRef, useState } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	useAnimation,
	AnimatePresence,
	useMotionValueEvent,
} from "framer-motion";
import { Leaf, User2, Shield, DollarSign } from "lucide-react";
// import { fetchNextScenario } from "../../lib/scenarioFetcher.ts.old";
import { cn } from "../../lib/utils";
import { createClient } from "../../lib/supabase/client";

const DRAG_THRESHOLD = 200;
const THROW_VELOCITY = 750;

type ClientScenario = {
	situation: string;
	optionA: { text: string; id: number };
	optionB: { text: string; id: number };
};

const clientScenario = (
	situation: string,
	optionRows: { leading_choice: string | null; id: number }[]
) => ({
	situation,
	optionA: { text: optionRows[0].leading_choice, id: optionRows[0].id },
	optionB: { text: optionRows[1].leading_choice, id: optionRows[1].id },
});

const STARTING_SCENARIO_ID = 5;

export default function GameInterface() {
	const [dayCount, setDayCount] = useState(0);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stats] = useState({
		nature: 50,
		social: 50,
		military: 50,
		economy: 50,
	});
	// const [scenarios] = useState<Database["public"]["Tables"]["games"]["Row"][]>(
	// 	[]
	// );
	const [scenarios, setScenario] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

	const supabase = createClient();

	// supabase.auth.signInAnonymously();

	const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const choiseScenarios = useRef<{
		optionA: ClientScenario | null;
		optionB: ClientScenario | null;
	}>({
		optionA: null,
		optionB: null,
	});

	useEffect(() => {
		const initializeScenario = async () => {
			try {
				const { data } = await supabase.functions.invoke("generateScenario", {
					body: { scenarioId: STARTING_SCENARIO_ID },
				});

				const generatedScenario: ClientScenario = data.data;
				["optionA", "optionB"].map((key) => {
					console.log(generatedScenario[key].id);
					supabase.functions
						.invoke("generateScenario", {
							body: { scenarioId: generatedScenario[key].id },
						})
						.then((s) => {
							console.log(key);
							console.log(s.data.data);
							choiseScenarios.current = {
								...choiseScenarios.current,
								[key]: s.data.data,
							};
						});
				});
				console.log(generatedScenario);
				setCurrentScenario(generatedScenario);

				// // Prefetch the next two scenarios

				// );
			} catch (error) {
				console.error("Failed to load scenario:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initializeScenario();
	}, []); // Empty dependency array means this runs once on mount

	useEffect(() => {
		console.log(choiseScenarios);
	}, [choiseScenarios]);

	const mainControls = useAnimation();
	const SecondControls = useAnimation();

	// Card motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(
		[x, y],
		([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.05
	);

	const leftOpacity = useTransform(x, [200, 30, -30, -200], [0, 0.7, 0.7, 1]);
	const rightOpacity = useTransform(x, [-200, -30, 30, 200], [0, 0.7, 0.7, 1]);

	const [nextCardContent, setNextCardContent] = useState<string>("");

	useMotionValueEvent(x, "change", (latestX) => {
		// console.log(latestX);

		if (latestX < 0) {
			setNextCardContent(choiseScenarios.current.optionA?.situation || "");
			console.log(choiseScenarios.current.optionA?.situation);
		} else {
			setNextCardContent(choiseScenarios.current.optionB?.situation || "");
			console.log(choiseScenarios.current.optionB?.situation);
		}
	});

	useEffect(() => {
		console.log(nextCardContent);
	}, [nextCardContent]);

	// const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

	const handleDragEnd = async (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: {
			offset: { x: number; y: number };
			velocity: { x: number; y: number };
		}
	) => {
		const offset = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
		const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
		console.log("fetchNextScenario");

		if (
			(offset > DRAG_THRESHOLD || velocity > THROW_VELOCITY) &&
			!isAnimating
		) {
			setIsAnimating(true);
			const angle = Math.atan2(info.offset.y, info.offset.x);
			const throwX = Math.cos(angle) * window.innerWidth * 1.5;
			const throwY = Math.sin(angle) * window.innerHeight * 1.5;

			setScenario([...scenarios, scenarios.length]);
			while (scenarios.length + 1 > randomRotations.current.length) {
				randomRotations.current.push(Math.random() * 10 - 5);
			}

			await mainControls.start({
				x: throwX,
				y: throwY,
				opacity: 0,
				transition: { duration: 1 },
			});

			const isSwipingLeft = info.offset.x < 0;
			const selectedScenario = isSwipingLeft
				? choiseScenarios.current.optionA
				: choiseScenarios.current.optionB;

			console.log(isSwipingLeft);

			console.log("swiped");

			setCurrentScenario(selectedScenario);

			// previueMsgs.current = [
			// 	...previueMsgs.current,
			// 	{
			// 		role: "user",
			// 		content: isSwipingLeft
			// 			? currentScenario.optionA
			// 			: currentScenario.optionB,
			// 	},
			// 	{
			// 		role: "assistant",
			// 		content: selectedScenario.situation,
			// 	},
			// ];
			// setCurrentScenario(selectedScenario);

			// console.log("current", selectedScenario);

			// setDayCount((prev) => prev + 1);

			// ["optionA", "optionB"].map((key) => {
			// 	// fetchNextScenario([
			// 	//   ...previueMsgs.current,
			// 	//   {
			// 	//     role: "user",
			// 	//     content: selectedScenario[key],
			// 	//   },
			// 	// ]).then((s) => {
			// 	//   choiseScenarios.current = {
			// 	//     ...choiseScenarios.current,
			// 	//     [key]: normalizeScenario(s),
			// 	//   };
			// 	//   console.log(key, ":", s);
			// 	// });
			// });

			// Move to next scenario
			// setCurrentScenarioIndex(
			// 	(prevIndex) => (prevIndex + 1) % scenarios.length
			// );

			// mainControls.set({ x: 0, y: 0, opacity: 1 });

			setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
			x.set(0);
			y.set(0);

			// Reset card position for next scenario
			setIsAnimating(false);
		} else {
			// Snap back to center
			mainControls.start({
				x: 0,
				y: 0,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			});
		}
	};

	useEffect(() => {
		console.log(currentScenarioIndex);
	}, [currentScenarioIndex]);

	const randomRotations = useRef([
		Math.random() * 10 - 5,
		Math.random() * 10 - 5,
		Math.random() * 10 - 5,
	]);

	// useEffect(() => {
	// 	mainControls.set({ x: 0, y: 0, opacity: 1 });
	// }, [currentScenario]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!currentScenario) {
		return <div>Error loading scenario</div>;
	}

	return (
		<div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
			{/* Status Bar */}
			<div className="p-4 flex justify-between items-center max-w-md mx-auto w-full">
				<StatusIcon icon={Leaf} value={stats.nature} />
				<StatusIcon icon={User2} value={stats.social} />
				<StatusIcon icon={Shield} value={stats.military} />
				<StatusIcon icon={DollarSign} value={stats.economy} />
			</div>

			{/* Progress Bar */}
			{/* <div className="max-w-md mx-auto w-full px-8">
				<Progress value={33} className="h-2 bg-neutral-800" />
			</div> */}

			{/* Main Content */}
			<div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
				{/* Swipeable Cards */}
				<div className="relative w-full aspect-[6/7]">
					<AnimatePresence>
						{scenarios[1] &&
							scenarios.map((i) => (
								<motion.div
									key={`${i}`}
									animate={{
										scale:
											0.95 ** (i - (currentScenarioIndex + (isAnimating && 1))),
										y: (i - (currentScenarioIndex + (isAnimating && 1))) * 30,
										opacity: 1,
									}}
									initial={{
										y: (i - currentScenarioIndex) * 30,
										opacity: 0,
										scale: 0.95 ** (i - currentScenarioIndex),
									}}
									style={{
										zIndex: scenarios.length - i,
										visibility:
											i >= currentScenarioIndex ? "visible" : "hidden",
										rotate: randomRotations.current[i],
										willChange: "transform, opacity", // Hint the browser
									}}
									whileTap={{ cursor: "grabbing" }}
									className="absolute inset-0 touch-none"
									transition={{ duration: 0.5, ease: "easeInOut" }}
								>
									<motion.div
										className="absolute inset-0 bg-black rounded-2xl shadow-xl"
										id={i + ""}
										style={i === currentScenarioIndex ? { rotate, x, y } : {}}
										drag={i === currentScenarioIndex && !isAnimating}
										animate={i === currentScenarioIndex && mainControls}
										dragConstraints={{
											top: -100,
											bottom: 100,
											left: -100,
											right: 100,
										}}
										onDragEnd={
											i === currentScenarioIndex ? handleDragEnd : undefined
										}
									>
										<motion.div
											className="p-6 h-full flex flex-col bg-neutral-800 rounded-2xl"
											animate={{
												opacity:
													1 -
													(i - (currentScenarioIndex + (isAnimating && 1))) *
														0.2,
											}}
											initial={{
												opacity:
													1 -
													(i - (currentScenarioIndex + (isAnimating && 1))) *
														0.4,
											}}
										>
											<div className="flex-1 flex flex-col text-center items-center justify-around">
												<p className="font-mono text-sm md:text-base">
													{i === currentScenarioIndex
														? currentScenario.situation
														: nextCardContent}
												</p>
												<div className="w-32 h-32 bg-neutral-700 rounded-full" />
											</div>
										</motion.div>
									</motion.div>
								</motion.div>
							))}
					</AnimatePresence>
				</div>
				<div className="mt-8 flex flex-row gap-6 font-mono px-0 w-full justify-between md:text-xl z-10">
					<motion.h1 style={{ opacity: leftOpacity }}>
						{currentScenario.optionA.text}
					</motion.h1>
					<motion.h1 style={{ opacity: rightOpacity }} className="text-right">
						{currentScenario.optionB.text}
					</motion.h1>
				</div>
				{/* Year and Days Counter */}
				<div className="mt-8 text-center font-mono">
					<p className="text-2xl">2075</p>
					<p className="text-neutral-400">{dayCount} days in power</p>
				</div>
			</div>
		</div>
	);
}

function StatusIcon({
	icon: Icon,
	value,
}: {
	icon: React.ElementType;
	value: number;
}) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div
				className={cn(
					"w-12 h-12 rounded-full flex items-center justify-center",
					value > 70
						? "bg-green-900"
						: value > 30
						? "bg-neutral-800"
						: "bg-red-900"
				)}
			>
				<Icon className="w-6 h-6" />
			</div>
			<div className="w-2 h-2 rounded-full bg-white" />
		</div>
	);
}
