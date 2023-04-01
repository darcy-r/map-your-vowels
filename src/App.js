import { useState, React} from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ScatterPlot from './Plot.js';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const referenceData = {
  "none" : [],
  "Australian English 1991-1994" : [
    {"elicitation" : "heed", "f1" : 320, "f2" : 2360, "description" : "iː", "dataset" : "reference"},
    {"elicitation" : "hid", "f1" : 330, "f2" : 2350, "description" : "ɪ", "dataset" : "reference"},
    {"elicitation" : "hair", "f1" : 450, "f2" : 2100, "description" : "eː", "dataset" : "reference"},
    {"elicitation" : "head", "f1" : 470, "f2" : 2090, "description" : "e", "dataset" : "reference"},
    {"elicitation" : "had", "f1" : 690, "f2" : 1760, "description" : "æ", "dataset" : "reference"},
    {"elicitation" : "hard", "f1" : 760, "f2" : 1350, "description" : "ɐː", "dataset" : "reference"},
    {"elicitation" : "hud", "f1" : 740, "f2" : 1390, "description" : "ɐ", "dataset" : "reference"},
    {"elicitation" : "hod", "f1" : 580, "f2" : 1040, "description" : "ɔ", "dataset" : "reference"},
    {"elicitation" : "horde", "f1" : 440, "f2" : 850, "description" : "oː", "dataset" : "reference"},
    {"elicitation" : "hood", "f1" : 380, "f2" : 950, "description" : "ʊ", "dataset" : "reference"},
    {"elicitation" : "who'd", "f1" : 340, "f2" : 1800, "description" : "ʉ", "dataset" : "reference"},
    {"elicitation" : "herd", "f1" : 470, "f2" : 1640, "description" : "ɜː", "dataset" : "reference"}
  ],
  "Australian English 196?" : [
    {"elicitation" : "heed", "f1" : 300, "f2" : 2280, "description" : "iː", "dataset" : "reference"},
    {"elicitation" : "hid", "f1" : 365, "f2" : 2210, "description" : "ɪ", "dataset" : "reference"},
    {"elicitation" : "hair", "f1" : 440, "f2" : 2010, "description" : "eː", "dataset" : "reference"},
    {"elicitation" : "head", "f1" : 455, "f2" : 2090, "description" : "e", "dataset" : "reference"},
    {"elicitation" : "had", "f1" : 630, "f2" : 1880, "description" : "æ", "dataset" : "reference"},
    {"elicitation" : "hard", "f1" : 750, "f2" : 1370, "description" : "ɐː", "dataset" : "reference"},
    {"elicitation" : "hud", "f1" : 735, "f2" : 1410, "description" : "ɐ", "dataset" : "reference"},
    {"elicitation" : "hod", "f1" : 625, "f2" : 1060, "description" : "ɔ", "dataset" : "reference"},
    {"elicitation" : "horde", "f1" : 445, "f2" : 825, "description" : "oː", "dataset" : "reference"},
    {"elicitation" : "hood", "f1" : 400, "f2" : 910, "description" : "ʊ", "dataset" : "reference"},
    {"elicitation" : "who'd", "f1" : 350, "f2" : 1610, "description" : "ʉ", "dataset" : "reference"},
    {"elicitation" : "herd", "f1" : 470, "f2" : 1510, "description" : "ɜː", "dataset" : "reference"}
  ],
}

// const diphthongs = {
//   "Australian English 1991-1994" : [
//     {"elicitation" : "hoyed", "f1" : , "f2" : , "description" : "oɪ", "dataset" : "reference"},
//     {"elicitation" : "hide", "f1" : , "f2" : , "description" : "ɑɪ", "dataset" : "reference"},
//     {"elicitation" : "hayed", "f1" : , "f2" : , "description" : "æɪ", "dataset" : "reference"},
//     {"elicitation" : "hoed", "f1" : , "f2" : , "description" : "əʉ", "dataset" : "reference"},
//     {"elicitation" : "how'd", "f1" : , "f2" : , "description" : "æɔ", "dataset" : "reference"}
//   ]
// }

const elicitations = [
  "heed", "hid", "head", "hair", "had", "who'd", "heard", "hud", "hard",
  "hood", "hoard", "hod"
]

const elicitationRhymes = {
  "heed" : ["need"],
  "hid" : ["did"],
  "head" : ["dead"],
  "hair" : ["fair"],
  "had" : ["dad"],
  "who'd" : ["food"],
  "heard" : ["third"],
  "hud" : ["blood", "mud"],
  "hard" : ["card",],
  "hood" : ["good"],
  "hoard" : ["bored"],
  "hod" : ["god"],
}

const diphthongElicitations = [
  "hoyed", "hide", "hayed", "hoed", "how'd"
]

// define maths components
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

