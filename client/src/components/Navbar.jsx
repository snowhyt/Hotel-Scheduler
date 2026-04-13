import { Link } from "react-router-dom"
import Logo from "../assets/2205-clear.png"
import DashboardIcon from "../assets/stats.png";
import BookingsIcon from "../assets/tabs.png";
import SchedIcon from "../assets/agenda.png";
import CalendarIcon from "../assets/schedule.png";
import RoomIcon from "../assets/bed.png";

export default function Navbar() {
  return (
    <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      {/* Fixed width: w-64 = 256px, you can change to w-72 for 288px or w-80 for 320px */}

      <div className="w-full h-auto justify-items-center mt-5">
        <img src={Logo} alt="2205_logo" height="auto" width="150px" />
      </div>

      <div className="flex flex-col text-left mt-10 flex-1 w-full">
        <ul>
          <Link to="/">
            <li className="hover:text-sky-400 py-6 pl-4 rounded transition-colors hover:bg-gray-700 flex flex-row items-center gap-2">
              <img src={DashboardIcon} alt="dashboard_icon" height="auto" width="40px" />
              Dashboard
            </li>
          </Link>
          
          <Link to="/bookings">
            <li className="hover:text-sky-400 py-6 pl-4 rounded transition-colors hover:bg-gray-700 flex flex-row items-center gap-4">
              <img src={SchedIcon} alt="bookings_icon" height="auto" width="30px" />
              Bookings
            </li>
          </Link>

          <Link to="/create-booking">
            <li className="hover:text-sky-400 py-6 pl-4 rounded transition-colors hover:bg-gray-700 flex flex-row items-center gap-4">
              <img src={BookingsIcon} alt="bookings_icon" height="auto" width="30px" />
              Create Booking
            </li>
          </Link>

          <Link to="/rooms">
            <li className="hover:text-sky-400 py-6 pl-4 rounded transition-colors hover:bg-gray-700 flex flex-row items-center gap-4">
              <img src={RoomIcon} alt="bookings_icon" height="auto" width="30px" />
              Rooms
            </li>
          </Link>

          <Link to="/availability">
            <li className="hover:text-sky-400 py-6 pl-4 rounded transition-colors hover:bg-gray-700 flex flex-row items-center gap-4">
              <img src={CalendarIcon} alt="bookings_icon" height="auto" width="30px" />
              Availability
            </li>
          </Link>
        </ul>
      </div>

      <div name="spacer" className="flex-1"></div>
      
      <div className="text-xs text-gray-500 pb-6 text-center">
        © 2026 Hotel Scheduler
      </div>
    </div>
  );
}