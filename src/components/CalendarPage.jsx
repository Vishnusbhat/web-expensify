import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebaseConfig'; // Ensure you have configured Firestore
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [taskInput, setTaskInput] = useState('');
  const [labelInput, setLabelInput] = useState('Drive'); // Set "Drive" as the default label
  const [editingEvent, setEditingEvent] = useState(null);
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
        eventsData[eventDate].push({ task: data.task, label: data.label });
      });
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
  
      // If editing, remove the old event
      if (editingEvent) {
        const oldEventDocRef = doc(db, 'events', dateStr + editingEvent.task);
        await deleteDoc(oldEventDocRef);
  
        setEvents((prevEvents) => {
          const updatedEvents = { ...prevEvents };
          updatedEvents[dateStr] = updatedEvents[dateStr].filter(
            (event) =>
              !(event.task === editingEvent.task && event.label === editingEvent.label)
          );
          return updatedEvents;
        });
      }
  
      // Add the new or updated event
      const eventDocRef = doc(db, 'events', dateStr + taskInput);
      const eventData = {
        date: date,
        task: taskInput,
        label: labelInput,
      };
      await setDoc(eventDocRef, eventData);
  
      setEvents((prevEvents) => ({
        ...prevEvents,
        [dateStr]: [...(prevEvents[dateStr] || []), eventData],
      }));
  
      // Reset input fields and editing state
      setTaskInput('');
      setLabelInput('Drive'); // Reset to "Drive" after adding the event
      setEditingEvent(null);
      setShowEventForm(false);
    } catch (error) {
      console.error('Error adding or updating event:', error);
    }
  };

  const handleEditEvent = (task, label) => {
    setTaskInput(task);
    setLabelInput(label);
    setEditingEvent({ task, label });
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (task, label) => {
    try {
      const dateStr = date.toDateString();
      const eventDocRef = doc(db, 'events', dateStr + task);
      await deleteDoc(eventDocRef);

      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        updatedEvents[dateStr] = updatedEvents[dateStr].filter(
          (event) => !(event.task === task && event.label === label)
        );
        if (updatedEvents[dateStr].length === 0) {
          delete updatedEvents[dateStr];
        }
        return updatedEvents;
      });
    } catch (error) {
      console.error('Error deleting event:', error);
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
          {tasksForSelectedDate.length ? (
            <ul className="list-disc pl-5">
              {tasksForSelectedDate.map((event, index) => (
                <li
                  key={index}
                  className="mb-2 bg-gray-100 p-2 rounded shadow-md flex justify-between items-center"
                >
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: event.label === 'Drive' ? '#fbbc05' : '#34a853' }} // Different colors for labels
                    ></span>
                    <strong className=' mr-2'>{event.label}: </strong>
                    {event.task}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEditEvent(event.task, event.label)}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.task, event.label)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-lg">No tasks or schedules for this date.</p>
              <p className="text-sm mt-2">Click "Add Event" to create one.</p>
            </div>
          )}
        </div>

        {/* Add/Edit task/schedule form */}
        <div>
          {showEventForm ? (
            <div className="p-4 border border-gray-200 rounded-lg">
              <select
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full mb-2"
              >
                <option value="Drive">Drive</option>
                <option value="Workshop">Workshop</option>
                <option value="Team Event">Team Event</option>
                {/* Add more options as needed */}
              </select>
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
                {editingEvent ? 'Update Event' : 'Add Event'}
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
