import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebaseConfig'; // Ensure you have configured Firestore
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [taskInput, setTaskInput] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      const eventsData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const eventDate = new Date(data.date.seconds * 1000).toDateString();
        if (!eventsData[eventDate]) {
          eventsData[eventDate] = [];
        }
        eventsData[eventDate].push(data.task);
      });
      console.log('Fetched events:', eventsData); // Debugging line
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    try {
      const dateStr = date.toDateString();
      const eventDocRef = doc(db, 'events', dateStr + taskInput);
      await setDoc(eventDocRef, {
        date: date,
        task: taskInput,
      });

      setEvents((prevEvents) => ({
        ...prevEvents,
        [dateStr]: [...(prevEvents[dateStr] || []), taskInput],
      }));
      setTaskInput('');
      setShowEventForm(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const tasksForSelectedDate = events[date.toDateString()] || [];
  const eventDates = Object.keys(events);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      {/* Calendar on the left */}
      <div className="flex-shrink-0 w-full md:w-1/3 p-4">
        <Calendar
          onChange={handleDateChange}
          value={date}
          className="bg-white rounded-lg shadow w-full p-4 h-auto"
          tileClassName={({ date, view }) => {
            const dateStr = date.toDateString();
            console.log('Checking date:', dateStr); // Debugging line
            if (view === 'month' && eventDates.includes(dateStr)) {
              return 'calendar-event';
            }
            return null;
          }}
        />
      </div>

      {/* Right side for tasks and form */}
      <div className="flex-1 p-4">
        {/* Current tasks and schedules */}
        <div className="overflow-auto mb-10">
          <h3 className="text-2xl mb-4">Schedules</h3>
          <ul className="list-disc pl-5">
            {tasksForSelectedDate.length ? (
              tasksForSelectedDate.map((task, index) => (
                <li key={index} className="mb-2 bg-gray-100 p-2 rounded shadow-md">
                  {task}
                </li>
              ))
            ) : (
              <li>No tasks or schedules for this date.</li>
            )}
          </ul>
        </div>

        {/* Add task/schedule form */}
        <div>
          {showEventForm ? (
            <div className="p-4 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Enter task or event"
                className="p-2 border border-gray-300 rounded-lg w-full mb-2"
              />
              <button
                onClick={handleAddEvent}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
              >
                Add Event
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-green-500 text-white py-2 px-4 rounded-lg"
            >
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Inline CSS styles for calendar */}
      <style jsx>{`
        .calendar-event {
          background: #e0f7fa; /* Light blue background for events */
          border-radius: 50%;
          border: 2px solid #00796b; /* Darker blue border */
        }

        .react-calendar__tile--now {
          background: #4285f4;
          color: white;
        }

        .react-calendar__tile--active {
          background: #34a853;
          color: white;
        }

        .react-calendar__tile {
          border-radius: 4px;
          transition: background 0.2s ease-in-out;
        }

        .react-calendar__tile:hover {
          background: #e8f0fe;
        }
      `}</style>
    </div>
  );
}

export default CalendarPage;
