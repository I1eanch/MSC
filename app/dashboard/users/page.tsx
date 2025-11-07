'use client'

import { RoleGuard } from '@/components/guards/RoleGuard'
import DashboardLayout from '@/app/dashboard/layout'

export default function UsersPage() {
  return (
    <RoleGuard>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage system users and permissions</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Users
                </h3>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all users in your account including their name, email, role and status.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  Add user
                </button>
              </div>
            </div>
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            John Doe
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            john@example.com
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            Admin
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <a href="#" className="text-primary-600 hover:text-primary-900">
                              Edit
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            Jane Smith
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            jane@example.com
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            User
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <a href="#" className="text-primary-600 hover:text-primary-900">
                              Edit
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}