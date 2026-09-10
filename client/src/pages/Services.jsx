import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api.js";
import ServiceCard from "../components/ServiceCard.jsx";
import { deleteService } from "../services/api.js";
import EditService from "./EditService.jsx";
import Modal from "../components/Modal.jsx";

export default function Services() {
  const [services, setServices] = useState([]);
  const [view, setView] = useState("table");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState("");

  const initialForm = {
    name: "",
    price: "",
    service_type: "", 
    is_active: "active", 
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchServices();
  }, []);

  // 📡 Fetch services
  const fetchServices = async () => {
    try {
      console.log("Fetching services...");
      const res = await API.get("/services");
      
      console.log("Backend Response Data:", res.data); // <--- LOOK AT THIS IN YOUR CONSOLE
      
      // Ensure we always set an array, even if the backend returns something weird
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        console.error("Backend did not return an array!", res.data);
        setServices([]); 
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to fetch hotel-services. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.service_type || !form.price || !form.is_active) {
      toast.error("All fields are required");
      return;
    }

    try {
      await API.post("/services", {
        name: form.name,
        service_type: form.service_type,
        price: Number(form.price),
        is_active: form.is_active
      });

      toast.success("Service added!");
      setForm(initialForm);
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add service");
    }
  };

  // 🛡️ Bulletproof Filter (Won't crash if a database field is NULL)
  const filteredServices = services.filter((s) => {
    const searchLower = (search || "").toLowerCase();
    
    // Using default empty strings to guarantee `.toLowerCase()` doesn't crash
    const matchServiceName = (s.name || "").toLowerCase().includes(searchLower);
    const matchServiceType = (s.service_type || "").toLowerCase().includes(searchLower); 
    const matchServiceStatus = (s.is_active || "").toLowerCase().includes(searchLower);

    return matchServiceName || matchServiceType || matchServiceStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await deleteService(id);
      toast.success("Service deleted!");
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed. There is an error.");
    }
  };

  if (loading) return <div className="p-6 text-xl font-bold">Loading data from backend...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Services</h1>

      {/* ➕ ADD SERVICE FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 flex-wrap text-sm items-center"
      >
        <div>
          <h2 className="font-bold">Create New Service</h2>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            placeholder="Service Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 w-[300px] rounded"
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded"
          />
{/* 
          <input
            type="text"
            name="service_type" 
            placeholder="Type (e.g. laundry, hotel)"
            value={form.service_type}
            onChange={handleChange}
            className="border p-2 rounded"
          /> */}
          <select 
          name="service_type"
          value={form.service_type}
          onChange={handleChange}
          className="border p-2 rounded"
          >
            <option value="" default className="text-slate-700">Service Type</option>
            <option value="hotel">hotel</option>
            <option value="laundry">laundry</option>
            <option value="other">other</option>
          </select>

          <select 
            name="is_active" 
            value={form.is_active} 
            onChange={handleChange} 
            className="border p-2 rounded"
          >
            <option value="active">Active</option>
            <option value="not_active">Not Active</option>
          </select>

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Service
          </button>
        </div>
      </form>

      {/* Filtering UI */}
      <div className="flex flex-col justify-end md:flex-row gap-4 mb-4 ">
        <input 
          type="text"
          placeholder="Search e.g. name, type, status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3 bg-white"
        />
      </div>

      {/* VIEW SWITCH */}
      <div className="my-5 inline-flex p-1 bg-neutral-200 rounded-lg">
        <button
          onClick={() => setView("table")}
          className={`px-4 py-2 rounded ${view === "table" ? "bg-white shadow" : ""}`}
        >
          Table
        </button>
        <button
          onClick={() => setView("card")}
          className={`px-4 py-2 rounded ${view === "card" ? "bg-white shadow" : ""}`}
        >
          Cards
        </button>
      </div>

      {/* VIEW */}
      {view === "card" ? (
        <div className="flex gap-3 flex-wrap p-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id} 
              {...service} 
              onDelete={handleDelete}
              onEdit={() => {
                setSelectedService(service);
                setIsModalOpen(true);
              }}
            />
          ))}
          {filteredServices.length === 0 && (
            <div className="w-full text-center p-4">No services found in database.</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded-xl text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2">Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Status</th>
                <th className="p-2">Price</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-t text-center">
                  <td className="p-2">{service.name}</td>
                  <td className="p-2">{service.service_type}</td>
                  <td className={`p-2 ${
                      service.is_active === "active" ? "text-green-700"
                    : service.is_active === "not_active" ? "text-blue-700"
                    : "text-gray-700"
                  }`}>
                    {service.is_active
                      ?.replaceAll("_", " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())
                    }
                  </td>
                  <td className="p-2">₱{service.price}</td>
                
                  <td className="p-2 flex gap-2 justify-center">
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-8 bg-gray-50 text-gray-500">
                    No services found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        title="Edit Service"
      >
        <EditService
          service={selectedService}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedService(null);
            fetchServices();
          }}
        />
      </Modal>
    </div>
  );
}