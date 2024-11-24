"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Leaf, User2, Shield, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export default function GameInterface() {
  const [dayCount, setDayCount] = useState(36);
  const [stats, setStats] = useState({
    nature: 50,
    social: 50,
    military: 50,
    economy: 50,
  });

  // Card swipe motion values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  // Handle card swipe
  const handleDragEnd = () => {
    const xVal = x.get();
    if (Math.abs(xVal) > 100) {
      // Swipe threshold reached
      if (xVal > 0) {
        // Swiped right
        setStats((prev) => ({
          ...prev,
          social: Math.min(100, prev.social + 10),
          economy: Math.min(100, prev.economy + 5),
        }));
      } else {
        // Swiped left
        setStats((prev) => ({
          ...prev,
          military: Math.min(100, prev.military + 10),
          nature: Math.max(0, prev.nature - 5),
        }));
      }
      setDayCount((prev) => prev - 1);
    }
    x.set(0); // Reset card position
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
          It seems that some homeless people live in the ruins of a nuclear
          power station. Some are disfigured by radiation. People are afraid of
          them.
        </p>

        {/* Swipeable Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate }}
          onDragEnd={handleDragEnd}
          className="relative w-full aspect-[3/4] cursor-grab active:cursor-grabbing"
        >
          <motion.div
            className="absolute inset-0 bg-neutral-900 rounded-2xl shadow-xl"
            style={{ opacity }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-32 h-32 bg-neutral-800 rounded-full" />
              </div>
              <p className="text-center text-lg font-mono mt-4">
                Send them away
              </p>
              <p className="text-center font-mono mt-2">Governor Armstrong</p>
            </div>
          </motion.div>
        </motion.div>

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
  icon: LucideIcon;
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
