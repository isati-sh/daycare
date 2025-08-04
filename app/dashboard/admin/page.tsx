'use client';

import React from 'react';
// Update the import path below if the actual path is different
import RoleGuard from '@/components/guards/roleGuard';

const AdminDashboardPage = () => {
  return (
    <RoleGuard path="/dashboard/admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin dashboard. More features coming soon!</p>
      </div>
    </RoleGuard>
  );
};

export default AdminDashboardPage;
