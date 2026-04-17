export default function Card({ title, value, totalpax }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow gap-y-2 flex flex-col items-center">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-[35pt] text-blue-500 font-bold mt-2">{value}</p>
      <p className="text-lg text-black">Rooms</p>
      
      <p className="text-md  text-gray-500 pt-2"><hr/> 
      Total Pax: {totalpax}23</p>
    </div>
  );
}