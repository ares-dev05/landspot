import React, { useState, useCallback } from 'react';
import Steps from './components/steps';
import Footer from './components/footer';
import SelectState from './components/select-state';
import SetNorth from './components/set-north';
import SelectLot from './components/select-lot';
import SelectFloorplan from './components/select-floorplan';
import View from './components/view';

const Form = () => {
  const [step, setStep] = useState(0);
  const [state, setState] = useState(null);
  const [north, setNorth] = useState('North');
  const [lot, setLot] = useState(null);
  const [floorplan, setFloorplan] = useState('0');
  const [isPlay, setPlay] = useState(false);

  const prevStep = useCallback(() => {
    if (step > 0) setStep(step => step - 1);
  }, [step, setStep]);

  const nextStep = useCallback(() => {
    if (step < 5) {
      if (step === 0 && state) setStep(step => step + 1);
      else if (step === 1 && north) setStep(step => step + 1);
      else if (step === 2 && lot) setStep(step => step + 1);
      else if (step === 3 && floorplan) setStep(step => step + 1);
    }
  }, [step, setStep, state, lot]);

  const showTooltip = useCallback(() => {
    if (
      (step === 0 && state != null) ||
      (step === 1 && north != null) ||
      (step === 2 && lot != null) ||
      (step === 3 && floorplan != null)
    ) {
      return true;
    } else {
      return false;
    }
  }, [step, state, north, lot, floorplan]);

  return (
    <div className='form-wrapper'>
      {step < 4 && <Steps step={step} />}
      {step === 0 && <SelectState state={state} setState={setState} />}
      {step === 1 && <SetNorth state={north} setState={setNorth} />}
      {step === 2 && <SelectLot state={lot} setState={setLot} />}
      {step === 3 && (
        <SelectFloorplan state={floorplan} setState={setFloorplan} />
      )}
      {step > 3 && (
        <View isPlay={isPlay} state={state} direction={north} lot={lot} />
      )}

      <Footer
        step={step}
        prevStep={prevStep}
        nextStep={nextStep}
        isPlay={isPlay}
        setPlay={setPlay}
        showTooltip={showTooltip}
      />
    </div>
  );
};

export default Form;
