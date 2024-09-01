import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaEllipsisV, FaUser } from 'react-icons/fa';

function DriveDetails() {
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [previousDrives, setPreviousDrives] = useState([]);
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
  const modalRef = useRef(null);

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

        const allDrives = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          allDrives.push({
            id: doc.id,
            task: data.task,
            date: data.date.toDate(),
          });
        });

        // Separate drives into upcoming and previous
        const now = new Date();
        const upcoming = allDrives.filter(drive => drive.date > now)
                                  .sort((a, b) => a.date - b.date);
        const previous = allDrives.filter(drive => drive.date <= now)
                                  .sort((a, b) => b.date - a.date);

        setUpcomingDrives(upcoming);
        setPreviousDrives(previous);
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

    if (!selectedDrive) {
      console.error('No drive selected');
      return;
    }

    try {
      const driveDocRef = doc(db, 'events', selectedDrive.id);
      const driveDoc = await getDoc(driveDocRef);
      const driveData = driveDoc.data();

      const updatedTasks = Array.isArray(driveData.tasks) ? [...driveData.tasks] : [];
      updatedTasks.push({ task: newTask, assignedUsers: [] });

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

      const updatedTasks = Array.isArray(driveData.tasks) ? [...driveData.tasks] : [];
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
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setShowForm(false);
      }
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
      <h3 className="text-2xl mb-4">Upcoming Drive Events</h3>
      {upcomingDrives.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {upcomingDrives.map((drive, index) => (
            <li
              key={index}
              className="bg-gray-100 p-2 rounded shadow-md cursor-pointer hover:bg-gray-200 transition"
              onClick={() => handleDriveClick(drive)}
            >
              <strong>{drive.task}</strong> on {drive.date.toDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming drives found.</p>
      )}

      <h3 className="text-2xl mt-8 mb-4">Previous Drive Events</h3>
      {previousDrives.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {previousDrives.map((drive, index) => (
            <li
              key={index}
              className="bg-gray-100 p-2 rounded shadow-md cursor-pointer hover:bg-gray-200 transition"
              onClick={() => handleDriveClick(drive)}
            >
              <strong>{drive.task}</strong> on {drive.date.toDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No previous drives found.</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
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

            <h4 className="text-lg mb-4">Task List</h4>
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map((task, index) => {
                  const userCount = task.assignedUsers.length;
                  const isUserAssigned = task.assignedUsers.includes(currentUserId);
                  return (
                    <li
                      key={index}
                      className={`p-2 rounded-lg shadow-md flex justify-between items-center ${
                        isUserAssigned ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {editTaskIndex === index ? (
                        <div className="flex items-center w-full space-x-2">
                          <input
                            type="text"
                            value={editTaskText}
                            onChange={(e) => setEditTaskText(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg w-full"
                          />
                          <button
                            onClick={handleTaskEditSubmit}
                            className="bg-blue-500 text-white py-1 px-3 rounded-lg"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>{task.task}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUserIconClick(index)}
                              className="text-gray-500 flex items-center"
                            >
                              <FaUser />
                              <span className="ml-1 text-sm">({userCount})</span>
                            </button>
                            <button
                              onClick={() => handleTaskOptionsToggle(index)}
                              className="text-gray-500"
                            >
                              <FaEllipsisV />
                            </button>
                          </div>
                        </>
                      )}

                      {showTaskOptions === index && (
                        <div
                          ref={taskOptionsRef}
                          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10"
                        >
                          <ul className="space-y-1">
                            <li>
                              <button
                                onClick={() => handleTaskAction(index, isUserAssigned ? 'leave' : 'select')}
                                className="w-full text-left"
                              >
                                {isUserAssigned ? 'Leave Task' : 'Select Task'}
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleTaskEdit(index)}
                                className="w-full text-left"
                              >
                                Edit Task
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleDeleteTask(index)}
                                className="w-full text-left"
                              >
                                Delete Task
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}

                      {showUserList === index && (
                        <div
                          ref={userListRef}
                          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10"
                        >
                          {userDetails[index] && userDetails[index].length > 0 ? (
                            <ul>
                              {userDetails[index].map((user, idx) => (
                                <li key={idx}>{user.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>None</p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No tasks added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DriveDetails;






// import { useEffect, useState, useRef } from 'react';
// import { db } from '../firebaseConfig';
// import { collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { FaEllipsisV, FaUser } from 'react-icons/fa';

// function DriveDetails() {
//   const [driveEvents, setDriveEvents] = useState([]);
//   const [selectedDrive, setSelectedDrive] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [newTask, setNewTask] = useState('');
//   const [tasks, setTasks] = useState([]);
//   const [editTaskIndex, setEditTaskIndex] = useState(null);
//   const [editTaskText, setEditTaskText] = useState('');
//   const [showTaskOptions, setShowTaskOptions] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState('');
//   const [showUserList, setShowUserList] = useState(null);
//   const [userDetails, setUserDetails] = useState({});
//   const taskOptionsRef = useRef(null);
//   const userListRef = useRef(null);
//   const modalRef = useRef(null);

//   useEffect(() => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (user) {
//       setCurrentUserId(user.uid);
//     } else {
//       console.log('No user is logged in');
//     }
//   }, []);

//   useEffect(() => {
//     const fetchDriveEvents = async () => {
//       try {
//         const eventsRef = collection(db, 'events');
//         const q = query(eventsRef, where('label', '==', 'Drive'));
//         const snapshot = await getDocs(q);

//         const drives = [];
//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           drives.push({
//             id: doc.id,
//             task: data.task,
//             date: data.date.toDate().toDateString(),
//           });
//         });

//         setDriveEvents(drives);
//       } catch (error) {
//         console.error('Error fetching drive events:', error);
//       }
//     };

//     fetchDriveEvents();
//   }, []);

//   const handleDriveClick = async (drive) => {
//     setSelectedDrive(drive);
//     setShowForm(true);

//     try {
//       const driveDocRef = doc(db, 'events', drive.id);
//       const driveDoc = await getDoc(driveDocRef);
//       const driveData = driveDoc.data();
//       setTasks(driveData.tasks || []);
//     } catch (error) {
//       console.error('Error fetching tasks for drive:', error);
//     }
//   };

//   const handleNewTaskSubmit = async () => {
//     if (newTask.trim() === '') return;

//     if (!selectedDrive) {
//       console.error('No drive selected');
//       return;
//     }

//     try {
//       const driveDocRef = doc(db, 'events', selectedDrive.id);
//       const driveDoc = await getDoc(driveDocRef);
//       const driveData = driveDoc.data();

//       const updatedTasks = Array.isArray(driveData.tasks) ? [...driveData.tasks] : [];
//       updatedTasks.push({ task: newTask, assignedUsers: [] });

//       await updateDoc(driveDocRef, { tasks: updatedTasks });

//       setTasks(updatedTasks);
//       setNewTask('');
//     } catch (error) {
//       console.error('Error adding new task:', error);
//     }
//   };

//   const handleTaskOptionsToggle = (index) => {
//     setShowTaskOptions(showTaskOptions === index ? null : index);
//   };

//   const handleTaskClick = async (taskIndex) => {
//     try {
//       if (!selectedDrive) return;

//       const driveDocRef = doc(db, 'events', selectedDrive.id);
//       const driveDoc = await getDoc(driveDocRef);
//       const driveData = driveDoc.data();
//       const updatedTasks = [...driveData.tasks];
//       const task = updatedTasks[taskIndex];

//       if (task.assignedUsers.includes(currentUserId)) {
//         // Leave the task
//         task.assignedUsers = task.assignedUsers.filter(userId => userId !== currentUserId);
//       } else {
//         // Select the task
//         task.assignedUsers.push(currentUserId);
//       }

//       await updateDoc(driveDocRef, { tasks: updatedTasks });
//       setTasks(updatedTasks);
//     } catch (error) {
//       console.error('Error handling task action:', error);
//     }
//   };

//   const handleTaskEdit = (index) => {
//     setEditTaskIndex(index);
//     setEditTaskText(tasks[index].task);
//   };

//   const handleTaskEditSubmit = async () => {
//     if (editTaskText.trim() === '') return;

//     try {
//       const driveDocRef = doc(db, 'events', selectedDrive.id);
//       const driveDoc = await getDoc(driveDocRef);
//       const driveData = driveDoc.data();

//       const updatedTasks = Array.isArray(driveData.tasks) ? [...driveData.tasks] : [];
//       updatedTasks[editTaskIndex].task = editTaskText;

//       await updateDoc(driveDocRef, { tasks: updatedTasks });

//       setTasks(updatedTasks);
//       setEditTaskIndex(null);
//       setEditTaskText('');
//     } catch (error) {
//       console.error('Error updating task:', error);
//     }
//   };

//   const handleDeleteTask = async (index) => {
//     try {
//       const driveDocRef = doc(db, 'events', selectedDrive.id);
//       const driveDoc = await getDoc(driveDocRef);
//       const driveData = driveDoc.data();

//       const updatedTasks = driveData.tasks.filter((_, i) => i !== index);

//       await updateDoc(driveDocRef, { tasks: updatedTasks });

//       setTasks(updatedTasks);
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   };

//   const handleUserIconClick = async (taskIndex) => {
//     setShowUserList(showUserList === taskIndex ? null : taskIndex);

//     if (!tasks[taskIndex].assignedUsers.length) return;

//     if (!userDetails[taskIndex]) {
//       try {
//         const userDocs = await Promise.all(
//           tasks[taskIndex].assignedUsers.map((userId) => getDoc(doc(db, 'users', userId)))
//         );
//         const usersData = userDocs.map((doc) => doc.data());

//         setUserDetails((prevDetails) => ({
//           ...prevDetails,
//           [taskIndex]: usersData,
//         }));
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//       }
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         modalRef.current &&
//         !modalRef.current.contains(event.target)
//       ) {
//         setShowForm(false);
//       }
//       if (
//         taskOptionsRef.current &&
//         !taskOptionsRef.current.contains(event.target)
//       ) {
//         setShowTaskOptions(null);
//       }
//       if (
//         userListRef.current &&
//         !userListRef.current.contains(event.target)
//       ) {
//         setShowUserList(null);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="p-4 border border-gray-200 rounded-lg shadow-md bg-white">
//       <h3 className="text-2xl mb-4">All Drive Events</h3>
//       {driveEvents.length > 0 ? (
//         <ul className="list-disc pl-5 space-y-2">
//           {driveEvents.map((drive, index) => (
//             <li
//               key={index}
//               className="bg-gray-100 p-2 rounded shadow-md cursor-pointer hover:bg-gray-200 transition"
//               onClick={() => handleDriveClick(drive)}
//             >
//               <strong>{drive.task}</strong> on {drive.date}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No Drives found.</p>
//       )}

//       {showForm && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
//           <div ref={modalRef} className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
//             <h4 className="text-xl mb-4">Tasks for {selectedDrive.task}</h4>
//             <div className="mb-4">
//               <input
//                 type="text"
//                 value={newTask}
//                 onChange={(e) => setNewTask(e.target.value)}
//                 placeholder="Enter new task"
//                 className="p-2 border border-gray-300 rounded-lg w-full mb-2"
//               />
//               <button
//                 onClick={handleNewTaskSubmit}
//                 className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
//               >
//                 Add Task
//               </button>
//             </div>

//             <h4 className="text-lg mb-4">Task List</h4>
//             {tasks.length > 0 ? (
//               <ul className="space-y-2">
//                 {tasks.map((task, index) => {
//                   const userCount = task.assignedUsers.length;
//                   const isUserAssigned = task.assignedUsers.includes(currentUserId);
//                   return (
//                     <li
//                       key={index}
//                       className={`p-2 rounded-lg shadow-md flex justify-between items-center ${
//                         isUserAssigned ? 'bg-green-100' : 'bg-gray-100'
//                       } cursor-pointer`}
//                       onClick={() => handleTaskClick(index)}
//                     >
//                       {editTaskIndex === index ? (
//                         <div className="flex items-center w-full space-x-2">
//                           <input
//                             type="text"
//                             value={editTaskText}
//                             onChange={(e) => setEditTaskText(e.target.value)}
//                             className="p-2 border border-gray-300 rounded-lg w-full"
//                           />
//                           <button
//                             onClick={handleTaskEditSubmit}
//                             className="bg-blue-500 text-white py-1 px-3 rounded-lg"
//                           >
//                             Save
//                           </button>
//                         </div>
//                       ) : (
//                         <>
//                           <span>{task.task}</span>
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() => handleUserIconClick(index)}
//                               className="text-gray-500 flex items-center"
//                             >
//                               <FaUser />
//                               <span className="ml-1 text-sm">({userCount})</span>
//                             </button>
//                             <button
//                               onClick={() => handleTaskOptionsToggle(index)}
//                               className="text-gray-500"
//                             >
//                               <FaEllipsisV />
//                             </button>
//                           </div>
//                         </>
//                       )}

//                       {showTaskOptions === index && (
//                         <div
//                           ref={taskOptionsRef}
//                           className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10"
//                         >
//                           <ul className="space-y-1">
//                             <li>
//                               <button
//                                 onClick={() => handleTaskEdit(index)}
//                                 className="w-full text-left"
//                               >
//                                 Edit Task
//                               </button>
//                             </li>
//                             <li>
//                               <button
//                                 onClick={() => handleDeleteTask(index)}
//                                 className="w-full text-left"
//                               >
//                                 Delete Task
//                               </button>
//                             </li>
//                           </ul>
//                         </div>
//                       )}

//                       {showUserList === index && (
//                         <div
//                           ref={userListRef}
//                           className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10"
//                         >
//                           {userDetails[index] && userDetails[index].length > 0 ? (
//                             <ul>
//                               {userDetails[index].map((user, idx) => (
//                                 <li key={idx}>{user.name}</li>
//                               ))}
//                             </ul>
//                           ) : (
//                             <p>None</p>
//                           )}
//                         </div>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             ) : (
//               <p>No tasks added yet.</p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DriveDetails;

