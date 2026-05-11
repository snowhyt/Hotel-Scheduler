export default function Card({ title, value,}) {
  return (
    <div className=" bg-white p-4 rounded-2xl shadow flex flex-col items-center">
      <div className="title flex-1">
          <h3 className="text-gray-500">{title}</h3>
      </div>
      
      <div className="stats-body">
        <p className="text-[35pt] text-blue-500 font-bold p-2">{value}</p>
        <p className="text-[15pt] text-black">Rooms</p>
      </div>

      <div className="footer">
        <p className="text-[12pt]  text-gray-500 pt-2 tracking-[5px]">
        Total Pax: 23</p>
      </div>
    </div>
  );
}