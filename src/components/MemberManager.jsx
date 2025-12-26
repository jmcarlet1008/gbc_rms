import React, { useState } from 'react';

import { ImportService } from '../services/ImportService';

export function MemberManager({ members, onAddMember, onImportMembers }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [newMemberCode, setNewMemberCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const [editingMember, setEditingMember] = useState(null);

    const handleImport = async () => {
        // Simplified confirmation - or could use a custom modal.
        // For now, let's assume the user knows what they are doing if they click it, or provide a gentler confirm.
        if (!window.confirm("Import members from Excel? This will replace the current list.")) return;

        try {
            setIsImporting(true);
            const importedMembers = await ImportService.importMembersFromUrl('/MembersList.xlsx');
            console.log("Imported members:", importedMembers);

            if (onImportMembers) {
                onImportMembers(importedMembers);
                alert(`Successfully imported ${importedMembers.length} members!`);
            } else {
                console.error("onImportMembers prop is missing!");
                alert("Error: Could not update member list (Internal Error).");
            }
        } catch (error) {
            console.error("Import failed:", error);
            alert("Failed to import: " + error.message);
        } finally {
            setIsImporting(false);
        }
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to DELETE ALL members? This cannot be undone.")) {
            if (onImportMembers) {
                onImportMembers([]);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!lastName.trim()) return; // First name might be optional? adhering to previous logic it was checked.

        const fullName = `${lastName.trim()}, ${firstName.trim()}${middleInitial ? ' ' + middleInitial.trim() + '.' : ''}`;

        onAddMember({
            id: crypto.randomUUID(),
            name: fullName,
            code: newMemberCode.trim(),
            type: 'Member' // Default to Member
        });

        // Reset form
        setFirstName('');
        setLastName('');
        setMiddleInitial('');
        setNewMemberCode('');
    };

    // Edit Handlers
    const handleEditClick = (member) => {
        setEditingMember({ ...member });
    };

    const handleSaveEdit = () => {
        if (!editingMember.name.trim()) return;

        const updatedMembers = members.map(m =>
            m.id === editingMember.id ? editingMember : m
        );

        if (onImportMembers) {
            onImportMembers(updatedMembers);
        }
        setEditingMember(null);
    };

    const handleDeleteClick = (id) => {
        if (!window.confirm("Delete this member?")) return;
        const updatedMembers = members.filter(m => m.id !== id);
        if (onImportMembers) onImportMembers(updatedMembers);
    };

    return (
        <div className="flex flex-col gap-lg">

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
                    <p className="text-sm text-gray-500">Manage your church members database.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        onClick={handleClear}
                    >
                        Clear All
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        onClick={handleImport}
                        disabled={isImporting}
                    >
                        {isImporting ? 'Importing...' : 'Import from Excel'}
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        onClick={() => {
                            if (window.confirm("This will overwrite current members with 'MembersList.xlsx' from the public folder. Proceed?")) {
                                handleImport();
                            }
                        }}
                        style={{ display: 'none' }} // Hidden debug button
                    >
                        Debug Import
                    </button>
                </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Member List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Registered Members</h3>
                        <span className="px-2 py-1 bg-white border rounded text-xs font-medium text-gray-500">{members.length} Total</span>
                    </div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="p-3 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {members.map(member => (
                                    <tr key={member.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-3 font-mono text-sm text-gray-500">{member.code || '-'}</td>
                                        <td className="p-3 font-bold text-gray-900">{member.name}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.type === 'Member'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {member.type}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit Member"
                                                    onClick={() => handleEditClick(member)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete Member"
                                                    onClick={() => handleDeleteClick(member.id)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <p className="text-base font-medium text-gray-500">No members found</p>
                                                <p className="text-sm">Add a new member or import from Excel to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Add Member Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </span>
                        Add New Member
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Member Code</label>
                            <input
                                type="text"
                                placeholder="e.g. 001"
                                value={newMemberCode}
                                onChange={(e) => setNewMemberCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 font-mono text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Middle Initial</label>
                            <input
                                type="text"
                                value={middleInitial}
                                onChange={(e) => setMiddleInitial(e.target.value)}
                                placeholder="A"
                                maxLength={3}
                                className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 text-center text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg ease-in-out duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Create Member
                        </button>
                    </form>
                </div>
            </div>

            {/* Edit Modal - Moved to end and verified z-index */}
            {
                editingMember && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-lg w-96 shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4">Edit Member</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-1">Code</label>
                                    <input
                                        className="w-full border p-2 rounded bg-gray-50 font-mono"
                                        value={editingMember.code}
                                        onChange={e => setEditingMember({ ...editingMember, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-1">Name</label>
                                    <input
                                        className="w-full border p-2 rounded font-bold text-lg"
                                        value={editingMember.name}
                                        onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider block mb-1">Type</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={editingMember.type}
                                        onChange={e => setEditingMember({ ...editingMember, type: e.target.value })}
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Non-Member">Non-Member</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button className="btn btn-outline" onClick={() => setEditingMember(null)}>Cancel</button>
                                    <button className="btn btn-primary px-6" onClick={handleSaveEdit}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
