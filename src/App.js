import { useState, React} from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ScatterPlot from './Plot.js';
import { referenceData, varietyParentLanguages, citationForms, citationFormRhymes } from './linguisticData.js'
import { normalisationMethods, normaliseDataset } from './normalisation.js'

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function reshapeUserData(userFormantValues) {
  let userChartData = [];
  for (let citationForm in userFormantValues) {
    if (userFormantValues[citationForm]["f1"] && userFormantValues[citationForm]["f2"]) {
      userChartData.push({
        "citation_form" : citationForm,
        "f1" : parseFloat(userFormantValues[citationForm]["f1"]),
        "f2" : parseFloat(userFormantValues[citationForm]["f2"]),
        "dataset" : "user input"
      });
    }
  }
  return userChartData
}

function App() {
  const [referenceDataset, setReferenceDataset] = useState("Australian English male 1991-1994");
  const [referenceLanguage, setReferenceLanguage] = useState("Australian English");
  const [normalisationMethod, setNormalisationMethod] = useState("none");
  const [formantValues, setFormantValues] = useState(
    citationForms[referenceLanguage].reduce((o, key) => ({ ...o, [key]: {"f1" : "", "f2" : ""}}), {})
  );
  const [reshapedFormantValues, setReshapedFormantValues] = useState(
    reshapeUserData(formantValues)
  );
  const [chartData, setChartData] = useState(
    normaliseDataset(referenceData[referenceDataset], normalisationMethod).concat(reshapeUserData(formantValues, normalisationMethod))
  );

  function handleChange(citationForm, formant, value) {
    let updateObj = formantValues;
    updateObj[citationForm][formant] = value;
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
    // update the reference language only if it changes
    if (varietyParentLanguages[selectedReferenceDataset] != referenceLanguage) {
      setReferenceLanguage(varietyParentLanguages[selectedReferenceDataset]);
    }
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
              <li>Record the words in citation form below:
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
          <FormantForm citationForms={citationForms[referenceLanguage]} variety={varietyParentLanguages[referenceDataset]} changeHandler={handleChange}/>
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

function FormantForm({ citationForms, variety, changeHandler }) {
  return (
    <Accordion>
      {
        citationForms.map((e, i) => <FormantInputs key={e} indexNumber={i} variety={variety} citationForm={e} formOnChange={changeHandler}/>)
      }
    </Accordion>
  );
}

function FormantInputs(props) {
  return (
    <Accordion.Item eventKey={props.indexNumber}>
      <Accordion.Header>"{props.citationForm}" vowel</Accordion.Header>
      <Accordion.Body>
        <p><i>rhymes with {citationFormRhymes[props.variety][props.citationForm].map(w => '"' + w + '"').join(', ')}</i></p>
        <FormantInput formantN={1} citationForm={props.citationForm} formOnChange={props.formOnChange}/>
        <FormantInput formantN={2} citationForm={props.citationForm} formOnChange={props.formOnChange}/>
      </Accordion.Body>
    </Accordion.Item>
  );
}

function FormantInput( { formantN, citationForm, formOnChange } ) {
  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm={2}>F{formantN}</Form.Label>
      <Col sm={10}>
        <Form.Control type="number" onChange={e => formOnChange(citationForm, "f" + formantN, e.target.value)}/>
      </Col>
    </Form.Group>
  )
}

export default App;
