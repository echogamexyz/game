"use client";

import { useEffect, useState } from "react";
import {
	motion,
	useMotionValue,
	useTransform,
	useAnimation,
	AnimatePresence,
} from "framer-motion";
import { Leaf, User2, Shield, DollarSign } from "lucide-react";
import { Progress } from "../../components/ui/progress";
import { fetchNextScenario } from "../../lib/scenarioFetcher";
import { cn } from "../../lib/utils";

const DRAG_THRESHOLD = 200;
const THROW_VELOCITY = 750;

interface Scenario {
	id: number;
	description: string;
	decision_one: string;
	decision_two: string;
	decision_chosen: number | null;
}

const scenarios: Scenario[] = [
	{
		id: 1,
		description:
			"It seems that some homeless people live in the ruins of a nuclear power station. Some are disfigured by radiation. People are afraid of them.",
		decision_one: "Help the homeless",
		decision_two: "Expel the homeless",
		decision_chosen: 1,
	},
	{
		id: 2,
		description:
			"A group of scientists claim they can restore some of the damaged ecosystem, but it will require significant resources.",
		decision_one: "Fund the restoration",
		decision_two: "Reject the restoration",
		decision_chosen: 2,
	},
	{
		id: 3,
		description:
			"Neighboring settlements are becoming increasingly hostile. They eye our resources with envy.",
		decision_one: "Build defenses",
		decision_two: "Seek diplomacy",
		decision_chosen: null,
	},
	// Add more scenarios as needed
];

export default function GameInterface() {
	const [dayCount, setDayCount] = useState(0);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stats, setStats] = useState({
		nature: 50,
		social: 50,
		military: 50,
		economy: 50,
	});

	const [currentScenario, setCurrentScenario] = useState({
		situation:
			"The country is facing a severe drought, and the food supply is running low. The people are getting restless.",
		choiceA: "Build defenses",
		choiceB: "Seek diplomacy",
	});

	const [previueMsgs, setPreviueMsgs] = useState([
		{
			role: "assistant",
			content:
				"The country is facing a severe drought, and the food supply is running low. The people are getting restless.",
		},
	]);

	const [choiseScenarios, setChoiseScenarios] = useState({
		choiceA: {
			situation:
				"Neighboring countries are mobilizing troops near your border, and intelligence suggests a potential invasion is imminent. Your military is currently undermanned and underfunded.",
			choiceA: "Diplomatic negotiations",
			choiceB: "Rapid military buildup",
		},
		choiceB: {
			situation:
				"International aid organizations have arrived with emergency food supplies, but rebel groups are threatening to block the distribution routes, claiming political corruption.",
			choiceA: "Negotiate with rebels",
			choiceB: "Military escort",
		},
	});

	useEffect(() => {
		console.log(choiseScenarios);
	}, [choiseScenarios]);

	const controls = useAnimation();

	// Card motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(
		[x, y],
		([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.05
	);
	const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

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

			await controls.start({
				x: throwX,
				y: throwY,
				opacity: 0,
				transition: { duration: 0.5 },
			});

			// Update stats based on swipe direction (simplified for this example)
			// if (info.offset.x > 0) {
			//   setStats((prev) => ({
			//     ...prev,
			//     social: Math.min(100, prev.social + 10),
			//     economy: Math.min(100, prev.economy + 5),
			//   }));
			// } else {
			//   setStats((prev) => ({
			//     ...prev,
			//     military: Math.min(100, prev.military + 10),
			//     nature: Math.max(0, prev.nature - 5),
			//   }));
			// }
			let localCurrentScenario = {
				situation: "",
				choiceA: "",
				choiceB: "",
			};
			if (info.offset.x < 0) {
				localCurrentScenario = choiseScenarios.choiceA;
				setCurrentScenario(choiseScenarios.choiceA);
			} else {
				localCurrentScenario = choiseScenarios.choiceB;
				setCurrentScenario(choiseScenarios.choiceB);
			}

			setPreviueMsgs((prev) => [
				...prev,
				{
					role: "assistant",
					content: localCurrentScenario.situation,
				},
			]);

			console.log("current", localCurrentScenario);

			setDayCount((prev) => prev + 1);

			fetchNextScenario([
				...previueMsgs,
				{
					role: "user",
					content: localCurrentScenario.choiceA,
				},
			]).then((s) => {
				setChoiseScenarios((p) => ({
					...p,
					choiceA: {
						...s,
						situation: s.situation || "",
						choiceA: s.choiceA || "",
						choiceB: s.choiceB || "",
					},
				}));
				console.log(s);
			});
			fetchNextScenario([
				...previueMsgs,
				{
					role: "user",
					content: localCurrentScenario.choiceB,
				},
			]).then((s) =>
				setChoiseScenarios((p) => ({
					...p,
					choiceB: {
						...s,
						situation: s.situation || "",
						choiceA: s.choiceA || "",
						choiceB: s.choiceB || "",
					},
				}))
			);

			// Move to next scenario
			setCurrentScenarioIndex(
				(prevIndex) => (prevIndex + 1) % scenarios.length
			);

			// Reset card position for next scenario
			x.set(0);
			y.set(0);
			controls.set({ x: 0, y: 0, opacity: 1 });
			setIsAnimating(false);
		} else {
			// Snap back to center
			controls.start({
				x: 0,
				y: 0,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			});
		}
	};

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			{/* Status Bar */}
			<div className="p-4 flex justify-between items-center max-w-md mx-auto w-full">
				<StatusIcon icon={Leaf} value={stats.nature} />
				<StatusIcon icon={User2} value={stats.social} />
				<StatusIcon icon={Shield} value={stats.military} />
				<StatusIcon icon={DollarSign} value={stats.economy} />
			</div>

			{/* Progress Bar */}
			<div className="max-w-md mx-auto w-full px-8">
				<Progress value={33} className="h-2 bg-neutral-800" />
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
				<p className="text-center mb-8 font-mono">
					{currentScenario.situation}
				</p>

				{/* Swipeable Cards */}
				<div className="relative w-full aspect-[6/7]">
					<AnimatePresence>
						{scenarios.map(
							(scenario, index) =>
								index >= currentScenarioIndex && (
									<motion.div
										key={`${scenario.id}-${index}`}
										drag={index === currentScenarioIndex && !isAnimating}
										dragConstraints={{
											top: -100,
											bottom: 100,
											left: -100,
											right: 100,
										}}
										style={
											index === currentScenarioIndex
												? { x, y, zIndex: scenarios.length - index }
												: { zIndex: scenarios.length - index }
										}
										animate={
											index === currentScenarioIndex
												? controls
												: {
														scale: 0.95,
														y: (index - currentScenarioIndex) * 20,
												  }
										}
										onDragEnd={
											index === currentScenarioIndex ? handleDragEnd : undefined
										}
										whileTap={{ cursor: "grabbing" }}
										className="absolute inset-0 touch-none"
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
									>
										<motion.div
											className="absolute inset-0 bg-neutral-900 rounded-2xl shadow-xl"
											style={index === currentScenarioIndex ? { rotate } : {}}
										>
											<div className="p-6 h-full flex flex-col">
												<div className="flex-1 flex items-center justify-center">
													<div className="w-32 h-32 bg-neutral-800 rounded-full" />
												</div>
											</div>
										</motion.div>
									</motion.div>
								)
						)}
					</AnimatePresence>
				</div>
				<div className="mt-8 flex flex-row gap-6 font-mono px-0 w-full justify-between text-xl">
					<h1>{currentScenario.choiceA}</h1>
					<h1>{currentScenario.choiceB}</h1>
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
