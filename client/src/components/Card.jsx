export default function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h2 className="text-gray-500">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}