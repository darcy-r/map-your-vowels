export const normalisationMethods = [
  "none", "Lobanov", "Nearey 1", "Nearey 2"
]

const e = Math.exp(1)

function antilog(n, base = e) {
  if (base === e) return Math.exp(n);
  return Math.pow(base, n);
}

function average(inputArray) {
  return inputArray.reduce((a, b) => a + b, 0) / inputArray.length;
}

function standardDeviation (array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function normaliseFormantNearey1(formantN, allNFormants) {
  return antilog(Math.log(formantN) - average(allNFormants.map(f => Math.log(f))));
}

function normaliseFormantNearey2(formantN, allFormants) {
  return antilog(Math.log(formantN) - average(allFormants.map(f => Math.log(f))));
}

function normaliseFormantLobanov(formant, meanFormant, stdDevFormant) {
  return (formant - meanFormant) / stdDevFormant;
}

function normaliseFormant(method, formantN, allNFormants, allFormants, meanNFormant, stdDevNFormant) {
  switch (method) {
    case "Lobanov":
      return normaliseFormantLobanov(formantN, meanNFormant, stdDevNFormant);
    case "Nearey 1":
      return normaliseFormantNearey1(formantN, allNFormants);
    case "Nearey 2":
      return normaliseFormantNearey2(formantN, allFormants)
  }
}

export function normaliseDataset(dataset, method) {
  if ((! dataset) || (dataset.length == 0)) {
    return dataset
  }
  if (method == "none") {
    return dataset;
  }
  const f1s = dataset.map(row => row["f1"]);
  const f2s = dataset.map(row => row["f2"]);
  const meanF1 = average(f1s);
  const meanF2 = average(f2s);
  let stdDevF1;
  let stdDevF2;
  if (method == "Lobanov") {
    stdDevF1 = standardDeviation(f1s);
    stdDevF2 = standardDeviation(f2s);
  }
  for (let i = 0; i < dataset.length; i++) {
    dataset[i]["normalisedF1"] = normaliseFormant(method, dataset[i]["f1"], f1s, f1s.concat(f2s), meanF1, stdDevF1);
    dataset[i]["normalisedF2"] = normaliseFormant(method, dataset[i]["f2"], f2s, f1s.concat(f2s), meanF2, stdDevF2);
  }
  return dataset;
}
