import { DC } from "../../constants";

export const cursedRows = [
  {
		id: 1,
		get curse() { return `All Antimatter Dimensions' initial cost scaling is increased to 
			${format(Decimal.NUMBER_MAX_VALUE, 1, 0)}.` },
		effect: Decimal.NUMBER_MAX_VALUE
  },
	{
		id: 2,
		get curse() { return `Antimatter Galaxies require ${formatInt(10)} more Dimensions per Galaxy, and
			Distant cost scaling starts ${formatInt(1000)} Galaxies earlier` },
		effects: {
			perGalaxyIncrease: -10,
			distantGalaxyStart: -1000
		}	
	},
	{
		id: 3,
		get curse() { return `Divide starting tick speed by ${formatPostBreak(DC.E10000)}.` },
		effect: DC.E10000
	},
	{
		id: 4,
		curse: "8th Antimatter Dimensions are weaker based on the product of all your " +
			"AD amounts.",
		effect: () => Decimal.min(AntimatterDimension(1).amount.times(AntimatterDimension(2).amount.times(AntimatterDimension(3).
    	amount.times(AntimatterDimension(4).amount.times(AntimatterDimension(5).amount.times(AntimatterDimension(6).amount.times(
    	AntimatterDimension(7).amount)))))).plus(1).pow(-0.0003), 1),
			formatEffect: value => `/${format(value.recip(), 2, 2)}`
	},
	{
		id: 5,
		curse: "Dimension Boosts only affect ADs 1-7.",
	},
	{
		id: 6,
		curse: "Dimension Autobuyer bulk is unlimited, but 1st AD gets an exponentially decreasing nerf " +
		"that resets on Dimension Boosts, Antimatter Galaxies, and Infinities",
		effect: () => DC.D1_00038.pow(Math.pow(Time.timeSinceLastReset.totalSeconds, 0.02))
			.times(DC.E1E7.recip()).clampMax(DC.D1),
		formatEffect: value => `${formatX(value, 2, 2)}`
	},
	{
		id: 7,
		curse: `Infinity Power divides IP gain at a reduced rate`,
		effect: () => Decimal.pow(Currency.infinityPower.value.add(1), -0.001).clampMax(1),
    formatEffect: value => `${formatInt(1)}/${format(value.recip(), 2, 2)}`,
	},
	{
		id: 8
	},
	{
		id: 9
	},
	{
		id: 10
	},
	{
		id: 11
	},
	{
		id: 12
	},
	{
		id: 13
	},
	// I don't plan to include cursed rows 14-18, but having them defined avoids 'undefined' issues
	// when I attempt to call CursedRow(x) that doesn't exist. If there's no 'curse' they should be innaccesible
	{
		id: 14
	},
	{
		id: 15
	},
	{
		id: 16
	},
	{
		id: 17
	},
	{
		id: 18
	},
]