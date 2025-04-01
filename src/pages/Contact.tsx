import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import contactHeader from '../../public/assets/Screenshot 2025-03-18 at 1.25.59 PM.png'

export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contacts from Supabase when component mounts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id:any, newStatus:any) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error('Error updating contact status:', error);
        return;
      }

      // Update local state to reflect changes
      setContacts(contacts.map(contact =>
        contact.id === id ? { ...contact, status: newStatus } : contact
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openModal = (contact = null) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentContact(null);
  };

  const saveContact = async (contactData:any) => {
    try {
      if (contactData.id) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            name: contactData.name,
            number: contactData.number,
            note: contactData.note,
            status: contactData.status,
            updated_at: new Date()
          })
          .eq('id', contactData.id);

        if (error) {
          console.error('Error updating contact:', error);
          return;
        }
      } else {
        // Add new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            name: contactData.name,
            number: contactData.number,
            note: contactData.note,
            status: contactData.status,
            user_id: (await supabase.auth.getUser()).data?.user?.id
          });

        if (error) {
          console.error('Error adding contact:', error);
          return;
        }
      }

      // Refresh contacts list
      fetchContacts();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-white p-4 flex items-center gap-2 border-b">
        <Link to="/" className="text-black">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl text-[#4a6fa5] font-bold">Manage Your Contact</h1>
      </div>

      {/* Blue header section with title and image */}
      <div className="p-4 text-[#4a6fa5]">
        <div className="bg-[#daeeff] flex items-center justify-between p-3 rounded-xl">
          <div className="w-1/4">
            <img src={contactHeader} alt="IMG" className="h-12" />
          </div>
          <div className="w-auto">
            <p className="text-xs">
              Lorem Ipsum is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever Since The 1500s, When An Unknown Printer Took A Galley
            </p>
          </div>
        </div>
      </div>

      {/* Your Contact Section Header */}
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-red-500">Your Contact</h3>
        <button 
          onClick={() => openModal()} 
          className="bg-yellow-400 text-black text-sm py-1 px-3 rounded-full font-bold"
        >
          Add New
        </button>
      </div>

      {/* Contact List */}
      <div className="px-4">
        {loading ? (
          <div className="text-center py-4">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No contacts found. Add your first contact!</div>
        ) : (
          contacts.map(contact => (
            <div key={contact?.id} className="bg-blue-100 rounded-xl mb-3 shadow-sm">
              <div className="bg-[#69b0ee] flex items-center p-3 rounded-xl">
                <div className="bg-[#c0e2ff] p-3 text-[#4a6fa5] w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xl italic font-bold">
                  <span>{contact?.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xl text-white italic font-bold">{contact?.name}</p>
                  <p className="text-sm text-white">{contact?.number}</p>
                </div>
                <button onClick={() => openModal(contact)} className="bg-white p-2 rounded-full">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-3">
                <div className="flex gap-2">
                  <p className="text-md align-center items-center text-[#4a6fa5] font-bold">Status :</p>
                  <button
                    onClick={() => handleStatusChange(contact?.id, 'to be called')}
                    className={`px-3 py-1 rounded-full text-xs ${
                      contact?.status === 'to be called' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    To be called
                  </button>
                  <button
                    onClick={() => handleStatusChange(contact?.id, 'followed')}
                    className={`px-3 py-1 rounded-full text-xs ${
                      contact?.status === 'followed' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Followed
                  </button>
                  <button
                    onClick={() => handleStatusChange(contact?.id, 'donated')}
                    className={`px-3 py-1 rounded-full text-xs ${
                      contact?.status === 'donated' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Donated
                  </button>
                </div>
                {contact?.note && (
                  <div className="mt-2">
                    <p className="text-sm text-[#4a6fa5]"><span className="font-bold">Note:</span> {contact?.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#c0e2ff] rounded-xl p-6 w-full max-w-md">
            <form onSubmit={(e:any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              saveContact({
                id: currentContact?.id,
                name: formData.get('name'),
                number: formData.get('number'),
                note: formData.get('note'),
                status: formData.get('status') || 'to be called'
              });
            }}>
              <div className="mb-4">
                <label className="block text-lg text-[#4a6fa5] font-bold">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentContact?.name}
                  className="mt-1 block w-full text-[#4a6fa5] rounded-xl border-[#4a6fa5] shadow-sm p-2 border-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg text-[#4a6fa5] font-bold">Number</label>
                <input
                  type="text"
                  name="number"
                  defaultValue={currentContact?.number}
                  className="mt-1 block w-full text-[#4a6fa5] rounded-xl border-[#4a6fa5] shadow-sm p-2 border-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg text-[#4a6fa5] font-bold">Note</label>
                <input
                  type="text"
                  name="note"
                  defaultValue={currentContact?.note}
                  className="mt-1 block w-full text-[#4a6fa5] rounded-xl border-[#4a6fa5] shadow-sm p-2 border-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg text-[#4a6fa5] font-bold">Status</label>
                <select
                  name="status"
                  defaultValue={currentContact?.status}
                  className="mt-1 block w-full text-[#4a6fa5] rounded-xl border-[#4a6fa5] shadow-sm p-2 border-2"
                  required
                >
                  <option value="to be called">To be called</option>
                  <option value="followed">Followed</option>
                  <option value="donated">Donated</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-full"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}