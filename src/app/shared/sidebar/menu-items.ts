import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
	// Dashboard Routes for admin & client...
	{
		path: '/me/dashboard', title: 'Dashboard', icon: 'mdi mdi-security-home', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '/admin/dashboard', title: 'Admin Dashboard', icon: 'mdi mdi-security-home', extralink: false, submenu: [], role: 'admin'
	},

	// Profile Routes...
	{
		path: '/me/profile', title: 'Profile', icon: 'mdi mdi-account-settings-variant', extralink: false, role: 'client', submenu: []
	},

	// Transaction routes...
	{
		path: '/me/transaction/request', title: 'New Request', icon: 'mdi mdi-file-send', extralink: false, role: 'client', submenu: []
	},
	{
		path: '/me/transaction', title: 'My Transactions', icon: 'mdi mdi-file-cloud', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '', title: 'Transactions', icon: 'mdi mdi-file-document', class: 'has-arrow', extralink: false, role: 'admin', submenu: [
			{
				path: '/admin/transaction/list', title: 'All Transactions', icon: 'mdi mdi-file-cloud', extralink: false, submenu: []
			},
			{
				path: '/admin/transaction/request', title: 'Make Transaction', icon: 'mdi mdi-file-send', extralink: false, submenu: []
			}
		]
	},

	// Customer Routes...
	{
		path: '', title: 'Customers', icon: 'mdi mdi-account-multiple', class: 'has-arrow', extralink: false, role: 'admin', submenu: [
			{
				path: '/admin/customer/list', title: 'All Customers', icon: 'mdi mdi-account-network', extralink: false, submenu: []
			},
			{
				path: '/admin/customer/create', title: 'Create Customer', icon: 'mdi mdi-account-plus', extralink: false, submenu: []
			}
		]
	},

	// Currency Routes...
	{
		path: '/admin/currency', title: 'Currencies', icon: 'mdi mdi-bank', extralink: false, submenu: [], role: 'admin'
	},

	// Staff Routes...
	{
		path: '/admin/staff', title: 'Staffs', 'icon': 'mdi mdi-worker', extralink: false, submenu: [], role: 'admin'
	},

	// Reporting Routes...
	/*{
		path: '/admin/reports', title: 'Reports', 'icon': 'mdi mdi-poll-box', extralink: false, submenu: [], role: 'admin'
	}*/
];

