import { DC } from "../../constants";

export const cursedRows = [
  {
		id: 1,
		get description() { return `All Antimatter Dimensions' initial cost scaling is increased to 
			${format(Decimal.NUMBER_MAX_VALUE, 1, 0)}.` },
		effect: Decimal.NUMBER_MAX_VALUE
  },
	{
		id: 2,
		get description() { return `Antimatter Galaxies require ${formatInt(10)} more Dimensions per Galaxy.` },
		effect: -10
	},
	{
		id: 3,
		get description() { return `Multiply starting tick speed by ${formatPostBreak(DC.E1000.recip())}.` },
		effect: DC.E1000
	},
	{
		id: 4,
		description: "8th Antimatter Dimensions are weaker based on the product of all your " +
			"AD amounts.",
		effect: () => Decimal.min(AntimatterDimension(1).amount.times(AntimatterDimension(2).amount.times(AntimatterDimension(3).
    	amount.times(AntimatterDimension(4).amount.times(AntimatterDimension(5).amount.times(AntimatterDimension(6).amount.times(
    	AntimatterDimension(7).amount)))))).plus(1).pow(-0.0002), 1),
			formatEffect: value => `${formatX(value, 2, 2)}`
	},
	{
		id: 5,
		description: "Dimension Boosts only affect ADs 1-7.",
	},
	{
		id: 6,
		description: "Dimension Autobuyer bulk is unlimited, but 1st AD gets an exponentially decreasing nerf " +
		"that resets on Dimension Boosts, Antimatter Galaxies, and Infinities",
		effect: () => DC.D1_00038.pow(Math.pow(Time.timeSinceLastReset.totalSeconds, 0.02))
			.times(DC.E1E7.recip()).clampMax(DC.D1),
		formatEffect: value => `${formatX(value, 2, 2)}`
	},
]