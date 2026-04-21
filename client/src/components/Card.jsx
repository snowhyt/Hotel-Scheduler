export default function Card({ title, value,}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow gap-y-2 flex flex-col items-center">
      <div className="title flex-1">
          <h2 className="text-gray-500">{title}</h2>
      </div>
      
      <div className="stats-body">
        <p className="text-[45pt] text-blue-500 font-bold pb-6 pt-2">{value}</p>
        <p className="text-lg text-black">Rooms</p>
      </div>

      <div className="footer">
        <p className="text-md  text-gray-500 pt-2 tracking-[5px]">
        Total Pax: 23</p>
      </div>
    </div>
  );
}