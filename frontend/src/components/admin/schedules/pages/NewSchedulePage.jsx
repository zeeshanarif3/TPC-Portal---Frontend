
import './NewSchedulePage.css'
import {useDashboard} from '../../../../hooks/useDashboard'

export default function NewSchedulePage({ token, onBack }) {
  const { createSchedule } = useDashboard();
  const [newdata, setNewdata] = useState([]);

  return (
    <>
      <button onClick={onBack}>← Back</button>
      

      {/* Rest of the page */}

      
    </>
  );
}