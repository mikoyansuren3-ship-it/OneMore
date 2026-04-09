import { CO2Equivalent } from "../types";

const KG_CO2_PER_TREE = 22;
const KG_CO2_PER_MILE = 1 / 2.4;
const KG_CO2_PER_LA_NYC_FLIGHT = 900;
const KG_CO2_PER_PHONE_YEAR = 8;
const KG_CO2_PER_KWH = 0.42;

export function treesToCO2(trees: number): number {
  return trees * KG_CO2_PER_TREE;
}

export function getEquivalents(trees: number): CO2Equivalent[] {
  const co2 = treesToCO2(trees);

  const miles = Math.round(co2 * 2.4);
  const flights = (co2 / KG_CO2_PER_LA_NYC_FLIGHT).toFixed(1);
  const phones = Math.round(co2 / KG_CO2_PER_PHONE_YEAR);
  const kwh = Math.round(co2 / KG_CO2_PER_KWH);

  return [
    {
      icon: "car",
      value: miles.toLocaleString() + " mi",
      description: "of driving absorbed",
    },
    {
      icon: "airplane",
      value: flights,
      description: "LA→NYC flights offset",
    },
    {
      icon: "phone-portrait",
      value: phones.toString(),
      description: "phones charged for a year",
    },
    {
      icon: "bulb",
      value: kwh.toLocaleString() + " hrs",
      description: "of energy offset",
    },
  ];
}
