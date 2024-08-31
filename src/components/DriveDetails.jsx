import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaEllipsisV, FaUser } from 'react-icons/fa';

function DriveDetails() {
  const [driveEvents, setDriveEvents] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editTaskIndex, setEditTaskIndex] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [showTaskOptions, setShowTaskOptions] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [showUserList, setShowUserList] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const taskOptionsRef = useRef(null);
  const userListRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    } else {
      console.log('No user is logged in');
    }
  }, []);

  useEffect(() => {
    const fetchDriveEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('label', '==', 'Drive'));
        const snapshot = await getDocs(q);

        const drives = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          drives.push({
            id: doc.id,
            task: data.task,
            date: data.date.toDate().toDateString(),
          });
        });

        setDriveEvents(drives);
      } catch (error) {
        console.error('Error fetching drive events:', error);
      }
    };

    fetchDriveEvents();
  }, []);

  const handleDriveClick = async (drive) => {
    setSelectedDrive(drive);
    setShowForm(true);

    try {
      const driveDocRef = doc(db, 'events', drive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();
      setTasks(driveData.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks for drive:', error);
    }
  };

  const handleNewTaskSubmit = async () => {
    if (newTask.trim() === '') return;

    try {
      const driveDocRef = doc(db, 'events', selectedDrive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();

      const updatedTasks = [...driveData.tasks, { task: newTask, assignedUsers: [] }];
      await updateDoc(driveDocRef, { tasks: updatedTasks });

      setTasks(updatedTasks);
      setNewTask(''); 
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  };

  const handleTaskOptionsToggle = (index) => {
    setShowTaskOptions(showTaskOptions === index ? null : index);
  };

  const handleTaskAction = async (taskIndex, action) => {
    try {
      if (!selectedDrive) return;

      const driveDocRef = doc(db, 'events', selectedDrive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();
      const updatedTasks = [...driveData.tasks];

      if (action === 'select') {
        if (!updatedTasks[taskIndex].assignedUsers.includes(currentUserId)) {
          updatedTasks[taskIndex].assignedUsers.push(currentUserId);
        }
      } else if (action === 'leave') {
        updatedTasks[taskIndex].assignedUsers = updatedTasks[taskIndex].assignedUsers.filter(
          (userId) => userId !== currentUserId
        );
      }

      await updateDoc(driveDocRef, { tasks: updatedTasks });
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error handling task action:', error);
    }
  };

  const handleTaskEdit = (index) => {
    setEditTaskIndex(index);
    setEditTaskText(tasks[index].task); 
  };

  const handleTaskEditSubmit = async () => {
    if (editTaskText.trim() === '') return;

    try {
      const driveDocRef = doc(db, 'events', selectedDrive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();

      const updatedTasks = [...driveData.tasks];
      updatedTasks[editTaskIndex].task = editTaskText;

      await updateDoc(driveDocRef, { tasks: updatedTasks });

      setTasks(updatedTasks);
      setEditTaskIndex(null); 
      setEditTaskText(''); 
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (index) => {
    try {
      const driveDocRef = doc(db, 'events', selectedDrive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();

      const updatedTasks = driveData.tasks.filter((_, i) => i !== index);

      await updateDoc(driveDocRef, { tasks: updatedTasks });

      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUserIconClick = async (taskIndex) => {
    setShowUserList(showUserList === taskIndex ? null : taskIndex);

    if (!tasks[taskIndex].assignedUsers.length) return;

    if (!userDetails[taskIndex]) {
      try {
        const userDocs = await Promise.all(
          tasks[taskIndex].assignedUsers.map((userId) => getDoc(doc(db, 'users', userId)))
        );
        const usersData = userDocs.map((doc) => doc.data());

        setUserDetails((prevDetails) => ({
          ...prevDetails,
          [taskIndex]: usersData,
        }));
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        taskOptionsRef.current &&
        !taskOptionsRef.current.contains(event.target)
      ) {
        setShowTaskOptions(null); 
      }
      if (
        userListRef.current &&
        !userListRef.current.contains(event.target)
      ) {
        setShowUserList(null); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-md bg-white">
      <h3 className="text-2xl mb-4">All Drive Events</h3>
      {driveEvents.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {driveEvents.map((drive, index) => (
            <li
              key={index}
              className="bg-gray-100 p-2 rounded shadow-md cursor-pointer hover:bg-gray-200 transition"
              onClick={() => handleDriveClick(drive)}
            >
              <strong>{drive.task}</strong> on {drive.date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No "Drive" events found.</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <h4 className="text-xl mb-4">Tasks for {selectedDrive.task}</h4>
            <div className="mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter new task"
                className="p-2 border border-gray-300 rounded-lg w-full mb-2"
              />
              <button
                onClick={handleNewTaskSubmit}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
              >
                Add Task
              </button>
            </div>

            <h4 className="text-lg mb-4">Current Tasks</h4>
            {tasks.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {tasks.map((task, index) => {
                  const isUserAssigned = task.assignedUsers.includes(currentUserId);

                  return (
                    <li
                      key={index}
                      className="bg-gray-100 p-2 rounded shadow-md flex justify-between items-center relative"
                    >
                      <span className="flex-1">{task.task}</span>
                      <div className="flex items-center space-x-4">
                        {!isUserAssigned ? (
                          <button
                            onClick={() => handleTaskAction(index, 'select')}
                            className="bg-green-500 text-white py-1 px-2 rounded-lg"
                          >
                            Select Task
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTaskAction(index, 'leave')}
                            className="bg-red-500 text-white py-1 px-2 rounded-lg"
                          >
                            Leave Task
                          </button>
                        )}

                        <FaUser
                          className="cursor-pointer mr-2"
                          onClick={() => handleUserIconClick(index)}
                        />
                        <span>{task.assignedUsers.length}</span>

                        {showUserList === index && userDetails[index] && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10"
                            ref={userListRef}
                          >
                            <ul>
                              {userDetails[index].map((user, userIndex) => (
                                <li key={userIndex} className="border-b last:border-b-0 py-1">
                                  {user.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <FaEllipsisV
                          className="cursor-pointer ml-4"
                          onClick={() => handleTaskOptionsToggle(index)}
                        />
                        {showTaskOptions === index && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
                            ref={taskOptionsRef}
                          >
                            {editTaskIndex === index ? (
                              <button
                                onClick={handleTaskEditSubmit}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                              >
                                Save Task
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleTaskEdit(index)}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                  Edit Task
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(index)}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                  Delete Task
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No tasks found.</p>
            )}

            <button
              onClick={() => setShowForm(false)}
              className="bg-red-500 text-white py-2 px-4 rounded-lg mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriveDetails;
