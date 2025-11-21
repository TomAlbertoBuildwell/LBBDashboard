import React, { useMemo } from 'react';
import { formatCurrency } from '../utils/dashboardUtils.mjs';

const START_ANGLE = 270;
const END_ANGLE = 90;
const VIEWBOX_WIDTH = 340;
const VIEWBOX_HEIGHT = 220;
const RADIUS = 150;
const STROKE_WIDTH = 22;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const polarToCartesian = (cx, cy, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const TargetGauge = ({ title, domain, targetAngle, totalAmount, targetAmount }) => {
  const percentToTarget = targetAmount === 0 ? 0 : (totalAmount / targetAmount) * 100;
  const clampedPercent = Math.max(0, percentToTarget);
  const maxDomain = domain[1] === domain[0] ? domain[0] + 1 : domain[1];
  const progressRatio = clamp((totalAmount - domain[0]) / (maxDomain - domain[0]), 0, 1);
  const progressAngle = START_ANGLE - progressRatio * 180;
  const normalizedTargetAngle = clamp(targetAngle, END_ANGLE, START_ANGLE);

  const { backgroundArc, foregroundArc, targetLine } = useMemo(() => {
    const cx = VIEWBOX_WIDTH / 2;
    const cy = VIEWBOX_HEIGHT - 10;

    const bgArc = describeArc(cx, cy, RADIUS, START_ANGLE, END_ANGLE);
    const fgArc = describeArc(cx, cy, RADIUS, START_ANGLE, Math.max(progressAngle, END_ANGLE));

    const targetInner = polarToCartesian(cx, cy, RADIUS - STROKE_WIDTH / 2, normalizedTargetAngle);
    const targetOuter = polarToCartesian(cx, cy, RADIUS + STROKE_WIDTH / 2, normalizedTargetAngle);

    return {
      backgroundArc: { path: bgArc },
      foregroundArc: { path: fgArc },
      targetLine: { x1: targetInner.x, y1: targetInner.y, x2: targetOuter.x, y2: targetOuter.y },
    };
  }, [progressAngle, normalizedTargetAngle]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="w-full h-64">
        <path
          d={backgroundArc.path}
          stroke="#1f2937"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={foregroundArc.path}
          stroke="#a855f7"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1={targetLine.x1}
          y1={targetLine.y1}
          x2={targetLine.x2}
          y2={targetLine.y2}
          stroke="#f97316"
          strokeWidth={4}
        />
      </svg>
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-300">Pipeline Total</p>
          <p className="text-3xl font-semibold text-white">{formatCurrency(totalAmount)}</p>
          <p className="text-sm text-gray-400">{clampedPercent.toFixed(1)}% of target</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#a855f7]" />
            <span className="text-sm text-gray-300">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-[#f97316]" />
            <span className="text-sm text-gray-300">Target ({formatCurrency(targetAmount)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetGauge;