function normaliseDataset(dataset, method) {
  if (dataset.length == 0) {
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

const normalisationMethods = [
  "none", "Lobanov", "Nearey 1", "Nearey 2"
]

function reshapeUserData(userFormantValues) {
  let userChartData = [];
  for (let elicitation in userFormantValues) {
    if (userFormantValues[elicitation]["f1"] && userFormantValues[elicitation]["f2"]) {
      userChartData.push({
        "elicitation" : elicitation,
        "f1" : parseFloat(userFormantValues[elicitation]["f1"]),
        "f2" : parseFloat(userFormantValues[elicitation]["f2"]),
        "dataset" : "user input"
      });
    }
  }
  return userChartData
}

function App() {
  const [formantValues, setFormantValues] = useState(
    elicitations.reduce((o, key) => ({ ...o, [key]: {"f1" : "", "f2" : ""}}), {})
  );
  const [reshapedFormantValues, setReshapedFormantValues] = useState(
    reshapeUserData(formantValues)
  );
  const [referenceDataset, setReferenceDataset] = useState("Australian English 1991-1994");
  const [normalisationMethod, setNormalisationMethod] = useState("none");
  const [chartData, setChartData] = useState(
    normaliseDataset(referenceData[referenceDataset], normalisationMethod).concat(reshapeUserData(formantValues, normalisationMethod))
  );

  function handleChange(elicitation, formant, value) {
    let updateObj = formantValues;
    updateObj[elicitation][formant] = value;
    setFormantValues(updateObj);
    setChartData(
      normaliseDataset(referenceData[referenceDataset], normalisationMethod).concat(normaliseDataset(reshapedFormantValues, normalisationMethod))
    );
  }

  function handleNormalisationSelection(selectedNormalisationMethod) {
    setNormalisationMethod(selectedNormalisationMethod);
  }

  function handleReferenceDataSelection(selectedReferenceDataset) {
    setReferenceDataset(selectedReferenceDataset);
  }

  return (
    <div className="App">
      <div id="visualisation-pane">
        <ScatterPlot
          data={normaliseDataset(referenceData[referenceDataset], normalisationMethod).concat(normaliseDataset(reshapeUserData(formantValues), normalisationMethod))}
          normalisationMethod={normalisationMethod}
          />
      </div>
      <div className="control-pane">
        <div className="control-pane-content">
          <h2>Map your vowels</h2>
          <h5>Instructions</h5>
          <p>
            <ul>
              <li><a href="https://www.fon.hum.uva.nl/praat/">Download Praat</a></li>
              <li>Record the h_d words below:
                <ul>
                  <li>open Praat</li>
                  <li>record mono sound (⌘R)</li>
                  <li>save to list and close</li>
                  <li>view and edit</li>
                  <li>highlight vowel</li>
                  <li>get first formant (F1)</li>
                  <li>get second formant (F2)</li>
                </ul>
              </li>
              <li>Analyse on plot alone, or normalise formant values and compare to reference data</li>
            </ul>
          </p>
          <h5>Settings</h5>
          <Selector
            label="Normalisation"
            selectedValue={normalisationMethod}
            changeHandler={handleNormalisationSelection}
            options={normalisationMethods}/>
          <Selector
            label="Reference data"
            selectedValue={referenceDataset}
            changeHandler={handleReferenceDataSelection}
            options={Object.keys(referenceData)}/>
          <h5>Your data</h5>
          <FormantForm changeHandler={handleChange}/>
        </div>
      </div>
    </div>
  );
}

function Selector({ label, changeHandler, selectedValue, options }) {
  return (
    <Form>
      <Form.Group className="mb-3" controlId="formDataset">
        <Form.Label>
          {label}
        </Form.Label>
        <Form.Select aria-label="Normalisation" defaultValue={selectedValue} onChange={e => changeHandler(e.target.value)}>
          {options.map(o => <option value={o}>{o}</option>)}
        </Form.Select>
      </Form.Group>
    </Form>
  );
}

function FormantForm({ changeHandler }) {
  return (
    <Accordion>
      {
        elicitations.map((e, i) => <FormantInputs key={e} indexNumber={i} elicitation={e} formOnChange={changeHandler}/>)
      }
    </Accordion>
  );
}

function FormantInputs(props) {
  return (
    <Accordion.Item eventKey={props.indexNumber}>
      <Accordion.Header>"{props.elicitation}" vowel</Accordion.Header>
      <Accordion.Body>
        <p><i>rhymes with {elicitationRhymes[props.elicitation].map(w => '"' + w + '"').join(', ')}</i></p>
        <FormantInput formantN={1} elicitation={props.elicitation} formOnChange={props.formOnChange}/>
        <FormantInput formantN={2} elicitation={props.elicitation} formOnChange={props.formOnChange}/>
      </Accordion.Body>
    </Accordion.Item>
  );
}

function FormantInput( { formantN, elicitation, formOnChange } ) {
  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={2}>F{formantN}</Form.Label>
      <Col sm={10}>
        <Form.Control type="number" onChange={e => formOnChange(elicitation, "f" + formantN, e.target.value)}/>
      </Col>
    </Form.Group>
  )
}

export default App;
