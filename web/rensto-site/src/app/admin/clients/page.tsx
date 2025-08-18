"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  MessageSquare,
  Download,
  DollarSign
} from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "active" | "inactive" | "prospect"
  totalValue: number
  lastContact: string
  nextFollowUp: string
  source: string
  tags: string[]
}

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full rensto-animate-glow mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
            redirect("/login")
  }

  // Mock data - in real app this would come from MongoDB
  const clients: Client[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john@acmecorp.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corporation",
      status: "active",
      totalValue: 125000,
      lastContact: "2024-01-15",
      nextFollowUp: "2024-01-22",
      source: "Referral",
      tags: ["Enterprise", "Tech"]
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@techstart.com",
      phone: "+1 (555) 234-5678",
      company: "TechStart Inc",
      status: "active",
      totalValue: 89000,
      lastContact: "2024-01-14",
      nextFollowUp: "2024-01-21",
      source: "Website",
      tags: ["Startup", "SaaS"]
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@globalsolutions.com",
      phone: "+1 (555) 345-6789",
      company: "Global Solutions",
      status: "prospect",
      totalValue: 0,
      lastContact: "2024-01-10",
      nextFollowUp: "2024-01-17",
      source: "LinkedIn",
      tags: ["Enterprise", "Consulting"]
    },
    {
      id: "4",
      name: "Lisa Chen",
      email: "lisa@innovateco.com",
      phone: "+1 (555) 456-7890",
      company: "InnovateCo",
      status: "inactive",
      totalValue: 45000,
      lastContact: "2023-12-15",
      nextFollowUp: "2024-01-30",
      source: "Cold Email",
      tags: ["Startup", "Fintech"]
    }
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "company":
        return a.company.localeCompare(b.company)
      case "value":
        return b.totalValue - a.totalValue
      case "lastContact":
        return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800"
      case "inactive":
        return "bg-slate-100 text-slate-800"
      case "prospect":
        return "bg-blue-100 style={{ color: 'var(--rensto-blue)' }}"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
            <p className="text-slate-600 mt-1">Manage your clients, track relationships, and monitor business growth.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Clients</p>
                <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 style={{ color: 'var(--rensto-blue)' }}" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Clients</p>
                <p className="text-2xl font-bold text-slate-900">
                  {clients.filter(c => c.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(clients.reduce((sum, c) => sum + c.totalValue, 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Prospects</p>
                <p className="text-2xl font-bold text-slate-900">
                  {clients.filter(c => c.status === "prospect").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 style={{ color: 'var(--rensto-blue)' }}" />
              </div>
            </div>
          </div>
        </div>

        {/* s and Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="value">Sort by Value</option>
              <option value="lastContact">Sort by Last Contact</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Next Follow-up
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-500">{client.company}</div>
                          <div className="text-sm text-slate-400">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatCurrency(client.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(client.lastContact)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(client.nextFollowUp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {client.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
