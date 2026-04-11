import './OfficerExercises.css'
import WalkTest from './exercises/WalkTest.jsx'
import BMI from './exercises/BMI.jsx'
import SitUp from './exercises/SitUp.jsx'
import PushUp from './exercises/PushUp.jsx'
import Sprint300m from './exercises/Sprint300m.jsx'

const TabIconWalk = () => (<svg viewBox="0 0 24 24"><circle cx="14" cy="5" r="2"/><path d="M18 22l-3-3-1.5 3L9 16l-4 4"/><path d="M10 16l2-5 3 1"/></svg>)
const TabIconScale = () => (<svg viewBox="0 0 24 24"><path d="M16 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/><line x1="2" y1="12" x2="20" y2="12"/><path d="M12 2v20"/></svg>)
const TabIconActivity = () => (<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)
const TabIconTarget = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>)
const TabIconZap = () => (<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>)

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
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'walk' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('walk')}><TabIconWalk /> Walk Test</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'bmi' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('bmi')}><TabIconScale /> BMI</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'situp' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('situp')}><TabIconActivity /> 1 Min Sit-up</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'pushup' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('pushup')}><TabIconTarget /> Push-up</button>
        <button type="button" className={`admin-record-tab ${officerDashboardTab === 'sprint' ? 'active' : ''}`} onClick={() => setOfficerDashboardTab('sprint')}><TabIconZap /> 300m Sprint</button>
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
