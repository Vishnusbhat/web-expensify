import { useNavigate } from 'react-router-dom';

const cardData = [
  { title: 'Inventory', route: '/inventory' },
  { title: 'Drives', route: '/drives' },
  { title: 'Calendar', route: '/calendar' },
  { title: 'Daily Points', route: '/daily-points' },
  { title: 'Apply for Leave', route: '/apply-leave' },
  { title: 'Attendance', route: '/attendance' },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col items-center justify-start mt-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {cardData.map((card, index) => (
            <button
              key={index}
              className="p-4 sm:p-6 lg:p-8 h-24 sm:h-28 lg:h-32 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
              onClick={() => navigate(card.route)}
            >
              <span className="text-lg sm:text-xl lg:text-2xl font-bold">{card.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
