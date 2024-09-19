// app/dashboard/professor_list/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import withAuth from '../../components/withAuth'; 
import LoadingSpinner from '../../components/LoadingSpinner'; 

const ProfessorsList = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const resultsPerPage = 10;

  useEffect(() => {
    async function fetchProfessors() {
      setLoading(true); 
      try {
        const res = await fetch(`/api/professor_list?page=${currentPage}&search=${searchTerm}`);
        const data = await res.json();
        if (res.ok) {
          setProfessors(data.professors);
          setTotalPages(data.totalPages);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Failed to fetch professors');
      } finally {
        setLoading(false);
      }
    }

    fetchProfessors();
  }, [currentPage, searchTerm]);

  const handleEdit = (id) => {
    router.push(`/professors/${id}/edit`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6 lg:p-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Professors List</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 p-3 rounded-lg border border-gray-300 shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-lg">
  <thead>
    <tr className="bg-blue-600 text-white">
      <th className="py-4 px-6 text-left">ID</th>
      <th className="py-4 px-6 text-left">First Name</th>
      <th className="py-4 px-6 text-left">Last Name</th>
      <th className="py-4 px-6 text-left">Email</th>
      <th className="py-4 px-6 text-left">Actions</th>
    </tr>
  </thead>
  <tbody>
    {professors.length > 0 ? (
      professors.map((professor, index) => (
        <tr
          key={professor.id}
          className={`${
            index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
          } text-gray-900 hover:bg-gray-200 transition-all border-b`}
        >
          <td className="py-4 px-6">{professor.id}</td>
          <td className="py-4 px-6">{professor.first_name}</td>
          <td className="py-4 px-6">{professor.last_name}</td>
          <td className="py-4 px-6">{professor.email}</td>
          <td className="py-4 px-6">
            <button
              onClick={() => handleEdit(professor.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Edit
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
          No Professors Found
        </td>
      </tr>
    )}
  </tbody>
</table>

      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-lg transition-all ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default withAuth(ProfessorsList);
