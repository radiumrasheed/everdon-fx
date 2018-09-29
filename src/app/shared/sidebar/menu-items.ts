import {RouteInfo} from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
	// Dashboard Routes for admin & client...
	{
		path: '/me/dashboard', title: 'Dashboard', icon: 'mdi mdi-gauge', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '/admin/dashboard', title: 'Admin Dashboard', icon: 'mdi mdi-gauge', extralink: false, submenu: [], role: 'admin'
	},

	// Profile Routes...
	{
		path: '/me/profile', title: 'Profile', icon: 'mdi mdi-account-settings-variant', extralink: false, role: 'client', submenu: []
	},

	// Transaction routes...
	{
		path: '/me/transaction/request', title: 'New Request', icon: 'mdi mdi-certificate', extralink: false, role: 'client', submenu: []
	},
	{
		path: '/me/transaction', title: 'My Transactions', icon: 'mdi mdi-receipt', extralink: false, submenu: [], role: 'client'
	},
	{
		path: '', title: 'Transactions', icon: 'mdi mdi-receipt', class: 'has-arrow', extralink: false, role: 'admin', submenu: [
			{
				path: '/admin/transaction/list', title: 'All Transactions', icon: 'mdi mdi-pages', extralink: false, submenu: []
			},
			{
				path: '/admin/transaction/request', title: 'Make Transaction', icon: 'mdi mdi-whatshot', extralink: false, submenu: []
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
		path: '', title: 'Currencies', icon: 'mdi mdi-cash-multiple', class: 'has-arrow', extralink: false, role: 'admin', submenu: [
			{
				path: '/admin/currency/list', title: 'Currencies', icon: 'mdi mdi-bank', extralink: false, submenu: []
			}
		]
	}
];

