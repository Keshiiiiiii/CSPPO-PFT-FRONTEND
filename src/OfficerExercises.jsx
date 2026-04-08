import './OfficerExercises.css'
import WalkTest from './exercises/WalkTest.jsx'
import BMI from './exercises/BMI.jsx'
import SitUp from './exercises/SitUp.jsx'
import PushUp from './exercises/PushUp.jsx'
import Sprint300m from './exercises/Sprint300m.jsx'

function OfficerExercises({
  officerDashboardTab,
  setOfficerDashboardTab,
  isAddingWalkTest,
  setIsAddingWalkTest,
  walkTestForm,
  setWalkTestForm,
  handleSubmitWalkTest,
  walkTestMessage,
  officerWalkRecords,
  isAddingBmi,
  setIsAddingBmi,
  bmiForm,
  setBmiForm,
  handleSubmitBmi,
  bmiMessage,
  officerBmiRecords,
  isAddingSitup,
  setIsAddingSitup,
  situpForm,
  setSitupForm,
  handleSubmitSitup,
  situpMessage,
  officerSitupRecords,
  isAddingPushup,
  setIsAddingPushup,
  pushupForm,
  setPushupForm,
  handleSubmitPushup,
  pushupMessage,
  officerPushupRecords,
  isAddingSprint,
  setIsAddingSprint,
  sprintForm,
  setSprintForm,
  handleSubmitSprint,
  sprintMessage,
  officerSprintRecords,
}) {
  return (
    <div className="officer-exercises">
      <div className="admin-record-tabs" style={{ marginBottom: 12 }}>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'walk' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('walk')}>Walk Test</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'bmi' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('bmi')}>BMI</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'situp' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('situp')}>1 Min Sit-up</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'pushup' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('pushup')}>Push-up</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'sprint' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('sprint')}>300m Sprint</button>
      </div>

      {officerDashboardTab === 'walk' && (
        <WalkTest
          isAddingWalkTest={isAddingWalkTest}
          setIsAddingWalkTest={setIsAddingWalkTest}
          walkTestForm={walkTestForm}
          setWalkTestForm={setWalkTestForm}
          handleSubmitWalkTest={handleSubmitWalkTest}
          walkTestMessage={walkTestMessage}
          officerWalkRecords={officerWalkRecords}
        />
      )}

      {officerDashboardTab === 'bmi' && (
        <BMI
          isAddingBmi={isAddingBmi}
          setIsAddingBmi={setIsAddingBmi}
          bmiForm={bmiForm}
          setBmiForm={setBmiForm}
          handleSubmitBmi={handleSubmitBmi}
          bmiMessage={bmiMessage}
          officerBmiRecords={officerBmiRecords}
        />
      )}

      {officerDashboardTab === 'situp' && (
        <SitUp
          isAddingSitup={isAddingSitup}
          setIsAddingSitup={setIsAddingSitup}
          situpForm={situpForm}
          setSitupForm={setSitupForm}
          handleSubmitSitup={handleSubmitSitup}
          situpMessage={situpMessage}
          officerSitupRecords={officerSitupRecords}
        />
      )}

      {officerDashboardTab === 'pushup' && (
        <PushUp
          isAddingPushup={isAddingPushup}
          setIsAddingPushup={setIsAddingPushup}
          pushupForm={pushupForm}
          setPushupForm={setPushupForm}
          handleSubmitPushup={handleSubmitPushup}
          pushupMessage={pushupMessage}
          officerPushupRecords={officerPushupRecords}
        />
      )}

      {officerDashboardTab === 'sprint' && (
        <Sprint300m
          isAddingSprint={isAddingSprint}
          setIsAddingSprint={setIsAddingSprint}
          sprintForm={sprintForm}
          setSprintForm={setSprintForm}
          handleSubmitSprint={handleSubmitSprint}
          sprintMessage={sprintMessage}
          officerSprintRecords={officerSprintRecords}
        />
      )}
    </div>
  )
}

export default OfficerExercises
